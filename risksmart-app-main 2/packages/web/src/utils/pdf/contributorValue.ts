import type {
  ContributorGroupPartsFragment,
  ContributorPartsFragment,
} from '@risksmart-app/web-graphql-client/generated/graphql';

export const getContributorValue = (item: {
  contributors: ContributorPartsFragment[];
  contributorGroups: ContributorGroupPartsFragment[];
}) =>
  item.contributors.length || item.contributorGroups.length
    ? item.contributors
        .map((o) => o.user?.FriendlyName)
        .concat(item.contributorGroups.map((o) => o.group?.Name))
        .join(', ')
    : '-';
