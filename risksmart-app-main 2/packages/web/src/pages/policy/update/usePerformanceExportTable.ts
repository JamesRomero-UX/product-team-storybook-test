import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { ContentTable } from 'pdfmake/interfaces';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';

import { useGetDocumentAssessmentResultsByParentId } from '@/hooks/queries';
import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const usePerformanceExportTable = (
  documentId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { getLabel: getAssessmentStatusLabel } = useRating('assessment_status');
  const { getLabel: getPerformanceResultLabel } =
    useRating('performance_result');

  const { refetch, loading } = useGetDocumentAssessmentResultsByParentId({
    queryArgs: { parentId: documentId },
    shouldSkip: true,
  });

  const createExportTable = async () => {
    const { data: assessmentData } = await refetch();
    const assessmentsTableData = (
      assessmentData?.document_assessment_result ?? []
    ).map((au) => [
      au.parents?.filter((p) => p.assessment)[0]?.assessment?.Title ?? '-',
      getAssessmentStatusLabel(
        au.parents?.filter((p) => p.assessment)[0]?.assessment?.Status ?? '-'
      ),
      getPerformanceResultLabel(au.Rating),
      toLocalDate(
        au.parents?.filter((p) => p.assessment)[0]?.assessment?.StartDate
      ),
      toLocalDate(
        au.parents?.filter((p) => p.assessment)[0]?.assessment
          ?.ActualCompletionDate
      ),
      au.parents?.filter((p) => p.assessment)[0]?.assessment?.completedByUser
        ?.FriendlyName ?? '-',
    ]);

    return createTable({
      widths: '*',
      body: [
        tableHeaders([
          getStandardFieldLabel('assessment', 'Title'),
          getStandardFieldLabel('assessment', 'Status'),
          getStandardFieldLabel('document_assessment_result', 'Rating'),
          getStandardFieldLabel('assessment', 'StartDate'),
          getStandardFieldLabel('assessment', 'ActualCompletionDate'),
          getStandardFieldLabel('assessment', 'CompletedByUser'),
        ]),
        ...assessmentsTableData,
      ],
    });
  };

  return [createExportTable, loading];
};

export default usePerformanceExportTable;
