import { getRatingByRange } from '@risksmart-app/i18n/src/ratings';

import { filterControls } from '../filters';
import type {
  CalculateControlEffectivenessFn,
  CalculateInherentScoreFn,
  CalculateResidualScoreFn,
  NumberOfControlsWithGapsConfig,
} from '../types';
import type { ModelConfig } from './types';

export const calculateInherentScore: CalculateInherentScoreFn<
  NumberOfControlsWithGapsConfig | undefined | null
> = ({ latestInherentRating, config }) => {
  if (config?.inherentScoreOverride) {
    return { score: config.inherentScoreOverride, likelihood: 0, impact: 0 }; // likelihood and impact are not used in this case
  }

  if (!latestInherentRating?.Likelihood || !latestInherentRating.Impact) {
    return null;
  }

  return {
    score: latestInherentRating.Likelihood * latestInherentRating.Impact,
    likelihood: latestInherentRating.Likelihood,
    impact: latestInherentRating.Impact,
  };
};

export const calculateControlEffectiveness: CalculateControlEffectivenessFn<
  NumberOfControlsWithGapsConfig | undefined | null
> = ({ controls, config }) => {
  if (controls.length === 0) {
    return null;
  }

  if (
    controls.some(
      (control) =>
        control?.control?.testResults?.[0] == null ||
        control?.control?.testResults?.[0]?.OverallEffectiveness == null
    )
  ) {
    return null;
  }

  let filteredControls = filterControls(controls, config);

  if (config?.excludeControlsWithValues) {
    filteredControls = filteredControls.filter(
      (control) =>
        control?.control?.testResults?.[0]?.OverallEffectiveness == null ||
        !config.excludeControlsWithValues?.includes(
          control?.control?.testResults?.[0]?.OverallEffectiveness
        )
    );
  }

  const controlsWithGaps = filteredControls.filter(
    (control) =>
      control?.control?.testResults?.[0]?.OverallEffectiveness &&
      config?.nonEffectiveValues.includes(
        control?.control?.testResults?.[0]?.OverallEffectiveness
      )
  );

  return {
    overallMitigation: 1 - controlsWithGaps.length / filteredControls.length,
  };
};

export const calculateResidualScore: CalculateResidualScoreFn = ({
  inherentRating,
  controlEffectiveness,
}) => {
  return inherentRating && controlEffectiveness
    ? Math.max(
        inherentRating -
          inherentRating * controlEffectiveness.overallMitigation,
        1
      )
    : null;
};

export const modelConfig: ModelConfig<NumberOfControlsWithGapsConfig> = {
  requiresAggregation: true,
  calculateControlEffectiveness,
  calculateInherentScore,
  calculateResidualScore,
  calculateResidualRating: ({ residualRatingCategories, residualScore }) =>
    getRatingByRange(residualRatingCategories, residualScore)?.value ?? null,
  calculateInherentRating: ({ inherentRatingCategories, inherentScore }) =>
    getRatingByRange(inherentRatingCategories, inherentScore)?.value ?? null,
};
