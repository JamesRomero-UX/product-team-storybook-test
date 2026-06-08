import { useRating } from '@risksmart-app/components/src/hooks/useRating';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SimpleRatingBadge from 'src/components/simple-rating-badge';

import ActionsStatusBadge from '@/components/action-status-badge/ActionsStatusBadge';
import { isActionStatusOverdue } from '@/components/action-status-badge/utils';
import Link from '@/components/link';
import { useGetContributorsFieldConfig } from '@/utils/table/hooks/useGetContributorsFieldConfig';
import { useGetDepartmentFieldConfig } from '@/utils/table/hooks/useGetDepartmentFieldConfig';
import { useGetOwnersFieldConfig } from '@/utils/table/hooks/useGetOwnersFieldConfig';
import type {
  StatefulTableOptions,
  UseGetTablePropsOptions,
} from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetStatelessTableProps } from '@/utils/table/hooks/useGetStatelessTableProps';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import { useGetTablePropsWithoutUrlHash } from '@/utils/table/hooks/useGetTablePropsWithoutUrlHash';
import { useGetTagFieldConfig } from '@/utils/table/hooks/useGetTagFieldConfig';
import { useLinkArrayField } from '@/utils/table/hooks/useLinkArrayField';
import { exportStyleFromOption } from '@/utils/table/pdfExportStyles';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { actionDetailsUrl } from '@/utils/urls';

import type { ActionFields, ActionTableFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = ({
  useAbsoluteUrls,
}: {
  useAbsoluteUrls?: boolean;
}): TableFields<ActionTableFields> => {
  const allOwners = useGetOwnersFieldConfig<ActionTableFields>({
    formId: 'action',
    fieldId: 'Owners',
  });
  const allContributors = useGetContributorsFieldConfig<ActionTableFields>({
    formId: 'action',
    fieldId: 'Contributors',
  });
  const tagField = useGetTagFieldConfig<ActionTableFields>({
    formId: 'action',
    fieldId: 'tags',
  });
  const departmentField = useGetDepartmentFieldConfig<ActionTableFields>(
    (r) => r.departments,
    {
      formId: 'action',
      fieldId: 'departments',
    }
  );
  const { getByValue: getPriority } = useRating('priority');
  const { getByValue: getActionStatus } = useRating('action_status');
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'actions.columns',
  });
  const { t } = useTranslation(['common'], {
    keyPrefix: 'columns',
  });
  const associations = useLinkArrayField<ActionTableFields>(
    t('associations'),
    (r) => r.ParentTitle
  );

  return useMemo(
    () => ({
      SequentialIdLabel: { header: t('id'), sortingField: 'SequentialId' },
      Title: {
        formId: 'action',
        fieldId: 'Title',
        cell: (item) => (
          <Link
            variant={'secondary'}
            href={useAbsoluteUrls ? actionDetailsUrl(item.Id) : item.Id}
            isRelativeUrl={!useAbsoluteUrls}
          >
            {item.Title}
          </Link>
        ),
        isRowHeader: true,
      },
      allOwners,
      allContributors,
      ParentTitle: associations,
      DateRaised: dateColumnFromConfig({
        header: { formId: 'action', fieldId: 'DateRaised' },
        dateField: 'DateRaised',
      }),
      DateDue: dateColumnFromConfig({
        header: { formId: 'action', fieldId: 'DateDue' },
        dateField: 'DateDue',
      }),
      ClosedDate: dateColumnFromConfig({
        header: { formId: 'action', fieldId: 'ClosedDate' },
        dateField: 'ClosedDate',
      }),
      StatusLabelled: {
        formId: 'action',
        fieldId: 'Status',
        cell: (item) => (
          <ActionsStatusBadge
            item={{
              Status: item.Status,
              DateDue: item.DateDue,
            }}
          />
        ),
        // PDF export: colour cell using the action status rating colour (handles overdue override)
        exportCellStyle: exportStyleFromOption((item) =>
          isActionStatusOverdue({
            item: { Status: item.Status, DateDue: item.DateDue },
          })
            ? getActionStatus('overdue')
            : getActionStatus(item.Status)
        ),
      },
      PriorityLabelled: {
        formId: 'action',
        fieldId: 'Priority',
        cell: (item) => (
          <SimpleRatingBadge rating={getPriority(item.Priority)} />
        ),
        sortingField: 'Priority',
        exportCellStyle: exportStyleFromOption((item) =>
          getPriority(item.Priority)
        ),
      },
      tags: tagField,
      departments: departmentField,
      Id: { header: t('guid') },
      ModifiedAtTimestamp: dateColumnFromConfig({
        header: { header: t('updated_on') },
        dateField: 'ModifiedAtTimestamp',
      }),
      ModifiedByUser: { header: t('updated_by_id') },
      ModifiedByUserName: { header: st('modified_by_username') },
      CreatedAtTimestamp: dateColumnFromConfig({
        header: { header: t('created_on') },
        dateField: 'CreatedAtTimestamp',
      }),
      CreatedByUserName: { header: st('created_by_username') },

      UpdateCount: { header: st('updateCount') },
      LatestUpdateCreatedAtTimestamp: dateColumnFromConfig({
        header: { header: st('latestUpdateCreatedAtTimestamp') },
        dateField: 'LatestUpdateCreatedAtTimestamp',
      }),
      LatestUpdateDescription: { header: st('latestUpdateDescription') },
      LatestUpdateTitle: { header: st('latestUpdateTitle') },
      Description: { formId: 'action', fieldId: 'Description' },
    }),
    [
      allContributors,
      allOwners,
      associations,
      departmentField,
      getPriority,
      st,
      getActionStatus,
      t,
      tagField,
      useAbsoluteUrls,
    ]
  );
};

const useGetActionTableProps = (
  records: ActionFields[] | undefined,
  useAbsoluteUrls: boolean = false
): UseGetTablePropsOptions<ActionTableFields> => {
  const labelledFields = useLabelledFields(records);
  const { t } = useTranslation(['common'], { keyPrefix: 'actions' });
  const fields = useGetFieldConfig({ useAbsoluteUrls });

  return {
    tableId: 'actionRegister',
    data: labelledFields,
    entityLabel: t('entity_name'),
    emptyCollectionAction: <></>,
    preferencesStorageKey: 'ActionsRegisterTable-PreferencesV1',
    enableFiltering: true,
    initialColumns: [
      'Title',
      'allOwners',
      'ParentTitle',
      'DateRaised',
      'DateDue',
      'ClosedDate',
      'StatusLabelled',
      'PriorityLabelled',
      'tags',
    ],
    fields,
    defaultSortingState: {
      sortingColumn: 'DateRaised',
      sortingDirection: 'desc',
    },
    customAttributeFormIds: ['action'],
  };
};

export const useGetCollectionTableProps = (
  records: ActionFields[] | undefined
): TablePropsWithActions<ActionTableFields> => {
  const props = useGetActionTableProps(records);

  return useGetTableProps(props);
};

export const useGetCollectionStatelessTableProps = (
  records: ActionFields[] | undefined,
  useAbsoluteUrls?: boolean
): TablePropsWithActions<ActionTableFields> => {
  const props = useGetActionTableProps(records, useAbsoluteUrls);

  return useGetTablePropsWithoutUrlHash(props);
};

export const useGetActionSmartWidgetTableProps = (
  records: ActionFields[] | undefined,

  statefulTableOptions: StatefulTableOptions<ActionTableFields>
): TablePropsWithActions<ActionTableFields> => {
  const props = useGetActionTableProps(records, true);

  return useGetStatelessTableProps<ActionTableFields>({
    ...props,
    ...statefulTableOptions,
    enableFiltering: false,
  });
};
