import type { GetUsersByGroupIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { CollectionData } from '@/utils/collectionUtils';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields, TablePropsWithActions } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

type UserGroupMembersTableFields = CollectionData<
  GetUsersByGroupIdQuery['user_group'][0]['users'][0]
>;

export type GroupMembersTableFields =
  UserGroupMembersTableFields['authUsers'] & {
    Name: null | string;
    CreatedByUserName: null | string;
    CreatedAtTimestamp: string;
  };

const getNameForUser = (user?: UserGroupMembersTableFields['authUsers']) => {
  if (!user) {
    return '-';
  }

  return `${user.FirstName || ''} ${user.LastName || ''}`.trim() || '-';
};

export const useGetCollectionTableProps = (
  records: UserGroupMembersTableFields[]
): TablePropsWithActions<GroupMembersTableFields> => {
  const { t } = useTranslation(['common'], { keyPrefix: 'userGroupMembers' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'userGroupMembers.columns',
  });

  const labelledFields = useMemo<GroupMembersTableFields[]>(
    () =>
      records
        ?.filter((u) => u.authUsers)
        .map((record) => {
          return {
            ...record.authUsers,
            Name: getNameForUser(record?.authUsers),
            CreatedByUserName: record.createdByUser?.FriendlyName || '-',
            CreatedAtTimestamp: record?.CreatedAtTimestamp,
            Status:
              record.authUsers?.organisationusers?.[0]?.Status ??
              record.authUsers?.Status,
          };
        }),
    [records]
  );

  const fields: TableFields<GroupMembersTableFields> = {
    Name: {
      id: 'name',
      header: st('name'),
    },
    FirstName: {
      header: st('firstName'),
    },
    LastName: {
      header: st('lastName'),
    },
    FriendlyName: {
      header: st('username'),
    },
    Email: {
      header: st('email'),
    },
    RoleKey: {
      header: st('role'),
    },
    Status: {
      header: st('status'),
    },
    CreatedByUserName: {
      header: st('created_by_user'),
    },
    CreatedAtTimestamp: dateColumnFromConfig({
      header: { header: st('created_on') },
      dateField: 'CreatedAtTimestamp',
    }),
  };

  return useGetTableProps({
    data: labelledFields,
    entityLabel: t('entity_name'),
    fields,
    initialColumns: ['FriendlyName', 'Email', 'CreatedAtTimestamp'],
    preferencesStorageKey: 'GroupMembersSettingsTable-Preferences',
    customAttributeFormIds: [],
  });
};
