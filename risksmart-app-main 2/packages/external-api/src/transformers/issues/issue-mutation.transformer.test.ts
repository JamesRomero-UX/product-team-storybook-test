import { describe, expect, it } from 'vitest';

import type { UpdateIssueRequest } from '../../schemas/issues/issue-mutate-request.schema';
import {
  type IssueUpdateDefaults,
  mergeIssueUpdateDefaults,
} from './issue-mutation.transformer';

const baseItem: UpdateIssueRequest = {
  title: 'Test Issue',
  dateIdentified: '2024-01-15T00:00:00Z',
  dateOccurred: '2024-01-10T00:00:00Z',
  owners: ['provider|user-1'],
};

const existingDefaults: IssueUpdateDefaults = {
  Details: 'Existing details',
  ImpactsCustomer: true,
  IsExternalIssue: false,
};

describe('mergeIssueUpdateDefaults', () => {
  describe('description (maps from Details)', () => {
    it('preserves existing value when field is omitted (undefined)', () => {
      const result = mergeIssueUpdateDefaults(baseItem, existingDefaults);
      expect(result.description).toBe('Existing details');
    });

    it('passes through explicit null (intentional clear)', () => {
      const item: UpdateIssueRequest = { ...baseItem, description: null };
      const result = mergeIssueUpdateDefaults(item, existingDefaults);
      expect(result.description).toBeNull();
    });

    it('uses provided value when set', () => {
      const item: UpdateIssueRequest = {
        ...baseItem,
        description: 'New details',
      };
      const result = mergeIssueUpdateDefaults(item, existingDefaults);
      expect(result.description).toBe('New details');
    });
  });

  describe('impactsCustomer', () => {
    it('preserves existing value when field is omitted (undefined)', () => {
      const result = mergeIssueUpdateDefaults(baseItem, existingDefaults);
      expect(result.impactsCustomer).toBe(true);
    });

    it('passes through explicit null (intentional clear)', () => {
      const item: UpdateIssueRequest = { ...baseItem, impactsCustomer: null };
      const result = mergeIssueUpdateDefaults(item, existingDefaults);
      expect(result.impactsCustomer).toBeNull();
    });

    it('uses provided value when set', () => {
      const item: UpdateIssueRequest = {
        ...baseItem,
        impactsCustomer: false,
      };
      const result = mergeIssueUpdateDefaults(item, existingDefaults);
      expect(result.impactsCustomer).toBe(false);
    });
  });

  describe('isExternalIssue', () => {
    it('preserves existing value when field is omitted (undefined)', () => {
      const result = mergeIssueUpdateDefaults(baseItem, existingDefaults);
      expect(result.isExternalIssue).toBe(false);
    });

    it('passes through explicit null (intentional clear)', () => {
      const item: UpdateIssueRequest = { ...baseItem, isExternalIssue: null };
      const result = mergeIssueUpdateDefaults(item, existingDefaults);
      expect(result.isExternalIssue).toBeNull();
    });

    it('uses provided value when set', () => {
      const item: UpdateIssueRequest = {
        ...baseItem,
        isExternalIssue: true,
      };
      const result = mergeIssueUpdateDefaults(item, existingDefaults);
      expect(result.isExternalIssue).toBe(true);
    });
  });

  it('preserves non-nullable fields unchanged', () => {
    const result = mergeIssueUpdateDefaults(baseItem, existingDefaults);
    expect(result.title).toBe(baseItem.title);
    expect(result.dateIdentified).toBe(baseItem.dateIdentified);
    expect(result.dateOccurred).toBe(baseItem.dateOccurred);
    expect(result.owners).toBe(baseItem.owners);
  });

  it('uses null existing values when item field is omitted', () => {
    const existingWithNulls: IssueUpdateDefaults = {
      Details: null,
      ImpactsCustomer: null,
      IsExternalIssue: null,
    };
    const result = mergeIssueUpdateDefaults(baseItem, existingWithNulls);
    expect(result.description).toBeNull();
    expect(result.impactsCustomer).toBeNull();
    expect(result.isExternalIssue).toBeNull();
  });
});
