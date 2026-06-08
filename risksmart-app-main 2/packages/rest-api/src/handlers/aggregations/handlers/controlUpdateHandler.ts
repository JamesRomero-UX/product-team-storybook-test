import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';

import {
  recalculateAncestorScores,
  recalculateTierThreeRiskScoresByControlId,
  recalculateTierThreeRiskScoresByRiskId,
} from '../calculators';
import type { ModelConfig } from '../models/types';
import type { RatingCategories } from '../ratingCategories';
import type { RiskScoreForInsert } from '../types';
import { upsertScores } from '../upsertScores';

export const handleControlUpdate = async <T>(
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  nodeId: string,
  op: string,
  model: ModelConfig<T>,
  config: T,
  orgKey: string,
  ratingCategories: RatingCategories
) => {
  let scores: RiskScoreForInsert[] = [];

  // When we are deleting a control, we have to look up things by the Risk
  // as the relationship has already been removed
  if (op === 'DELETE') {
    scores = await recalculateTierThreeRiskScoresByRiskId(
      hasuraClient,
      nodeId,
      config,
      model,
      ratingCategories
    );
  } else {
    scores = await recalculateTierThreeRiskScoresByControlId(
      hasuraClient,
      nodeId,
      config,
      model,
      ratingCategories
    );
  }

  await upsertScores(hasuraClient, scores, orgKey);

  const flattenedAncestorScores = await recalculateAncestorScores(
    hasuraClient,
    scores.map((score) => ({ riskId: score.RiskId!, isTierThree: true })),
    model,
    ratingCategories
  );

  await upsertScores(hasuraClient, flattenedAncestorScores, orgKey);
};
