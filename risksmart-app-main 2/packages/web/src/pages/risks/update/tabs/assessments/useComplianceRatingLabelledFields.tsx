import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';

import { useRiskScore } from '@/hooks/useRiskScore';
import { useRiskRatingResolver } from '@/ratings/useRiskRatingResolver';

import { useControlTypeLabel } from '../../../../assessments/forms/useControlTypeLabel';
import { UNRATED } from '../../../../controls/lookupData';
import type {
  ComplianceRiskAssessmentResultFlatFields,
  ComplianceRiskAssessmentResultRegisterFields,
} from './types';

export const useComplianceRatingLabelledFields = (
  riskId: string,
  records: ComplianceRiskAssessmentResultFlatFields[] | undefined
) => {
  const statusRating = useRating('assessment_status');
  const getControlTypeLabel = useControlTypeLabel();
  const riskScores = useRiskScore(riskId);
  const { resolveRiskRating, resolveImpact, resolveLikelihood } =
    useRiskRatingResolver();

  return useMemo<ComplianceRiskAssessmentResultRegisterFields[]>(() => {
    return (
      records?.map((d) => {
        const complianceMonitoringAssessment = d.parents.find(
          (p) => p.complianceMonitoringAssessment
        )?.complianceMonitoringAssessment;

        return {
          ...d,
          StatusLabelled:
            complianceMonitoringAssessment !== undefined
              ? (statusRating.getLabel(
                  complianceMonitoringAssessment?.Status
                ) ?? '-')
              : '-',
          NextTestDate: complianceMonitoringAssessment?.NextTestDate ?? '-',
          ActualCompletionDate:
            complianceMonitoringAssessment?.ActualCompletionDate ?? '-',
          ParentTitle: complianceMonitoringAssessment?.Title ?? '-',
          ControlTypeLabelled:
            getControlTypeLabel(d.ControlType) || UNRATED.label,
          CompletionDate:
            complianceMonitoringAssessment?.ActualCompletionDate ?? '-',
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
