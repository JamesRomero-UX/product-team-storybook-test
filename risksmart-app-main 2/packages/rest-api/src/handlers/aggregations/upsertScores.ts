import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { getLogger } from 'src/logger';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';

import type { RiskScoreForInsert } from './types';

const logger = getLogger();

export const upsertScores = async (
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  scores: RiskScoreForInsert[],
  orgKey: string
) => {
  logger.info('Upserting aggregated risk scored', {
    scoreCount: scores.length,
  });

  const apiClient = getRisksmartApiClient(hasuraClient);
  const { insert_risk_score } = await apiClient.upsertRiskScores({
    scores: scores.map((score) => ({
      ...score,
      OrgKey: orgKey,
      CreatedAtTimestamp: new Date().toISOString(),
      ModifiedAtTimestamp: new Date().toISOString(),
    })),
  });

  return insert_risk_score;
};
