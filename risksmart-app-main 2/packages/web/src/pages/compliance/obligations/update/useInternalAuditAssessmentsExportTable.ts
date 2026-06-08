import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetInternalAuditReportObligationAssessmentResultsByObligationIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';
import { UNRATED } from 'src/pages/controls/lookupData';

import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const useInternalAuditReportsExportTable = (
  obligationId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { getLabel: getStatusLabel } = useRating('assessment_status');
  const { getLabel: getResultLabel } = useRating('performance_result');
  const [getInternalAudits, getInternalAuditsResult] = useLazyQuery(
    GetInternalAuditReportObligationAssessmentResultsByObligationIdDocument,
    {
      variables: {
        ObligationId: obligationId,
      },
    }
  );

  const createExportTable = async () => {
    const { data: internalAuditData } = await getInternalAudits();
    const internalAuditTableData = (
      internalAuditData?.obligation_internal_audit_result ?? []
    ).map((au) => [
      au.parents[0].internalAuditReport?.Title ?? '-',
      getStatusLabel(au.parents[0].internalAuditReport?.Status ?? '-'),
      getResultLabel(au.Rating ?? UNRATED.value),
      toLocalDate(au.parents[0].internalAuditReport?.StartDate),
      toLocalDate(au.parents[0].internalAuditReport?.ActualCompletionDate),
      au.parents[0].internalAuditReport?.completedByUser?.FriendlyName ?? '-',
    ]);

    return createTable({
      widths: '*',
      body: [
        tableHeaders([
          getStandardFieldLabel('internal_audit_report', 'Title'),
          getStandardFieldLabel('internal_audit_report', 'Status'),
          getStandardFieldLabel('obligation_internal_audit_result', 'Rating'),
          getStandardFieldLabel('internal_audit_report', 'StartDate'),
          getStandardFieldLabel(
            'internal_audit_report',
            'ActualCompletionDate'
          ),
          getStandardFieldLabel('internal_audit_report', 'CompletedByUser'),
        ]),
        ...internalAuditTableData,
      ],
    });
  };

  return [createExportTable, getInternalAuditsResult.loading];
};

export default useInternalAuditReportsExportTable;
