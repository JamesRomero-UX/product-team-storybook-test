import { useTranslation } from 'react-i18next';
import { MAX_COL_WIDTH } from 'src/App.config';

import Link from '@/components/link';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

import type { ControlGroupFlatFields, ControlGroupTableFields } from './types';
import { useLabelledFields } from './useLabelledFields';

const useGetFieldConfig = (): TableFields<ControlGroupTableFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'columns' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'controlGroups.columns',
  });

  return {
    Title: {
      formId: 'control_group',
      fieldId: 'Title',
      cell: (item) => (
        <Link variant={'secondary'} href={`/control-groups/${item.Id}`}>
          {item.Title}
        </Link>
      ),
      maxWidth: MAX_COL_WIDTH,
      isRowHeader: true,
    },
    OwnerName: {
      formId: 'control_group',
      fieldId: 'Owner',
      cell: (item) => item.OwnerName || '-',
      maxWidth: MAX_COL_WIDTH,
    },
    Description: {
      formId: 'control_group',
      fieldId: 'Description',
      cell: (item) => item.Description || '-',
      maxWidth: MAX_COL_WIDTH,
    },

    LinkedControlCount: {
      header: st('linked_controls'),
      cell: (item) => item.LinkedControlCount ?? '-',
      filterOptions: {
        filteringProperties: {
          operators: ['!=', '>', '<', '>=', '<='],
        },
      },
    },
    //------------------
    Id: {
      header: t('id'),
    },
    Owner: {
      header: st('owner_id'),
    },
    ModifiedAtTimestamp: dateColumnFromConfig({
      header: { header: t('updated_on') },
      dateField: 'ModifiedAtTimestamp',
    }),
    CreatedByUser: {
      header: t('created_by_id'),
    },
    CreatedByUserName: {
      header: t('created_by_username'),
    },
  };
};

export const useGetCollectionTableProps = (
  records: ControlGroupFlatFields[] | undefined
): TablePropsWithActions<ControlGroupTableFields> => {
  const { t: st } = useTranslation(['common'], { keyPrefix: 'controlGroups' });
  const fields = useGetFieldConfig();
  const labelledFields = useLabelledFields(records);

  return useGetTableProps({
    tableId: 'controlGroupRegister',
    data: labelledFields,
    customAttributeFormIds: ['control_group'],
    entityLabel: st('entity_name'),
    emptyCollectionAction: <></>,
    preferencesStorageKey: 'ControlGroupRegisterTable-PreferencesV1',
    enableFiltering: true,
    initialColumns: ['Title', 'OwnerName', 'Description', 'LinkedControlCount'],
    fields,
  });
};
