import { useLazyQuery } from '@apollo/client';
import { GetAssessmentActivitiesByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import { useTranslation } from 'react-i18next';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';

import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const useAssessmentActivityExportTable = (
  parentId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const [getAssessmentActivities, getAssessmentActivitiesResult] = useLazyQuery(
    GetAssessmentActivitiesByParentIdDocument,
    {
      variables: {
        AssessmentId: parentId,
      },
    }
  );

  const { t } = useTranslation(['common'], {
    keyPrefix: 'assessmentActivities',
  });
  const createExportTable = async () => {
    const { data: assessmentActivityData } = await getAssessmentActivities();
    const status = t('status');
    const type = t('type');
    const assessmentActivityTableData = (
      assessmentActivityData?.assessment_activity ?? []
    ).map((i) => [
      i.ActivityType ? type[i.ActivityType] : '-',
      i.Title!,
      i.Status ? status[i.Status] : '-',
      toLocalDate(i.CompletionDate),
    ]);

    return createTable({
      widths: [70, '*', 50, 70],
      body: [
        tableHeaders([
          getStandardFieldLabel('assessment_activity', 'ActivityType'),
          getStandardFieldLabel('assessment_activity', 'Title'),
          getStandardFieldLabel('assessment_activity', 'Status'),
          getStandardFieldLabel('assessment_activity', 'CompletionDate'),
        ]),
        ...assessmentActivityTableData,
      ],
    });
  };

  return [createExportTable, getAssessmentActivitiesResult.loading];
};

export default useAssessmentActivityExportTable;
