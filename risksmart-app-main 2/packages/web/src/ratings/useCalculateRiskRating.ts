import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import { hasColor, hasLikelihoodImpact, hasRange, range } from '@/utils/utils';

import { useScoringSettings } from './useScoringSettings';

/**
 * Calculated the risk assessment rating based on impact and likelihood.
 * @param controlType
 * @returns
 */
export const useCalculateRiskRating = (
  controlType: Risk_Assessment_Result_Control_Type_Enum
) => {
  const { hasScoringSettings, getRatingByLikelihoodAndImpact } =
    useScoringSettings();
  const { options } = useRating(
    controlType === Risk_Assessment_Result_Control_Type_Enum.Controlled
      ? 'risk_controlled'
      : 'risk_uncontrolled'
  );

  return ({
    likelihood,
    impact,
  }: {
    likelihood: number;
    impact: number;
  }): {
    value: number;
    label: string;
    color?: string;
  } => {
    if (hasScoringSettings) {
      const cell = getRatingByLikelihoodAndImpact(likelihood, impact);
      if (cell) {
        return { label: cell.label, value: cell.value, color: cell.color };
      }

      return { label: 'Unknown', value: 0, color: undefined };
    }

    const combinedValue = Math.max(likelihood, 1) * Math.max(impact, 1); // Don't times by 0
    const rating = options.find((option) => {
      if (hasLikelihoodImpact(option)) {
        return option.likelihoodImpact.find(
          (li) => li.impact === impact && li.likelihood === likelihood
        );
      }

      return (
        hasRange(option) &&
        range(option.range[0], option.range[1]).includes(combinedValue)
      );
    });

    if (!rating) {
      // Don't log an error here, this function is called frequently (e.g. when resizing columns in the register)
      //  and it will cause performance issues and unnecessary noise in Sentry.
      return {
        label: 'Unknown',
        value: 0,
        color: undefined,
      };
    }

    return {
      label: rating?.label || 'Unknown',
      value: Number(rating?.value) || 0,
      color: hasColor(rating) ? rating.color : undefined,
    };
  };
};
