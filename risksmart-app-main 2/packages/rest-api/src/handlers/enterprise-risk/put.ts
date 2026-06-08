import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
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

    const allowedParentTypes: ParentTypeEnum[] = [
      ParentTypeEnum.EnterpriseRisk,
    ];
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
    objectType: ParentTypeEnum.EnterpriseRisk,
    accessType: AccessTypeEnum.Update,
  });

  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }

  const result = await apiClient.updateEnterpriseRisk({
    where: { Id: { _eq: input.Id } },
    _set: {
      ParentId: input.ParentId,
      Title: input.Title,
      Tier: input.Tier,
      Description: input.Description,
      Treatment: input.Treatment,
      CustomAttributeData: input.CustomAttributeData,
    },
  });

  const affectedRows = result.update_enterprise_risk?.affected_rows;
  if (!affectedRows) {
    logger.warn('No rows affected');

    return {
      statusCode: 404,
      body: JSON.stringify({
        affected_rows: result.update_enterprise_risk?.affected_rows,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows: result.update_enterprise_risk?.affected_rows,
    }),
  };
});
