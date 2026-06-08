import {
  AccessTypeEnum,
  IndicatorTypeEnum,
  ParentTypeEnum,
} from 'generated/graphql';
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
    ParentTypeEnum.Indicator,
    AccessTypeEnum.Update,
    input.Id
  );

  await apiClient.updateIndicator({
    Title: input.Title,
    Id: Id,
    Description: input.Description,
    CustomAttributeData: input.CustomAttributeData,
    Unit: input.Unit,
    UpperToleranceNum:
      input.Type === IndicatorTypeEnum.Number ? input.UpperToleranceNum : null,
    LowerToleranceNum:
      input.Type === IndicatorTypeEnum.Number ? input.LowerToleranceNum : null,
    TargetValueTxt:
      input.Type === IndicatorTypeEnum.Text ? input.TargetValueTxt : null,
    UpperAppetiteNum:
      input.Type === IndicatorTypeEnum.Number ? input.UpperAppetiteNum : null,
    LowerAppetiteNum:
      input.Type === IndicatorTypeEnum.Number ? input.LowerAppetiteNum : null,
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
  const { ctx, refreshIndicatorScheduleState } =
    createScheduleRefresh(sessionData);
  await refreshIndicatorScheduleState(ctx, Id);

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id,
    }),
  };
});
