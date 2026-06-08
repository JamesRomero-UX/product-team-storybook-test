import type { GetRisksQuery } from 'generated/graphql';
import {
  RiskStatusTypeEnum,
  RiskTreatmentTypeEnum,
  TestFrequencyEnum,
} from 'generated/graphql';
import type { UpdateInput } from 'src/repositories/risk/risk.repository';
import { buildSchedule } from 'src/testing/test-data/scheduleBuilder';

import { compare } from './riskComparator';

const current: GetRisksQuery['risk'][number] = {
  Id: '1',
  Description: 'description',
  Title: 'title',
  ParentRiskId: '2',
  Status: RiskStatusTypeEnum.Active,
  Tier: 2,
  Treatment: RiskTreatmentTypeEnum.Terminate,
  CustomAttributeData: {
    key: 'value',
  },
  ownerGroups: [{ UserGroupId: '1' }],
  contributorGroups: [{ UserGroupId: '2' }],
  owners: [{ UserId: '1' }],
  contributors: [{ UserId: '2' }],
  tags: [{ TagTypeId: '1' }],
  departments: [{ DepartmentTypeId: '1' }],
  schedule: buildSchedule(),
};

const toCompare: UpdateInput = {
  ...current,
  Description: 'description',
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

describe('riskComparator', () => {
  it('should return false when both objects are the same', () => {
    expect(compare(current, toCompare)).toBe(false);
  });

  it('should return true when descriptions are different', () => {
    const data: UpdateInput = {
      ...toCompare,
      Description: 'new description',
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when titles are different', () => {
    const data: UpdateInput = {
      ...toCompare,
      Title: 'new title',
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when parent risk ids are different', () => {
    const data: UpdateInput = {
      ...toCompare,
      ParentRiskId: '3',
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when statuses are different', () => {
    const data: UpdateInput = {
      ...toCompare,
      Status: RiskStatusTypeEnum.Emerging,
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when tiers are different', () => {
    const data: UpdateInput = {
      ...toCompare,
      Tier: 3,
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when treatments are different', () => {
    const data: UpdateInput = {
      ...toCompare,
      Treatment: RiskTreatmentTypeEnum.Transfer,
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when owner group ids are different', () => {
    const data: UpdateInput = {
      ...toCompare,
      OwnerGroupIds: ['2'],
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when contributor group ids are different', () => {
    const data: UpdateInput = {
      ...toCompare,
      ContributorGroupIds: ['3'],
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when owner ids are different', () => {
    const data: UpdateInput = {
      ...toCompare,
      OwnerIds: ['2'],
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when contributor ids are different', () => {
    const data: UpdateInput = {
      ...toCompare,
      ContributorIds: ['3'],
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when tag type ids are different', () => {
    const data: UpdateInput = {
      ...toCompare,
      TagTypeIds: ['2'],
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when department type ids are different', () => {
    const data: UpdateInput = {
      ...toCompare,
      DepartmentTypeIds: ['2'],
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when custom attribute data is different', () => {
    const data: UpdateInput = {
      ...toCompare,
      CustomAttributeData: {
        key: 'value 2',
      },
    };
    expect(compare(current, data)).toBe(true);
  });

  it('should return true when Frequency data is different', () => {
    const data: UpdateInput = {
      ...toCompare,
      schedule: {
        ...toCompare.schedule,
        Frequency: TestFrequencyEnum.Monthly,
      },
    };
    expect(compare(current, data)).toBe(true);
  });
});
