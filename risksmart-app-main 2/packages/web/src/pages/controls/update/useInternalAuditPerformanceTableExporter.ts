import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetInternalAuditReportTestResultsByControlIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import { useTranslation } from 'react-i18next';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';

import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const useInternalAuditPerformanceTableExporter = (
  controlId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { t } = useTranslation(['common']);

  const [getTestResults, getTestResultsResult] = useLazyQuery(
    GetInternalAuditReportTestResultsByControlIdDocument,
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

    const testResultsTableData = (
      testResultData?.control_test_internal_audit_result ?? []
    ).map((au) => [
      au.Title ?? '-',
      toLocalDate(au.TestDate),
      au.TestType
        ? testTypeLookup[au.TestType as keyof typeof testTypeLookup]
        : '-',
      getEffectivenessLabel(au.OverallEffectiveness),
      au.submitter?.FriendlyName ?? '',
      toLocalDate(
        au.parents
          .filter((c) => c.internalAuditReport)
          .map((c) => c.internalAuditReport)[0]?.NextTestDate
      ) ?? '',
    ]);

    return createTable({
      widths: ['*', 50, 70, 90, 70, 50],
      body: [
        tableHeaders([
          getStandardFieldLabel('control_test_internal_audit_result', 'Title'),
          getStandardFieldLabel(
            'control_test_internal_audit_result',
            'TestDate'
          ),
          getStandardFieldLabel(
            'control_test_internal_audit_result',
            'TestType'
          ),
          getStandardFieldLabel(
            'control_test_internal_audit_result',
            'OverallEffectiveness'
          ),
          getStandardFieldLabel(
            'control_test_internal_audit_result',
            'Submitter'
          ),
          getStandardFieldLabel('internal_audit_report', 'NextTestDate'),
        ]),
        ...testResultsTableData,
      ],
    });
  };

  return [createExportTable, getTestResultsResult.loading];
};

export default useInternalAuditPerformanceTableExporter;
