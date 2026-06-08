import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';

import { UNRATED } from '../../../../controls/lookupData';
import type {
  DocumentAssessmentResultFlatFields,
  DocumentAssessmentResultRegisterFields,
} from './types';

export const useDocumentRatingLabelledFields = (
  records: DocumentAssessmentResultFlatFields[] | undefined
) => {
  const { getByValue: getResultByValue } = useRating('performance_result');

  return useMemo<DocumentAssessmentResultRegisterFields[]>(() => {
    return (
      records?.map((d) => {
        const assessment = d.parents.filter((a) => a.assessment)[0]?.assessment;

        return {
          ...d,
          Title: assessment?.Title ?? '-',
          ActualCompletionDate: assessment?.ActualCompletionDate ?? '-',
          CompletionDate: assessment?.ActualCompletionDate ?? '-',
          ResultValue: d.Rating ?? UNRATED.value,
          TestDate: d.TestDate ?? null,
          Result: getResultByValue(d.Rating)?.label ?? UNRATED.label,
          Id: d.Id,
          AssessmentId: assessment?.Id,
          Status: assessment?.Status ?? '-',
          NextTestDate: assessment?.NextTestDate,
        };
      }) || []
    );
  }, [records, getResultByValue]);
};
