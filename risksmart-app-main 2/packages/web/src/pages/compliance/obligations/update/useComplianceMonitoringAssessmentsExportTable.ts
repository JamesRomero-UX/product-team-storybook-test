import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';
import { UNRATED } from 'src/pages/controls/lookupData';

import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const useComplianceMonitoringAssessmentsExportTable = (
  obligationId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { getLabel: getStatusLabel } = useRating('assessment_status');
  const { getLabel: getResultLabel } = useRating('performance_result');
  const [getAssessments, getAssessmentsResult] = useLazyQuery(
    GetComplianceMonitoringAssessmentObligationAssessmentResultsByObligationIdDocument,
    {
      variables: {
        ObligationId: obligationId,
      },
    }
  );

  const createExportTable = async () => {
    const { data: assessmentsData } = await getAssessments();
    const assessmentsTableData = (
      assessmentsData?.obligation_second_line_result ?? []
    ).map((au) => [
      au.parents[0].complianceMonitoringAssessment?.Title ?? '-',
      getStatusLabel(
        au.parents[0].complianceMonitoringAssessment?.Status ?? '-'
      ),
      getResultLabel(au.Rating ?? UNRATED.value),
      toLocalDate(au.parents[0].complianceMonitoringAssessment?.StartDate),
      toLocalDate(
        au.parents[0].complianceMonitoringAssessment?.ActualCompletionDate
      ),
      au.parents[0].complianceMonitoringAssessment?.completedByUser
        ?.FriendlyName ?? '-',
    ]);

    return createTable({
      widths: '*',
      body: [
        tableHeaders([
          getStandardFieldLabel('compliance_monitoring_assessment', 'Title'),
          getStandardFieldLabel('compliance_monitoring_assessment', 'Status'),
          getStandardFieldLabel('obligation_second_line_result', 'Rating'),
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

  return [createExportTable, getAssessmentsResult.loading];
};

export default useComplianceMonitoringAssessmentsExportTable;
