import { IndicatorType } from '@risksmart-app/domain/src/types/consts/indicator-type';
import { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import { describe, expect, it } from 'vitest';

import type { UpdateIndicatorRequest } from '../../schemas/indicators/indicator-mutate-request.schema';
import {
  type IndicatorUpdateDefaults,
  mergeIndicatorUpdateDefaults,
} from './indicator-mutation.transformer';

const baseNumberItem: UpdateIndicatorRequest = {
  title: 'Number Indicator',
  owners: ['provider|user-1'],
};

const baseTextItem: UpdateIndicatorRequest = {
  title: 'Text Indicator',
  targetValue: 'Green',
  owners: ['provider|user-1'],
};

const existingDefaults: IndicatorUpdateDefaults = {
  Type: IndicatorType.Number,
  Description: 'Existing description',
  Unit: 'USD',
  UpperToleranceNum: 150,
  LowerToleranceNum: 50,
  UpperAppetiteNum: 120,
  LowerAppetiteNum: 80,
  schedule: {
    StartDate: '2024-01-01T00:00:00Z',
    ManualDueDate: '2024-06-30T00:00:00Z',
    Frequency: TestFrequency.Monthly,
    TimeToCompleteValue: 7,
    TimeToCompleteUnit: UnitOfTime.Day,
  },
};

const existingTextDefaults: IndicatorUpdateDefaults = {
  Type: IndicatorType.Text,
  Description: 'Existing description',
  Unit: null,
  UpperToleranceNum: null,
  LowerToleranceNum: null,
  UpperAppetiteNum: null,
  LowerAppetiteNum: null,
  schedule: existingDefaults.schedule,
};

describe('mergeIndicatorUpdateDefaults', () => {
  describe('description (both types)', () => {
    it('preserves existing value when omitted on number type', () => {
      const result = mergeIndicatorUpdateDefaults(
        baseNumberItem,
        existingDefaults
      );
      expect(result.description).toBe('Existing description');
    });

    it('preserves existing value when omitted on text type', () => {
      const result = mergeIndicatorUpdateDefaults(
        baseTextItem,
        existingTextDefaults
      );
      expect(result.description).toBe('Existing description');
    });

    it('passes through explicit null (intentional clear)', () => {
      const item: UpdateIndicatorRequest = {
        ...baseNumberItem,
        description: null,
      };
      const result = mergeIndicatorUpdateDefaults(item, existingDefaults);
      expect(result.description).toBeNull();
    });

    it('uses provided value when set', () => {
      const item: UpdateIndicatorRequest = {
        ...baseNumberItem,
        description: 'New description',
      };
      const result = mergeIndicatorUpdateDefaults(item, existingDefaults);
      expect(result.description).toBe('New description');
    });
  });

  describe('number-type-specific fields', () => {
    describe('unit', () => {
      it('preserves existing value when omitted', () => {
        const result = mergeIndicatorUpdateDefaults(
          baseNumberItem,
          existingDefaults
        );
        expect(result.unit).toBe('USD');
      });

      it('passes through explicit null (intentional clear)', () => {
        const item: UpdateIndicatorRequest = {
          ...baseNumberItem,
          unit: null,
        };
        const result = mergeIndicatorUpdateDefaults(item, existingDefaults);
        expect(result.unit).toBeNull();
      });

      it('uses provided value when set', () => {
        const item: UpdateIndicatorRequest = {
          ...baseNumberItem,
          unit: 'EUR',
        };
        const result = mergeIndicatorUpdateDefaults(item, existingDefaults);
        expect(result.unit).toBe('EUR');
      });
    });

    describe('upperTolerance', () => {
      it('preserves existing value when omitted', () => {
        const result = mergeIndicatorUpdateDefaults(
          baseNumberItem,
          existingDefaults
        );
        expect(result.upperTolerance).toBe(150);
      });

      it('passes through explicit null', () => {
        const item: UpdateIndicatorRequest = {
          ...baseNumberItem,
          upperTolerance: null,
        };
        const result = mergeIndicatorUpdateDefaults(item, existingDefaults);
        expect(result.upperTolerance).toBeNull();
      });

      it('uses provided value when set', () => {
        const item: UpdateIndicatorRequest = {
          ...baseNumberItem,
          upperTolerance: 200,
        };
        const result = mergeIndicatorUpdateDefaults(item, existingDefaults);
        expect(result.upperTolerance).toBe(200);
      });
    });

    it('does not add number fields when type is text', () => {
      const result = mergeIndicatorUpdateDefaults(
        baseTextItem,
        existingTextDefaults
      );
      expect('unit' in result).toBe(false);
      expect('upperTolerance' in result).toBe(false);
    });
  });

  describe('schedule', () => {
    it('reconstructs schedule from existing when omitted', () => {
      const result = mergeIndicatorUpdateDefaults(
        baseNumberItem,
        existingDefaults
      );
      expect(result.schedule).toEqual({
        startDate: '2024-01-01T00:00:00Z',
        manualDueDate: '2024-06-30T00:00:00Z',
        frequency: TestFrequency.Monthly,
        timeToCompleteValue: 7,
        timeToCompleteUnit: UnitOfTime.Day,
      });
    });

    it('uses provided schedule when set', () => {
      const newSchedule: UpdateIndicatorRequest['schedule'] = {
        frequency: TestFrequency.Weekly,
      };
      const item: UpdateIndicatorRequest = {
        ...baseNumberItem,
        schedule: newSchedule,
      };
      const result = mergeIndicatorUpdateDefaults(item, existingDefaults);
      expect(result.schedule).toBe(newSchedule);
    });

    it('does not add schedule when existing schedule is null (entity has no schedule)', () => {
      const existingNoSchedule: IndicatorUpdateDefaults = {
        ...existingDefaults,
        schedule: null,
      };
      const result = mergeIndicatorUpdateDefaults(
        baseNumberItem,
        existingNoSchedule
      );
      expect(result.schedule).toBeUndefined();
    });
  });

  it('preserves non-nullable fields unchanged', () => {
    const result = mergeIndicatorUpdateDefaults(
      baseNumberItem,
      existingDefaults
    );
    expect(result.title).toBe(baseNumberItem.title);
    expect(result.owners).toBe(baseNumberItem.owners);
  });
});
