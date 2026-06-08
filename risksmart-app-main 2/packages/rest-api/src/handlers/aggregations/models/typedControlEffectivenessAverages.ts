import { getRatingByLikelihoodAndImpact } from '@risksmart-app/i18n/src/ratings';
import { ControlTypeEnum } from 'generated/graphql';
import _ from 'lodash';

import { filterControls } from '../filters';
import type {
  CalculateControlEffectivenessFn,
  CalculateInherentScoreFn,
  CalculateResidualScoreFn,
  Controls,
  TypedControlEffectivenessAveragesConfig,
} from '../types';
import type { ModelConfig } from './types';

export const round = (
  score: number,
  config?: TypedControlEffectivenessAveragesConfig | null
) => {
  if (config?.roundControlEffectiveness) {
    return Math.round(score);
  }

  return score;
};

export const calculateInherentScore: CalculateInherentScoreFn<
  TypedControlEffectivenessAveragesConfig | undefined | null
> = ({ latestInherentRating }) => {
  if (!latestInherentRating?.Likelihood || !latestInherentRating.Impact) {
    return null;
  }

  return {
    likelihood: latestInherentRating.Likelihood,
    impact: latestInherentRating.Impact,
    score: latestInherentRating.Likelihood * latestInherentRating.Impact,
  };
};

const defaultMitigations = [
  { lowerBound: 0.0, upperBound: 1.0, mitigationMultiplier: 0.95 },
  { lowerBound: 1.0, upperBound: 2.0, mitigationMultiplier: 0.75 },
  { lowerBound: 2.0, upperBound: 3.0, mitigationMultiplier: 0.45 },
  { lowerBound: 3.0, upperBound: 4.0, mitigationMultiplier: 0.2 },
  { lowerBound: 4.0, upperBound: 99.0, mitigationMultiplier: 0.01 },
];

const defaultLikelihoodImpactConfig: TypedControlEffectivenessAveragesConfig['likelihoodImpactWeights'] =
  {
    [ControlTypeEnum.Corrective]: {
      impactWeight: 1,
      likelihoodWeight: 0,
    },
    [ControlTypeEnum.Detective]: {
      impactWeight: 0.75,
      likelihoodWeight: 0.25,
    },
    [ControlTypeEnum.Preventive]: {
      impactWeight: 0,
      likelihoodWeight: 1,
    },
    [ControlTypeEnum.Directive]: {
      impactWeight: 0.25,
      likelihoodWeight: 0.25,
    },
  };

const calculateEffectivenessAverage = (
  controls: Partial<Controls>,
  config: TypedControlEffectivenessAveragesConfig | undefined | null
) => {
  const controlEffectivenessSum = controls.reduce((acc, current) => {
    let weight = 1;

    if (config?.enableWeighting && config?.weightFieldName) {
      weight =
        current?.control?.CustomAttributeData?.[config.weightFieldName] ?? 1;
    }

    if (
      config?.ignoreOverallEffectiveness &&
      current?.control?.testResults?.[0] &&
      (!current?.control?.testResults?.[0]?.DesignEffectiveness ||
        !current?.control?.testResults?.[0]?.PerformanceEffectiveness)
    ) {
      throw new Error(
        'Design and Performance effectiveness must be present when ignoreOverallEffectiveness is true'
      );
    }

    if (
      config?.ignoreOverallEffectiveness &&
      current?.control?.testResults?.[0]?.DesignEffectiveness &&
      current?.control?.testResults?.[0]?.PerformanceEffectiveness
    ) {
      return (
        acc +
        weight *
          current.control.testResults[0].DesignEffectiveness *
          current.control.testResults[0].PerformanceEffectiveness
      );
    }

    if (!current?.control?.testResults?.[0]?.OverallEffectiveness) {
      return acc;
    }

    return acc + weight * current.control.testResults[0].OverallEffectiveness;
  }, 0);

  const sumOfWeights = controls.reduce((acc, current) => {
    let weight = 1;

    if (config?.enableWeighting && config?.weightFieldName) {
      weight =
        current?.control?.CustomAttributeData?.[config.weightFieldName] ?? 1;
    }

    return acc + weight;
  }, 0);

  return round(controlEffectivenessSum / sumOfWeights, config);
};

export const calculateControlEffectiveness: CalculateControlEffectivenessFn<
  TypedControlEffectivenessAveragesConfig | undefined | null
> = ({ controls, config }) => {
  if (controls.length === 0) {
    return null;
  }

  const filteredAndGroupedControls = _.groupBy(controls, 'control.Type');

  const averages = _.mapValues(filteredAndGroupedControls, (c) => {
    const filteredControls = filterControls(c, config);

    return calculateEffectivenessAverage(filteredControls, config);
  });

  const weights = {
    ...defaultLikelihoodImpactConfig,
    ...config?.likelihoodImpactWeights,
  };

  const likelihood = _.reduce(
    averages,
    (acc, current, key) => {
      const contribution = weights[key as ControlTypeEnum]?.likelihoodWeight;
      if (!contribution) {
        return { sum: acc.sum, sumOfWeights: acc.sumOfWeights };
      }

      return {
        sum: acc.sum + current * contribution,
        sumOfWeights: acc.sumOfWeights + contribution,
      };
    },
    { sum: 0, sumOfWeights: 0 }
  );
  const likelihoodAvg = likelihood.sum / likelihood.sumOfWeights;

  const impact = _.reduce(
    averages,
    (acc, current, key) => {
      const contribution = weights[key as ControlTypeEnum]?.impactWeight;
      if (!contribution) {
        return { sum: acc.sum, sumOfWeights: acc.sumOfWeights };
      }

      return {
        sum: acc.sum + current * contribution,
        sumOfWeights: acc.sumOfWeights + contribution,
      };
    },
    { sum: 0, sumOfWeights: 0 }
  );
  const impactAvg = impact.sum / impact.sumOfWeights;

  return {
    impactMitigation:
      (config?.mitigations ?? defaultMitigations).find((entry) => {
        return entry.lowerBound <= impactAvg && entry.upperBound > impactAvg;
      })?.mitigationMultiplier || 1.0,
    likelihoodMitigation:
      (config?.mitigations ?? defaultMitigations).find((entry) => {
        return (
          entry.lowerBound <= likelihoodAvg && entry.upperBound > likelihoodAvg
        );
      })?.mitigationMultiplier || 1.0,
    overallMitigation: 1, // unused
  };
};

export const calculateResidualScore: CalculateResidualScoreFn = ({
  inherentScore,
  controlEffectiveness,
}) => {
  if (
    !inherentScore ||
    !controlEffectiveness ||
    !controlEffectiveness.likelihoodMitigation ||
    !controlEffectiveness.impactMitigation
  ) {
    return null;
  }

  const likelihood = Math.round(
    Math.max(
      inherentScore.likelihood * controlEffectiveness.likelihoodMitigation,
      1
    )
  );
  const impact = Math.round(
    Math.max(inherentScore.impact * controlEffectiveness.impactMitigation, 1)
  );

  return {
    likelihood,
    impact,
    score: likelihood * impact,
  };
};

export const modelConfig: ModelConfig<TypedControlEffectivenessAveragesConfig> =
  {
    requiresAggregation: true,
    calculateControlEffectiveness,
    calculateInherentScore,
    calculateResidualScore,
    calculateResidualRating: ({
      residualRatingCategories,
      residualLikelihood,
      residualImpact,
    }) =>
      getRatingByLikelihoodAndImpact(
        residualRatingCategories,
        residualLikelihood,
        residualImpact
      )?.value ?? null,
    calculateInherentRating: ({
      inherentRatingCategories,
      inherentImpact,
      inherentLikelihood,
    }) =>
      getRatingByLikelihoodAndImpact(
        inherentRatingCategories,
        inherentLikelihood,
        inherentImpact
      )?.value ?? null,
  };
