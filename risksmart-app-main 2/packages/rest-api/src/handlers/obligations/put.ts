import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { checkPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PutSchema } from './schema';

export const handler = backendRouteHandler(PutSchema, async (body) => {
  const sessionData = getSessionData(body.session_variables);
  const apiClient = getBackendRestApiClient(sessionData);
  const input = body.input.object;
  const Id = input.Id;

  await checkPermission(
    body,
    ParentTypeEnum.Obligation,
    AccessTypeEnum.Update,
    Id
  );

  await apiClient.updateObligation({
    Title: input.Title,
    Id: Id,
    ParentId: input.ParentId,
    Description: input.Description,
    CustomAttributeData: input.CustomAttributeData,
    Adherence: input.Adherence,
    Type: input.Type,
    Interpretation: input.Interpretation,
    owners: input.OwnerUserIds.map((UserId) => ({ UserId, ParentId: Id })),
    contributors: input.ContributorUserIds.map((UserId) => ({
      UserId,
      ParentId: Id,
    })),
    tags: input.TagTypeIds.map((TagTypeId) => ({ TagTypeId, ParentId: Id })),
    departments: input.DepartmentTypeIds.map((o) => ({
      DepartmentTypeId: o,
      ParentId: Id,
    })),
    ownerGroups: input.OwnerGroupIds.map((UserGroupId) => ({
      UserGroupId,
      ParentId: Id,
    })),
    contributorGroups: input.ContributorGroupIds.map((UserGroupId) => ({
      UserGroupId,
      ParentId: Id,
    })),
    contributorIds: input.ContributorUserIds,
    contributorGroupIds: input.ContributorGroupIds,
    ownerIds: input.OwnerUserIds,
    ownerGroupIds: input.OwnerGroupIds,
    TagTypeIds: input.TagTypeIds,
    DepartmentTypeIds: input.DepartmentTypeIds,
    schedule: {
      ...input.schedule,
      Id: input.Id,
    },
  });
  const { ctx, refreshObligationScheduleState } =
    createScheduleRefresh(sessionData);
  await refreshObligationScheduleState(ctx, Id);

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id,
    }),
  };
});
