import {
  AccessTypeEnum,
  GetWizardDocument,
  ParentTypeEnum,
} from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { checkPermission } from 'src/services/role-access/roleAccessService';

import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (request) => {
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

  const wizard = await hasuraClient.query({
    query: GetWizardDocument,
    variables: { RiskId: input.RiskId },
  });

  if (wizard.data.wizard_by_pk?.RiskId === input.RiskId) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        RiskId: '',
      }),
    };
  }

  const result = await apiClient.insertWizard({
    object: {
      RiskId: input.RiskId,
      AssessmentId: input.AssessmentId,
      CurrentStep: 0,
      Status: input.Status,
      ActivityId: input.ActivityId,
    },
  });

  const riskId = result.insert_wizard_one?.RiskId;
  if (!riskId) {
    throw new Error('Missing risk id');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      RiskId: riskId,
    }),
  };
});
