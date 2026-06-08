import { randomUUID } from 'crypto';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { getNode } from 'src/services/node/nodeService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (request) => {
  const hasuraClient = getHasuraBackendClientForAction(request);
  const apiClient = getRisksmartApiClient(hasuraClient);
  const sessionData = getSessionData(request.session_variables);
  const {
    input: { object: input },
  } = request;
  let parent;

  if (input.ParentId) {
    const parentNode = await getNode(hasuraClient, input.ParentId);

    const allowedParentTypes: ParentTypeEnum[] = [ParentTypeEnum.Entity];
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
    parentObject: parent,
    objectType: ParentTypeEnum.Entity,
    accessType: AccessTypeEnum.Insert,
  });
  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }

  const id = randomUUID();

  const result = await apiClient.insertEntity({
    object: {
      Id: id,
      ParentId: input.ParentId,
      Name: input.Name,
      Description: input.Description,
      Weight: input.Weight,
      owners: { data: input.owners.map((o) => ({ UserId: o })) },
      ownerGroups: {
        data: input.ownerGroups.map((g) => ({ UserGroupId: g })),
      },
    },
  });
  const entityId = result.insert_entity_one?.Id;
  if (!entityId) {
    throw new Error('Missing entity id');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: result.insert_entity_one?.Id,
    }),
  };
});
