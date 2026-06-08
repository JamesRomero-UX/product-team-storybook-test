import {
  AccessTypeEnum,
  GetEntityByIdWithDescendantsDocument,
  ParentTypeEnum,
} from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getLogger } from 'src/logger';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { getNode } from 'src/services/node/nodeService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PutSchema } from './schema';

const logger = getLogger();

export const handler = backendRouteHandler(PutSchema, async (request) => {
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

    const { data: entityData } = await hasuraClient.query({
      query: GetEntityByIdWithDescendantsDocument,
      variables: { Id: input.Id },
    });
    if (
      entityData.entity_by_pk?.descendants?.some((e) => input.ParentId === e.Id)
    ) {
      throw new BadRequest('Cannot set parent to a descendant');
    }

    parent = parentNode;
  }

  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    parentObject: parent,
    objectType: ParentTypeEnum.Entity,
    accessType: AccessTypeEnum.Update,
  });

  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }

  const result = await apiClient.updateEntity({
    where: { Id: { _eq: input.Id } },
    _set: {
      Name: input.Name,
      ParentId: input.ParentId,
      Description: input.Description,
      Weight: input.Weight,
    },
    Id: input.Id,
    owners: input.owners.map((o) => ({ UserId: o, ParentId: input.Id })),
    ownerIds: input.owners,
    ownerGroups: input.ownerGroups.map((g) => ({
      UserGroupId: g,
      ParentId: input.Id,
    })),
    ownerGroupIds: input.ownerGroups,
  });

  const affectedRows = result.update_entity?.affected_rows;
  if (!affectedRows) {
    logger.warn('No rows affected');

    return {
      statusCode: 404,
      body: JSON.stringify({
        affected_rows: result.update_entity?.affected_rows,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows: result.update_entity?.affected_rows,
    }),
  };
});
