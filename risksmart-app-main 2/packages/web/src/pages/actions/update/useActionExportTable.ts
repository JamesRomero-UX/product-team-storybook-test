import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { GetActionsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ContentTable } from 'pdfmake/interfaces';
import type { GetStandardFormFieldLabel } from 'src/hooks/forms/useFormCustomisation';

import { toLocalDate } from '@/utils/dateUtils';
import { getOwnerValue } from '@/utils/pdf/ownerValue';
import { createTable, tableHeaders } from '@/utils/pdf/table';
import { getTagsValue } from '@/utils/pdf/tagsValue';

const useActionExportTable = (
  parentId: string,
  getStandardFieldLabel: GetStandardFormFieldLabel
): [() => Promise<ContentTable>, boolean] => {
  const [getActions, getActionsResult] = useLazyQuery(GetActionsDocument, {
    variables: {
      where: { parents: { ParentId: { _eq: parentId } } },
    },
  });
  const { getLabel: getPriorityLabel } = useRating('priority');
  const { getLabel: getStatusLabel } = useRating('action_status');

  const createExportTable = async () => {
    const { data: actionData } = await getActions();
    const actionTableData = (actionData?.action ?? []).map((i) => [
      i.Title,
      getOwnerValue(i),
      toLocalDate(i.DateRaised),
      toLocalDate(i.DateDue),
      getStatusLabel(i.Status),
      getPriorityLabel(i.Priority),
      getTagsValue(i),
    ]);

    return createTable({
      widths: ['*', 50, 50, 70, 70, 50, 70],
      body: [
        tableHeaders([
          getStandardFieldLabel('action', 'Title'),
          getStandardFieldLabel('action', 'Owners'),
          getStandardFieldLabel('action', 'DateRaised'),
          getStandardFieldLabel('action', 'DateDue'),
          getStandardFieldLabel('action', 'Status'),
          getStandardFieldLabel('action', 'Priority'),
          getStandardFieldLabel('action', 'tags'),
        ]),
        ...actionTableData,
      ],
    });
  };

  return [createExportTable, getActionsResult.loading];
};

export default useActionExportTable;
