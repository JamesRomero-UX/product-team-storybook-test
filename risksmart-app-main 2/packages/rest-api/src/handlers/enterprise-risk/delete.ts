import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getLogger } from 'src/logger';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { checkPermission } from 'src/services/role-access/roleAccessService';

import { DeleteSchema } from './schema';

const logger = getLogger();

export const handler = backendRouteHandler(DeleteSchema, async (request) => {
  const hasuraClient = getHasuraBackendClientForAction(request);
  const apiClient = getRisksmartApiClient(hasuraClient);

  await checkPermission(
    request,
    ParentTypeEnum.EnterpriseRisk,
    AccessTypeEnum.Delete,
    request.input.Id
  );

  const result = await apiClient.deleteEnterpriseRisk({
    where: { Id: { _eq: request.input.Id } },
  });

  const affectedRows = result.delete_enterprise_risk?.affected_rows;
  if (!affectedRows) {
    logger.warn('No rows affected');

    return {
      statusCode: 404,
      body: JSON.stringify({
        affected_rows: result.delete_enterprise_risk?.affected_rows,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows: result.delete_enterprise_risk?.affected_rows,
    }),
  };
});
