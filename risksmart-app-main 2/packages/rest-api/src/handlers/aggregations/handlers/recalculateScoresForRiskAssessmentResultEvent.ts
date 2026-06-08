import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { RiskAssessmentResult } from 'generated/graphql';
import {
  ParentTypeEnum,
  RiskAssessmentResultControlTypeEnum,
} from 'generated/graphql';
import { getRiskAssessmentResult } from 'src/services/assessment-result/assessmentResultService';
import { getRisk } from 'src/services/risk/riskService';

import { getLogger } from '../../../logger';
import {
  recalculateAncestorScores,
  recalculateTierThreeRiskScoresByRiskId,
} from '../calculators';
import type { ModelConfig } from '../models/types';
import type { RatingCategories } from '../ratingCategories';
import { recalculateRiskScoreForDefaultRiskModel } from '../riskScoreCalculationService';
import { upsertScores } from '../upsertScores';

const logger = getLogger();

export const recalculateScoresForRiskAssessmentResultEvent = async <T>(
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  riskAssessmentResultEvent: RiskAssessmentResult,
  model: ModelConfig<T>,
  config: T,
  orgKey: string,
  ratingCategories: RatingCategories
) => {
  logger.appendKeys({
    id: riskAssessmentResultEvent.Id,
  });

  const riskAssessmentResults = await getRiskAssessmentResult(hasuraClient, {
    Id: riskAssessmentResultEvent.Id,
  });
  const riskAssessmentResult = riskAssessmentResults[0];
  if (
    // If the risk assessment result has parents
    // All the parents should be either risk or risk & assessment result, otherwise rating from elsewhere.
    riskAssessmentResult?.parents &&
    !riskAssessmentResult?.parents?.every((c) => {
      const RiskAndAssessmentParent: ParentTypeEnum[] = [
        ParentTypeEnum.Risk,
        ParentTypeEnum.Assessment,
      ];

      const RiskParent: ParentTypeEnum[] = [ParentTypeEnum.Risk];

      return (
        RiskAndAssessmentParent.includes(c.ParentType) ||
        RiskParent.includes(c.ParentType)
      );
    })
  ) {
    logger.info(
      'Result is not from an assessment or directly on a risk. Skipping recalculation.'
    );

    return;
  }
  const riskId = riskAssessmentResult?.parents.find((p) => p.risk?.Id)?.risk
    ?.Id;

  if (!riskId) {
    throw new Error('Cannot find risk parent for risk assessment result');
  }

  if (!model.requiresAggregation) {
    await recalculateRiskScoreForDefaultRiskModel(
      riskId,
      orgKey,
      hasuraClient,
      model,
      config,
      ratingCategories
    );

    return;
  }

  if (
    riskAssessmentResult?.ControlType ===
    RiskAssessmentResultControlTypeEnum.Controlled
  ) {
    logger.info('Controlled. Skipping recalculation', {
      controlType: riskAssessmentResult?.ControlType,
    });

    return;
  }

  const risk = await getRisk(hasuraClient, {
    Id: riskId,
  });

  if (risk?.[0]?.Tier !== 3) {
    logger.info('Risk is not tier 3. Skipping recalculation');

    return;
  }

  const scores = await recalculateTierThreeRiskScoresByRiskId(
    hasuraClient,
    riskId,
    config,
    model,
    ratingCategories
  );

  await upsertScores(hasuraClient, scores, orgKey);

  const flattenedAncestorScores = await recalculateAncestorScores(
    hasuraClient,
    scores.map((score) => ({ riskId: score.RiskId!, isTierThree: true })),
    model,
    ratingCategories
  );

  await upsertScores(hasuraClient, flattenedAncestorScores, orgKey);
};
