import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetIndicatorsByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import { useTranslation } from 'react-i18next';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';

import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

import { conformanceRatingFromResults } from '../calculateConformanceRating';
import { latestResultValueFromData } from '../latestResultValueFromData';

const useIndicatorExportTable = (
  parentId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { getLabel: getTestFreqLabel } = useRating('frequency');
  const { getLabel: getConformanceLabel } = useRating(
    'indicator_conformance_status'
  );
  const [getIndicators, getIndicatorsResult] = useLazyQuery(
    GetIndicatorsByParentIdDocument,
    {
      variables: {
        parentId,
      },
    }
  );

  const { t: indicatorsColumns } = useTranslation(['common'], {
    keyPrefix: 'indicators.columns',
  });
  const createIndicatorTable = async () => {
    const { data: indicatorsData } = await getIndicators();
    const indicatorTableData = (indicatorsData?.indicator ?? []).map(
      (indicator) => [
        indicator.Title,
        getTestFreqLabel(indicator.schedule?.Frequency),
        latestResultValueFromData(indicator),
        getConformanceLabel(conformanceRatingFromResults(indicator)),
        toLocalDate(indicator.orderedResults[0]?.ResultDate),
      ]
    );

    return createTable({
      widths: ['*', 50, 50, 70, 70, 50, 70],
      body: [
        tableHeaders([
          getStandardFieldLabel('indicator', 'Title'),
          indicatorsColumns('test_frequency'),
          indicatorsColumns('latest_result'),
          indicatorsColumns('conformance'),
          indicatorsColumns('latest_result_date'),
        ]),
        ...indicatorTableData,
      ],
    });
  };

  return [createIndicatorTable, getIndicatorsResult.loading];
};

export default useIndicatorExportTable;
