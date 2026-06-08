import type { RatingWithColor } from '@risksmart-app/components/src/hooks/types';
import type { RatingContext } from '@risksmart-app/components/src/hooks/useRating';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useCallback, useMemo } from 'react';

import { useScoringSettings } from './useScoringSettings';

export interface ResolvedRating {
  label: string;
  value: number;
  color?: string;
}

export interface RiskRatingResolver {
  resolveRiskRating: (params: {
    likelihood: number | null | undefined;
    impact: number | null | undefined;
    controlType: Risk_Assessment_Result_Control_Type_Enum;
    rating: number | null | undefined;
  }) => ResolvedRating | undefined;
  resolveImpact: (
    value: number | null | undefined
  ) => ResolvedRating | undefined;
  resolveLikelihood: (
    value: number | null | undefined
  ) => ResolvedRating | undefined;
  hasScoringSettings: boolean;
  maxInherentRating: number;
  maxResidualRating: number;
  options: {
    likelihood: RatingWithColor<number>[];
    impact: RatingWithColor<number>[];
    ratingLevel: RatingWithColor<number>[];
  };
}

export const useRiskRatingResolver = (
  context: RatingContext = 'standard'
): RiskRatingResolver => {
  const {
    hasScoringSettings,
    getRatingByLikelihoodAndImpact,
    getLikelihoodByValue,
    getImpactByValue,
    likelihoodOptions,
    impactOptions,
    ratingLevelOptions,
  } = useScoringSettings();

  const {
    getByValue: getTaxonomyControlledRatingByValue,
    options: taxonomyControlledOptions,
  } = useRating('risk_controlled', context);

  const {
    getByValue: getTaxonomyUncontrolledRatingByValue,
    options: taxonomyUncontrolledOptions,
  } = useRating('risk_uncontrolled', context);

  const {
    getByValue: getTaxonomyLikelihoodByValue,
    options: taxonomyLikelihoodOptions,
  } = useRating('likelihood', context);

  const {
    getByValue: getTaxonomyImpactByValue,
    options: taxonomyImpactOptions,
  } = useRating('impact', context);

  const resolveRiskRating = useCallback(
    ({
      likelihood,
      impact,
      controlType,
      rating,
    }: {
      likelihood: number | null | undefined;
      impact: number | null | undefined;
      controlType: Risk_Assessment_Result_Control_Type_Enum;
      rating: number | null | undefined;
    }): ResolvedRating | undefined => {
      if (hasScoringSettings) {
        if (likelihood != null && impact != null) {
          const cell = getRatingByLikelihoodAndImpact(likelihood, impact);
          if (cell) {
            return { label: cell.label, value: cell.value, color: cell.color };
          }
        }

        return undefined;
      }

      const option =
        controlType === Risk_Assessment_Result_Control_Type_Enum.Controlled
          ? getTaxonomyControlledRatingByValue(rating)
          : getTaxonomyUncontrolledRatingByValue(rating);

      if (!option || option.value == null) {
        return undefined;
      }

      return {
        label: option.label,
        value: Number(option.value),
        color: 'color' in option ? (option.color as string) : undefined,
      };
    },
    [
      hasScoringSettings,
      getRatingByLikelihoodAndImpact,
      getTaxonomyControlledRatingByValue,
      getTaxonomyUncontrolledRatingByValue,
    ]
  );

  const resolveImpact = useCallback(
    (value: number | null | undefined): ResolvedRating | undefined => {
      if (value == null) {
        return undefined;
      }

      if (hasScoringSettings) {
        const r = getImpactByValue(value);

        return r
          ? { label: r.label, value: r.value, color: r.color }
          : undefined;
      }

      const option = getTaxonomyImpactByValue(value);
      if (!option || option.value == null) {
        return undefined;
      }

      return {
        label: option.label,
        value: Number(option.value),
        color: 'color' in option ? (option.color as string) : undefined,
      };
    },
    [hasScoringSettings, getImpactByValue, getTaxonomyImpactByValue]
  );

  const resolveLikelihood = useCallback(
    (value: number | null | undefined): ResolvedRating | undefined => {
      if (value == null) {
        return undefined;
      }

      if (hasScoringSettings) {
        const r = getLikelihoodByValue(value);

        return r
          ? { label: r.label, value: r.value, color: r.color }
          : undefined;
      }

      const option = getTaxonomyLikelihoodByValue(value);
      if (!option || option.value == null) {
        return undefined;
      }

      return {
        label: option.label,
        value: Number(option.value),
        color: 'color' in option ? (option.color as string) : undefined,
      };
    },
    [hasScoringSettings, getLikelihoodByValue, getTaxonomyLikelihoodByValue]
  );

  const options = useMemo(
    () => ({
      likelihood: hasScoringSettings
        ? likelihoodOptions
        : taxonomyLikelihoodOptions.map((option) => ({
            label: option.label,
            value: Number(option.value),
            color: option.color ?? '',
          })),
      impact: hasScoringSettings
        ? impactOptions
        : taxonomyImpactOptions.map((option) => ({
            label: option.label,
            value: Number(option.value),
            color: option.color ?? '',
          })),
      ratingLevel: ratingLevelOptions,
    }),
    [
      hasScoringSettings,
      likelihoodOptions,
      impactOptions,
      taxonomyLikelihoodOptions,
      taxonomyImpactOptions,
      ratingLevelOptions,
    ]
  );

  const maxInherentRating = useMemo(() => {
    if (hasScoringSettings) {
      return Math.max(...ratingLevelOptions.map((o) => o.value), 0);
    }

    return Math.max(
      ...taxonomyUncontrolledOptions.map((o) => Number(o.value) || 0)
    );
  }, [hasScoringSettings, ratingLevelOptions, taxonomyUncontrolledOptions]);

  const maxResidualRating = useMemo(() => {
    if (hasScoringSettings) {
      return Math.max(...ratingLevelOptions.map((o) => o.value), 0);
    }

    return Math.max(
      ...taxonomyControlledOptions.map((o) => Number(o.value) || 0)
    );
  }, [hasScoringSettings, ratingLevelOptions, taxonomyControlledOptions]);

  return useMemo(
    () => ({
      resolveRiskRating,
      resolveImpact,
      resolveLikelihood,
      hasScoringSettings,
      maxInherentRating,
      maxResidualRating,
      options,
    }),
    [
      resolveRiskRating,
      resolveImpact,
      resolveLikelihood,
      hasScoringSettings,
      maxInherentRating,
      maxResidualRating,
      options,
    ]
  );
};
