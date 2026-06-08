import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { BadRequest, Forbidden, Unauthorized } from 'http-errors';
import { getEnv } from 'src/environment';
import { getHasuraClient } from 'src/graphqlClient';
import { getLogger } from 'src/logger';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import {
  getHasuraClaims,
  getTenantNameFromClaims,
  getUserIdFromClaims,
} from 'src/requestHelpers';
import JiraApiClient from 'src/services/jira/apiClient';
import { getNode } from 'src/services/node/nodeService';
import type { ObjectWithContributors } from 'src/services/role-access/roleAccessService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { type z } from 'zod';

import { getConfig } from '../utils/config';
import { getOrAddDepartmentType } from '../utils/department';
import { getRiskSmartUserIdFromJiraUser } from '../utils/user';
import type { JiraRiskSchema } from './schema';
import { addRiskAssessmentResult } from './utils/assessmentResult';

const logger = getLogger();

/**
 * This is a generic handler for Jira to Risk integration - to create a customer-specific
 * integration, create the customer-specific schema, transform to JiraRiskSchema, and call this
 * handler to complete the creation of the risk.
 */
export const jiraToRiskHandler = async (
  input: {
    body: z.infer<typeof JiraRiskSchema>;
    secretName: string;
  },
  evt: APIGatewayProxyEventV2
) => {
  if (!evt.headers.authorization) {
    throw new Unauthorized('Invalid authorization credentials in request');
  }

  const { body, secretName } = input;

  const claims = getHasuraClaims(evt);
  const userId = getUserIdFromClaims(evt);
  const tenantName = getTenantNameFromClaims(evt);

  const hasuraClient = await getHasuraClient({
    authorization: evt.headers.authorization,
    tenantName,
  });

  const client = getBackendRestApiClient({
    tenant: tenantName,
    orgKey: claims['x-hasura-org-id'],
    userId,
    userRole: claims['x-hasura-default-role'],
  });

  logger.info('Calling Jira to Risk handler for user on tenant', {
    userId,
    tenantName,
  });

  // Get configuration values from secrets manager
  const config = await getConfig(secretName);

  let parent: ObjectWithContributors | null | undefined = null;
  if (body.ParentRiskId) {
    const parentNode = await getNode(hasuraClient, body.ParentRiskId);

    const allowedParentTypes: ParentTypeEnum[] = [ParentTypeEnum.Risk];
    if (!parentNode) {
      throw new Forbidden('Access to parent denied');
    }
    if (!allowedParentTypes.includes(parentNode.ObjectType)) {
      throw new Forbidden('Invalid parent type');
    }
    parent = parentNode;
  }

  logger.info('Creating new risk under parent risk', {
    parentRiskId: body.ParentRiskId,
  });

  const parentPermissionGranted = await hasPermission(hasuraClient, {
    userId: userId,
    parentObject: parent,
    objectType: ParentTypeEnum.Risk,
    accessType: AccessTypeEnum.Insert,
  });
  if (!parentPermissionGranted) {
    throw new Forbidden('Access to parent denied');
  }

  const jiraApiClient = new JiraApiClient(
    config.JiraBaseUrl,
    config.JiraApiToken
  );

  let ownerId: string | undefined;
  if (body.Issue.OwnerAccountId) {
    ownerId = await getRiskSmartUserIdFromJiraUser({
      apiClient: client,
      jiraApiClient,
      accountId: body.Issue.OwnerAccountId,
      email: body.Issue.OwnerEmail,
      fallbackUserId: body.FallbackUserId,
    });
  }

  if (!ownerId) {
    logger.info('Insufficient data provided - risk creation/update deferred', {
      providedFields: Object.keys(body.Issue),
      requiredFields: ['OwnerAccountId'],
    });

    return {
      statusCode: 202,
      body: JSON.stringify({
        message: 'Request accepted - insufficient data for risk processing',
        status: 'deferred',
      }),
    };
  }

  let contributorId: string | undefined;
  if (body.Issue.ContributorAccountId) {
    contributorId = await getRiskSmartUserIdFromJiraUser({
      apiClient: client,
      jiraApiClient,
      accountId: body.Issue.ContributorAccountId,
      email: body.Issue.ContributorEmail,
      fallbackUserId: body.FallbackUserId,
    });
  }

  let departmentTypeIds: string[] = [];
  if (body.Issue.DepartmentNames) {
    departmentTypeIds = await Promise.all(
      body.Issue.DepartmentNames.map((name) =>
        getOrAddDepartmentType(client, name)
      )
    );
  }

  const customAttributes: Record<string, string> = {};
  if (body.JiraLinkCustomAttribute) {
    customAttributes[body.JiraLinkCustomAttribute] =
      `${config.JiraBaseUrl}/browse/${body.Issue.Key}`;
  }
  if (body.RiskSummaryCustomAttribute && body.Issue.Summary) {
    customAttributes[body.RiskSummaryCustomAttribute] = body.Issue.Summary;
  }

  const risk = {
    ParentRiskId: body.ParentRiskId,
    Title: body.Issue.Title,
    Tier: 3, // Currently hardcoded to 3 for Jira risks
    Status: body.Issue.Status,
    Description: body.Issue.Description,
    Treatment: undefined,
    CustomAttributeData:
      Object.keys(customAttributes).length > 0 ? customAttributes : undefined,
    Owners: [{ UserId: ownerId }],
    Contributors: contributorId ? [{ UserId: contributorId }] : [],
    OwnerGroups: [],
    ContributorGroups: [],
    Tags: [],
    OwnerIds: [ownerId],
    ContributorIds: contributorId ? [contributorId] : [],
    OwnerGroupIds: [],
    ContributorGroupIds: [],
    TagTypeIds: [],
    DepartmentTypeIds: departmentTypeIds,
  };

  if (body.Issue.RSUrl) {
    const existingId = body.Issue.RSUrl.split('/').pop();

    if (!existingId) {
      throw new BadRequest('Invalid RS reference');
    }

    const existingNode = await getNode(hasuraClient, existingId);
    if (!existingNode || existingNode.ObjectType !== ParentTypeEnum.Risk) {
      throw new BadRequest('Invalid RS reference');
    }

    const existingRiskResult = await client.getRiskById({
      Id: existingNode.Id,
    });
    const existingRisk = existingRiskResult?.risk?.[0];
    if (!existingRisk) {
      throw new BadRequest('Invalid RS reference');
    }

    const updatePermissionGranted = await hasPermission(hasuraClient, {
      userId: userId,
      parentObject: existingNode,
      objectType: ParentTypeEnum.Risk,
      accessType: AccessTypeEnum.Update,
    });
    if (!updatePermissionGranted) {
      throw new Forbidden('Access to risk denied');
    }

    logger.info('Updating existing risk', {
      riskId: existingNode.Id,
    });

    await client.updateRisk({
      ...risk,
      Id: existingNode.Id,
      ParentRiskId: existingRisk.ParentRiskId ?? body.ParentRiskId,
      tags: [],
      departments: departmentTypeIds.map((id) => ({
        DepartmentTypeId: id,
        ParentId: existingNode.Id,
      })),
      schedule: { Id: existingNode.Id },
      Owners: [{ UserId: ownerId, ParentId: existingNode.Id }],
      Contributors: contributorId
        ? [{ UserId: contributorId, ParentId: existingNode.Id }]
        : [],
    });

    await addRiskAssessmentResult(client, {
      riskId: existingNode.Id,
      impact: body.Issue.Impact,
      likelihood: body.Issue.Likelihood,
      rating: body.Issue.Rating,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        Id: existingNode.Id,
      }),
    };
  }

  const id = randomUUID();

  logger.info('Inserting new risk', { id });

  const result = await client.insertChildRisk({
    ...risk,
    Id: id,
    schedule: { Id: id },
    Departments: departmentTypeIds.map((id) => ({
      DepartmentTypeId: id,
    })),
  });

  const riskId = result.insert_risk_one?.Id;
  if (!riskId) {
    throw new Error('Missing risk id');
  }

  logger.info('Risk created successfully');

  await addRiskAssessmentResult(client, {
    riskId,
    impact: body.Issue.Impact,
    likelihood: body.Issue.Likelihood,
    rating: body.Issue.Rating,
  });

  if (body.SetRefInJira) {
    logger.info('Adding RiskSmart risk URL to Jira issue');

    const webAppUrl = getEnv('WEB_APP_URL');

    const jiraUpdateResult = await jiraApiClient.updateIssue(body.Issue.Key, {
      fields: {
        [body.RSUrlCustomFieldKey]: new URL(
          `/risks/${riskId}`,
          webAppUrl
        ).toString(),
      },
    });

    if (jiraUpdateResult === null) {
      logger.error(
        'Failed to update Jira issue with RiskSmart risk URL (404 - potentially permissions issue)',
        {
          issueKey: body.Issue.Key,
          customFieldId: body.RSUrlCustomFieldKey,
          id,
        }
      );
      throw new BadRequest(
        'Failed to update Jira issue: ticket not found or permission issue.'
      );
    }
  } else {
    logger.info('Skipping setting RiskSmart risk URL in Jira issue');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: result.insert_risk_one?.Id,
    }),
  };
};
