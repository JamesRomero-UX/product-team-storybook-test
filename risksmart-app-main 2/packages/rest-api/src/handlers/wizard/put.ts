import {
  AccessTypeEnum,
  ParentTypeEnum,
  WizardStatusEnum,
} from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { checkPermission } from 'src/services/role-access/roleAccessService';

import { PutSchema } from './schema';

export const handler = backendRouteHandler(PutSchema, async (request) => {
  const hasuraClient = getHasuraBackendClientForAction(request);
  const apiClient = getRisksmartApiClient(hasuraClient);
  const {
    input: { object: input },
  } = request;

  await checkPermission(
    request,
    ParentTypeEnum.Assessment,
    AccessTypeEnum.Update,
    input.RiskId
  );

  await checkPermission(
    request,
    ParentTypeEnum.Control,
    AccessTypeEnum.Update,
    input.RiskId
  );

  const result = await apiClient.updateWizard({
    RiskId: input.RiskId,
    CurrentStep: input.CurrentStep,
    Status: input.Status ?? WizardStatusEnum.InProgress,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows: result.update_wizard?.affected_rows,
    }),
  };
});
