import { describe, expect, it } from 'vitest';

import {
  defaultGraphqlOwnershipFields,
  toGraphqlScheduleInput,
} from './shared-transforms';

const fullSchedule = {
  frequency: 'daily',
  manualDueDate: '2024-01-01T00:00:00Z',
  startDate: '2024-06-01T00:00:00Z',
  timeToCompleteValue: 5,
  timeToCompleteUnit: 'day',
};

const allNullScheduleOutput = {
  Frequency: null,
  ManualDueDate: null,
  StartDate: null,
  TimeToCompleteValue: null,
  TimeToCompleteUnit: null,
};

describe('toGraphqlScheduleInput', () => {
  it('should map all schedule fields to PascalCase GraphQL keys', () => {
    const result = toGraphqlScheduleInput(fullSchedule);

    expect(result).toEqual({
      Frequency: 'daily',
      ManualDueDate: '2024-01-01T00:00:00Z',
      StartDate: '2024-06-01T00:00:00Z',
      TimeToCompleteValue: 5,
      TimeToCompleteUnit: 'day',
    });
  });

  it('should return all null fields when schedule is undefined', () => {
    expect(toGraphqlScheduleInput(undefined)).toEqual(allNullScheduleOutput);
  });

  it('should return all null fields when all values are explicitly null', () => {
    const result = toGraphqlScheduleInput({
      frequency: null,
      manualDueDate: null,
      startDate: null,
      timeToCompleteValue: null,
      timeToCompleteUnit: null,
    });

    expect(result).toEqual(allNullScheduleOutput);
  });

  it('should map provided fields and null the rest for a partial schedule', () => {
    const result = toGraphqlScheduleInput({ frequency: 'weekly' });

    expect(result).toEqual({
      Frequency: 'weekly',
      ManualDueDate: null,
      StartDate: null,
      TimeToCompleteValue: null,
      TimeToCompleteUnit: null,
    });
  });

  it('should handle an empty object with no fields set', () => {
    expect(toGraphqlScheduleInput({})).toEqual(allNullScheduleOutput);
  });
});

describe('defaultGraphqlOwnershipFields', () => {
  it('should pass owners through as OwnerUserIds and set all others to empty arrays', () => {
    const result = defaultGraphqlOwnershipFields(['user-1', 'user-2']);

    expect(result).toEqual({
      OwnerUserIds: ['user-1', 'user-2'],
      OwnerGroupIds: [],
      ContributorUserIds: [],
      ContributorGroupIds: [],
      TagTypeIds: [],
      DepartmentTypeIds: [],
    });
  });

  it('should return empty OwnerUserIds when given an empty array', () => {
    const result = defaultGraphqlOwnershipFields([]);

    expect(result.OwnerUserIds).toEqual([]);
    expect(result.OwnerGroupIds).toEqual([]);
  });

  it('should handle multiple provider-format owners', () => {
    const owners = ['provider|a', 'provider|b', 'provider|c'];
    const result = defaultGraphqlOwnershipFields(owners);

    expect(result.OwnerUserIds).toEqual(owners);
  });

  it('should preserve all existing ownership arrays when existing data is provided', () => {
    const result = defaultGraphqlOwnershipFields(['user-1'], {
      ownerGroupIds: ['group-1', 'group-2'],
      contributorUserIds: ['contrib-1'],
      contributorGroupIds: ['cgroup-1'],
      tagTypeIds: ['tag-1', 'tag-2'],
      departmentTypeIds: ['dept-1'],
    });

    expect(result).toEqual({
      OwnerUserIds: ['user-1'],
      OwnerGroupIds: ['group-1', 'group-2'],
      ContributorUserIds: ['contrib-1'],
      ContributorGroupIds: ['cgroup-1'],
      TagTypeIds: ['tag-1', 'tag-2'],
      DepartmentTypeIds: ['dept-1'],
    });
  });

  it('should use empty arrays when existing arrays are empty', () => {
    const result = defaultGraphqlOwnershipFields(['user-1'], {
      ownerGroupIds: [],
      contributorUserIds: [],
      contributorGroupIds: [],
      tagTypeIds: [],
      departmentTypeIds: [],
    });

    expect(result.OwnerGroupIds).toEqual([]);
    expect(result.ContributorUserIds).toEqual([]);
    expect(result.ContributorGroupIds).toEqual([]);
    expect(result.TagTypeIds).toEqual([]);
    expect(result.DepartmentTypeIds).toEqual([]);
  });

  it('should default to empty arrays when existing param is undefined', () => {
    const result = defaultGraphqlOwnershipFields(['user-1'], undefined);

    expect(result.OwnerGroupIds).toEqual([]);
    expect(result.ContributorUserIds).toEqual([]);
    expect(result.ContributorGroupIds).toEqual([]);
    expect(result.TagTypeIds).toEqual([]);
    expect(result.DepartmentTypeIds).toEqual([]);
  });
});
