import type { GetDepartmentsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Link from '@/components/link';
import type { CollectionData } from '@/utils/collectionUtils';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

export type DepartmentTypeTableFields = CollectionData<
  GetDepartmentsQuery['department_type'][0]
>;

export type DepartmentsTableFields = DepartmentTypeTableFields & {
  CreatedByUserName: null | string;
  ModifiedByUserName: null | string;
  DepartmentGroup: null | string;
};

export const useGetCollectionTableProps = (
  records: DepartmentTypeTableFields[],
  onEdit: (departmentType: DepartmentTypeTableFields) => void
): TablePropsWithActions<DepartmentsTableFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'departments' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'departments.columns',
  });
  const { t: stc } = useTranslation(['common'], {
    keyPrefix: 'columns',
  });

  const labelledFields = useMemo<DepartmentsTableFields[]>(
    () =>
      records?.map((record) => {
        return {
          ...record,
          CreatedByUserName: record.createdByUser?.FriendlyName || '-',
          ModifiedByUserName: record.modifiedByUser?.FriendlyName || '-',
          DepartmentGroup: record.department_type_group?.Name || '',
        };
      }),
    [records]
  );

  const fields: TableFields<DepartmentsTableFields> = {
    Name: {
      id: 'name',
      header: st('name'),
      cell: (item) => (
        <Link variant={'secondary'} href={'#'} onFollow={() => onEdit(item)}>
          {item.Name}
        </Link>
      ),
    },
    Description: {
      header: st('description'),
    },
    CreatedAtTimestamp: dateColumnFromConfig({
      header: { header: st('created_on') },
      dateField: 'CreatedAtTimestamp',
    }),
    CreatedByUserName: {
      header: st('created_by_user'),
    },
    ModifiedAtTimestamp: dateColumnFromConfig({
      header: { header: st('updated_on') },
      dateField: 'ModifiedAtTimestamp',
    }),
    ModifiedByUserName: {
      header: st('updated_by_user'),
    },
    DepartmentGroup: {
      header: st('department_type_group'),
    },
    DepartmentTypeId: {
      header: stc('guid'),
    },
  };

  return useGetTableProps({
    tableId: 'departmentRegister',
    data: labelledFields,
    entityLabel: t('entity_name'),
    fields,
    initialColumns: ['Name', 'Description', 'DepartmentGroup'],
    preferencesStorageKey: 'DepartmentsSettingsTable-Preferences',
    customAttributeFormIds: [],
  });
};
