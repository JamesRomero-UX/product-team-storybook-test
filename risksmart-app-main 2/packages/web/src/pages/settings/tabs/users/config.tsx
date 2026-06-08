import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import type { GetAuthUsersQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BadgeList from 'src/components/badge-list';

import Link from '@/components/link';
import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import type { CollectionData } from '@/utils/collectionUtils';
import { useGetTableProps } from '@/utils/table/hooks/useGetTableProps';
import type { TableFields } from '@/utils/table/types';
import { dateColumnFromConfig } from '@/utils/table/utils/dateColumn';

type AuthUserFields = CollectionData<GetAuthUsersQuery['auth_user'][0]>;

type AuthUserRegisterFields = Omit<AuthUserFields, 'userGroupUsers'> & {
  Name: string;
  UserGroups: string[];
  LastSeen: string;
};

export const useGetUsersTableProps = (
  users: AuthUserFields[],
  onEdit: (user: AuthUserRegisterFields) => void
) => {
  const risksmartUser = useRisksmartUser();
  const { t } = useTranslation(['common'], { keyPrefix: 'userSettings' });
  const { t: st } = useTranslation(['common'], {
    keyPrefix: 'userSettings.columns',
  });

  // Check if the new granular role system (trpc feature) is enabled
  const isMultiRoleEnabled = useIsFeatureFlagEnabled('trpc');

  const fields: TableFields<AuthUserRegisterFields> = {
    Name: {
      id: 'name',
      header: st('displayName'),
      cell: (item) => (
        <Link variant={'secondary'} onFollow={() => onEdit(item)}>
          {item.Name}
        </Link>
      ),
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
      cell: (item) => {
        if (isMultiRoleEnabled && item.customRoles) {
          // When TRPC is enabled, show roles from custom_role table
          const roleNames = item.customRoles.map(
            (userRole) => userRole.role.RoleName
          );

          return roleNames.join(', ');
        }
        if (!isMultiRoleEnabled && item.organisationusers?.length > 0) {
          // When TRPC is not enabled, show role from organisation_users table
          return item.organisationusers[0].RoleKey;
        }

        // Fallback for older data or if no roles are available
        return '';
      },
      exportVal: (item) => {
        if (isMultiRoleEnabled && item.customRoles) {
          const roleNames = item.customRoles.map(
            (userRole) => userRole.role.RoleName
          );

          return roleNames.join(', ');
        }
        if (!isMultiRoleEnabled && item.organisationusers?.length > 0) {
          // When TRPC is not enabled, show role from organisation_users table
          return item.organisationusers[0].RoleKey;
        }

        // Fallback for older data or if no roles are available
        return '';
      },
    },
    Status: {
      header: st('status'),
    },
    UserGroups: {
      header: st('userGroups'),
      cell: (item) => <BadgeList badges={item.UserGroups} />,
      exportVal: (item) => item.UserGroups.join(', '),
    },
    CreatedOn: dateColumnFromConfig({
      header: { header: st('created_on') },
      dateField: 'CreatedOn',
    }),
    LastSeen: dateColumnFromConfig({
      header: { header: st('lastSeen') },
      dateField: 'LastSeen',
    }),
    Id: {
      header: st('userId'),
    },
    JobTitle: {
      header: st('jobTitle'),
    },
    Department: {
      header: st('department'),
    },
    OfficeLocation: {
      header: st('officeLocation'),
    },
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

  const mappedData = useMemo<AuthUserRegisterFields[]>(
    () =>
      users
        .filter(
          (u) => !u.IsCustomerSupport || !!risksmartUser.user?.isCustomerSupport
        )
        .map(
          (user) =>
            ({
              ...user,
              Name: user.FriendlyName,
              UserGroups: user.userGroupUsers.map((u) => u.userGroups.Name),
              RoleKey: user.organisationusers?.[0]?.RoleKey ?? user.RoleKey,
              LastSeen: user.organisationusers?.[0]?.LastSeen ?? user.LastSeen,
              Status: user.organisationusers?.[0]?.Status ?? user.Status,
            }) as AuthUserRegisterFields
        ),
    [risksmartUser.user?.isCustomerSupport, users]
  );

  return useGetTableProps({
    tableId: 'userRegister',
    data: mappedData,
    entityLabel: t('entity_name'),
    fields,
    initialColumns: [
      'Name',
      'Email',
      'Status',
      'RoleKey',
      'LastSeen',
      'UserGroups',
    ],
    preferencesStorageKey: 'AuthUsersRegisterTable-Preferences',
    customAttributeFormIds: [],
  });
};
