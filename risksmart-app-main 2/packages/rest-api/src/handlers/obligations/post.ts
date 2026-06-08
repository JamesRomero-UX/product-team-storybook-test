import { randomUUID } from 'crypto';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { getNode } from 'src/services/node/nodeService';
import type { ObjectWithContributors } from 'src/services/role-access/roleAccessService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (body) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const apiClient = getRisksmartApiClient(hasuraClient);
  const sessionData = getSessionData(body.session_variables);

  const input = body.input.object;

  let parent: ObjectWithContributors | null | undefined = null;
  if (input.ParentId) {
    const parentNode = await getNode(hasuraClient, input.ParentId);

    const allowedParentTypes: ParentTypeEnum[] = [ParentTypeEnum.Obligation];
    if (!parentNode) {
      throw new Forbidden('Access to parent denied');
    }
    if (!allowedParentTypes.includes(parentNode.ObjectType)) {
      throw new Forbidden('Invalid parent type');
    }
    parent = parentNode;
  }

  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    objectType: ParentTypeEnum.Obligation,
    accessType: AccessTypeEnum.Insert,
    parentObject: parent,
  });
  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }

  const id = randomUUID();

  const result = await apiClient.insertObligation({
    Id: id,
    ParentId: input.ParentId,
    Title: input.Title,
    Type: input.Type,
    Adherence: input.Adherence,
    Interpretation: input.Interpretation,
    Description: input.Description,
    CustomAttributeData: input.CustomAttributeData,
    Owners: input.OwnerUserIds.map((UserId) => ({ UserId })),
    Contributors: input.ContributorUserIds.map((UserId) => ({
      UserId,
    })),
    OwnerGroups: input.OwnerGroupIds.map((UserGroupId) => ({
      UserGroupId,
    })),
    ContributorGroups: input.ContributorGroupIds.map((UserGroupId) => ({
      UserGroupId,
    })),
    Tags: input.TagTypeIds.map((TagTypeId) => ({ TagTypeId })),
    Departments: input.DepartmentTypeIds.map((DepartmentTypeId) => ({
      DepartmentTypeId,
    })),
    schedule: {
      ...input.schedule,
      Id: id,
    },
  });
  const obligationId = result.insert_obligation_one?.Id;
  if (!obligationId) {
    throw new Error('Missing obligation id');
  }

  const { ctx, refreshObligationScheduleState } =
    createScheduleRefresh(sessionData);
  await refreshObligationScheduleState(ctx, obligationId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: obligationId,
    }),
  };
});
