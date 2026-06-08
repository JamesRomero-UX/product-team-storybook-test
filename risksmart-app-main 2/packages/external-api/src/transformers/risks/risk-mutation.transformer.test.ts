import { RiskStatusType } from '@risksmart-app/domain/src/types/consts/risk-status-type';
import { RiskTreatmentType } from '@risksmart-app/domain/src/types/consts/risk-treatment-type';
import { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import { describe, expect, it } from 'vitest';

import type { UpdateRiskRequest } from '../../schemas/risks/risk-mutate-request.schema';
import {
  mergeRiskUpdateDefaults,
  type RiskUpdateDefaults,
} from './risk-mutation.transformer';

const baseItem: UpdateRiskRequest = {
  title: 'Test Risk',
  treatment: RiskTreatmentType.Treat,
  owners: ['provider|user-1'],
};

const existingDefaults: RiskUpdateDefaults = {
  Description: 'Existing description',
  Status: RiskStatusType.Active,
  ParentRiskId: 'parent-uuid-1234',
  schedule: {
    StartDate: '2024-01-01T00:00:00Z',
    ManualDueDate: '2024-06-30T00:00:00Z',
    Frequency: TestFrequency.Monthly,
    TimeToCompleteValue: 7,
    TimeToCompleteUnit: UnitOfTime.Day,
  },
};

describe('mergeRiskUpdateDefaults', () => {
  describe('description', () => {
    it('preserves existing value when field is omitted (undefined)', () => {
      const result = mergeRiskUpdateDefaults(baseItem, existingDefaults);
      expect(result.description).toBe('Existing description');
    });

    it('passes through explicit null (intentional clear)', () => {
      const item: UpdateRiskRequest = { ...baseItem, description: null };
      const result = mergeRiskUpdateDefaults(item, existingDefaults);
      expect(result.description).toBeNull();
    });

    it('uses provided value when set', () => {
      const item: UpdateRiskRequest = {
        ...baseItem,
        description: 'New description',
      };
      const result = mergeRiskUpdateDefaults(item, existingDefaults);
      expect(result.description).toBe('New description');
    });
  });

  describe('status', () => {
    it('preserves existing value when field is omitted (undefined)', () => {
      const result = mergeRiskUpdateDefaults(baseItem, existingDefaults);
      expect(result.status).toBe(RiskStatusType.Active);
    });

    it('passes through explicit null (intentional clear)', () => {
      const item: UpdateRiskRequest = { ...baseItem, status: null };
      const result = mergeRiskUpdateDefaults(item, existingDefaults);
      expect(result.status).toBeNull();
    });

    it('uses provided value when set', () => {
      const item: UpdateRiskRequest = {
        ...baseItem,
        status: RiskStatusType.Retired,
      };
      const result = mergeRiskUpdateDefaults(item, existingDefaults);
      expect(result.status).toBe(RiskStatusType.Retired);
    });
  });

  describe('parentRiskId', () => {
    it('preserves existing value when field is omitted (undefined)', () => {
      const result = mergeRiskUpdateDefaults(baseItem, existingDefaults);
      expect(result.parentRiskId).toBe('parent-uuid-1234');
    });

    it('does not add parentRiskId when existing is null (tier-1 risk has no parent)', () => {
      const existingNoParent: RiskUpdateDefaults = {
        ...existingDefaults,
        ParentRiskId: null,
      };
      const result = mergeRiskUpdateDefaults(baseItem, existingNoParent);
      expect(result.parentRiskId).toBeUndefined();
    });

    it('uses provided value when set', () => {
      const item: UpdateRiskRequest = {
        ...baseItem,
        parentRiskId: 'new-parent-uuid',
      };
      const result = mergeRiskUpdateDefaults(item, existingDefaults);
      expect(result.parentRiskId).toBe('new-parent-uuid');
    });
  });

  describe('schedule', () => {
    it('reconstructs schedule from existing when omitted (undefined)', () => {
      const result = mergeRiskUpdateDefaults(baseItem, existingDefaults);
      expect(result.schedule).toEqual({
        startDate: '2024-01-01T00:00:00Z',
        manualDueDate: '2024-06-30T00:00:00Z',
        frequency: TestFrequency.Monthly,
        timeToCompleteValue: 7,
        timeToCompleteUnit: UnitOfTime.Day,
      });
    });

    it('uses provided schedule when set', () => {
      const newSchedule: UpdateRiskRequest['schedule'] = {
        frequency: TestFrequency.Weekly,
      };
      const item: UpdateRiskRequest = { ...baseItem, schedule: newSchedule };
      const result = mergeRiskUpdateDefaults(item, existingDefaults);
      expect(result.schedule).toBe(newSchedule);
    });

    it('uses null from existing schedule fields when they are null', () => {
      const existingWithNullSchedule: RiskUpdateDefaults = {
        ...existingDefaults,
        schedule: {
          StartDate: null,
          ManualDueDate: null,
          Frequency: null,
          TimeToCompleteValue: null,
          TimeToCompleteUnit: null,
        },
      };
      const result = mergeRiskUpdateDefaults(
        baseItem,
        existingWithNullSchedule
      );
      expect(result.schedule).toEqual({
        startDate: null,
        manualDueDate: null,
        frequency: null,
        timeToCompleteValue: null,
        timeToCompleteUnit: null,
      });
    });

    it('does not add schedule when existing schedule is null (entity has no schedule)', () => {
      const existingNoSchedule: RiskUpdateDefaults = {
        ...existingDefaults,
        schedule: null,
      };
      const result = mergeRiskUpdateDefaults(baseItem, existingNoSchedule);
      expect(result.schedule).toBeUndefined();
    });
  });

  it('preserves non-nullable fields unchanged', () => {
    const result = mergeRiskUpdateDefaults(baseItem, existingDefaults);
    expect(result.title).toBe(baseItem.title);
    expect(result.treatment).toBe(baseItem.treatment);
    expect(result.owners).toBe(baseItem.owners);
  });
});
