import { useInternalAuditRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useControlTypeLabel } from 'src/pages/assessments/forms/useControlTypeLabel';

import { decorateWithControlType, getParentTitle } from './helpers';
import type {
  InternalAuditResultFields,
  InternalAuditResultRegisterFields,
} from './types';

export const useLabelledFields = (
  records: InternalAuditResultFields[] | undefined
) => {
  const { t: at } = useTranslation('common', {
    keyPrefix: 'assessmentResults',
  });
  const assessmentResultTypes = at('resultTypes', { returnObjects: true });
  const getControlTypeLabel = useControlTypeLabel();
  const { getByValue: getByResultValue } =
    useInternalAuditRating('performance_result');
  const { getByValue: getEffectivenessByValue } =
    useInternalAuditRating('effectiveness');
  const { getByValue: getRiskControlledByValue } =
    useInternalAuditRating('risk_controlled');
  const { getByValue: getRiskUncontrolledByValue } =
    useInternalAuditRating('risk_uncontrolled');
  const labelledFields = useMemo<
    InternalAuditResultRegisterFields[] | undefined
  >(() => {
    const ratingFns = {
      document_internal_audit_result: (d: InternalAuditResultFields) =>
        getByResultValue(d.Rating),
      obligation_internal_audit_result: (d: InternalAuditResultFields) =>
        getByResultValue(d.Rating),
      control_test_internal_audit_result: (d: InternalAuditResultFields) =>
        getEffectivenessByValue(d.OverallEffectiveness),
      risk_uncontrolled_internal_audit_result: (
        d: InternalAuditResultFields
      ) => {
        return getRiskUncontrolledByValue(d.Rating);
      },

      risk_controlled_internal_audit_result: (d: InternalAuditResultFields) => {
        return getRiskControlledByValue(d.Rating);
      },
    };

    return records?.map((d) => {
      return {
        ...d,
        TypeLabelled: decorateWithControlType(
          assessmentResultTypes[
            d.typename as keyof typeof assessmentResultTypes
          ],
          getControlTypeLabel,
          d
        ),
        ParentTitle: getParentTitle(d) || '-',
        RatingLabelled:
          ratingFns[d.typename as keyof typeof ratingFns](d)?.label || '-',
        Rationale: d.Rationale,
        TestDate: d.TestDate,
      };
    });
  }, [
    records,
    assessmentResultTypes,
    getByResultValue,
    getControlTypeLabel,
    getEffectivenessByValue,
    getRiskControlledByValue,
    getRiskUncontrolledByValue,
  ]);

  return labelledFields;
};
