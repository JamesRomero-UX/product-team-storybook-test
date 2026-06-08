import crypto from 'crypto';
import type {
  GetNodeQuery,
  InsertIssueWithoutParentMutationVariables,
} from 'generated/graphql';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { getNode } from 'src/services/node/nodeService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (body) => {
  const hasuraClient = getHasuraBackendClientForAction(body);
  const sessionData = getSessionData(body.session_variables);
  const hasuraAdminClient = getHasuraAdminClient(sessionData.tenant);

  const input = body.input.object;
  let parent: GetNodeQuery['node_by_pk'] | null = null;
  if (input.ParentId) {
    parent = await getNode(hasuraClient, input.ParentId);
    const allowedParentTypes: ParentTypeEnum[] = [
      ParentTypeEnum.Obligation,
      ParentTypeEnum.Document,
      ParentTypeEnum.Control,
      ParentTypeEnum.Assessment,
      ParentTypeEnum.ComplianceMonitoringAssessment,
      ParentTypeEnum.InternalAuditReport,
      ParentTypeEnum.InternalAuditEntity,
      ParentTypeEnum.ThirdParty,
    ];
    if (!parent) {
      throw new Forbidden('Access to parent denied');
    }
    if (!allowedParentTypes.includes(parent.ObjectType)) {
      throw new Forbidden('Invalid parent type');
    }

    if (!Object.values(ParentTypeEnum).includes(input.Type as ParentTypeEnum)) {
      throw new Forbidden('Invalid parent type');
    }

    const permissionGranted = await hasPermission(hasuraClient, {
      userId: sessionData.userId,
      parentObject: parent,
      objectType: ParentTypeEnum.Issue,
      accessType: AccessTypeEnum.Insert,
    });
    if (!permissionGranted) {
      throw new Forbidden('Access denied');
    }
  } else {
    const hasPublicIssuePermission = await hasPermission(hasuraClient, {
      userId: sessionData.userId,
      objectType: ParentTypeEnum.PublicIssueForm,
      accessType: AccessTypeEnum.Read,
    });
    if (!hasPublicIssuePermission) {
      throw new Forbidden('Access denied');
    }
  }

  const issueType = input.Type as ParentTypeEnum;
  const allowedParentIssueTypes: ParentTypeEnum[] = [
    ParentTypeEnum.Issue,
    ParentTypeEnum.IssueBreachLog,
    ParentTypeEnum.IssueConsumerDuty,
    ParentTypeEnum.IssueCustomerTrust,
    ParentTypeEnum.IssueGdprBreachLog,
    ParentTypeEnum.IssuePciBreachLog,
    ParentTypeEnum.IssueRiskEvent,
    ParentTypeEnum.IssueSarLog,
  ];

  if (!allowedParentIssueTypes.includes(issueType)) {
    throw new Forbidden('Invalid issue type');
  }

  const Id = crypto.randomUUID();

  const variables: InsertIssueWithoutParentMutationVariables = {
    Title: input.Title,
    Id,
    Details: input.Details,
    CustomAttributeData: input.CustomAttributeData,
    DateIdentified: input.DateIdentified,
    DateOccurred: input.DateOccurred,
    ImpactsCustomer: input.ImpactsCustomer,
    IsExternalIssue: input.IsExternalIssue,
    Type: issueType,
    Tags: input.TagTypeIds.map((o) => ({ TagTypeId: o, ParentId: Id })),
    Departments: input.DepartmentTypeIds.map((o) => ({
      DepartmentTypeId: o,
      ParentId: Id,
    })),
    contributors: input.ContributorUserIds.map((id) => ({
      UserId: id,
      ParentId: Id,
    })),
    owners: input.OwnerUserIds.map((id) => ({
      UserId: id,
      ParentId: Id,
    })),
    contributorGroups: input.ContributorGroupIds.map((id) => ({
      UserGroupId: id,
      ParentId: Id,
    })),
    ownerGroups: input.OwnerGroupIds.map((id) => ({
      UserGroupId: id,
      ParentId: Id,
    })),
    Meta: input.Meta,
  };

  const userApiClient = getRisksmartApiClient(hasuraClient);
  const adminApiClient = getRisksmartApiClient(hasuraAdminClient);

  let sequentialId: number | null | undefined;

  if (parent) {
    const result = await userApiClient.insertIssue({
      ...variables,
      ParentId: parent.Id,
      ParentType: parent.ObjectType,
    });
    sequentialId = result.insert_issue_one?.SequentialId;
  } else {
    // User may not have permission to read sequential ID, so grab via admin client
    await userApiClient.insertIssueWithoutParent(variables);
    const { issue_by_pk } = await adminApiClient.getIssueById({ Id });
    sequentialId = issue_by_pk?.SequentialId;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id,
      SequentialId: sequentialId,
    }),
  };
});
