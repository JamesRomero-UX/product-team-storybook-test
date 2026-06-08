import { RiskStatusType } from '@risksmart-app/domain/src/types/consts/risk-status-type';
import { RiskTreatmentType } from '@risksmart-app/domain/src/types/consts/risk-treatment-type';
import { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import { describe, expect, it } from 'vitest';

import type { CreateRiskMutationData } from '../../clients/mutation-client.interface';
import { toGraphqlRiskInput } from './risk-transforms';

const baseTier1Request: CreateRiskMutationData = {
  title: 'Test Risk',
  description: 'A description',
  tier: 1,
  treatment: RiskTreatmentType.Treat,
  status: RiskStatusType.Active,
  owners: ['provider|user-1'],
  schedule: {
    frequency: TestFrequency.Daily,
    manualDueDate: '2024-01-01T00:00:00Z',
    startDate: '2024-06-01T00:00:00Z',
    timeToCompleteValue: 5,
    timeToCompleteUnit: UnitOfTime.Day,
  },
};

describe('toGraphqlRiskInput', () => {
  it('should map a tier 1 request with all fields', () => {
    const result = toGraphqlRiskInput(baseTier1Request);

    expect(result).toEqual({
      Title: 'Test Risk',
      Description: 'A description',
      Tier: 1,
      ParentRiskId: null,
      Treatment: RiskTreatmentType.Treat,
      Status: RiskStatusType.Active,
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
        TimeToCompleteValue: 5,
        TimeToCompleteUnit: 'day',
      },
    });
  });

  it('should set ParentRiskId for tier 2 risks', () => {
    const tier2Request: CreateRiskMutationData = {
      ...baseTier1Request,
      tier: 2,
      parentRiskId: 'parent-risk-uuid',
    };

    const result = toGraphqlRiskInput(tier2Request);

    expect(result.ParentRiskId).toBe('parent-risk-uuid');
    expect(result.Tier).toBe(2);
  });

  it('should set ParentRiskId for tier 3 risks', () => {
    const tier3Request: CreateRiskMutationData = {
      ...baseTier1Request,
      tier: 3,
      parentRiskId: 'parent-risk-uuid',
    };

    const result = toGraphqlRiskInput(tier3Request);

    expect(result.ParentRiskId).toBe('parent-risk-uuid');
    expect(result.Tier).toBe(3);
  });

  it('should set ParentRiskId to null for tier 1 without parentRiskId', () => {
    const result = toGraphqlRiskInput(baseTier1Request);

    expect(result.ParentRiskId).toBeNull();
  });

  it('should coalesce description to null and leave treatment/status as undefined when not provided', () => {
    const minimalRequest: CreateRiskMutationData = {
      title: 'Minimal Risk',
      tier: 1,
      owners: ['provider|user-1'],
    };

    const result = toGraphqlRiskInput(minimalRequest);

    expect(result.Description).toBeNull();
    // Treatment and Status use `as` casts without `?? null`, so undefined
    // values pass through as undefined (both are valid InputMaybe fields)
    expect(result.Treatment).toBeUndefined();
    expect(result.Status).toBeUndefined();
  });

  it('should map a full schedule', () => {
    const result = toGraphqlRiskInput(baseTier1Request);

    expect(result.schedule).toEqual({
      Frequency: 'daily',
      ManualDueDate: '2024-01-01T00:00:00Z',
      StartDate: '2024-06-01T00:00:00Z',
      TimeToCompleteValue: 5,
      TimeToCompleteUnit: 'day',
    });
  });

  it('should map all null schedule fields when schedule is undefined', () => {
    const noScheduleRequest: CreateRiskMutationData = {
      title: 'No Schedule Risk',
      tier: 1,
      owners: ['provider|user-1'],
    };

    const result = toGraphqlRiskInput(noScheduleRequest);

    expect(result.schedule).toEqual({
      Frequency: null,
      ManualDueDate: null,
      StartDate: null,
      TimeToCompleteValue: null,
      TimeToCompleteUnit: null,
    });
  });

  it('should handle partial schedule', () => {
    const partialScheduleRequest: CreateRiskMutationData = {
      ...baseTier1Request,
      schedule: {
        frequency: TestFrequency.Weekly,
      },
    };

    const result = toGraphqlRiskInput(partialScheduleRequest);

    expect(result.schedule).toEqual({
      Frequency: 'weekly',
      ManualDueDate: null,
      StartDate: null,
      TimeToCompleteValue: null,
      TimeToCompleteUnit: null,
    });
  });

  it('should delegate ownership fields correctly', () => {
    const multiOwnerRequest: CreateRiskMutationData = {
      ...baseTier1Request,
      owners: ['provider|user-1', 'provider|user-2'],
    };

    const result = toGraphqlRiskInput(multiOwnerRequest);

    expect(result.OwnerUserIds).toEqual(['provider|user-1', 'provider|user-2']);
    expect(result.OwnerGroupIds).toEqual([]);
    expect(result.ContributorUserIds).toEqual([]);
    expect(result.ContributorGroupIds).toEqual([]);
    expect(result.TagTypeIds).toEqual([]);
    expect(result.DepartmentTypeIds).toEqual([]);
  });

  it('should preserve existing ownership arrays when existingOwnership is provided', () => {
    const result = toGraphqlRiskInput(baseTier1Request, {
      ownerGroupIds: ['group-1'],
      contributorUserIds: ['contrib-1'],
      contributorGroupIds: ['cgroup-1'],
      tagTypeIds: ['tag-1'],
      departmentTypeIds: ['dept-1'],
    });

    expect(result.OwnerGroupIds).toEqual(['group-1']);
    expect(result.ContributorUserIds).toEqual(['contrib-1']);
    expect(result.ContributorGroupIds).toEqual(['cgroup-1']);
    expect(result.TagTypeIds).toEqual(['tag-1']);
    expect(result.DepartmentTypeIds).toEqual(['dept-1']);
  });
});
