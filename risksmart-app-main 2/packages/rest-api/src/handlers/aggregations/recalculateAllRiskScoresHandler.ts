import { RiskScoringModelEnum } from 'generated/graphql';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { initI18n } from 'src/i18n';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { getSessionData } from 'src/session';
import { z } from 'zod';

import { getLogger } from '../../logger';
import { recalculate as recalculateEnterpriseRiskScores } from './enterpriseRiskScore';
import { models } from './models';
import type { ModelConfig } from './models/types';
import { getRatingCategories } from './ratingCategories';
import {
  recalculateAllRiskScoresForAggregationBasedModels,
  recalculateAllRiskScoresForDefaultRiskModel,
} from './riskScoreCalculationService';

const logger = getLogger();

export const handler = backendRouteHandler(z.any(), async (body) => {
  const sessionData = getSessionData(body.session_variables);

  const hasuraClient = getHasuraAdminClient(sessionData.tenant);
  const apiClient = getRisksmartApiClient(hasuraClient);

  await initI18n(sessionData.orgKey, hasuraClient);

  const { aggregation_org } = await apiClient.getAggregationSettingsForOrg({
    OrgKey: sessionData.orgKey,
  });
  const aggregationSettings = aggregation_org[0];

  const riskScoringModel: RiskScoringModelEnum =
    aggregationSettings?.RiskScoringModel ?? RiskScoringModelEnum.Default;
  logger.appendKeys({ riskScoringModel });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const model = models[riskScoringModel] as ModelConfig<any>;
  const config = aggregationSettings?.Config;

  const ratingCategories = await getRatingCategories(
    apiClient,
    sessionData.orgKey,
    sessionData.tenant
  );

  if (model.requiresAggregation) {
    await recalculateAllRiskScoresForAggregationBasedModels(
      sessionData.orgKey,
      hasuraClient,
      model,
      config,
      ratingCategories
    );
  } else {
    await recalculateAllRiskScoresForDefaultRiskModel(
      sessionData.orgKey,
      hasuraClient,
      model,
      config,
      ratingCategories
    );
  }

  // Recalculate enterprise risk scores after any of the above events
  await recalculateEnterpriseRiskScores(sessionData.orgKey, sessionData.tenant);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Recalculated all risk scores' }),
  };
});
