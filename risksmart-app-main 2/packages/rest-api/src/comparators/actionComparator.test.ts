import type { GetActionsQuery } from 'generated/graphql';
import { ActionStatusEnum } from 'generated/graphql';
import type { UpdateByPkInput } from 'src/repositories/action/action.repository';

import { compare } from './actionComparator';

describe('actionComparator', () => {
  const current: GetActionsQuery['action'][number] = {
    Id: '1',
    Description: 'description',
    Title: 'title',
    Status: ActionStatusEnum.Open,
    CustomAttributeData: {
      key: 'value',
    },
    ModifiedAtTimestamp: '2000-01-01',
    Priority: 1,
    DateDue: '2022-01-01',
    DateRaised: '2022-02-01',
    ownerGroups: [{ UserGroupId: '1' }],
    contributorGroups: [{ UserGroupId: '2' }],
    owners: [{ UserId: '1' }],
    contributors: [{ UserId: '2' }],
    tags: [{ TagTypeId: '1' }],
    departments: [{ DepartmentTypeId: '1' }],
    parents: [],
  };

  const incoming: UpdateByPkInput = {
    ...current,
    Description: 'description',
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

  it('should return true when priorities are different', () => {
    const data: UpdateByPkInput = {
      ...incoming,
      Priority: 2,
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when due dates are different', () => {
    const data: UpdateByPkInput = {
      ...incoming,
      DateDue: '2022-01-02',
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when raised dates are different', () => {
    const data: UpdateByPkInput = {
      ...incoming,
      DateRaised: '2022-02-02',
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
});
