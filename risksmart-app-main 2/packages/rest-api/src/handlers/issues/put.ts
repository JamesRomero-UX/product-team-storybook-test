import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { checkPermission } from 'src/services/role-access/roleAccessService';

import { PutSchema } from './schema';

export const handler = backendRouteHandler(PutSchema, async (body) => {
  const hasuraClient = getHasuraBackendClientForAction(body);
  const userApiClient = getRisksmartApiClient(hasuraClient);

  const input = body.input.object;

  await checkPermission(
    body,
    ParentTypeEnum.Issue,
    AccessTypeEnum.Update,
    input.Id
  );

  const { update_issue } = await userApiClient.updateIssue({
    Title: input.Title,
    Id: input.Id,
    Details: input.Details ?? '',
    CustomAttributeData: input.CustomAttributeData,
    DateIdentified: input.DateIdentified,
    DateOccurred: input.DateOccurred,
    ImpactsCustomer: input.ImpactsCustomer,
    IsExternalIssue: input.IsExternalIssue,
    TagTypeIds: input.TagTypeIds,
    DepartmentTypeIds: input.DepartmentTypeIds,
    contributorIds: input.ContributorUserIds,
    ownerIds: input.OwnerUserIds,
    ownerGroupIds: input.OwnerGroupIds,
    contributorGroupIds: input.ContributorGroupIds,
    OriginalTimestamp: input.OriginalTimestamp,
    tags: input.TagTypeIds.map((o) => ({ TagTypeId: o, ParentId: input.Id })),
    departments: input.DepartmentTypeIds.map((o) => ({
      DepartmentTypeId: o,
      ParentId: input.Id,
    })),
    contributors: input.ContributorUserIds.map((id) => ({
      UserId: id,
      ParentId: input.Id,
    })),
    owners: input.OwnerUserIds.map((id) => ({
      UserId: id,
      ParentId: input.Id,
    })),
    contributorGroups: input.ContributorGroupIds.map((id) => ({
      UserGroupId: id,
      ParentId: input.Id,
    })),
    ownerGroups: input.OwnerGroupIds.map((id) => ({
      UserGroupId: id,
      ParentId: input.Id,
    })),
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows: update_issue?.affected_rows,
    }),
  };
});
