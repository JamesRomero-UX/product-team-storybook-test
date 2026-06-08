import type { GetActionsQuery } from 'generated/graphql';
import { isEqual } from 'lodash';
import type { UpdateByPkInput } from 'src/repositories/action/action.repository';

export const compare = (
  current: GetActionsQuery['action'][number],
  incoming: UpdateByPkInput
) => {
  return (
    current.ClosedDate !== incoming.ClosedDate ||
    current.DateDue !== incoming.DateDue ||
    current.DateRaised !== incoming.DateRaised ||
    current.Description !== incoming.Description ||
    current.Title !== incoming.Title ||
    current.Priority !== incoming.Priority ||
    !isEqual(
      current.ownerGroups.map((og) => og.UserGroupId),
      incoming.OwnerGroupIds
    ) ||
    !isEqual(
      current.contributorGroups.map((cg) => cg.UserGroupId),
      incoming.ContributorGroupIds
    ) ||
    !isEqual(
      current.owners.map((o) => o.UserId),
      incoming.OwnerIds
    ) ||
    !isEqual(
      current.contributors.map((c) => c.UserId),
      incoming.ContributorIds
    ) ||
    !isEqual(
      current.tags.map((t) => t.TagTypeId),
      incoming.TagTypeIds
    ) ||
    !isEqual(
      current.departments.map((d) => d.DepartmentTypeId),
      incoming.DepartmentTypeIds
    ) ||
    !isEqual(current.CustomAttributeData, incoming.CustomAttributeData)
  );
};
