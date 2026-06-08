import { ActionStatus } from '@risksmart-app/domain/src/types/consts/action-status';
import { describe, expect, it } from 'vitest';

import type { UpdateActionRequest } from '../../schemas/actions/action-mutate-request.schema';
import {
  type ActionUpdateDefaults,
  mergeActionUpdateDefaults,
} from './action-mutation.transformer';

const baseItem: UpdateActionRequest = {
  title: 'Test Action',
  status: ActionStatus.Open,
  dateRaised: '2024-01-10T00:00:00Z',
  dateDue: '2024-03-10T00:00:00Z',
  priority: 2,
  owners: ['provider|user-1'],
};

const existingDefaults: ActionUpdateDefaults = {
  ClosedDate: '2024-02-01T00:00:00Z',
  Description: 'Existing description',
};

describe('mergeActionUpdateDefaults', () => {
  describe('closedDate', () => {
    it('preserves existing value when field is omitted (undefined)', () => {
      const result = mergeActionUpdateDefaults(baseItem, existingDefaults);
      expect(result.closedDate).toBe('2024-02-01T00:00:00Z');
    });

    it('passes through explicit null (intentional clear)', () => {
      const item: UpdateActionRequest = { ...baseItem, closedDate: null };
      const result = mergeActionUpdateDefaults(item, existingDefaults);
      expect(result.closedDate).toBeNull();
    });

    it('uses provided value when set', () => {
      const item: UpdateActionRequest = {
        ...baseItem,
        closedDate: '2024-05-01T00:00:00Z',
      };
      const result = mergeActionUpdateDefaults(item, existingDefaults);
      expect(result.closedDate).toBe('2024-05-01T00:00:00Z');
    });

    it('does not add closedDate key when both item and existing are undefined', () => {
      const existingWithUndefined: ActionUpdateDefaults = {
        ClosedDate: null,
        Description: null,
      };
      // When existing is null (not undefined), it IS preserved
      const result = mergeActionUpdateDefaults(baseItem, existingWithUndefined);
      expect(result.closedDate).toBeNull();
    });
  });

  describe('description', () => {
    it('preserves existing value when field is omitted (undefined)', () => {
      const result = mergeActionUpdateDefaults(baseItem, existingDefaults);
      expect(result.description).toBe('Existing description');
    });

    it('passes through explicit null (intentional clear)', () => {
      const item: UpdateActionRequest = { ...baseItem, description: null };
      const result = mergeActionUpdateDefaults(item, existingDefaults);
      expect(result.description).toBeNull();
    });

    it('uses provided value when set', () => {
      const item: UpdateActionRequest = {
        ...baseItem,
        description: 'New description',
      };
      const result = mergeActionUpdateDefaults(item, existingDefaults);
      expect(result.description).toBe('New description');
    });
  });

  it('preserves all non-nullable fields unchanged', () => {
    const result = mergeActionUpdateDefaults(baseItem, existingDefaults);
    expect(result.title).toBe(baseItem.title);
    expect(result.status).toBe(baseItem.status);
    expect(result.dateRaised).toBe(baseItem.dateRaised);
    expect(result.dateDue).toBe(baseItem.dateDue);
    expect(result.priority).toBe(baseItem.priority);
    expect(result.owners).toBe(baseItem.owners);
  });

  it('uses null existing values when item field is omitted', () => {
    const existingWithNulls: ActionUpdateDefaults = {
      ClosedDate: null,
      Description: null,
    };
    const result = mergeActionUpdateDefaults(baseItem, existingWithNulls);
    expect(result.closedDate).toBeNull();
    expect(result.description).toBeNull();
  });
});
