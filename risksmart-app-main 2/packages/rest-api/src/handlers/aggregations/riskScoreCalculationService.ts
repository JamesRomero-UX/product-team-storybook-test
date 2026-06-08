import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { RiskBoolExp } from 'generated/graphql';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';

import {
  calculateNonAggregatedScoreFromModel,
  recalculateRiskScoresByTier,
  recalculateTierThreeRiskScoresByRiskId,
} from './calculators';
import type { ModelConfig } from './models/types';
import type { RatingCategories } from './ratingCategories';
import { upsertScores } from './upsertScores';

export const recalculateRiskScoreForDefaultRiskModel = async <T>(
  riskId: string,
  orgKey: string,
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  model: ModelConfig<T>,
  config: T,
  ratingCategories: RatingCategories
) => {
  await recalculateRiskScoresForDefaultRiskModel(
    { Id: { _eq: riskId } },
    orgKey,
    hasuraClient,
    model,
    config,
    ratingCategories
  );
};

const recalculateRiskScoresForDefaultRiskModel = async <T>(
  riskDataWhereClause: RiskBoolExp,
  orgKey: string,
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  model: ModelConfig<T>,
  config: T,
  ratingCategories: RatingCategories
) => {
  // No need to delete risk scores as fk constraints handle this as required.
  const apiClient = getRisksmartApiClient(hasuraClient);
  const { risk: risks } = await apiClient.getRiskScoreData({
    where: riskDataWhereClause,
  });
  const scores = risks.map((risk) =>
    calculateNonAggregatedScoreFromModel({
      risk,
      config,
      model,
      inherentRatingCategories: ratingCategories.inherentRatingCategories,
      residualRatingCategories: ratingCategories.residualRatingCategories,
    })
  );
  await upsertScores(hasuraClient, scores, orgKey);
};

export const recalculateAllRiskScoresForDefaultRiskModel = async <T>(
  orgKey: string,
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  model: ModelConfig<T>,
  config: T,
  ratingCategories: RatingCategories
) => {
  await recalculateRiskScoresForDefaultRiskModel(
    { OrgKey: { _eq: orgKey } },
    orgKey,
    hasuraClient,
    model,
    config,
    ratingCategories
  );
};

/**
 * Recalculated all risk scores for risk scoring models that are based on aggregation
 * @param orgKey
 * @param hasuraClient
 * @param model
 * @param config
 */
export const recalculateAllRiskScoresForAggregationBasedModels = async <T>(
  orgKey: string,
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  model: ModelConfig<T>,
  config: T,
  ratingCategories: RatingCategories
) => {
  const apiClient = getRisksmartApiClient(hasuraClient);

  await apiClient.deleteRiskScoresForOrg({ OrgKey: orgKey });

  const { risk: tierThreeRisks } = await apiClient.getTierThreeRisks({
    OrgKey: orgKey,
  });

  await Promise.all(
    tierThreeRisks.map(async (risk) => {
      const scores = await recalculateTierThreeRiskScoresByRiskId(
        hasuraClient,
        risk.Id,
        config,
        model,
        ratingCategories
      );

      await upsertScores(hasuraClient, scores, risk.OrgKey);
    })
  );

  const tierTwoScores = await recalculateRiskScoresByTier({
    hasuraClient,
    orgKey,
    tier: 2,
    model,
    ratingCategories,
  });
  await upsertScores(hasuraClient, tierTwoScores, orgKey);

  const tierOneScores = await recalculateRiskScoresByTier({
    hasuraClient,
    orgKey,
    tier: 1,
    model,
    ratingCategories,
  });
  await upsertScores(hasuraClient, tierOneScores, orgKey);
};
