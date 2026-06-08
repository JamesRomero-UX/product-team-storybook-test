import { useInternalAuditRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAggregation } from 'src/hooks/useAggregation';
import { useControlTypeLabel } from 'src/pages/assessments/forms/useControlTypeLabel';

import { useRiskScoreFormatters } from '@/hooks/useRiskScore';
import { useRiskRatingResolver } from '@/ratings/useRiskRatingResolver';

import { decorateWithControlType, getParentTitle } from './helpers';
import type {
  InternalAuditReportResultFields,
  InternalAuditReportResultRegisterFields,
} from './types';

export const useLabelledFields = (
  records: InternalAuditReportResultFields[] | undefined
) => {
  const { t: at } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });
  const { t } = useTranslation(['common'], {
    keyPrefix: 'internalAuditReports',
  });
  const status = t('status');
  const assessmentResultTypes = at('resultTypes', { returnObjects: true });
  const getControlTypeLabel = useControlTypeLabel();
  const { riskModel } = useAggregation();
  const { getByValue: getByResultValue } =
    useInternalAuditRating('performance_result');
  const { getByValue: getEffectivenessByValue } =
    useInternalAuditRating('effectiveness');
  const { resolveImpact, resolveLikelihood } =
    useRiskRatingResolver('internal_audit');
  const getFormatters = useRiskScoreFormatters();

  return useMemo<InternalAuditReportResultRegisterFields[] | undefined>(() => {
    const ratingFns = {
      document_internal_audit_result: (d: InternalAuditReportResultFields) =>
        getByResultValue(d.Rating),
      obligation_internal_audit_result: (d: InternalAuditReportResultFields) =>
        getByResultValue(d.Rating),
      control_test_internal_audit_result: (
        d: InternalAuditReportResultFields
      ) => getEffectivenessByValue(d.OverallEffectiveness),
      risk_controlled_internal_audit_result: (
        d: InternalAuditReportResultFields
      ) => {
        const rating = d.Rating;
        const controlType = d.ControlType;
        if (
          rating == null ||
          controlType == null ||
          riskModel === 'control_effectiveness_averages'
        ) {
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
      risk_uncontrolled_internal_audit_result: (
        d: InternalAuditReportResultFields
      ) => {
        const rating = d.Rating;
        const controlType = d.ControlType;
        if (
          rating == null ||
          controlType == null ||
          riskModel === 'control_effectiveness_averages'
        ) {
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
    };

    const likelihoodFns = {
      document_internal_audit_result: (_d: InternalAuditReportResultFields) =>
        null,
      obligation_internal_audit_result: (_d: InternalAuditReportResultFields) =>
        null,
      control_test_internal_audit_result: (
        _d: InternalAuditReportResultFields
      ) => null,
      risk_controlled_internal_audit_result: (
        d: InternalAuditReportResultFields
      ) => resolveLikelihood(d.Likelihood),
      risk_uncontrolled_internal_audit_result: (
        d: InternalAuditReportResultFields
      ) => resolveLikelihood(d.Likelihood),
    };

    const impactFns = {
      document_internal_audit_result: (_d: InternalAuditReportResultFields) =>
        null,
      obligation_internal_audit_result: (_d: InternalAuditReportResultFields) =>
        null,
      control_test_internal_audit_result: (
        _d: InternalAuditReportResultFields
      ) => null,
      risk_controlled_internal_audit_result: (
        d: InternalAuditReportResultFields
      ) => resolveImpact(d.Impact),
      risk_uncontrolled_internal_audit_result: (
        d: InternalAuditReportResultFields
      ) => resolveImpact(d.Impact),
    };

    return records?.map((d) => {
      const auditStatus = d.internalAuditReports.find(
        (a) => a.internalAuditReport
      )?.internalAuditReport?.Status;

      return {
        ...d,
        AuditTitle:
          d.internalAuditReports.find((a) => a.internalAuditReport)
            ?.internalAuditReport?.Title || '-',
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
        StartDate: d.internalAuditReports.find((a) => a.internalAuditReport)
          ?.internalAuditReport?.StartDate,
        ActualCompletionDate: d.internalAuditReports.find(
          (a) => a.internalAuditReport
        )?.internalAuditReport?.ActualCompletionDate,
        CompletedByUser:
          d.internalAuditReports.find((a) => a.internalAuditReport)
            ?.internalAuditReport?.completedByUser?.FriendlyName || '-',
        Rationale: d.Rationale,
        TestDate: d.TestDate,
        Status: auditStatus ?? '-',
        StatusLabelled: auditStatus ? status[auditStatus] : '-',
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
    riskModel,
    status,
  ]);
};
