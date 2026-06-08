import type { MultiselectProps } from '@risk-smart/themed-cloudscape-components/multiselect';
import type {
  GetUserGroupsQuery,
  GetUsersQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { UserUp01 } from '@untitled-ui/icons-react';
import _ from 'lodash';
import type { FC } from 'react';
import Tokens from 'src/components/tokens';
import type { Token } from 'src/components/tokens/Tokens';

export type Props = {
  tokenOptions: MultiselectProps.Option[];
  inheritedContributorLookup: Set<string>;
  users: GetUsersQuery | undefined;
  userGroups: GetUserGroupsQuery | undefined;
  disabled: boolean;
  onRemoveToken: (value: string) => void;
  showInheritedContributors: boolean;
  disabledUsers?: { userId: string; reason: string }[];
};

export const ContributorTokens: FC<Props> = ({
  tokenOptions,
  inheritedContributorLookup,
  users,
  userGroups,
  disabled,
  onRemoveToken,
  showInheritedContributors,
  disabledUsers,
}) => {
  const directTokens: Token[] = _.sortBy(
    tokenOptions
      // Removed inherited contributors as rendered below
      .map((o) => ({
        value: o.value!,
        label: o.label!,
        disabled: false,
      })),
    'label'
  );

  const directLookup = new Set<string>(
    directTokens.map((directToken) => directToken.value)
  );

  const inheritedTokens: Token[] = showInheritedContributors
    ? _.sortBy(
        Array.from(inheritedContributorLookup)
          .filter((value) => !directLookup.has(value))
          .map((value) => ({
            value,
            label:
              users?.user.find((o) => o.Id === value)?.FriendlyName ??
              userGroups?.user_group.find((o) => o.Id === value)?.Name ??
              value,
            disabled: true,
            icon: <UserUp01 viewBox={'0 0 24 24'} className={'w-6 h-6'} />,
          })),
        'label'
      )
    : [];

  const currentAndInheritedContributors = directTokens.concat(inheritedTokens);

  const withDisabledUsers = currentAndInheritedContributors.map((token) => {
    const disabledUser = disabledUsers?.find((disabledUser) => {
      return disabledUser.userId === token.value;
    });

    return disabledUser
      ? {
          ...token,
          disabled: true,
          reason: disabledUser.reason,
        }
      : token;
  });

  return (
    <Tokens
      limit={4}
      disabled={disabled}
      onRemove={onRemoveToken}
      tokens={withDisabledUsers}
    />
  );
};
