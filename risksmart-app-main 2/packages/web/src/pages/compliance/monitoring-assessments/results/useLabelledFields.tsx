import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useControlTypeLabel } from 'src/pages/assessments/forms/useControlTypeLabel';

import { useRiskScoreFormatters } from '@/hooks/useRiskScore';
import { useRiskRatingResolver } from '@/ratings/useRiskRatingResolver';

import { decorateWithControlType, getParentTitle } from './helpers';
import type {
  ComplianceMonitoringAssessmentResultFields,
  ComplianceMonitoringAssessmentResultRegisterFields,
} from './types';

export const useLabelledFields = (
  records: ComplianceMonitoringAssessmentResultFields[] | undefined
) => {
  const { t: at } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });
  const { t } = useTranslation(['common'], {
    keyPrefix: 'complianceMonitoringAssessment',
  });
  const status = t('status');
  const assessmentResultTypes = at('resultTypes', { returnObjects: true });
  const getControlTypeLabel = useControlTypeLabel();
  const { getByValue: getByResultValue } = useRating('performance_result');
  const { getByValue: getEffectivenessByValue } = useRating('effectiveness');
  const { resolveImpact, resolveLikelihood } = useRiskRatingResolver();
  const getFormatters = useRiskScoreFormatters();

  return useMemo<
    ComplianceMonitoringAssessmentResultRegisterFields[] | undefined
  >(() => {
    const ratingFns = {
      document_second_line_result: (
        d: ComplianceMonitoringAssessmentResultFields
      ) => getByResultValue(d.Rating),
      obligation_second_line_result: (
        d: ComplianceMonitoringAssessmentResultFields
      ) => getByResultValue(d.Rating),
      control_test_second_line_result: (
        d: ComplianceMonitoringAssessmentResultFields
      ) => getEffectivenessByValue(d.OverallEffectiveness),
      risk_uncontrolled_second_line_result: (
        d: ComplianceMonitoringAssessmentResultFields
      ) => {
        const rating = d.Rating;
        const controlType = d.ControlType;
        if (rating == null || controlType == null) {
          return;
        }

        const { getInherentLabel } = getFormatters({
          inherentRating: rating,
          inherentLikelihood: d.Likelihood,
          inherentImpact: d.Impact,
        });

        return {
          label: getInherentLabel(),
        };
      },

      risk_controlled_second_line_result: (
        d: ComplianceMonitoringAssessmentResultFields
      ) => {
        const rating = d.Rating;
        const controlType = d.ControlType;
        if (rating == null || controlType == null) {
          return;
        }

        const { getResidualLabel } = getFormatters({
          residualRating: rating,
          residualLikelihood: d.Likelihood,
          residualImpact: d.Impact,
        });

        return {
          label: getResidualLabel(),
        };
      },
    };

    const likelihoodFns = {
      document_second_line_result: (
        _d: ComplianceMonitoringAssessmentResultFields
      ) => null,
      obligation_second_line_result: (
        _d: ComplianceMonitoringAssessmentResultFields
      ) => null,
      control_test_second_line_result: (
        _d: ComplianceMonitoringAssessmentResultFields
      ) => null,
      risk_controlled_second_line_result: (
        d: ComplianceMonitoringAssessmentResultFields
      ) => resolveLikelihood(d.Likelihood),
      risk_uncontrolled_second_line_result: (
        d: ComplianceMonitoringAssessmentResultFields
      ) => resolveLikelihood(d.Likelihood),
    };

    const impactFns = {
      document_second_line_result: (
        _d: ComplianceMonitoringAssessmentResultFields
      ) => null,
      obligation_second_line_result: (
        _d: ComplianceMonitoringAssessmentResultFields
      ) => null,
      control_test_second_line_result: (
        _d: ComplianceMonitoringAssessmentResultFields
      ) => null,
      risk_controlled_second_line_result: (
        d: ComplianceMonitoringAssessmentResultFields
      ) => resolveImpact(d.Impact),
      risk_uncontrolled_second_line_result: (
        d: ComplianceMonitoringAssessmentResultFields
      ) => resolveImpact(d.Impact),
    };

    return records?.map((d) => {
      const assessmentStatus = d.complianceMonitoringAssessments.find(
        (a) => a.complianceMonitoringAssessment
      )?.complianceMonitoringAssessment?.Status;

      return {
        ...d,
        AssessmentTitle:
          d.complianceMonitoringAssessments.find(
            (a) => a.complianceMonitoringAssessment
          )?.complianceMonitoringAssessment?.Title || '-',
        TypeLabelled: decorateWithControlType(
          assessmentResultTypes[
            d.__typename as keyof typeof assessmentResultTypes
          ],
          getControlTypeLabel,
          d
        ),
        ParentTitle: getParentTitle(d) || '-',
        RatingLabelled:
          ratingFns[d.__typename as keyof typeof ratingFns](d)?.label || '-',
        ImpactLabelled:
          impactFns[d.__typename as keyof typeof impactFns](d)?.label || '-',
        LikelihoodLabelled:
          likelihoodFns[d.__typename as keyof typeof likelihoodFns](d)?.label ||
          '-',
        StartDate: d.complianceMonitoringAssessments.find(
          (a) => a.complianceMonitoringAssessment
        )?.complianceMonitoringAssessment?.StartDate,
        ActualCompletionDate: d.complianceMonitoringAssessments.find(
          (a) => a.complianceMonitoringAssessment
        )?.complianceMonitoringAssessment?.ActualCompletionDate,
        CompletedByUser:
          d.complianceMonitoringAssessments.find(
            (a) => a.complianceMonitoringAssessment
          )?.complianceMonitoringAssessment?.completedByUser?.FriendlyName ||
          '-',
        Rationale: d.Rationale,
        TestDate: d.TestDate,
        Status: assessmentStatus ?? '-',
        StatusLabelled: assessmentStatus ? status[assessmentStatus] : '-',
        originalResult: d,
      };
    });
  }, [
    records,
    assessmentResultTypes,
    getControlTypeLabel,
    getByResultValue,
    getEffectivenessByValue,
    resolveLikelihood,
    resolveImpact,
    getFormatters,
    status,
  ]);
};
