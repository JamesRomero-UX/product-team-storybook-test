import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import { GetIssuesByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import { useTranslation } from 'react-i18next';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';

import { toLocalDate } from '@/utils/dateUtils';
import { IssueTypeMapping } from '@/utils/issueVariantUtils';
import { getOwnerValue } from '@/utils/pdf/ownerValue';
import { createTable, tableHeaders } from '@/utils/pdf/table';
import { getTagsValue } from '@/utils/pdf/tagsValue';

const useIssuesExportTable = (
  parentId: string,
  type: ParentIssueType,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const issueTypeMap = IssueTypeMapping[type];
  const [getIssues, getIssuesResult] = useLazyQuery(
    GetIssuesByParentIdDocument,
    {
      variables: {
        ParentId: parentId,
        Type: type,
      },
    }
  );
  const { getLabel: getIssueAssessmentStatusLabel } = useRating(
    'issue_assessment_status'
  );
  const { getLabel: getSeverityLabel } = useRating('severity');

  const { t: issuesColumns } = useTranslation(['common'], {
    keyPrefix: `${issueTypeMap.taxonomy}.columns`,
  });
  const createExportTable = async () => {
    const { data: issueData } = await getIssues();
    const issuesTableData = (issueData?.issue ?? []).map((i) => [
      i.Title,
      getOwnerValue(i),
      getSeverityLabel(i.assessment?.Severity),
      getIssueAssessmentStatusLabel(i.assessment?.Status),
      toLocalDate(i.CreatedAtTimestamp),
      toLocalDate(i.assessment?.TargetCloseDate),
      getTagsValue(i),
    ]);

    return createTable({
      widths: ['*', 50, 50, 70, 70, 50, 70],
      body: [
        tableHeaders([
          getStandardFieldLabel('issue', 'Title'),
          getStandardFieldLabel('issue', 'Owners'),
          getStandardFieldLabel('issue_assessment', 'Severity'),
          getStandardFieldLabel('issue_assessment', 'Status'),
          issuesColumns('raised'),
          getStandardFieldLabel('issue_assessment', 'TargetCloseDate'),
          getStandardFieldLabel('issue', 'tags'),
        ]),
        ...issuesTableData,
      ],
    });
  };

  return [createExportTable, getIssuesResult.loading];
};

export default useIssuesExportTable;
