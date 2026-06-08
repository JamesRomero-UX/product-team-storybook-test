import { useMutation, useQuery } from '@apollo/client';
import Button from '@risksmart-app/components/src/button';
import type {
  GetUserGroupsQuery,
  GetUsersQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetUserSearchPreferencesDocument,
  UpsertUserSearchPreferencesDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { FC, ReactNode } from 'react';
import { useState } from 'react';

import type {
  HidableOption,
  HidableOptionGroup,
} from '../form/controlled-multiselect/types';
import {
  disableOptionForHidableOption,
  disableOptionsForOptionGroup,
} from './disableUsersUtils';
import type { Filter } from './useGroupAndUserOptions';
import { useGroupAndUserOptions } from './useGroupAndUserOptions';
import UserSearchPreferencesForm from './UserSearchPreferencesForm';

type RenderOptions = {
  onBlur: () => void;
  onChange: (options: readonly HidableOption[]) => void;
  statusType: 'error' | 'loading' | undefined;
  options: (HidableOption | HidableOptionGroup)[];
  userGroups: GetUserGroupsQuery | undefined;
  users: GetUsersQuery | undefined;
  preferencesButton: ReactNode;
  showInheritedContributors: boolean;
};

type Props = {
  disabledValues?: Set<string>;
  includeGroups: boolean;
  userFilter?: Filter<GetUsersQuery['user'][number]>;
  groupFilter?: Filter<GetUserGroupsQuery['user_group'][number]>;
  children: (options: RenderOptions) => ReactNode;
  addEmptyOption?: boolean;
  showInheritedContributorsToggle: boolean;
  disabledOptions?: { userId: string; reason: string }[];
};

const UserSearchPreferences: FC<Props> = ({
  disabledValues,
  userFilter,
  groupFilter,
  includeGroups,
  addEmptyOption,
  children,
  showInheritedContributorsToggle,
  disabledOptions,
}) => {
  const [showPreferences, setShowPreferences] = useState(false);
  const { data: userSearchPreferencesData, refetch } = useQuery(
    GetUserSearchPreferencesDocument
  );
  const [upsetUserSearchPreferences] = useMutation(
    UpsertUserSearchPreferencesDocument
  );
  const userSearchPreferences =
    userSearchPreferencesData?.user_search_preferences?.[0];
  const {
    optionItems,
    statusType,
    addRecentUser,
    commitRecentUsers,
    hasDirectoryDepartments,
    hasJobTitle,
    hasUserLocation,
    userGroups,
    users,
  } = useGroupAndUserOptions({
    addEmptyOption,
    includeGroups,
    userFilter,
    groupFilter,
    disabledValues,
    displayedAttributes: userSearchPreferences,
    hideGroups: !userSearchPreferences?.ShowGroups,
    hideInActiveUsers: userSearchPreferences?.FilterByActivePlatformUsers,
    hideArchivedUsers: !userSearchPreferences?.ShowArchivedUsers,
  });

  const withDisabledOptions = disabledOptions
    ? optionItems.map((option) => {
        if ('value' in option) {
          return disableOptionForHidableOption(option, disabledOptions);
        }
        if ('options' in option) {
          return disableOptionsForOptionGroup(option, disabledOptions);
        }

        return option;
      })
    : optionItems;

  const preferencesButton = (
    <Button
      onClick={() => setShowPreferences(true)}
      iconName={'settings'}
      variant={'icon'}
    />
  );

  return (
    <>
      {children({
        onBlur: commitRecentUsers,
        onChange: (options) => {
          for (const option of options) {
            if ('type' in option && option.type === 'user') {
              addRecentUser(option.value!);
            }
          }
        },
        statusType,
        options: withDisabledOptions,
        userGroups,
        users,
        preferencesButton,
        showInheritedContributors:
          userSearchPreferences?.ShowInheritedContributors ?? false,
      })}
      {showPreferences && (
        <UserSearchPreferencesForm
          values={userSearchPreferences}
          onSave={async (data) => {
            await upsetUserSearchPreferences({ variables: data });
            await refetch();
          }}
          onDismiss={() => setShowPreferences(false)}
          showJobTitleToggle={hasJobTitle}
          showDirectoryDepartmentsToggle={hasDirectoryDepartments}
          showUserLocationToggle={hasUserLocation}
          showInheritedContributorsToggle={showInheritedContributorsToggle}
        />
      )}
    </>
  );
};

export default UserSearchPreferences;
