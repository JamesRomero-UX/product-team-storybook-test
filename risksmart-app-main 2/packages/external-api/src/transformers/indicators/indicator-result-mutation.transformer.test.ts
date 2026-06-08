import { describe, expect, it } from 'vitest';

import type { UpdateIndicatorResultRequest } from '../../schemas/indicators/indicator-result-mutate-request.schema';
import {
  type IndicatorResultUpdateDefaults,
  mergeIndicatorResultUpdateDefaults,
} from './indicator-result-mutation.transformer';

const baseItem: UpdateIndicatorResultRequest = {
  resultDate: '2024-03-15T09:00:00Z',
};

const existingDefaults: IndicatorResultUpdateDefaults = {
  Description: 'Existing result description',
  TargetValueNum: 42.5,
  TargetValueTxt: null,
};

describe('mergeIndicatorResultUpdateDefaults', () => {
  describe('description', () => {
    it('preserves existing value when field is omitted (undefined)', () => {
      const result = mergeIndicatorResultUpdateDefaults(
        baseItem,
        existingDefaults
      );
      expect(result.description).toBe('Existing result description');
    });

    it('passes through explicit null (intentional clear)', () => {
      const item: UpdateIndicatorResultRequest = {
        ...baseItem,
        description: null,
      };
      const result = mergeIndicatorResultUpdateDefaults(item, existingDefaults);
      expect(result.description).toBeNull();
    });

    it('uses provided value when set', () => {
      const item: UpdateIndicatorResultRequest = {
        ...baseItem,
        description: 'New description',
      };
      const result = mergeIndicatorResultUpdateDefaults(item, existingDefaults);
      expect(result.description).toBe('New description');
    });
  });

  describe('targetValueNum', () => {
    it('preserves existing value when field is omitted (undefined)', () => {
      const result = mergeIndicatorResultUpdateDefaults(
        baseItem,
        existingDefaults
      );
      expect(result.targetValueNum).toBe(42.5);
    });

    it('passes through explicit null (intentional clear)', () => {
      const item: UpdateIndicatorResultRequest = {
        ...baseItem,
        targetValueNum: null,
      };
      const result = mergeIndicatorResultUpdateDefaults(item, existingDefaults);
      expect(result.targetValueNum).toBeNull();
    });

    it('uses provided value when set', () => {
      const item: UpdateIndicatorResultRequest = {
        ...baseItem,
        targetValueNum: 99,
      };
      const result = mergeIndicatorResultUpdateDefaults(item, existingDefaults);
      expect(result.targetValueNum).toBe(99);
    });
  });

  describe('targetValueTxt', () => {
    it('preserves existing value when field is omitted (undefined)', () => {
      const existingWithTxt: IndicatorResultUpdateDefaults = {
        Description: null,
        TargetValueNum: null,
        TargetValueTxt: 'On track',
      };
      const result = mergeIndicatorResultUpdateDefaults(
        baseItem,
        existingWithTxt
      );
      expect(result.targetValueTxt).toBe('On track');
    });

    it('passes through explicit null (intentional clear)', () => {
      const item: UpdateIndicatorResultRequest = {
        ...baseItem,
        targetValueTxt: null,
      };
      const existingWithTxt: IndicatorResultUpdateDefaults = {
        Description: null,
        TargetValueNum: null,
        TargetValueTxt: 'On track',
      };
      const result = mergeIndicatorResultUpdateDefaults(item, existingWithTxt);
      expect(result.targetValueTxt).toBeNull();
    });

    it('uses provided value when set', () => {
      const item: UpdateIndicatorResultRequest = {
        ...baseItem,
        targetValueTxt: 'Updated',
      };
      const result = mergeIndicatorResultUpdateDefaults(item, existingDefaults);
      expect(result.targetValueTxt).toBe('Updated');
    });
  });

  it('preserves non-nullable fields unchanged', () => {
    const result = mergeIndicatorResultUpdateDefaults(
      baseItem,
      existingDefaults
    );
    expect(result.resultDate).toBe(baseItem.resultDate);
  });

  it('uses null existing values when item field is omitted', () => {
    const existingWithNulls: IndicatorResultUpdateDefaults = {
      Description: null,
      TargetValueNum: null,
      TargetValueTxt: null,
    };
    const result = mergeIndicatorResultUpdateDefaults(
      baseItem,
      existingWithNulls
    );
    expect(result.description).toBeNull();
    expect(result.targetValueNum).toBeNull();
    expect(result.targetValueTxt).toBeNull();
  });
});
