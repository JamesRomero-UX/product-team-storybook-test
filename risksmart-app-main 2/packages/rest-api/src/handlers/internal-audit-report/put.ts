import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { checkPermission } from 'src/services/role-access/roleAccessService';

import { PutSchema } from './schema';

export const handler = backendRouteHandler(PutSchema, async (body) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const apiClient = getRisksmartApiClient(hasuraClient);
  const input = body.input.object;

  await checkPermission(
    body,
    ParentTypeEnum.InternalAuditReport,
    AccessTypeEnum.Update,
    input.Id
  );

  const result = await apiClient.updateInternalAuditReport({
    Id: input.Id,
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
    OriginatingItemId: input.OriginatingItemId,
    owners: input.OwnerUserIds.map((UserId) => ({
      UserId,
      ParentId: input.Id,
    })),
    contributors: input.ContributorUserIds.map((UserId) => ({
      UserId,
      ParentId: input.Id,
    })),
    ownerGroups: input.OwnerGroupIds.map((UserGroupId) => ({
      UserGroupId,
      ParentId: input.Id,
    })),
    contributorGroups: input.ContributorGroupIds.map((UserGroupId) => ({
      UserGroupId,
      ParentId: input.Id,
    })),
    tags: input.TagTypeIds.map((TagTypeId) => ({
      TagTypeId,
      ParentId: input.Id,
    })),
    departments: input.DepartmentTypeIds.map((DepartmentTypeId) => ({
      DepartmentTypeId,
      ParentId: input.Id,
    })),
    contributorIds: input.ContributorUserIds,
    contributorGroupIds: input.ContributorGroupIds,
    ownerIds: input.OwnerUserIds,
    ownerGroupIds: input.OwnerGroupIds,
    TagTypeIds: input.TagTypeIds,
    DepartmentTypeIds: input.DepartmentTypeIds,
  });
  const affected_rows = result.update_internal_audit_report?.affected_rows;

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows,
    }),
  };
});
