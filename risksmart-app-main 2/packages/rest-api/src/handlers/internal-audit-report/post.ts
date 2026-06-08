import { randomUUID } from 'node:crypto';

import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { checkPermission } from 'src/services/role-access/roleAccessService';

import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (body) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const apiClient = getRisksmartApiClient(hasuraClient);

  const input = body.input.object;

  await checkPermission(
    body,
    ParentTypeEnum.InternalAuditReport,
    AccessTypeEnum.Insert,
    input.OriginatingItemId ?? []
  );

  const id = randomUUID();
  const result = await apiClient.insertInternalAuditReport({
    Id: id,
    OriginatingItemId: input.OriginatingItemId,
    Title: input.Title,
    Summary: input.Summary,
    ActualCompletionDate: input.ActualCompletionDate,
    NextTestDate: input.NextTestDate,
    StartDate: input.StartDate,
    TargetCompletionDate: input.TargetCompletionDate,
    CompletedByUser: input.CompletedByUser,
    Status: input.Status,
    CustomAttributeData: input.CustomAttributeData,
    Outcome: input.Outcome,
    Owners: input.OwnerUserIds.map((UserId) => ({ UserId, ParentId: id })),
    Contributors: input.ContributorUserIds.map((UserId) => ({
      UserId,
      ParentId: id,
    })),
    OwnerGroups: input.OwnerGroupIds.map((UserGroupId) => ({
      UserGroupId,
      ParentId: id,
    })),
    ContributorGroups: input.ContributorGroupIds.map((UserGroupId) => ({
      UserGroupId,
      ParentId: id,
    })),
    Tags: input.TagTypeIds.map((TagTypeId) => ({ TagTypeId, ParentId: id })),
    Departments: input.DepartmentTypeIds.map((DepartmentTypeId) => ({
      DepartmentTypeId,
      ParentId: id,
    })),
  });
  const assessmentId = result.insert_internal_audit_report_one?.Id;
  if (!assessmentId) {
    throw new Error('Missing internal audit report id');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: assessmentId,
    }),
  };
});
