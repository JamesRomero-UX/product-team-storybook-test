import { Contributor_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import { type HasAccessOptions } from './Permission';

export const hasPermission = ({
  parentObject,
  accessType,
  objectType,
  roleAccess,
  userId,
  canHaveAccessAsContributor,
}: HasAccessOptions) => {
  const userContributions =
    (parentObject?.ancestorContributors ?? [])
      .filter((p) => p.UserId === userId)
      .map((p) => p.ContributorType) ?? [];

  return (
    roleAccess.filter(
      (ra) =>
        (canHaveAccessAsContributor ||
          ra.ContributorType === Contributor_Type_Enum.Any ||
          userContributions.includes(ra.ContributorType)) &&
        ra.AccessType === accessType &&
        ra.ObjectType === objectType
    ).length > 0
  );
};
