import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';

import { UNRATED } from '../../../../../controls/lookupData';
import type {
  ObligationAssessmentResultFlatFields,
  ObligationAssessmentResultRegisterFields,
} from './types';

export const useObligationRatingLabelledFields = (
  records: ObligationAssessmentResultFlatFields[] | undefined
) => {
  const { getByValue: getResultByValue } = useRating('performance_result');

  return useMemo<ObligationAssessmentResultRegisterFields[]>(() => {
    return (
      records?.map((d) => {
        const parent = d.parents.filter((a) => a.assessment)[0]?.assessment;

        return {
          ...d,
          CompletionDate: parent?.ActualCompletionDate ?? '-',
          NextTestDate: parent?.NextTestDate,
          Title: parent?.Title ?? '-',
          LinkedAssessmentId: parent?.Id,
          Status: parent?.Status,
          Result: getResultByValue(d.Rating)?.label ?? UNRATED.label,
        };
      }) || []
    );
  }, [getResultByValue, records]);
};
