import type { GetCustomRolesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { settingsEditCustomRoleUrl } from 'src/utils/urls';

import Link from '@/components/link';
import type { CollectionData } from '@/utils/collectionUtils';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

type CustomRoleFields = CollectionData<GetCustomRolesQuery['custom_role'][0]>;

type CustomRoleRegisterFields = CustomRoleFields & {
  MemberCount: number;
};

export const useGetCustomRolesTableProps = (roles: CustomRoleFields[]) => {
  const { t } = useTranslation(['common'], { keyPrefix: 'customRoles' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'customRoles.columns',
  });

  const fields: TableFields<CustomRoleRegisterFields> = {
    RoleName: {
      id: 'roleName',
      header: st('roleName'),
      cell: (item) => (
        <Link variant={'secondary'} href={settingsEditCustomRoleUrl(item.Id)}>
          {item.RoleName}
        </Link>
      ),
    },
    Description: {
      header: st('description'),
    },
    MemberCount: {
      header: st('memberCount'),
    },
    CreatedAtTimestamp: dateColumnFromConfig({
      header: { header: st('createdAtTimestamp') },
      dateField: 'CreatedAtTimestamp',
    }),
    CreatedByUser: {
      header: st('createdByUser'),
    },
    ModifiedByUser: {
      header: st('modifiedByUser'),
    },
    ModifiedAtTimestamp: dateColumnFromConfig({
      header: { header: st('modifiedAtTimestamp') },
      dateField: 'ModifiedAtTimestamp',
    }),
  };

  const mappedData = useMemo<CustomRoleRegisterFields[]>(
    () =>
      roles.map(
        (role) =>
          ({
            ...role,
            MemberCount: role.customRoleUsers_aggregate?.aggregate?.count ?? 0,
          }) as CustomRoleRegisterFields
      ),
    [roles]
  );

  return useGetTableProps({
    tableId: 'customRolesRegister',
    data: mappedData,
    entityLabel: t('entity_name'),
    fields,
    initialColumns: ['RoleName', 'Description', 'MemberCount'],
    preferencesStorageKey: 'CustomRolesRegisterTable-Preferences',
    customAttributeFormIds: [],
  });
};
