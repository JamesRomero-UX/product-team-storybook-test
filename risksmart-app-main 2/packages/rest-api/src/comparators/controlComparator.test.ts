import type { GetControlsQuery } from 'generated/graphql';
import { ControlTypeEnum, TestFrequencyEnum } from 'generated/graphql';
import type { UpdateByPkInput } from 'src/repositories/control/control.repository';
import { buildSchedule } from 'src/testing/test-data/scheduleBuilder';

import { compare } from './controlComparator';

describe('controlComparator', () => {
  const current: GetControlsQuery['control'][number] = {
    Id: '1',
    Description: 'description',
    Title: 'title',
    Type: ControlTypeEnum.Corrective,
    CustomAttributeData: {
      key: 'value',
    },
    ModifiedAtTimestamp: '2021-01-01',
    ownerGroups: [{ UserGroupId: '1' }],
    contributorGroups: [{ UserGroupId: '2' }],
    owners: [{ UserId: '1' }],
    contributors: [{ UserId: '2' }],
    tags: [{ TagTypeId: '1' }],
    departments: [{ DepartmentTypeId: '1' }],
    parents: [],
    schedule: buildSchedule(),
  };

  const incoming: UpdateByPkInput = {
    ...current,
    OriginalTimestamp: '2022-03-01',
    OwnerGroupIds: ['1'],
    ContributorGroupIds: ['2'],
    OwnerIds: ['1'],
    ContributorIds: ['2'],
    TagTypeIds: ['1'],
    DepartmentTypeIds: ['1'],
    Contributors: [{ UserId: '2' }],
    Owners: [{ UserId: '1' }],
    OwnerGroups: [{ UserGroupId: '1' }],
    ContributorGroups: [{ UserGroupId: '2' }],
    schedule: buildSchedule(),
  };

  it('should return false when both objects are the same', () => {
    expect(compare(current, incoming)).toBe(false);
  });

  it('should return true when descriptions are different', () => {
    const data: UpdateByPkInput = {
      ...incoming,
      Description: 'new description',
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when titles are different', () => {
    const data: UpdateByPkInput = {
      ...incoming,
      Title: 'new title',
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when types are different', () => {
    const data: UpdateByPkInput = {
      ...incoming,
      Type: ControlTypeEnum.Preventive,
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when owner group ids are different', () => {
    const data: UpdateByPkInput = {
      ...incoming,
      OwnerGroupIds: ['2'],
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when contributor group ids are different', () => {
    const data: UpdateByPkInput = {
      ...incoming,
      ContributorGroupIds: ['3'],
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when owner ids are different', () => {
    const data: UpdateByPkInput = {
      ...incoming,
      OwnerIds: ['2'],
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when contributor ids are different', () => {
    const data: UpdateByPkInput = {
      ...incoming,
      ContributorIds: ['3'],
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when tag type ids are different', () => {
    const data: UpdateByPkInput = {
      ...incoming,
      TagTypeIds: ['2'],
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when department type ids are different', () => {
    const data: UpdateByPkInput = {
      ...incoming,
      DepartmentTypeIds: ['2'],
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when custom attribute data is different', () => {
    const data: UpdateByPkInput = {
      ...incoming,
      CustomAttributeData: {
        key: 'new value',
      },
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when Frequency data is different', () => {
    const data: UpdateByPkInput = {
      ...incoming,
      schedule: {
        ...incoming.schedule,
        Frequency: TestFrequencyEnum.Monthly,
      },
    };
    expect(compare(current, data)).toBe(true);
  });
});
