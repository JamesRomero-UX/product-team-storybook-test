import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetObligationAssessmentResultsByObligationIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';
import { UNRATED } from 'src/pages/controls/lookupData';

import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const useAssessmentsExportTable = (
  obligationId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const { getLabel: getStatusLabel } = useRating('assessment_status');
  const { getLabel: getResultLabel } = useRating('performance_result');
  const [getAssessments, getAssessmentsResult] = useLazyQuery(
    GetObligationAssessmentResultsByObligationIdDocument,
    {
      variables: {
        ObligationId: obligationId,
      },
    }
  );

  const createExportTable = async () => {
    const { data: assessmentsData } = await getAssessments();
    const assessmentsTableData = (
      assessmentsData?.obligation_assessment_result ?? []
    ).map((au) => {
      let title = '-';
      let statusLabel = '-';
      let startDate = '-';
      let completionDate: string;
      let completedBy = '-';
      const hasAssessment = au.parents.length > 0 && au.parents[0].assessment;
      if (hasAssessment) {
        title = au.parents[0].assessment?.Title ?? '-';
        statusLabel = getStatusLabel(au.parents[0].assessment?.Status ?? '-');
        startDate = toLocalDate(au.parents[0].assessment?.StartDate);
        completionDate = toLocalDate(
          au.parents[0].assessment?.ActualCompletionDate
        );
        completedBy =
          au.parents[0].assessment?.completedByUser?.FriendlyName ?? '-';
      } else {
        completionDate = toLocalDate(au.TestDate);
      }

      return [
        title,
        statusLabel,
        getResultLabel(au.Rating ?? UNRATED.value),
        startDate,
        completionDate,
        completedBy,
      ];
    });

    return createTable({
      widths: '*',
      body: [
        tableHeaders([
          getStandardFieldLabel('assessment', 'Title'),
          getStandardFieldLabel('assessment', 'Status'),
          getStandardFieldLabel('obligation_assessment_result', 'Rating'),
          getStandardFieldLabel('assessment', 'StartDate'),
          getStandardFieldLabel('assessment', 'ActualCompletionDate'),
          getStandardFieldLabel('assessment', 'CompletedByUser'),
        ]),
        ...assessmentsTableData,
      ],
    });
  };

  return [createExportTable, getAssessmentsResult.loading];
};

export default useAssessmentsExportTable;
