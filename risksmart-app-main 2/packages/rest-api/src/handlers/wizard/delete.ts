import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { checkPermission } from 'src/services/role-access/roleAccessService';

import { DeleteSchema } from './schema';

export const handler = backendRouteHandler(DeleteSchema, async (request) => {
  const hasuraClient = getHasuraBackendClientForAction(request);
  const apiClient = getRisksmartApiClient(hasuraClient);
  const {
    input: { RiskId: riskId },
  } = request;

  await checkPermission(
    request,
    ParentTypeEnum.Assessment,
    AccessTypeEnum.Update,
    riskId
  );

  await checkPermission(
    request,
    ParentTypeEnum.Control,
    AccessTypeEnum.Update,
    riskId
  );

  const result = await apiClient.deleteWizard({ RiskId: riskId });

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows: result.delete_wizard?.affected_rows,
    }),
  };
});
