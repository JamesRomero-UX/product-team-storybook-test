import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';

import { useRiskScore } from '@/hooks/useRiskScore';
import { useRiskRatingResolver } from '@/ratings/useRiskRatingResolver';

import { useControlTypeLabel } from '../../../../assessments/forms/useControlTypeLabel';
import { UNRATED } from '../../../../controls/lookupData';
import type {
  InternalAuditRiskAssessmentResultFlatFields,
  InternalAuditRiskAssessmentResultRegisterFields,
} from './types';

export const useInternalAuditRatingLabelledFields = (
  riskId: string,
  records: InternalAuditRiskAssessmentResultFlatFields[] | undefined
) => {
  const statusRating = useRating('assessment_status');
  const getControlTypeLabel = useControlTypeLabel();
  const riskScores = useRiskScore(riskId);
  const { resolveRiskRating, resolveImpact, resolveLikelihood } =
    useRiskRatingResolver();

  return useMemo<InternalAuditRiskAssessmentResultRegisterFields[]>(() => {
    return (
      records?.map((d) => {
        const InternalAuditReport = d.parents.find(
          (p) => p.internalAuditReport
        )?.internalAuditReport;

        return {
          ...d,
          StatusLabelled:
            InternalAuditReport !== undefined
              ? (statusRating.getLabel(InternalAuditReport?.Status) ?? '-')
              : '-',
          NextTestDate: InternalAuditReport?.NextTestDate ?? '-',
          ActualCompletionDate:
            InternalAuditReport?.ActualCompletionDate ?? '-',
          ParentTitle: InternalAuditReport?.Title ?? '-',
          ControlTypeLabelled:
            getControlTypeLabel(d.ControlType) || UNRATED.label,
          CompletionDate: InternalAuditReport?.ActualCompletionDate ?? '-',
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
