import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetInternalAuditReportDocumentAssessmentResultsByDocumentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';

import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const useInternalAuditPerformanceExportTable = (
  documentId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { getLabel: getAssessmentStatusLabel } = useRating('assessment_status');
  const { getLabel: getPerformanceResultLabel } =
    useRating('performance_result');

  const [getDocumentAssessmentsResults, getDocumentAssessmentsResultsResult] =
    useLazyQuery(
      GetInternalAuditReportDocumentAssessmentResultsByDocumentIdDocument,
      {
        variables: {
          ParentId: documentId,
        },
        fetchPolicy: 'no-cache',
      }
    );

  const createExportTable = async () => {
    const { data: assessmentData } = await getDocumentAssessmentsResults();
    const assessmentsTableData = (
      assessmentData?.document_internal_audit_result ?? []
    ).map((au) => [
      au.parents?.filter((p) => p.internalAuditReport)[0]?.internalAuditReport
        ?.Title ?? '-',
      getAssessmentStatusLabel(
        au.parents?.filter((p) => p.internalAuditReport)[0]?.internalAuditReport
          ?.Status ?? '-'
      ),
      getPerformanceResultLabel(au.Rating),
      toLocalDate(
        au.parents?.filter((p) => p.internalAuditReport)[0]?.internalAuditReport
          ?.StartDate
      ),
      toLocalDate(
        au.parents?.filter((p) => p.internalAuditReport)[0]?.internalAuditReport
          ?.ActualCompletionDate
      ),
      au.parents?.filter((p) => p.internalAuditReport)[0]?.internalAuditReport
        ?.completedByUser?.FriendlyName ?? '-',
    ]);

    return createTable({
      widths: '*',
      body: [
        tableHeaders([
          getStandardFieldLabel('internal_audit_report', 'Title'),
          getStandardFieldLabel('internal_audit_report', 'Status'),
          getStandardFieldLabel('document_internal_audit_result', 'Rating'),
          getStandardFieldLabel('internal_audit_report', 'StartDate'),
          getStandardFieldLabel(
            'internal_audit_report',
            'ActualCompletionDate'
          ),
          getStandardFieldLabel('internal_audit_report', 'CompletedByUser'),
        ]),
        ...assessmentsTableData,
      ],
    });
  };

  return [createExportTable, getDocumentAssessmentsResultsResult.loading];
};

export default useInternalAuditPerformanceExportTable;
