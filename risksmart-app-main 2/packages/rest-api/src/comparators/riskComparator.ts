import type { GetRisksQuery } from 'generated/graphql';
import type { UpdateInput } from 'src/repositories/risk/risk.repository';

import { isEqual as isScheduleEqual } from './scheduleComparator';
import { arePropsEqual, areUnorderedArraysEqual } from './utils';

export const compare = (
  current: GetRisksQuery['risk'][number],
  data: UpdateInput
) =>
  !arePropsEqual(current, data, [
    'Title',
    'Description',
    'ParentRiskId',
    'Status',
    'Tier',
    'Treatment',
  ]) ||
  !areUnorderedArraysEqual(
    current.ownerGroups.map((og) => og.UserGroupId),
    data.OwnerGroupIds
  ) ||
  !areUnorderedArraysEqual(
    current.contributorGroups.map((cg) => cg.UserGroupId),
    data.ContributorGroupIds
  ) ||
  !areUnorderedArraysEqual(
    current.owners.map((o) => o.UserId),
    data.OwnerIds
  ) ||
  !areUnorderedArraysEqual(
    current.contributors.map((c) => c.UserId),
    data.ContributorIds
  ) ||
  !areUnorderedArraysEqual(
    current.tags.map((t) => t.TagTypeId),
    data.TagTypeIds
  ) ||
  !areUnorderedArraysEqual(
    current.departments.map((d) => d.DepartmentTypeId),
    data.DepartmentTypeIds
  ) ||
  !areUnorderedArraysEqual(
    current.CustomAttributeData,
    data.CustomAttributeData
  ) ||
  !isScheduleEqual(current.schedule, data.schedule);
