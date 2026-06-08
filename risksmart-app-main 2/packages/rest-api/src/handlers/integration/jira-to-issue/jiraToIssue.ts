import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { logger } from '@sentry/aws-serverless';
import type { APIGatewayProxyEventV2 } from 'aws-lambda/trigger/api-gateway-proxy';
import { randomUUID } from 'crypto';
import type {
  ContributorInsertInput,
  InsertIssueWithoutParentMutationVariables,
  IssueAssessmentStatusEnum,
  OwnerInsertInput,
  Sdk,
  UpdateIssueMutationVariables,
} from 'generated/graphql2';
import { ParentTypeEnum } from 'generated/graphql2';
import { BadRequest, Unauthorized } from 'http-errors';
import { getEnv } from 'src/environment';
import { getHasuraClient } from 'src/graphqlClient';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import {
  getHasuraClaims,
  getTenantNameFromClaims,
  getUserIdFromClaims,
} from 'src/requestHelpers';
import JiraApiClient from 'src/services/jira/apiClient';
import { getNode } from 'src/services/node/nodeService';
import type z from 'zod';

import { getConfig } from '../utils/config';
import { getDepartmentType } from '../utils/department';
import { getRiskSmartUserIdFromJiraUser } from '../utils/user';
import type { JiraIssueSchema } from './schema';

const insert = async (
  _hasuraClient: ApolloClient<NormalizedCacheObject>,
  backendClient: Sdk,
  issueData: Omit<
    InsertIssueWithoutParentMutationVariables,
    | 'Id'
    | 'Tags'
    | 'contributorGroups'
    | 'ownerGroups'
    | 'contributors'
    | 'owners'
  > & {
    contributors: ContributorInsertInput[];
    owners: OwnerInsertInput[];
  },
  issueAssessmentDetails: {
    assessmentStatus: IssueAssessmentStatusEnum;
    issueAssessmentCustomAttributeData?: z.infer<
      typeof JiraIssueSchema
    >['Issue']['IssueAssessmentCustomAttributeData'];
    issueAssessmentTypeOverride?: z.infer<
      typeof JiraIssueSchema
    >['IssueAssessmentTypeOverride'];
  }
) => {
  const issueId = randomUUID();

  await backendClient.insertIssueWithoutParent({
    ...issueData,
    Id: issueId,
    Tags: [],
    contributorGroups: [],
    ownerGroups: [],
    contributors: issueData.contributors.map((c) => ({
      ...c,
      ParentId: issueId,
    })),
    owners: issueData.owners.map((o) => ({
      ...o,
      ParentId: issueId,
    })),
  });

  const issueAssessmentId = randomUUID();

  await backendClient.insertIssueAssessment({
    Id: issueAssessmentId,
    ParentIssueId: issueId,
    IssueType: issueAssessmentDetails.issueAssessmentTypeOverride,
    Tags: [],
    Departments: [],
    Type: ParentTypeEnum.IssueAssessmentRiskEvent,
    Status: issueAssessmentDetails.assessmentStatus,
    ParentIds: [],
    TagTypeIds: [],
    parents: [],
    CustomAttributeData:
      issueAssessmentDetails.issueAssessmentCustomAttributeData ?? undefined,
  });

  return issueId;
};

const update = async (
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  backendClient: Sdk,
  issueKey: string,
  issueData: Omit<
    UpdateIssueMutationVariables,
    | 'Id'
    | 'OriginalTimestamp'
    | 'TagTypeIds'
    | 'tags'
    | 'departments'
    | 'contributorGroups'
    | 'contributorGroupIds'
    | 'ownerGroups'
    | 'ownerGroupIds'
  >
) => {
  const existingId = issueKey.split('/').pop();

  if (!existingId) {
    throw new BadRequest('Invalid RS reference');
  }

  const existingNode = await getNode(hasuraClient, existingId);
  if (
    !existingNode ||
    // @TODO: add all relevant types if needed
    (existingNode.ObjectType !== ParentTypeEnum.IssueRiskEvent &&
      existingNode.ObjectType !== ParentTypeEnum.Issue)
  ) {
    throw new BadRequest('Invalid RS reference');
  }

  const existingIssue = await backendClient.getIssueDetailsById({
    Id: existingId,
  });

  const existingIssueData = existingIssue.issue_by_pk;
  if (!existingIssueData) {
    throw new BadRequest('Invalid RS reference');
  }

  await backendClient.updateIssue({
    ...existingIssueData,
    ...issueData,
    Id: existingId,
    OriginalTimestamp: existingIssueData.ModifiedAtTimestamp,
    TagTypeIds: existingIssueData.tags.map((tag) => tag.TagTypeId),
    contributorGroupIds: existingIssueData.contributorGroups.map(
      (group) => group.UserGroupId
    ),
    ownerGroupIds: existingIssueData.ownerGroups.map(
      (group) => group.UserGroupId
    ),
    tags: existingIssueData.tags,
    departments: [issueData.DepartmentTypeIds].flat().map((id) => ({
      DepartmentTypeId: id,
      ParentId: existingId,
    })),
    contributorGroups: existingIssueData.contributorGroups,
    ownerGroups: existingIssueData.ownerGroups,
  });

  return existingId;
};

export const jiraToIssueHandler = async (
  input: {
    body: z.infer<typeof JiraIssueSchema>;
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

  const hasuraClient = getHasuraClient({
    authorization: evt.headers.authorization,
    tenantName,
  });

  const client = getBackendRestApiClient({
    tenant: tenantName,
    orgKey: claims['x-hasura-org-id'],
    userId,
    userRole: claims['x-hasura-default-role'],
  });

  logger.info('Calling Jira to Issue handler for user on tenant', {
    userId,
    tenantName,
  });

  // Get configuration values from secrets manager
  const config = await getConfig(secretName);

  const jiraApiClient = new JiraApiClient(
    config.JiraBaseUrl,
    config.JiraApiToken
  );

  const jiraLinkCustomAttribute: Record<string, string> = {};
  if (body.JiraLinkCustomAttribute) {
    jiraLinkCustomAttribute[body.JiraLinkCustomAttribute] =
      `${config.JiraBaseUrl}/browse/${body.Issue.Key}`;
  }

  const departmentTypeId = body.Issue.DepartmentName
    ? await getDepartmentType(client, body.Issue.DepartmentName)
    : undefined;

  const ownerIds = await Promise.all(
    body.Issue.OwnerAccountIds.map((accountId) =>
      getRiskSmartUserIdFromJiraUser({
        apiClient: client,
        jiraApiClient,
        accountId,
        email: undefined,
        fallbackUserId: body.FallbackUserId,
      })
    )
  );

  if (!ownerIds?.length) {
    logger.info('Insufficient data provided - issue creation/update deferred', {
      providedFields: Object.keys(body.Issue),
      requiredFields: ['OwnerAccountIds'],
    });

    return {
      statusCode: 202,
      body: JSON.stringify({
        message: 'Request accepted - insufficient data for issue processing',
        status: 'deferred',
      }),
    };
  }

  const contributorIds: string[] = [];

  const addContributorId = async (accountId?: string) => {
    if (accountId) {
      contributorIds.push(
        await getRiskSmartUserIdFromJiraUser({
          apiClient: client,
          jiraApiClient,
          accountId,
          fallbackUserId: body.FallbackUserId,
        })
      );
    }
  };

  if (
    body.Issue.ContributorAccountIds &&
    body.Issue.ContributorAccountIds.length > 0
  ) {
    await Promise.all(
      body.Issue.ContributorAccountIds.map((accountId) =>
        addContributorId(accountId)
      )
    );
  }

  const issue = {
    Title: body.Issue.Title,
    Details: body.Issue.Description,
    ImpactsCustomer: body.Issue.ImpactsCustomer,
    IsExternalIssue: body.Issue.IsExternalIssue,
    DateOccurred: body.Issue.DateOccurred!,
    DateIdentified: body.Issue.DateIdentified ?? new Date().toISOString(),
    Type: body.IssueTypeOverride ?? ParentTypeEnum.Issue,
    CustomAttributeData: {
      ...jiraLinkCustomAttribute,
      ...body.Issue.CustomAttributeData,
    },
    Meta: {
      JiraIssueKey: body.Issue.Key,
    },
    Departments: departmentTypeId
      ? [{ DepartmentTypeId: departmentTypeId }]
      : [],
    DepartmentTypeIds: departmentTypeId ? [departmentTypeId] : [],
    owners: ownerIds ? ownerIds.map((id) => ({ UserId: id })) : [],
    ownerIds: ownerIds ?? [],
    contributors:
      contributorIds.length > 0
        ? contributorIds.map((id) => ({ UserId: id }))
        : [],
    contributorIds: contributorIds,
  };

  if (body.Issue.RSUrl) {
    const existingId = await update(
      hasuraClient,
      client,
      body.Issue.RSUrl,
      issue
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        Id: existingId,
      }),
    };
  } else {
    const newId = await insert(hasuraClient, client, issue, {
      assessmentStatus: body.Issue.AssessmentStatus,
      issueAssessmentCustomAttributeData:
        body.Issue.IssueAssessmentCustomAttributeData,
      issueAssessmentTypeOverride: body.IssueAssessmentTypeOverride,
    });

    if (body.SetRefInJira && body.RSUrlCustomFieldKey) {
      logger.info('Adding RiskSmart issue URL to Jira issue');

      const webAppUrl = getEnv('WEB_APP_URL');

      const jiraUpdateResult = await jiraApiClient.updateIssue(body.Issue.Key, {
        fields: {
          [body.RSUrlCustomFieldKey]: new URL(
            `/issues/${newId}`,
            webAppUrl
          ).toString(),
        },
      });

      if (jiraUpdateResult === null) {
        logger.error(
          'Failed to update Jira issue with RiskSmart issue URL (404 - potentially permissions issue)',
          {
            issueKey: body.Issue.Key,
            customFieldId: body.RSUrlCustomFieldKey,
            newId,
          }
        );
        throw new BadRequest(
          'Failed to update Jira issue: ticket not found or permission issue.'
        );
      }
    } else {
      logger.info('Skipping setting RiskSmart issue URL in Jira issue');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        Id: newId,
      }),
    };
  }
};
