import crypto from 'crypto';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { insertChildControl } from 'src/services/control/controlService';
import { getNode } from 'src/services/node/nodeService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (body) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const sessionData = getSessionData(body.session_variables);
  const input = body.input.object;
  const parent = await getNode(hasuraClient, input.ParentId);
  const allowedParentTypes: ParentTypeEnum[] = [
    ParentTypeEnum.Risk,
    ParentTypeEnum.Obligation,
    ParentTypeEnum.ThirdParty,
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
    objectType: ParentTypeEnum.Control,
    accessType: AccessTypeEnum.Insert,
  });
  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }

  const Id = crypto.randomUUID();
  const id = await insertChildControl(hasuraClient, {
    ParentId: parent.Id,
    Title: input.Title,
    Id,
    Type: input.Type,

    Description: input.Description,
    CustomAttributeData: input.CustomAttributeData,
    Owners: input.OwnerUserIds.map((UserId) => ({ UserId, ParentId: Id })),
    Contributors: input.ContributorUserIds.map((UserId) => ({
      UserId,
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
    Tags: input.TagTypeIds.map((TagTypeId) => ({ TagTypeId, ParentId: Id })),
    Departments: input.DepartmentTypeIds.map((DepartmentTypeId) => ({
      DepartmentTypeId,
      ParentId: Id,
    })),
    schedule: {
      ...input.schedule,
      Id,
    },
  });
  if (!id) {
    throw new Error('Missing control Id');
  }

  const { ctx, refreshControlScheduleState } =
    createScheduleRefresh(sessionData);
  await refreshControlScheduleState(ctx, id);

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: id,
    }),
  };
});
