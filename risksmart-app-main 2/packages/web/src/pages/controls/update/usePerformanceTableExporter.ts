import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetTestResultsByControlIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import { useTranslation } from 'react-i18next';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';

import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const usePerformanceTableExporter = (
  controlId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { t } = useTranslation(['common']);

  const [getTestResults, getTestResultsResult] = useLazyQuery(
    GetTestResultsByControlIdDocument,
    {
      variables: {
        controlId: controlId,
      },
    }
  );
  const { getLabel: getEffectivenessLabel } = useRating('effectiveness');

  const createExportTable = async () => {
    const { data: testResultData } = await getTestResults();

    const testTypeLookup = t('testTypes');

    const testResultsTableData = (testResultData?.test_result ?? []).map(
      (au) => [
        au.Title ?? '-',
        toLocalDate(au.TestDate),
        au.TestType
          ? testTypeLookup[au.TestType as keyof typeof testTypeLookup]
          : '-',
        getEffectivenessLabel(au.OverallEffectiveness),
        au.submitter?.FriendlyName ?? '',
        toLocalDate(
          au.assessmentParents
            .filter((c) => c.assessment)
            .map((c) => c.assessment)[0]?.NextTestDate
        ) ?? '',
      ]
    );

    return createTable({
      widths: ['*', 50, 70, 90, 70, 50],
      body: [
        tableHeaders([
          getStandardFieldLabel('test_result', 'Title'),
          getStandardFieldLabel('test_result', 'TestDate'),
          getStandardFieldLabel('test_result', 'TestType'),
          getStandardFieldLabel('test_result', 'OverallEffectiveness'),
          getStandardFieldLabel('test_result', 'Submitter'),
          getStandardFieldLabel('assessment', 'NextTestDate'),
        ]),
        ...testResultsTableData,
      ],
    });
  };

  return [createExportTable, getTestResultsResult.loading];
};

export default usePerformanceTableExporter;
