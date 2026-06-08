import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getLogger } from 'src/logger';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { LinkSchema } from './schema';

const logger = getLogger();

export const handler = backendRouteHandler(LinkSchema, async (request) => {
  const hasuraClient = getHasuraBackendClientForAction(request);
  const sessionData = getSessionData(request.session_variables);
  const apiClient = getBackendRestApiClient(sessionData);

  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    objectType: ParentTypeEnum.EnterpriseRisk,
    accessType: AccessTypeEnum.Update,
  });

  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }

  const result = await apiClient.linkEnterpriseRisk({
    objects: request.input.objects.map((item) => ({
      RiskId: item.RiskId,
      EnterpriseRiskId: item.EnterpriseRiskId || null,
      EntityId: item.EntityId,
    })),
  });

  const affectedRows = result.insert_enterprise_risk_instance?.affected_rows;
  if (
    affectedRows === undefined ||
    affectedRows === null ||
    affectedRows === 0
  ) {
    logger.warn('Link enterprise risk returned no data');

    return {
      statusCode: 404,
      body: JSON.stringify({
        affected_rows: result.insert_enterprise_risk_instance?.affected_rows,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows: result.insert_enterprise_risk_instance?.affected_rows,
    }),
  };
});
