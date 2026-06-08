import { useQuery } from '@apollo/client';
import type { SelectProps } from '@risk-smart/themed-cloudscape-components';
import useRisksmartUser from '@risksmart-app/components/src/hooks/useRisksmartUser';
import type {
  GetUserGroupsQuery,
  GetUsersQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetUserGroupsDocument,
  GetUsersDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { User01, Users01 } from '@untitled-ui/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { notEmpty } from 'src/utilityTypes';

import type {
  HidableOption,
  HidableOptionGroup,
} from '../form/controlled-multiselect/types';
import type { StatusType } from '../form/controlled-select/ControlledSelect';
import { sortByLabel } from '../form/form-utils';
import useRecentUsers from './useRecentUsers';

const userToOption = ({
  user,
  displayedAttributes,
  hideInActive,
  isCustomerSupport,
  hideArchivedUsers,
}: {
  user: GetUsersQuery['user'][number];
  displayedAttributes: DisplayedAttributes;
  hideInActive: boolean;
  isCustomerSupport: boolean;
  hideArchivedUsers: boolean;
}): HidableOption & { type: 'user'; label: string; value: string } => {
  const tags: string[] = [];
  if (displayedAttributes.ShowUserEmail) {
    tags.push(user.Email || '-');
  }
  if (displayedAttributes.ShowUserPlatformRole) {
    tags.push(user.RoleKey || '-');
  }
  if (displayedAttributes.ShowDirectoryDepartment) {
    tags.push(user.Department || '-');
  }
  if (displayedAttributes.ShowUserLocation) {
    tags.push(user.OfficeLocation || '-');
  }
  if (displayedAttributes.ShowUserJobTitle) {
    tags.push(user.JobTitle || '-');
  }
  const hideAsCustomerSupport = !!user.IsCustomerSupport && !isCustomerSupport;

  return {
    value: String(user.Id),
    label: String(user.FriendlyName),
    hidden:
      (!user.LastSeen && hideInActive) ||
      (user.Status === 'archived' && hideArchivedUsers) ||
      hideAsCustomerSupport,
    type: 'user',
    tags,
    iconSvg: <User01 viewBox={'0 0 28 28'} width={28} height={28} />,
  };
};

export type Filter<T> = (item: T) => boolean;

type GroupAndUserResponse = {
  optionItems: (HidableOption | SelectProps.OptionGroup)[];
  statusType: 'error' | 'loading' | undefined;
  users: GetUsersQuery | undefined;
  userGroups: GetUserGroupsQuery | undefined;

  hasUserLocation: boolean;
  hasJobTitle: boolean;
  hasDirectoryDepartments: boolean;

  /**
   * Add a user to the top x most recently selected user
   * @param userId
   * @returns
   */
  addRecentUser: (userId: string) => void;
  commitRecentUsers: () => void;
};

type DisplayedAttributes = {
  ShowUserPlatformRole: boolean;
  ShowUserJobTitle: boolean;
  ShowDirectoryDepartment: boolean;
  ShowUserLocation: boolean;
  ShowUserEmail: boolean;
};

type Options = {
  addEmptyOption?: boolean;
  disabledValues?: Set<string>;
  userFilter?: Filter<GetUsersQuery['user'][number]>;
  groupFilter?: Filter<GetUserGroupsQuery['user_group'][number]>;
  includeGroups?: boolean;
  displayedAttributes?: DisplayedAttributes;
  hideGroups?: boolean;
  hideInActiveUsers?: boolean;
  hideArchivedUsers?: boolean;
  disableRecentUsers?: boolean;
};

const defaultDisplayedAttributes: DisplayedAttributes = {
  ShowUserPlatformRole: true,
  ShowUserJobTitle: false,
  ShowDirectoryDepartment: false,
  ShowUserLocation: false,
  ShowUserEmail: true,
};

export const useGroupAndUserOptions = ({
  addEmptyOption,
  disabledValues,
  userFilter,
  groupFilter,
  includeGroups,
  displayedAttributes,
  hideGroups,
  hideInActiveUsers,
  disableRecentUsers,
  hideArchivedUsers,
}: Options = {}): GroupAndUserResponse => {
  const currentUser = useRisksmartUser();
  const { t } = useTranslation(['common']);
  disabledValues = disabledValues ?? new Set<string>();
  addEmptyOption = addEmptyOption ?? false;
  groupFilter = groupFilter ?? ((group) => group.OwnerContributor);
  userFilter = userFilter ?? (() => true);
  displayedAttributes = displayedAttributes ?? defaultDisplayedAttributes;
  const {
    data: users,
    loading: loadingUsers,
    error: usersError,
  } = useQuery(GetUsersDocument);

  const hasAttributeData = useMemo(() => {
    let hasDirectoryDepartments = false;
    let hasJobTitle = false;
    let hasUserLocation = false;
    for (const user of users?.user ?? []) {
      if (user.OfficeLocation) {
        hasUserLocation = true;
      }
      if (user.JobTitle) {
        hasJobTitle = true;
      }
      if (user.Department) {
        hasDirectoryDepartments = true;
      }
    }

    return { hasJobTitle, hasUserLocation, hasDirectoryDepartments };
  }, [users?.user]);

  const {
    data: userGroups,
    loading: loadingUserGroups,
    error: userGroupsError,
  } = useQuery(GetUserGroupsDocument, { skip: !includeGroups });
  const {
    commit: commitRecentUsers,
    add: addRecentUser,
    users: recentlySelectedUsers,
  } = useRecentUsers();

  const isCustomerSupport = !!currentUser.user?.isCustomerSupport;
  const optionItems = useMemo<
    (SelectProps.Option | SelectProps.OptionGroup)[]
  >(() => {
    const archivedUsers =
      users?.user
        ?.filter((u) => u.Status === 'archived')
        .filter((u) =>
          disableRecentUsers ? true : !recentlySelectedUsers.includes(u.Id!)
        )
        .filter(userFilter)
        .map((user) =>
          userToOption({
            user,
            displayedAttributes,
            hideArchivedUsers: !!hideArchivedUsers,
            hideInActive: !!hideInActiveUsers,
            isCustomerSupport,
          })
        )
        .sort(sortByLabel) || [];
    const activeUsers =
      users?.user
        ?.filter((u) => u.Status === 'active')
        .filter((u) =>
          disableRecentUsers ? true : !recentlySelectedUsers.includes(u.Id!)
        )
        .filter(userFilter)
        .map((user) =>
          userToOption({
            user,
            displayedAttributes,
            hideArchivedUsers: !!hideArchivedUsers,
            hideInActive: !!hideInActiveUsers,
            isCustomerSupport,
          })
        )
        .sort(sortByLabel) || [];

    const recentUsers =
      recentlySelectedUsers
        .map((userId) => users?.user?.find((u) => u.Id === userId))
        .filter(notEmpty)
        .filter(userFilter)
        .map((user) =>
          userToOption({
            user,
            displayedAttributes,
            hideArchivedUsers: !!hideArchivedUsers,
            hideInActive: !!hideInActiveUsers,
            isCustomerSupport,
          })
        ) ?? [];

    const filteredUserGroups = userGroups?.user_group.filter(groupFilter);

    const localOptions: (HidableOption | HidableOptionGroup)[] = [];
    if (addEmptyOption) {
      localOptions.push({
        value: '',
        label: '-',
      });
    }

    if (recentUsers.length > 0 && !disableRecentUsers) {
      localOptions.push({
        label: t('recents'),
        options:
          recentUsers.map(({ value, ...rest }) => ({
            ...rest,
            value,
            disabled: disabledValues.has(value),
          })) || [],
      });
    }

    if (activeUsers.length > 0) {
      localOptions.push({
        label: t('users'),
        options:
          activeUsers.map(({ value, ...rest }) => ({
            ...rest,
            value,
            disabled: disabledValues.has(value),
          })) || [],
      });
    }

    if (filteredUserGroups && filteredUserGroups.length > 0 && includeGroups) {
      localOptions.push({
        label: t('groups'),
        hidden: hideGroups,
        options:
          filteredUserGroups.map((group) => ({
            value: group.Id,
            label: `${group.Name}`,
            type: 'userGroup',

            iconSvg: <Users01 viewBox={'0 0 28 28'} width={28} height={28} />,
            disabled: disabledValues.has(group.Id),
            tags: [' ', ' '], // hack to get styling of users and groups to align
            labelTag: `(${group.users_aggregate.aggregate?.count} ${t(
              'person',
              { count: group.users_aggregate.aggregate?.count }
            )})`,
          })) || [],
      });
    }

    if (archivedUsers && archivedUsers.filter((a) => !a.hidden).length > 0) {
      localOptions.push({
        label: t('archived'),
        options: archivedUsers,
      });
    }

    return localOptions;
  }, [
    users?.user,
    userFilter,
    groupFilter,
    recentlySelectedUsers,
    addEmptyOption,
    disableRecentUsers,
    userGroups,
    includeGroups,
    displayedAttributes,
    hideArchivedUsers,
    hideInActiveUsers,
    isCustomerSupport,
    t,
    disabledValues,
    hideGroups,
  ]);

  let statusType: StatusType | undefined = undefined;
  if (loadingUsers || loadingUserGroups) {
    statusType = 'loading';
  } else if (usersError || userGroupsError) {
    statusType = 'error';
  }

  return {
    optionItems,
    statusType,
    users,
    userGroups,
    addRecentUser,
    commitRecentUsers,
    ...hasAttributeData,
  };
};
