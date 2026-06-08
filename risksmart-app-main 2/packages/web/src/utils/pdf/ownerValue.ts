import type {
  OwnerGroupPartsFragment,
  OwnerPartsFragment,
} from '@risksmart-app/web-graphql-client/generated/graphql';

export const getOwnerValue = (item: {
  owners: OwnerPartsFragment[];
  ownerGroups: OwnerGroupPartsFragment[];
}) =>
  item.owners.length || item.ownerGroups.length
    ? item.owners
        .map((o) => o.user?.FriendlyName)
        .concat(item.ownerGroups.map((o) => o.group?.Name))
        .join(', ')
    : '-';
