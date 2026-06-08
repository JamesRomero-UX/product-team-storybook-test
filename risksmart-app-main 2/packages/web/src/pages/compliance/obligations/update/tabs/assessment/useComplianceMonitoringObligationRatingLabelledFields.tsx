import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';

import { UNRATED } from '../../../../../controls/lookupData';
import type {
  ComplianceObligationAssessmentResultFlatFields,
  ComplianceObligationAssessmentResultRegisterFields,
} from './types';

export const useComplianceMonitoringObligationRatingLabelledFields = (
  records: ComplianceObligationAssessmentResultFlatFields[] | undefined
) => {
  const { getByValue: getResultByValue } = useRating('performance_result');

  return useMemo<ComplianceObligationAssessmentResultRegisterFields[]>(() => {
    return (
      records?.map((d) => {
        const parent = d.parents.filter(
          (a) => a.complianceMonitoringAssessment
        )[0]?.complianceMonitoringAssessment;

        return {
          ...d,
          CompletionDate: parent?.ActualCompletionDate ?? '-',
          NextTestDate: parent?.NextTestDate,
          Title: parent?.Title ?? '-',
          LinkedComplianceMonitoringId: parent?.Id,
          Status: parent?.Status ?? undefined,
          Result: getResultByValue(d.Rating)?.label ?? UNRATED.label,
        };
      }) || []
    );
  }, [getResultByValue, records]);
};
