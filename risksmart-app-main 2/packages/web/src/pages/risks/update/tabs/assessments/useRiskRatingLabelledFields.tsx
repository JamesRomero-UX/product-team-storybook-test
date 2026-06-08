import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';

import { useRiskScore } from '@/hooks/useRiskScore';
import { useRiskRatingResolver } from '@/ratings/useRiskRatingResolver';

import { useControlTypeLabel } from '../../../../assessments/forms/useControlTypeLabel';
import { UNRATED } from '../../../../controls/lookupData';
import type {
  RiskAssessmentResultFlatFields,
  RiskAssessmentResultRegisterFields,
} from './types';

export const useRiskRatingLabelledFields = (
  riskId: string,
  records: RiskAssessmentResultFlatFields[] | undefined
) => {
  const statusRating = useRating('assessment_status');
  const getControlTypeLabel = useControlTypeLabel();
  const riskScores = useRiskScore(riskId);
  const { resolveRiskRating, resolveImpact, resolveLikelihood } =
    useRiskRatingResolver();

  return useMemo<RiskAssessmentResultRegisterFields[]>(() => {
    return (
      records?.map((d) => {
        const assessment = d.parents.find((p) => p.assessment)?.assessment;

        return {
          ...d,
          StatusLabelled:
            assessment !== undefined
              ? (statusRating.getLabel(assessment?.Status) ?? '-')
              : '-',
          NextTestDate: assessment?.NextTestDate ?? '-',
          ActualCompletionDate: assessment?.ActualCompletionDate ?? '-',
          ParentTitle: assessment?.Title ?? '-',
          ControlTypeLabelled:
            getControlTypeLabel(d.ControlType) || UNRATED.label,
          CompletionDate: assessment?.ActualCompletionDate ?? '-',
          RatingLabelled: !riskScores.showScore
            ? (resolveRiskRating({
                likelihood: d.Likelihood,
                impact: d.Impact,
                controlType: d.ControlType,
                rating: d.Rating,
              })?.label ?? UNRATED.label)
            : '-',
          ImpactLabelled: resolveImpact(d.Impact)?.label ?? UNRATED.label,
          LikelihoodLabelled:
            resolveLikelihood(d.Likelihood)?.label ?? UNRATED.label,
        };
      }) || []
    );
  }, [
    records,
    statusRating,
    getControlTypeLabel,
    riskScores,
    resolveRiskRating,
    resolveImpact,
    resolveLikelihood,
  ]);
};
