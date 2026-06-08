import type {
  AncestorContributorPartsFragment,
  Contributor_Type_Enum,
  GetUserGroupsQuery,
  GetUsersQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import type { ReactNode } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import type { Filter } from 'src/components/user-search-preferences/useGroupAndUserOptions';

import ControlledGroupAndUserMultiSelect from '../controlled-group-and-user-multi-select';
import type { ControlledBaseProps } from '../types';
import { ContributorTokens } from './ContributorTokens';

interface Props<T extends FieldValues> extends ControlledBaseProps<T> {
  disabled?: boolean;
  constraintText?: ReactNode;
  inheritedContributorsName: FieldPath<T>;
  includeGroups: boolean;
  testId: string;
  contributorType: Contributor_Type_Enum;
  disabledOptions?: { userId: string; reason: string }[];
  userFilter?: Filter<GetUsersQuery['user'][number]>;
  groupFilter?: Filter<GetUserGroupsQuery['user_group'][number]>;
}

const createContributorLookup = (
  ancestorsContributors: AncestorContributorPartsFragment[]
): Set<string> => {
  const items: Set<string> = new Set<string>();
  ancestorsContributors.forEach((dataItem) => {
    if (dataItem.UserGroupId) {
      items.add(dataItem.UserGroupId);
    } else {
      items.add(dataItem.UserId!);
    }
  });

  return items;
};

export const ControlledGroupAndUserContributorMultiSelect = <
  T extends FieldValues,
>({
  ...props
}: Props<T>) => {
  const { disabled, inheritedContributorsName } = props;

  const { watch } = useFormContext<T>();
  const inheritedContributors = watch(
    inheritedContributorsName
  ) as AncestorContributorPartsFragment[];

  const ancestorsContributors =
    inheritedContributors?.filter(
      (ic) =>
        ic.ContributorType === props.contributorType && ic.AncestorId !== ic.Id
    ) || [];

  const inheritedContributorLookup = createContributorLookup(
    ancestorsContributors
  );

  return (
    <ControlledGroupAndUserMultiSelect
      {...props}
      showInheritedContributorsToggle={true}
      customTokenRender={(
        tokenOptions,
        actions,
        users,
        userGroups,
        showInheritedContributors
      ) => {
        return (
          <ContributorTokens
            showInheritedContributors={showInheritedContributors}
            disabled={!!disabled}
            onRemoveToken={actions.removeToken}
            tokenOptions={tokenOptions}
            inheritedContributorLookup={inheritedContributorLookup}
            users={users}
            userGroups={userGroups}
            disabledUsers={props.disabledOptions}
          />
        );
      }}
    />
  );
};
