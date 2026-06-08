import type {
  GetUserGroupsQuery,
  GetUsersQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import _ from 'lodash';
import type { ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { Filter } from 'src/components/user-search-preferences/useGroupAndUserOptions';

import UserSearchPreferences from '../../user-search-preferences/UserSearchPreferences';
import ControlledMultiselect from '../controlled-multiselect';
import type { HidableOption } from '../controlled-multiselect/types';
import type { ControlledBaseProps } from '../types';
import styles from './style.module.scss';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  disabled?: boolean;
  constraintText?: ReactNode;
  testId?: string;
  includeGroups: boolean;
  userFilter?: Filter<GetUsersQuery['user'][number]>;
  groupFilter?: Filter<GetUserGroupsQuery['user_group'][number]>;
  customTokenRender?: (
    options: HidableOption[],
    actions: { removeToken: (value: string) => void },
    users: GetUsersQuery | undefined,
    userGroups: GetUserGroupsQuery | undefined,
    showInheritedContributors: boolean
  ) => ReactNode;
  disabledValues?: Set<string>;
  showInheritedContributorsToggle?: boolean;
  disabledOptions?: { userId: string; reason: string }[];
}

export const ControlledGroupAndUserMultiSelect = <T extends FieldValues>({
  includeGroups,
  userFilter,
  groupFilter,
  disabledValues,
  showInheritedContributorsToggle,
  disabledOptions,
  ...props
}: Props<T>) => {
  return (
    <UserSearchPreferences
      showInheritedContributorsToggle={showInheritedContributorsToggle ?? false}
      includeGroups={includeGroups}
      userFilter={userFilter}
      groupFilter={groupFilter}
      disabledValues={disabledValues}
      disabledOptions={disabledOptions}
    >
      {({
        onBlur,
        onChange,
        statusType,
        options,
        userGroups,
        users,
        preferencesButton,
        showInheritedContributors,
      }) => (
        <ControlledMultiselect
          filteringType={'auto'}
          className={styles.root}
          statusType={statusType}
          hideTokens={true}
          options={options}
          renderTokens={true}
          {...props}
          onChange={onChange}
          customTokenRender={
            props.customTokenRender
              ? (...args) => {
                  return props?.customTokenRender?.(
                    ...args,
                    users,
                    userGroups,
                    showInheritedContributors
                  );
                }
              : undefined
          }
          onBlur={onBlur}
          sideControl={preferencesButton}
          previewChangesFormatter={(
            val: [{ UserId?: string; value?: string }] | null | undefined
          ) => {
            if (Array.isArray(val)) {
              return val
                .map((v) => v.UserId ?? v.value)
                .map(
                  (v) =>
                    users?.user.find((u) => u.Id === v)?.FriendlyName ??
                    userGroups?.user_group.find((ug) => ug.Id === v)?.Name
                )
                .join(', ');
            }

            return '-';
          }}
          hasFieldChanged={(
            val:
              | {
                  from: { UserId?: string; value?: string }[];
                  to: { UserId?: string; value?: string }[];
                }
              | null
              | undefined
          ) => {
            if (val === undefined || val === null) {
              return false;
            }
            const from = val.from?.map((v) => v.UserId ?? v.value).sort();
            const to = val.to?.map((v) => v.UserId ?? v.value).sort();

            return !_.isEqual(from, to);
          }}
        />
      )}
    </UserSearchPreferences>
  );
};
