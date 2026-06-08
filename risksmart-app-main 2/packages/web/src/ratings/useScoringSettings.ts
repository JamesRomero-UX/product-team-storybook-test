import type {
  RatingWithColor,
  RatingWithColorAndLikelihoodImpact,
} from '@risksmart-app/components/src/hooks/types';
import { useCallback, useMemo } from 'react';

import type { RiskAssessmentResultConfig } from '@/hooks/queries/risk-assessment-result-config/useGetLatestRiskAssessmentResultConfig';
import { useGetLatestRiskAssessmentResultConfig } from '@/hooks/queries/risk-assessment-result-config/useGetLatestRiskAssessmentResultConfig';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

export interface MatrixCell {
  label: string;
  value: number;
  color: string;
  likelihood: number;
  impact: number;
}

const toRatingOptions = (
  matrix: RiskAssessmentResultConfig['matrix']
): RatingWithColorAndLikelihoodImpact<number>[] =>
  matrix.map((entry) => ({
    label: entry.title,
    value: entry.value,
    color: entry.color,
    likelihoodImpact: [{ likelihood: entry.likelihood, impact: entry.impact }],
    range: [0, 0] as readonly [number, number],
  }));

const toLikelihoodImpactOptions = (
  ratings: { title: string; value: number; color: string }[]
): RatingWithColor<number>[] =>
  ratings.map((r) => ({
    label: r.title,
    value: r.value,
    color: r.color,
  }));

const matrixKey = (likelihood: number, impact: number) =>
  `${likelihood}:${impact}`;

const buildMatrixLookup = (
  matrix: RiskAssessmentResultConfig['matrix']
): Map<string, MatrixCell> => {
  const map = new Map<string, MatrixCell>();
  for (const entry of matrix) {
    map.set(matrixKey(entry.likelihood, entry.impact), {
      label: entry.title,
      value: entry.value,
      color: entry.color,
      likelihood: entry.likelihood,
      impact: entry.impact,
    });
  }

  return map;
};

const buildValueLookup = (
  ratings: { title: string; value: number; color: string }[]
): Map<number, RatingWithColor<number>> => {
  const map = new Map<number, RatingWithColor<number>>();
  for (const r of ratings) {
    map.set(r.value, { label: r.title, value: r.value, color: r.color });
  }

  return map;
};

export function useScoringSettings() {
  const scoringSettingsDataEnabled = useIsFeatureFlagEnabled(
    'scoring_settings_data'
  );
  const { config: rawConfig, loading } = useGetLatestRiskAssessmentResultConfig(
    {
      skip: !scoringSettingsDataEnabled,
    }
  );
  const config = scoringSettingsDataEnabled ? rawConfig : undefined;
  const hasScoringSettings = !!config && !loading;

  const matrixLookup = useMemo(
    () => (config ? buildMatrixLookup(config.matrix) : new Map()),
    [config]
  );

  const likelihoodByValue = useMemo(
    () =>
      config
        ? buildValueLookup(config.likelihood.ratings)
        : new Map<number, RatingWithColor<number>>(),
    [config]
  );

  const impactByValue = useMemo(
    () =>
      config
        ? buildValueLookup(config.impact.ratings)
        : new Map<number, RatingWithColor<number>>(),
    [config]
  );

  const getRatingByLikelihoodAndImpact = useCallback(
    (likelihood: number, impact: number): MatrixCell | undefined =>
      matrixLookup.get(matrixKey(likelihood, impact)),
    [matrixLookup]
  );

  const getLikelihoodByValue = useCallback(
    (value: number): RatingWithColor<number> | undefined =>
      likelihoodByValue.get(value),
    [likelihoodByValue]
  );

  const getImpactByValue = useCallback(
    (value: number): RatingWithColor<number> | undefined =>
      impactByValue.get(value),
    [impactByValue]
  );

  const ratingLevelOptions = useMemo<RatingWithColor<number>[]>(() => {
    if (!config) {
      return [];
    }
    const seen = new Map<number, RatingWithColor<number>>();
    for (const entry of config.matrix) {
      if (!seen.has(entry.value)) {
        seen.set(entry.value, {
          label: entry.title,
          value: entry.value,
          color: entry.color,
        });
      }
    }

    return Array.from(seen.values()).sort((a, b) => a.value - b.value);
  }, [config]);

  return {
    hasScoringSettings,
    loading,
    config,
    matrixOptions: config ? toRatingOptions(config.matrix) : [],
    likelihoodOptions: config
      ? toLikelihoodImpactOptions(config.likelihood.ratings)
      : [],
    impactOptions: config
      ? toLikelihoodImpactOptions(config.impact.ratings)
      : [],
    ratingLevelOptions,
    impactCategories: config?.impact.categories ?? [],
    getRatingByLikelihoodAndImpact,
    getLikelihoodByValue,
    getImpactByValue,
  };
}
