import { getRatingByRange } from '@risksmart-app/i18n/src/ratings';

import { filterControls } from '../filters';
import type {
  CalculateControlEffectivenessFn,
  CalculateInherentScoreFn,
  CalculateResidualScoreFn,
  ControlEffectivenessAveragesConfig,
} from '../types';
import type { ModelConfig } from './types';

export const round = (
  score: number,
  config?: ControlEffectivenessAveragesConfig | null
) => {
  if (config?.roundControlEffectiveness) {
    return Math.round(score);
  }

  return score;
};

export const calculateInherentScore: CalculateInherentScoreFn<
  ControlEffectivenessAveragesConfig | undefined | null
> = ({ latestInherentRating }) => {
  if (!latestInherentRating?.Likelihood || !latestInherentRating.Impact) {
    return null;
  }

  return {
    score: latestInherentRating.Likelihood * latestInherentRating.Impact,
    likelihood: latestInherentRating.Likelihood,
    impact: latestInherentRating.Impact,
  };
};
const defaultMitigations = [
  { lowerBound: 0.0, upperBound: 1.0, mitigationMultiplier: 0.95 },
  { lowerBound: 1.0, upperBound: 2.0, mitigationMultiplier: 0.75 },
  { lowerBound: 2.0, upperBound: 3.0, mitigationMultiplier: 0.45 },
  { lowerBound: 3.0, upperBound: 4.0, mitigationMultiplier: 0.2 },
  { lowerBound: 4.0, upperBound: 99.0, mitigationMultiplier: 0.01 },
];

export const calculateControlEffectiveness: CalculateControlEffectivenessFn<
  ControlEffectivenessAveragesConfig | undefined | null
> = ({ controls, config }) => {
  if (controls.length === 0) {
    return null;
  }

  const filteredControls = filterControls(controls, config);

  const controlEffectivenessSum = filteredControls.reduce((acc, current) => {
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

  const sumOfWeights = filteredControls.reduce((acc, current) => {
    let weight = 1;

    if (config?.enableWeighting && config?.weightFieldName) {
      weight =
        current?.control?.CustomAttributeData?.[config.weightFieldName] ?? 1;
    }

    return acc + weight;
  }, 0);

  const controlEffectivenessAvg = round(
    controlEffectivenessSum / sumOfWeights,
    config
  );

  return {
    overallMitigation:
      (config?.mitigations ?? defaultMitigations).find((entry) => {
        return (
          entry.lowerBound <= controlEffectivenessAvg &&
          entry.upperBound > controlEffectivenessAvg
        );
      })?.mitigationMultiplier || 1.0,
  };
};

export const calculateResidualScore: CalculateResidualScoreFn = ({
  inherentScore,
  controlEffectiveness,
}) => {
  if (
    !inherentScore ||
    !controlEffectiveness ||
    !controlEffectiveness.overallMitigation ||
    !inherentScore.score
  ) {
    return null;
  }

  return Math.max(
    inherentScore.score * controlEffectiveness.overallMitigation,
    1
  ); // Value cannot be less than 1
};

export const modelConfig: ModelConfig<ControlEffectivenessAveragesConfig> = {
  requiresAggregation: true,
  calculateControlEffectiveness,
  calculateInherentScore,
  calculateResidualScore,
  calculateResidualRating: ({ residualRatingCategories, residualScore }) =>
    getRatingByRange(residualRatingCategories, residualScore)?.value ?? null,
  calculateInherentRating: ({ inherentRatingCategories, inherentScore }) =>
    getRatingByRange(inherentRatingCategories, inherentScore)?.value ?? null,
};
