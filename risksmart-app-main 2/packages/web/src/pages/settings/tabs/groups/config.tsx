import type { GetUserGroupsWithApproversQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Link from '@/components/link';
import type { CollectionData } from '@/utils/collectionUtils';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';
import { yesNoCell } from '@/utils/table/utils/yesNoCell';
import { settingsEditUserGroupsUrl } from '@/utils/urls';

export type UserGroupsTableFields = CollectionData<
  GetUserGroupsWithApproversQuery['user_group'][0]
>;

export type GroupsTableFields = UserGroupsTableFields & {
  CreatedByUserName: null | string;
  ModifiedByUserName: null | string;
  UserCount: null | number;
  ApprovalCount: null | number;
};

export const useGetCollectionTableProps = (
  records: UserGroupsTableFields[]
): TablePropsWithActions<GroupsTableFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'userGroups' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'userGroups.columns',
  });
  const { t: sst } = useTranslation(['common'], {
    keyPrefix: 'columns',
  });

  const labelledFields = useMemo<GroupsTableFields[]>(
    () =>
      records?.map((record) => {
        return {
          ...record,
          CreatedByUserName: record.createdByUser?.FriendlyName || '-',
          ModifiedByUserName: record.modifiedByUser?.FriendlyName || '-',
          UserCount: record.users_aggregate.aggregate?.count || 0,
          ApprovalCount: record.approvers_aggregate?.aggregate?.count || 0,
        };
      }),
    [records]
  );

  const fields: TableFields<GroupsTableFields> = {
    Name: {
      id: 'name',
      header: st('name'),
      cell: (item) => (
        <Link variant={'secondary'} href={settingsEditUserGroupsUrl(item.Id)}>
          {item.Name}
        </Link>
      ),
    },
    Description: {
      header: st('description'),
    },
    Email: {
      header: st('email'),
    },
    UserCount: {
      header: st('members'),
    },
    OwnerContributor: {
      header: st('owner_contributor'),
      cell: yesNoCell('OwnerContributor'),
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
    Id: {
      header: sst('guid'),
    },
  };

  return useGetTableProps({
    customAttributeFormIds: [],
    tableId: 'userGroupRegister',
    data: labelledFields,
    entityLabel: t('entity_name'),
    fields,
    initialColumns: ['Name', 'Description', 'UserCount', 'Email'],
    preferencesStorageKey: 'GroupsSettingsTable-Preferences',
  });
};
