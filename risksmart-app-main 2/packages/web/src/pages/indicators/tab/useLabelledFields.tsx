import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import _ from 'lodash';
import { useMemo } from 'react';

import { conformanceRatingFromResults } from '../calculateConformanceRating';
import { latestResultValueFromData } from '../latestResultValueFromData';
import type { IndicatorFlatFields, IndicatorTableFields } from './types';

export const useLabelledFields = (
  records: IndicatorFlatFields[] | undefined
) => {
  const { getLabel: getConformanceLabel } = useRating(
    'indicator_conformance_status'
  );
  const { getLabel: getTestFreqLabel } = useRating('frequency');

  return useMemo<IndicatorTableFields[] | undefined>(() => {
    return records?.map((d) => {
      return {
        ...d,
        LatestResultValue: latestResultValueFromData(d) || '-',
        LatestResultDate: d.orderedResults[0]?.ResultDate || '-',
        Conformance: conformanceRatingFromResults(d),
        ConformanceLabelled: getConformanceLabel(
          conformanceRatingFromResults(d)
        ),
        TestFrequencyLabelled: getTestFreqLabel(d.schedule?.Frequency) || '-',
      };
    });
  }, [records, getConformanceLabel, getTestFreqLabel]);
};
