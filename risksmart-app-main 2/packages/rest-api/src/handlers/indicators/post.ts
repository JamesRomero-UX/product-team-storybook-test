import crypto from 'crypto';
import {
  AccessTypeEnum,
  IndicatorTypeEnum,
  ParentTypeEnum,
} from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { insertChildIndicator } from 'src/services/indicator/indicatorService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (body) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const sessionData = getSessionData(body.session_variables);
  const apiClient = getBackendRestApiClient(sessionData);
  const input = body.input.object;
  const { node_by_pk: parent } = await apiClient.getNode({
    Id: input.ParentId,
  });
  const allowedParentTypes: ParentTypeEnum[] = [
    ParentTypeEnum.Risk,
    ParentTypeEnum.Control,
  ];
  if (!parent) {
    throw new Forbidden('Access to parent denied');
  }
  if (!allowedParentTypes.includes(parent.ObjectType)) {
    throw new Forbidden('Invalid parent type');
  }

  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    parentObject: parent,
    objectType: ParentTypeEnum.Indicator,
    accessType: AccessTypeEnum.Insert,
  });
  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }
  const Id = crypto.randomUUID();
  const id = await insertChildIndicator(hasuraClient, {
    ParentId: parent.Id,
    Title: input.Title,
    Id,
    Type: input.Type,
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
    Owners: input.OwnerUserIds.map((UserId) => ({ UserId, ParentId: Id })),
    Contributors: input.ContributorUserIds.map((UserId) => ({
      UserId,
      ParentId: Id,
    })),
    Tags: input.TagTypeIds.map((TagTypeId) => ({ TagTypeId, ParentId: Id })),
    Departments: input.DepartmentTypeIds.map((o) => ({
      DepartmentTypeId: o,
      ParentId: Id,
    })),
    OwnerGroups: input.OwnerGroupIds.map((UserGroupId) => ({
      UserGroupId,
      ParentId: Id,
    })),
    ContributorGroups: input.ContributorGroupIds.map((UserGroupId) => ({
      UserGroupId,
      ParentId: Id,
    })),
    schedule: {
      ...input.schedule,
      Id,
    },
  });

  const { ctx, refreshIndicatorScheduleState } =
    createScheduleRefresh(sessionData);
  await refreshIndicatorScheduleState(ctx, Id);

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: id,
    }),
  };
});
