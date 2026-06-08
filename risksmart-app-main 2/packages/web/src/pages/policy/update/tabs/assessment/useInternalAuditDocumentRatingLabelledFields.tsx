import { useInternalAuditRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';

import { UNRATED } from '../../../../controls/lookupData';
import type {
  InternalAuditDocumentAssessmentResultFlatFields,
  InternalAuditDocumentAssessmentResultRegisterFields,
} from './types';

export const useInternalAuditDocumentRatingLabelledFields = (
  records: InternalAuditDocumentAssessmentResultFlatFields[] | undefined
) => {
  const { getByValue: getResultByValue } =
    useInternalAuditRating('performance_result');

  return useMemo<InternalAuditDocumentAssessmentResultRegisterFields[]>(() => {
    return (
      records?.map((d) => {
        const report = d.parents.filter((a) => a.internalAuditReport)[0]
          ?.internalAuditReport;

        return {
          ...d,
          Title: report?.Title ?? '-',
          ActualCompletionDate: report?.ActualCompletionDate ?? '-',
          CompletionDate: report?.ActualCompletionDate ?? '-',
          ResultValue: d.Rating ?? UNRATED.value,
          TestDate: d.TestDate ?? null,
          Result: getResultByValue(d.Rating)?.label ?? UNRATED.label,
          Id: d.Id,
          InternalAuditReportId: report?.Id,
          Status: report?.Status ?? '-',
          NextTestDate: report?.NextTestDate,
        };
      }) || []
    );
  }, [records, getResultByValue]);
};
