import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';

import { UNRATED } from '../../../../controls/lookupData';
import type {
  ComplianceDocumentAssessmentResultFlatFields,
  ComplianceDocumentAssessmentResultRegisterFields,
} from './types';

export const useComplianceMonitoringDocumentRatingLabelledFields = (
  records: ComplianceDocumentAssessmentResultFlatFields[] | undefined
) => {
  const { getByValue: getResultByValue } = useRating('performance_result');

  return useMemo<ComplianceDocumentAssessmentResultRegisterFields[]>(() => {
    return (
      records?.map((d) => {
        const assessment = d.parents.filter(
          (a) => a.complianceMonitoringAssessment
        )[0]?.complianceMonitoringAssessment;

        return {
          ...d,
          Title: assessment?.Title ?? '-',
          ActualCompletionDate: assessment?.ActualCompletionDate ?? '-',
          CompletionDate: assessment?.ActualCompletionDate ?? '-',
          ResultValue: d.Rating ?? UNRATED.value,
          TestDate: d.TestDate ?? null,
          Result: getResultByValue(d.Rating)?.label ?? UNRATED.label,
          Id: d.Id,
          ComplianceMonitoringAssessmentId: assessment?.Id,
          Status: assessment?.Status ?? '-',
          NextTestDate: assessment?.NextTestDate,
        };
      }) || []
    );
  }, [records, getResultByValue]);
};
