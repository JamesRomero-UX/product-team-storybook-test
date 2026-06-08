import type { GetControlsQuery } from 'generated/graphql';
import { isEqual } from 'lodash';
import type { UpdateByPkInput } from 'src/repositories/control/control.repository';

import { isEqual as isScheduleEqual } from './scheduleComparator';
import { arePropsEqual, areUnorderedArraysEqual } from './utils';

export const compare = (
  current: GetControlsQuery['control'][number],
  incoming: UpdateByPkInput
) => {
  return (
    !arePropsEqual(current, incoming, ['Title', 'Description', 'Type']) ||
    !areUnorderedArraysEqual(
      current.ownerGroups.map((og) => og.UserGroupId),
      incoming.OwnerGroupIds
    ) ||
    !areUnorderedArraysEqual(
      current.ownerGroups.map((og) => og.UserGroupId),
      incoming.OwnerGroupIds
    ) ||
    !areUnorderedArraysEqual(
      current.contributorGroups.map((cg) => cg.UserGroupId),
      incoming.ContributorGroupIds
    ) ||
    !areUnorderedArraysEqual(
      current.owners.map((o) => o.UserId),
      incoming.OwnerIds
    ) ||
    !areUnorderedArraysEqual(
      current.contributors.map((c) => c.UserId),
      incoming.ContributorIds
    ) ||
    !areUnorderedArraysEqual(
      current.tags.map((t) => t.TagTypeId),
      incoming.TagTypeIds
    ) ||
    !areUnorderedArraysEqual(
      current.departments.map((d) => d.DepartmentTypeId),
      incoming.DepartmentTypeIds
    ) ||
    !isEqual(current.CustomAttributeData, incoming.CustomAttributeData) ||
    !isScheduleEqual(current.schedule, incoming.schedule)
  );
};
