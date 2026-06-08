import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type {
  GetRiskByTierQuery,
  GetRiskScoreDataQuery,
} from 'generated/graphql';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { getAncestorRiskScoresByRiskId } from 'src/services/aggregation/aggregationService';

import type { ModelConfig } from './models/types';
import type { RatingCategories } from './ratingCategories';
import type {
  AncestorScores,
  RatingCategory,
  RiskScoreForInsert,
} from './types';

export const recalculateTierThreeRiskScoresByRiskId = async <T>(
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  riskId: string | null,
  config: T,
  model: ModelConfig<T>,
  ratingCategories: RatingCategories
): Promise<RiskScoreForInsert[]> => {
  const apiClient = getRisksmartApiClient(hasuraClient);
  const { risk: risks } = await apiClient.getRiskScoreData({
    where: {
      Id: {
        _eq: riskId,
      },
      Tier: {
        _eq: 3,
      },
    },
  });

  return await recalculateTierThreeRiskScores(
    risks,
    config,
    model,
    ratingCategories
  );
};

export const recalculateTierThreeRiskScoresByControlId = async <T>(
  hasuraClient: ApolloClient<NormalizedCacheObject>,
  controlId: string | null,
  config: T,
  model: ModelConfig<T>,
  ratingCategories: RatingCategories
): Promise<RiskScoreForInsert[]> => {
  const apiClient = getRisksmartApiClient(hasuraClient);
  const { risk: risks } = await apiClient.getRiskScoreData({
    where: {
      Tier: {
        _eq: 3,
      },
      controls: {
        ControlId: {
          _eq: controlId,
        },
      },
    },
  });

  return await recalculateTierThreeRiskScores(
    risks,
    config,
    model,
    ratingCategories
  );
};

/**
 * Calculates scores by taking the average of all the child risk scores
 * @param param0
 * @returns
 */
export const calculateAggregatedScoreFromModel = <T>({
  childRiskScores,
  riskId,
  model,
  inherentRatingCategories,
  residualRatingCategories,
}: {
  riskId: string;
  childRiskScores: GetRiskByTierQuery['risk'][number]['childRisks'][number]['riskScore'][];
  model: ModelConfig<T>;
  inherentRatingCategories: RatingCategory[];
  residualRatingCategories: RatingCategory[];
}): RiskScoreForInsert => {
  const missingChildInherentRating =
    childRiskScores.length === 0 ||
    childRiskScores.some((riskScore) => !riskScore?.InherentScore);
  const missingChildResidualRating =
    childRiskScores.length === 0 ||
    childRiskScores.some((riskScore) => !riskScore?.ResidualScore);

  const inherentScore = !missingChildInherentRating
    ? childRiskScores.reduce((acc, riskScore) => {
        return acc + riskScore!.InherentScore!;
      }, 0) / childRiskScores?.length
    : null;

  const residualScore = !missingChildResidualRating
    ? childRiskScores.reduce((acc, riskScore) => {
        return acc + riskScore!.ResidualScore!;
      }, 0) / childRiskScores?.length
    : null;

  const residualImpact = !missingChildResidualRating
    ? Math.round(
        childRiskScores.reduce((acc, riskScore) => {
          return acc + riskScore!.ResidualImpact!;
        }, 0) / childRiskScores?.length
      )
    : null;

  const residualLikelihood = !missingChildResidualRating
    ? Math.round(
        childRiskScores.reduce((acc, riskScore) => {
          return acc + riskScore!.ResidualLikelihood!;
        }, 0) / childRiskScores?.length
      )
    : null;

  const inherentImpact = !missingChildInherentRating
    ? Math.round(
        childRiskScores.reduce((acc, riskScore) => {
          return acc + riskScore!.InherentImpact!;
        }, 0) / childRiskScores?.length
      )
    : null;

  const inherentLikelihood = !missingChildInherentRating
    ? Math.round(
        childRiskScores.reduce((acc, riskScore) => {
          return acc + riskScore!.InherentLikelihood!;
        }, 0) / childRiskScores?.length
      )
    : null;

  const score: RiskScoreForInsert = {
    RiskId: riskId,
    InherentRating: model.calculateInherentRating({
      inherentScore,
      inherentRatingCategories,
      latestInherentRating: null,
      inherentImpact,
      inherentLikelihood,
    }),
    InherentScore: inherentScore,
    ResidualRating: model.calculateResidualRating({
      residualScore,
      residualRatingCategories,
      latestResidualRating: null,
      residualImpact,
      residualLikelihood,
    }),
    ResidualScore: residualScore,
    ResidualImpact: residualImpact,
    ResidualLikelihood: residualLikelihood,
    InherentImpact: inherentImpact,
    InherentLikelihood: inherentLikelihood,
  };

  return score;
};

export const calculateNonAggregatedScoreFromModel = <T>({
  risk,
  config,
  model,
  inherentRatingCategories,
  residualRatingCategories,
}: {
  risk: GetRiskScoreDataQuery['risk'][number];
  config: T;
  model: ModelConfig<T>;
  inherentRatingCategories: RatingCategory[];
  residualRatingCategories: RatingCategory[];
}): RiskScoreForInsert => {
  const latestInherentRating =
    risk.inherentAssessmentResults?.[0]?.riskAssessmentResult;
  const latestResidualRating =
    risk.residualAssessmentResults?.[0]?.riskAssessmentResult;
  const inherentScore = model.calculateInherentScore({
    riskId: risk.Id,
    latestInherentRating,
    config,
  });
  const controlEffectiveness = model.calculateControlEffectiveness({
    controls: risk.controls,
    config,
  });

  const residualScore = model.calculateResidualScore({
    inherentScore,
    controlEffectiveness,
    latestResidualRating,
  });

  return {
    RiskId: risk.Id,
    ResidualScore:
      typeof residualScore === 'number'
        ? residualScore
        : (residualScore?.score ?? null),
    InherentScore:
      typeof inherentScore === 'number'
        ? inherentScore
        : (inherentScore?.score ?? null),
    ResidualRating: model.calculateResidualRating({
      residualScore:
        typeof residualScore === 'number'
          ? residualScore
          : (residualScore?.score ?? null),
      latestResidualRating,
      residualRatingCategories,
      residualImpact:
        typeof residualScore === 'number'
          ? latestResidualRating?.Impact
          : residualScore?.impact,
      residualLikelihood:
        typeof residualScore === 'number'
          ? latestResidualRating?.Likelihood
          : residualScore?.likelihood,
    }),
    InherentRating: model.calculateInherentRating({
      inherentScore:
        typeof inherentScore === 'number'
          ? inherentScore
          : (inherentScore?.score ?? null),
      latestInherentRating,
      inherentRatingCategories,
      inherentImpact: latestInherentRating?.Impact,
      inherentLikelihood: latestInherentRating?.Likelihood,
    }),
    ResidualImpact:
      typeof residualScore === 'object'
        ? (residualScore?.impact ?? null)
        : null,
    ResidualLikelihood:
      typeof residualScore === 'object'
        ? (residualScore?.likelihood ?? null)
        : null,
    InherentImpact:
      typeof inherentScore === 'object'
        ? (inherentScore?.impact ?? null)
        : null,
    InherentLikelihood:
      typeof inherentScore === 'object'
        ? (inherentScore?.likelihood ?? null)
        : null,
  };
};

const recalculateTierThreeRiskScores = async <T>(
  risks: GetRiskScoreDataQuery['risk'],
  config: T,
  model: ModelConfig<T>,
  ratingCategories: RatingCategories
): Promise<RiskScoreForInsert[]> => {
  if (!risks) {
    throw new Error('Risk not found');
  }

  return risks.map((risk) =>
    calculateNonAggregatedScoreFromModel({
      risk,
      config,
      model,
      inherentRatingCategories: ratingCategories.inherentRatingCategories,
      residualRatingCategories: ratingCategories.residualRatingCategories,
    })
  );
};

export const recalculateRiskScoresByTier = async <T>({
  hasuraClient,
  model,
  orgKey,
  tier,
  ratingCategories,
}: {
  hasuraClient: ApolloClient<unknown>;
  model: ModelConfig<T>;
  orgKey: string;
  tier: number;
  ratingCategories: RatingCategories;
}): Promise<RiskScoreForInsert[]> => {
  const apiClient = getRisksmartApiClient(hasuraClient);
  const { risk: risks } = await apiClient.getRiskByTier({
    OrgKey: orgKey,
    Tier: tier,
  });

  return risks.map((risk) =>
    calculateAggregatedScoreFromModel({
      childRiskScores: risk.childRisks.map((cr) => cr.riskScore),
      riskId: risk.Id,
      model,
      inherentRatingCategories: ratingCategories.inherentRatingCategories,
      residualRatingCategories: ratingCategories.residualRatingCategories,
    })
  );
};

export const recalculateAncestorScores = async <T>(
  hasuraClient: ApolloClient<unknown>,
  riskIds: { riskId: string; isTierThree?: boolean }[],
  model: ModelConfig<T>,
  ratingCategories: RatingCategories
): Promise<RiskScoreForInsert[]> => {
  const apiClient = getRisksmartApiClient(hasuraClient);
  const ancestorScores: RiskScoreForInsert[][] = await Promise.all(
    riskIds.map(async ({ riskId, isTierThree }) => {
      let ancestors: AncestorScores = { tier1: [], tier2: [] };

      if (isTierThree) {
        ancestors = await apiClient.getAncestorRiskScoresByTier3RiskId({
          RiskId: riskId,
        });
      } else {
        ancestors = await getAncestorRiskScoresByRiskId(hasuraClient, {
          RiskId: riskId,
        });
      }

      const newTierTwoScores = ancestors.tier2.map((ancestor) =>
        calculateAggregatedScoreFromModel({
          riskId: ancestor.Id,
          childRiskScores: ancestor.childRisks.map((cr) => cr.riskScore),
          model,
          inherentRatingCategories: ratingCategories.inherentRatingCategories,
          residualRatingCategories: ratingCategories.residualRatingCategories,
        })
      );

      const newTierOneRiskScores = ancestors.tier1.map((ancestor) => {
        const tierTwoRiskScores = newTierTwoScores.filter(
          (score) =>
            ancestor.childRisks.map((risk) => risk.Id).indexOf(score.RiskId!) >
            -1
        );

        const unaffectedRiskScores: RiskScoreForInsert[] = ancestor.childRisks
          ?.filter((risk) => {
            return (
              tierTwoRiskScores
                .map((score) => score.RiskId)
                .indexOf(risk.Id) === -1
            );
          })
          ?.map((risk) => ({
            RiskId: risk.Id,
            InherentScore: risk.riskScore?.InherentScore ?? null,
            ResidualScore: risk.riskScore?.ResidualScore ?? null,
            InherentRating: risk.riskScore?.InherentRating ?? null,
            ResidualRating: risk.riskScore?.ResidualRating ?? null,
            ResidualImpact: risk.riskScore?.ResidualImpact ?? null,
            ResidualLikelihood: risk.riskScore?.ResidualLikelihood ?? null,
            InherentImpact: risk.riskScore?.InherentImpact ?? null,
            InherentLikelihood: risk.riskScore?.InherentLikelihood ?? null,
          }));

        const childScores = [...unaffectedRiskScores, ...tierTwoRiskScores];
        const score = calculateAggregatedScoreFromModel({
          model,
          riskId: ancestor.Id,
          childRiskScores: childScores,
          inherentRatingCategories: ratingCategories.inherentRatingCategories,
          residualRatingCategories: ratingCategories.residualRatingCategories,
        });

        return score;
      });

      return [...newTierTwoScores, ...newTierOneRiskScores];
    })
  );

  // Remove duplicates and flatten the array
  return ancestorScores
    .flat()
    .filter(
      (score, index, self) =>
        index === self.findIndex((t) => t.RiskId === score.RiskId)
    );
};
