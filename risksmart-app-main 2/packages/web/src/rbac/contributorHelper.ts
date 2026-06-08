import type {
  AncestorContributorPartsFragment,
  ContributorGroupPartsFragment,
  ContributorPartsFragment,
  OwnerGroupPartsFragment,
  OwnerPartsFragment,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { Contributor_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { UserOrGroup } from 'src/schemas/global';

import type { LabelledIdArray } from './types';

/*
    Give an array of users and groups, returns a single array with a type
*/
const getUserGroups = (
  users: {
    UserId: string;
  }[],
  groups: {
    UserGroupId: string;
  }[]
): UserOrGroup[] => {
  const mappedUsers: UserOrGroup[] =
    users.map((r) => ({ value: r.UserId, type: 'user' })) ?? [];
  const mappedGroups: UserOrGroup[] =
    groups.map((r) => ({
      value: r.UserGroupId,
      type: 'userGroup',
    })) ?? [];

  return [...mappedUsers, ...mappedGroups];
};

export const getOwners = (
  item:
    | {
        owners: {
          UserId: string;
        }[];
        ownerGroups: {
          UserGroupId: string;
        }[];
      }
    | undefined
) => getUserGroups(item?.owners ?? [], item?.ownerGroups ?? []);

export const getContributors = (
  item:
    | {
        contributors: {
          UserId: string;
        }[];
        contributorGroups: {
          UserGroupId: string;
        }[];
      }
    | undefined
) => getUserGroups(item?.contributors ?? [], item?.contributorGroups ?? []);

export const getAllOwnersCellValue = (item: {
  owners: OwnerPartsFragment[];
  ownerGroups: OwnerGroupPartsFragment[];
}): LabelledIdArray => [
  ...item.owners.map((d) => ({
    label: d.user?.FriendlyName ?? '',
    id: d.UserId,
  })),
  ...item.ownerGroups.map((d) => ({
    label: d.group?.Name ?? '',
    id: d.UserGroupId,
  })),
];

export const getAllContributorsCellValue = (item: {
  contributors: ContributorPartsFragment[];
  contributorGroups: ContributorGroupPartsFragment[];
  ancestorContributors?: AncestorContributorPartsFragment[] | null;
}): LabelledIdArray => {
  const contributors = [
    ...item.contributors.map((d) => ({
      label: d.user?.FriendlyName ?? '',
      id: d.UserId,
    })),
    ...item.contributorGroups.map((d) => ({
      label: d.group?.Name ?? '',
      id: d.UserGroupId,
    })),
    ...(item.ancestorContributors ?? [])
      .filter((a) => a.ContributorType === Contributor_Type_Enum.Contributor)
      .filter((ac) => ac.UserId || ac.UserGroupId)
      .map((d) => ({
        label: d.user?.FriendlyName ?? d.user_group?.Name ?? '',
        id: d.UserId ?? d.UserGroupId ?? '',
      })),
  ];

  const ids = contributors.map((c) => c.id);

  // remove any duplicate contributors from the list
  return contributors.filter(
    (c, i) => ids.findIndex((id) => id === c.id) === i
  );
};
