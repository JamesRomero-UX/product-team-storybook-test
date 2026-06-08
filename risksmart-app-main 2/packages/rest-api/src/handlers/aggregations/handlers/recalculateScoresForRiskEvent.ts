import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { Risk } from 'generated/graphql';

import { getLogger } from '../../../logger';
import { recalculateAncestorScores } from '../calculators';
import type { ModelConfig } from '../models/types';
import type { RatingCategories } from '../ratingCategories';
import { recalculateAllRiskScoresForAggregationBasedModels } from '../riskScoreCalculationService';
import { upsertScores } from '../upsertScores';

const logger = getLogger();

export const recalculateScoresForRiskEvent = async <T>(
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  riskEvent: {
    newRisk: Pick<Risk, 'Id' | 'ParentRiskId' | 'Tier'> | null;
    oldRisk: Pick<Risk, 'Id' | 'ParentRiskId' | 'Tier'> | null;
    op: 'INSERT' | 'DELETE' | 'UPDATE';
  },
  model: ModelConfig<T>,
  config: T,
  orgKey: string,
  ratingCategories: RatingCategories
) => {
  const { newRisk, oldRisk, op } = riskEvent;
  switch (op) {
    case 'INSERT':
      {
        if (newRisk?.Tier === 1) {
          logger.info('Skipping Tier 1 risk');

          return;
        }

        if (!newRisk?.ParentRiskId) {
          throw new Error('missing parent risk id');
        }
        // Clear parent score
        const scores = await recalculateAncestorScores(
          hasuraClient,
          [{ riskId: newRisk.ParentRiskId }],
          model,
          ratingCategories
        );

        await upsertScores(hasuraClient, scores, orgKey);
      }
      break;
    case 'DELETE':
      {
        if (oldRisk?.Tier === 1) {
          logger.info('Deleted risk is tier 1. Skipping recalculation');

          return;
        }

        if (!oldRisk?.ParentRiskId) {
          logger.info(
            'Deleted risk does not have a parent. Skipping recalculation'
          );

          return;
        }

        await recalculateAllRiskScoresForAggregationBasedModels(
          orgKey,
          hasuraClient,
          model,
          config,
          ratingCategories
        );
      }
      break;
    case 'UPDATE':
      {
        if (newRisk?.ParentRiskId === oldRisk?.ParentRiskId) {
          logger.info('Parent risk unchanged. Skipping calculation');

          return;
        }

        await recalculateAllRiskScoresForAggregationBasedModels(
          orgKey,
          hasuraClient,
          model,
          config,
          ratingCategories
        );
      }
      break;
    default:
      logger.info('Unsupported op');
  }
};
