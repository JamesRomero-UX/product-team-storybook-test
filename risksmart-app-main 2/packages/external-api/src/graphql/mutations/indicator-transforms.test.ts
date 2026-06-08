import { IndicatorType } from '@risksmart-app/domain/src/types/consts/indicator-type';
import { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import { describe, expect, it } from 'vitest';

import type {
  CreateIndicatorRequest,
  UpdateIndicatorRequest,
} from '../../schemas/indicators/indicator-mutate-request.schema';
import {
  toGraphqlCreateIndicatorInput,
  toGraphqlUpdateIndicatorInput,
} from './indicator-transforms';

const baseNumberCreateRequest: CreateIndicatorRequest = {
  title: 'Test Indicator',
  description: 'A test indicator',
  type: IndicatorType.Number,
  parentId: 'parent-uuid-123',
  owners: ['provider|user-1'],
  unit: 'kg',
  upperTolerance: 100,
  lowerTolerance: 10,
  upperAppetite: 90,
  lowerAppetite: 20,
  schedule: {
    frequency: TestFrequency.Daily,
    manualDueDate: '2024-01-01T00:00:00Z',
    startDate: '2024-06-01T00:00:00Z',
    timeToCompleteValue: 3,
    timeToCompleteUnit: UnitOfTime.Day,
  },
};

const baseTextCreateRequest: CreateIndicatorRequest = {
  title: 'Text Indicator',
  description: 'A text indicator',
  type: IndicatorType.Text,
  parentId: 'parent-uuid-456',
  owners: ['provider|user-1'],
  targetValue: 'target-value-text',
  schedule: {
    frequency: TestFrequency.Weekly,
  },
};

describe('toGraphqlCreateIndicatorInput', () => {
  it('should map a number type indicator with all fields', () => {
    const result = toGraphqlCreateIndicatorInput(baseNumberCreateRequest);

    expect(result).toEqual({
      Title: 'Test Indicator',
      Description: 'A test indicator',
      Type: IndicatorType.Number,
      Unit: 'kg',
      TargetValueTxt: null,
      UpperToleranceNum: 100,
      LowerToleranceNum: 10,
      UpperAppetiteNum: 90,
      LowerAppetiteNum: 20,
      ParentId: 'parent-uuid-123',
      OwnerUserIds: ['provider|user-1'],
      OwnerGroupIds: [],
      ContributorUserIds: [],
      ContributorGroupIds: [],
      TagTypeIds: [],
      DepartmentTypeIds: [],
      CustomAttributeData: null,
      schedule: {
        Frequency: 'daily',
        ManualDueDate: '2024-01-01T00:00:00Z',
        StartDate: '2024-06-01T00:00:00Z',
        TimeToCompleteValue: 3,
        TimeToCompleteUnit: 'day',
      },
    });
  });

  it('should map a text type indicator with targetValue', () => {
    const result = toGraphqlCreateIndicatorInput(baseTextCreateRequest);

    expect(result.TargetValueTxt).toBe('target-value-text');
    expect(result.Unit).toBeNull();
    expect(result.UpperToleranceNum).toBeNull();
    expect(result.LowerToleranceNum).toBeNull();
    expect(result.UpperAppetiteNum).toBeNull();
    expect(result.LowerAppetiteNum).toBeNull();
  });

  it('should include ParentId from input', () => {
    const result = toGraphqlCreateIndicatorInput(baseNumberCreateRequest);

    expect(result.ParentId).toBe('parent-uuid-123');
  });

  it('should set description to null when undefined', () => {
    const noDescRequest: CreateIndicatorRequest = {
      ...baseNumberCreateRequest,
      description: undefined,
    };

    const result = toGraphqlCreateIndicatorInput(noDescRequest);

    expect(result.Description).toBeNull();
  });

  it('should include schedule and ownership fields', () => {
    const result = toGraphqlCreateIndicatorInput(baseNumberCreateRequest);

    expect(result.schedule).toEqual({
      Frequency: 'daily',
      ManualDueDate: '2024-01-01T00:00:00Z',
      StartDate: '2024-06-01T00:00:00Z',
      TimeToCompleteValue: 3,
      TimeToCompleteUnit: 'day',
    });
    expect(result.OwnerUserIds).toEqual(['provider|user-1']);
    expect(result.OwnerGroupIds).toEqual([]);
  });
});

describe('toGraphqlUpdateIndicatorInput', () => {
  const baseNumberUpdateRequest: UpdateIndicatorRequest = {
    title: 'Updated Indicator',
    description: 'Updated description',
    owners: ['provider|user-2'],
    unit: 'lbs',
    upperTolerance: 200,
    lowerTolerance: 20,
    upperAppetite: 180,
    lowerAppetite: 40,
    schedule: {
      frequency: TestFrequency.Annually,
    },
  };

  it('should NOT include ParentId', () => {
    const result = toGraphqlUpdateIndicatorInput({
      ...baseNumberUpdateRequest,
      type: IndicatorType.Number,
    });

    expect(result).not.toHaveProperty('ParentId');
  });

  it('should map all base fields correctly for number type', () => {
    const result = toGraphqlUpdateIndicatorInput({
      ...baseNumberUpdateRequest,
      type: IndicatorType.Number,
    });

    expect(result.Title).toBe('Updated Indicator');
    expect(result.Description).toBe('Updated description');
    expect(result.Type).toBe(IndicatorType.Number);
    expect(result.Unit).toBe('lbs');
    expect(result.UpperToleranceNum).toBe(200);
    expect(result.LowerToleranceNum).toBe(20);
    expect(result.UpperAppetiteNum).toBe(180);
    expect(result.LowerAppetiteNum).toBe(40);
  });

  it('should map text type correctly', () => {
    const textUpdateRequest: UpdateIndicatorRequest = {
      title: 'Updated Text',
      owners: ['provider|user-1'],
      targetValue: 'new-target',
    };

    const result = toGraphqlUpdateIndicatorInput({
      ...textUpdateRequest,
      type: IndicatorType.Text,
    });

    expect(result.TargetValueTxt).toBe('new-target');
    expect(result.Unit).toBeNull();
    expect(result.UpperToleranceNum).toBeNull();
    expect(result.LowerToleranceNum).toBeNull();
    expect(result.UpperAppetiteNum).toBeNull();
    expect(result.LowerAppetiteNum).toBeNull();
  });

  it('should include schedule and ownership fields', () => {
    const result = toGraphqlUpdateIndicatorInput({
      ...baseNumberUpdateRequest,
      type: IndicatorType.Number,
    });

    expect(result.schedule).toEqual({
      Frequency: 'annually',
      ManualDueDate: null,
      StartDate: null,
      TimeToCompleteValue: null,
      TimeToCompleteUnit: null,
    });
    expect(result.OwnerUserIds).toEqual(['provider|user-2']);
    expect(result.OwnerGroupIds).toEqual([]);
  });

  it('should preserve existing ownership arrays when existingOwnership is provided', () => {
    const result = toGraphqlUpdateIndicatorInput(
      { ...baseNumberUpdateRequest, type: IndicatorType.Number },
      {
        ownerGroupIds: ['group-1'],
        contributorUserIds: ['contrib-1'],
        contributorGroupIds: ['cgroup-1'],
        tagTypeIds: ['tag-1'],
        departmentTypeIds: ['dept-1'],
      }
    );

    expect(result.OwnerGroupIds).toEqual(['group-1']);
    expect(result.ContributorUserIds).toEqual(['contrib-1']);
    expect(result.ContributorGroupIds).toEqual(['cgroup-1']);
    expect(result.TagTypeIds).toEqual(['tag-1']);
    expect(result.DepartmentTypeIds).toEqual(['dept-1']);
  });
});
