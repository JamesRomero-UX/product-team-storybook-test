import type { UserOrGroup } from 'src/schemas/global';

export const ownerAndContributorIds = (data: {
  Owners: UserOrGroup[] | null;
  Contributors: UserOrGroup[] | null;
}) => ({
  ...contributorIds(data),
  ...ownerIds(data),
});

export const ownerIds = (data: { Owners: UserOrGroup[] | null }) => ({
  OwnerUserIds:
    data.Owners?.filter((c) => c.type === 'user').map((c) => c.value) ?? [],
  OwnerGroupIds:
    data.Owners?.filter((c) => c.type === 'userGroup').map((c) => c.value) ??
    [],
});

export const contributorIds = (data: {
  Contributors: UserOrGroup[] | null;
}) => ({
  ContributorUserIds:
    data.Contributors?.filter((c) => c.type === 'user').map((c) => c.value) ??
    [],
  ContributorGroupIds:
    data.Contributors?.filter((c) => c.type === 'userGroup').map(
      (c) => c.value
    ) ?? [],
});

export type Requiredish<T> = {
  [K in keyof Required<T>]: T[K];
};
