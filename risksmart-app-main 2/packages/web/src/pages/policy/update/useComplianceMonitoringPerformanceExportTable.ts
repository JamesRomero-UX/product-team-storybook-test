import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';

import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const useComplianceMonitoringPerformanceExportTable = (
  documentId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { getLabel: getAssessmentStatusLabel } = useRating('assessment_status');
  const { getLabel: getPerformanceResultLabel } =
    useRating('performance_result');

  const [getDocumentAssessmentsResults, getDocumentAssessmentsResultsResult] =
    useLazyQuery(
      GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdDocument,
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
      assessmentData?.document_second_line_result ?? []
    ).map((au) => [
      au.parents?.filter((p) => p.complianceMonitoringAssessment)[0]
        ?.complianceMonitoringAssessment?.Title ?? '-',
      getAssessmentStatusLabel(
        au.parents?.filter((p) => p.complianceMonitoringAssessment)[0]
          ?.complianceMonitoringAssessment?.Status ?? '-'
      ),
      getPerformanceResultLabel(au.Rating),
      toLocalDate(
        au.parents?.filter((p) => p.complianceMonitoringAssessment)[0]
          ?.complianceMonitoringAssessment?.StartDate
      ),
      toLocalDate(
        au.parents?.filter((p) => p.complianceMonitoringAssessment)[0]
          ?.complianceMonitoringAssessment?.ActualCompletionDate
      ),
      au.parents?.filter((p) => p.complianceMonitoringAssessment)[0]
        ?.complianceMonitoringAssessment?.completedByUser?.FriendlyName ?? '-',
    ]);

    return createTable({
      widths: '*',
      body: [
        tableHeaders([
          getStandardFieldLabel('compliance_monitoring_assessment', 'Title'),
          getStandardFieldLabel('compliance_monitoring_assessment', 'Status'),
          getStandardFieldLabel('document_second_line_result', 'Rating'),
          getStandardFieldLabel(
            'compliance_monitoring_assessment',
            'StartDate'
          ),
          getStandardFieldLabel(
            'compliance_monitoring_assessment',
            'ActualCompletionDate'
          ),
          getStandardFieldLabel(
            'compliance_monitoring_assessment',
            'CompletedByUser'
          ),
        ]),
        ...assessmentsTableData,
      ],
    });
  };

  return [createExportTable, getDocumentAssessmentsResultsResult.loading];
};

export default useComplianceMonitoringPerformanceExportTable;
