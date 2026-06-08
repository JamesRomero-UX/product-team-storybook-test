import { useLazyQuery } from '@apollo/client';
import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import {
  GetActionByIdDocument,
  GetActionUpdatesByParentActionIdDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { useTranslation } from 'react-i18next';
import { useFormCustomisation } from 'src/hooks/forms/useFormCustomisation';

import { toLocalDate } from '@/utils/dateUtils';
import { getFriendlyId } from '@/utils/friendlyId';
import { getContributorValue } from '@/utils/pdf/contributorValue';
import { getDepartmentsValue } from '@/utils/pdf/departmentValue';
import { createDocument } from '@/utils/pdf/document';
import { download } from '@/utils/pdf/downloader';
import { createField } from '@/utils/pdf/field';
import { createHeading, createSubHeading } from '@/utils/pdf/headings';
import { getOwnerValue } from '@/utils/pdf/ownerValue';
import { createTable, tableHeaders } from '@/utils/pdf/table';
import { optionalTableSection } from '@/utils/pdf/tableSection';
import { getTagsValue } from '@/utils/pdf/tagsValue';
import { twoColumns } from '@/utils/pdf/twoColumns';
import useCustomAttributeDataForExport from '@/utils/pdf/useCustomAttributeDataForExport';

const useExporter = (actionId: string): [() => void, { loading: boolean }] => {
  const { getStandardFieldLabel } = useFormCustomisation([
    'action',
    'action_update',
  ]);
  const [getCustomAttribute, customAttributesLoading] =
    useCustomAttributeDataForExport(Parent_Type_Enum.Action);

  const { t } = useTranslation(['common']);

  const { t: columns } = useTranslation(['common'], {
    keyPrefix: 'columns',
  });

  const { getLabel: getPriorityLabel } = useRating('priority');
  const { getLabel: getStatusLabel } = useRating('action_status');
  const [getAction, getActionResult] = useLazyQuery(GetActionByIdDocument, {
    variables: {
      _eq: actionId,
    },
  });
  const [getActionUpdates, getActionUpdatesResult] = useLazyQuery(
    GetActionUpdatesByParentActionIdDocument,
    {
      variables: {
        _eq: actionId,
      },
    }
  );

  const loading =
    getActionResult.loading ||
    getActionUpdatesResult.loading ||
    customAttributesLoading;
  const exportFunc = async () => {
    const { data: actionData } = await getAction();
    const { data: actionUpdatesData } = await getActionUpdates();
    const action = actionData?.action?.[0];

    const actionUpdates = actionUpdatesData?.action_update;

    if (!action || !actionUpdates) {
      return;
    }

    const actionUpdateTableData = actionUpdates.map((au) => [
      au.Title,
      au.Description,
      au.createdByUser?.FriendlyName ?? '',
      toLocalDate(au.CreatedAtTimestamp),
    ]);
    const title = `${action.Title} (${getFriendlyId(
      Parent_Type_Enum.Action,
      action.SequentialId
    )})`;

    const detailFields = [
      createField(getStandardFieldLabel('action', 'Title'), action.Title),
      createField(
        getStandardFieldLabel('action', 'Description'),
        action.Description
      ),
      createField(
        getStandardFieldLabel('action', 'Owners'),
        getOwnerValue(action)
      ),
      createField(
        getStandardFieldLabel('action', 'Contributors'),
        getContributorValue(action)
      ),
      createField(
        getStandardFieldLabel('action', 'Status'),
        getStatusLabel(action.Status)
      ),
      createField(
        getStandardFieldLabel('action', 'DateRaised'),
        toLocalDate(action.DateRaised)
      ),
      createField(
        getStandardFieldLabel('action', 'ClosedDate'),
        toLocalDate(action.ClosedDate)
      ),
      createField(
        getStandardFieldLabel('action', 'Priority'),
        getPriorityLabel(action.Priority)
      ),
      createField(
        getStandardFieldLabel('action', 'tags'),
        getTagsValue(action)
      ),
      createField(
        getStandardFieldLabel('action', 'departments'),
        getDepartmentsValue(action)
      ),
      ...(await getCustomAttribute(action)),
    ];

    const docDefinition = createDocument(title, [
      createHeading(title),
      createSubHeading(t('details')),
      twoColumns(detailFields),
      optionalTableSection(
        t('actionUpdates.tab_title'),
        createTable({
          widths: ['*', '*', 70, 50],
          body: [
            tableHeaders([
              getStandardFieldLabel('action_update', 'Title'),
              getStandardFieldLabel('action_update', 'Description'),
              columns('created_by_username'),
              columns('date'),
            ]),
            ...actionUpdateTableData,
          ],
        })
      ),
    ]);
    download(docDefinition);
  };

  return [exportFunc, { loading }];
};

export default useExporter;
