import { useLazyQuery } from '@apollo/client';
import { GetIssueUpdatesByParentIssueIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import { useTranslation } from 'react-i18next';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';

import { toLocalDate } from '@/utils/dateUtils';
import { createTable, tableHeaders } from '@/utils/pdf/table';

const useUpdatesExportTable = (
  issueId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const [getIssueUpdates, getIssueUpdatesResult] = useLazyQuery(
    GetIssueUpdatesByParentIssueIdDocument,
    {
      variables: {
        _eq: issueId,
      },
    }
  );

  const { t: columns } = useTranslation(['common'], {
    keyPrefix: 'columns',
  });
  const { t: updatesColumns } = useTranslation(['common'], {
    keyPrefix: 'actionUpdates.columns',
  });
  const createExportTable = async () => {
    const { data: issueUpdatesData } = await getIssueUpdates();
    const issueUpdatesTableData = (issueUpdatesData?.issue_update ?? []).map(
      (i) => [
        i.Title,
        i.Description,
        i.createdByUser?.FriendlyName ?? '-',
        toLocalDate(i.ModifiedAtTimestamp),
      ]
    );

    return createTable({
      widths: '*',
      body: [
        tableHeaders([
          getStandardFieldLabel('issue_update', 'Title'),
          getStandardFieldLabel('issue_update', 'Description'),
          columns('created_by_username'),
          updatesColumns('date'),
        ]),
        ...issueUpdatesTableData,
      ],
    });
  };

  return [createExportTable, getIssueUpdatesResult.loading];
};

export default useUpdatesExportTable;
