import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { Risk_Assessment_Result_Control_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC } from 'react';
import SimpleRatingBadge from 'src/components/simple-rating-badge';
import { useCalculateRiskRating } from 'src/ratings/useCalculateRiskRating';

import { getPerformanceRatingFromPerformanceScore } from '../impacts/ratings/performanceCalculation';
import type { CardType } from './types';
import { RiskAttribute } from './types';

const SelectedRiskAttribute: FC<{
  data: CardType;
  selectedRiskAttribute: RiskAttribute;
}> = ({ data, selectedRiskAttribute }) => {
  const getControlledRating = useCalculateRiskRating(
    Risk_Assessment_Result_Control_Type_Enum.Controlled
  );
  const getUncontrolledRating = useCalculateRiskRating(
    Risk_Assessment_Result_Control_Type_Enum.Uncontrolled
  );
  const { getByValue: getAppetitePerformanceByValue } = useRating(
    'appetite_performance'
  );
  const { getByValue: getImpactPerformanceByValue } =
    useRating('impact_performance');
  if (data.unlinked) {
    return;
  }
  let rating: { color?: string; label: string; tooltip?: string } | undefined =
    undefined;

  switch (selectedRiskAttribute) {
    case RiskAttribute.ControlledRating:
      if (
        data.ControlledLikelihoodValue != null &&
        data.ControlledImpactValue != null
      ) {
        rating = getControlledRating({
          likelihood: data.ControlledLikelihoodValue,
          impact: data.ControlledImpactValue,
        });
      }
      break;
    case RiskAttribute.UncontrolledRating:
      if (
        data.UncontrolledLikelihoodValue != null &&
        data.UncontrolledImpactValue != null
      ) {
        rating = getUncontrolledRating({
          likelihood: data.UncontrolledLikelihoodValue,
          impact: data.UncontrolledImpactValue,
        });
      }
      break;
    case RiskAttribute.ImpactPerformance:
      {
        if (data.impactRatings.length === 0) {
          return '-';
        }
        const impactPerformanceRating = getImpactPerformanceByValue(
          getPerformanceRatingFromPerformanceScore(data.ImpactPerformanceScore)
        );
        rating = {
          ...impactPerformanceRating,
          label: data.ImpactPerformanceScore?.toString() ?? '',
          tooltip: impactPerformanceRating?.label,
        };
      }
      break;
    case RiskAttribute.RiskStatus:
      return (
        <div className={'text-xs w-[75px] text-center'}>
          {data.StatusLabelled}
        </div>
      );
    case RiskAttribute.AppetitePerformance:
      if (!data.AppetitePerformance) {
        return '-';
      }
      rating = getAppetitePerformanceByValue(data.AppetitePerformance) ?? {
        label: 'Undefined',
        color: 'light-grey',
      };
  }

  return <SimpleRatingBadge rating={rating} />;
};

export default SelectedRiskAttribute;
