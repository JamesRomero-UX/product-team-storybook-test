import { useInternalAuditRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';

import { UNRATED } from '../../../../../controls/lookupData';
import type {
  InternalAuditObligationAssessmentResultFlatFields,
  InternalAuditObligationAssessmentResultRegisterFields,
} from './types';

export const useInternalAuditObligationRatingLabelledFields = (
  records: InternalAuditObligationAssessmentResultFlatFields[] | undefined
) => {
  const { getByValue: getResultByValue } =
    useInternalAuditRating('performance_result');

  return useMemo<
    InternalAuditObligationAssessmentResultRegisterFields[]
  >(() => {
    return (
      records?.map((d) => {
        const parent = d.parents.filter((a) => a.internalAuditReport)[0]
          ?.internalAuditReport;

        return {
          ...d,
          CompletionDate: parent?.ActualCompletionDate ?? '-',
          NextTestDate: parent?.NextTestDate,
          Title: parent?.Title ?? '-',
          LinkedInternalAuditId: parent?.Id,
          Status: parent?.Status ?? undefined,
          Result: getResultByValue(d.Rating)?.label ?? UNRATED.label,
        };
      }) || []
    );
  }, [getResultByValue, records]);
};
