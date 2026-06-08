import { getWrapper } from '@risksmart-app/components/src/testing/wrapper';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import type { Token } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

// Mock the useRating hook
vi.mock('@risksmart-app/components/src/hooks/useRating', () => ({
  useRating: vi.fn(),
}));

// Mock uuid to have predictable IDs in tests
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mocked-uuid'),
}));

import { useRating } from '@risksmart-app/components/src/hooks/useRating';

const mockUseRating = vi.mocked(useRating);

describe('Third Party useGetDefaultRibbonFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when third_party_status options are available', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue({
        options: [
          { value: 1, label: 'Active', color: 'green' },
          { value: 2, label: 'Inactive', color: 'red' },
          { value: 3, label: 'Pending', color: 'orange' },
        ],
        getIndexByValue: vi.fn(),
        getOptionsByRatingKey: vi.fn(),
        getByValue: vi.fn(),
        getByValueAndRatingKey: vi.fn(),
        getByLabel: vi.fn(),
        getLabel: vi.fn(),
        getColorClass: vi.fn(),
        getByRange: vi.fn(),
        getLabelByIndex: vi.fn(),
      });
    });

    it('should call useRating with third_party_status', () => {
      renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(mockUseRating).toHaveBeenCalledWith('third_party_status');
    });

    it('should return filters for each status option plus "All third parties"', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(result.current).toHaveLength(4);
      expect(result.current.map((filter) => filter.title)).toEqual([
        'Active',
        'Inactive',
        'Pending',
        'All third parties',
      ]);
    });

    it('should create correct filter structure for status options', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const activeFilter = result.current[0];
      expect(activeFilter).toEqual({
        id: 'mocked-uuid',
        title: 'Active',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'StatusLabelled',
              value: 'Active',
            },
          ],
          operation: 'and',
        },
      });
    });

    it('should create "All third parties" filter with empty tokenGroups', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const allFilter = result.current[result.current.length - 1];
      expect(allFilter).toEqual({
        id: 'mocked-uuid',
        title: 'All third parties',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [],
          operation: 'and',
        },
      });
    });
  });

  describe('when no third_party_status options are available', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue({
        options: [],
        getIndexByValue: vi.fn(),
        getOptionsByRatingKey: vi.fn(),
        getByValue: vi.fn(),
        getByValueAndRatingKey: vi.fn(),
        getByLabel: vi.fn(),
        getLabel: vi.fn(),
        getColorClass: vi.fn(),
        getByRange: vi.fn(),
        getLabelByIndex: vi.fn(),
      });
    });

    it('should return only "All third parties" filter', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(result.current).toHaveLength(1);
      expect(result.current[0].title).toBe('All third parties');
    });
  });

  describe('memoization behavior', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue({
        options: [
          { value: 1, label: 'Active', color: 'green' },
          { value: 2, label: 'Inactive', color: 'red' },
        ],
        getIndexByValue: vi.fn(),
        getOptionsByRatingKey: vi.fn(),
        getByValue: vi.fn(),
        getByValueAndRatingKey: vi.fn(),
        getByLabel: vi.fn(),
        getLabel: vi.fn(),
        getColorClass: vi.fn(),
        getByRange: vi.fn(),
        getLabelByIndex: vi.fn(),
      });
    });

    it('should return the same reference when options do not change', () => {
      const { result, rerender } = renderHook(
        () => useGetDefaultRibbonFilters(),
        {
          wrapper: getWrapper('i18n'),
        }
      );

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult).toStrictEqual(secondResult);
    });

    it('should return new reference when options change', () => {
      const { result, rerender } = renderHook(
        () => useGetDefaultRibbonFilters(),
        {
          wrapper: getWrapper('i18n'),
        }
      );

      const firstResult = result.current;

      // Mock different options
      mockUseRating.mockReturnValue({
        options: [{ value: 1, label: 'New Status', color: 'blue' }],
        getIndexByValue: vi.fn(),
        getOptionsByRatingKey: vi.fn(),
        getByValue: vi.fn(),
        getByValueAndRatingKey: vi.fn(),
        getByLabel: vi.fn(),
        getLabel: vi.fn(),
        getColorClass: vi.fn(),
        getByRange: vi.fn(),
        getLabelByIndex: vi.fn(),
      });

      rerender();
      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
      expect(secondResult[0].title).toBe('New Status');
    });
  });

  describe('edge cases', () => {
    it('should handle options with special characters in labels', () => {
      mockUseRating.mockReturnValue({
        options: [
          { value: 1, label: 'Status & Active', color: 'green' },
          { value: 2, label: 'Status "Quoted"', color: 'red' },
        ],
        getIndexByValue: vi.fn(),
        getOptionsByRatingKey: vi.fn(),
        getByValue: vi.fn(),
        getByValueAndRatingKey: vi.fn(),
        getByLabel: vi.fn(),
        getLabel: vi.fn(),
        getColorClass: vi.fn(),
        getByRange: vi.fn(),
        getLabelByIndex: vi.fn(),
      });

      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(result.current[0].title).toBe('Status & Active');
      expect(
        (result.current[0].itemFilterQuery.tokenGroups?.[0] as Token)?.value
      ).toBe('Status & Active');
      expect(result.current[1].title).toBe('Status "Quoted"');
      expect(
        (result.current[1].itemFilterQuery.tokenGroups?.[0] as Token)?.value
      ).toBe('Status "Quoted"');
    });

    it('should handle empty label gracefully', () => {
      mockUseRating.mockReturnValue({
        options: [{ value: 1, label: '', color: 'green' }],
        getIndexByValue: vi.fn(),
        getOptionsByRatingKey: vi.fn(),
        getByValue: vi.fn(),
        getByValueAndRatingKey: vi.fn(),
        getByLabel: vi.fn(),
        getLabel: vi.fn(),
        getColorClass: vi.fn(),
        getByRange: vi.fn(),
        getLabelByIndex: vi.fn(),
      });

      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(result.current[0].title).toBe('');
      expect(
        (result.current[0].itemFilterQuery.tokenGroups?.[0] as Token)?.value
      ).toBe('');
    });
  });

  describe('filter query structure validation', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue({
        options: [{ value: 1, label: 'Active', color: 'green' }],
        getIndexByValue: vi.fn(),
        getOptionsByRatingKey: vi.fn(),
        getByValue: vi.fn(),
        getByValueAndRatingKey: vi.fn(),
        getByLabel: vi.fn(),
        getLabel: vi.fn(),
        getColorClass: vi.fn(),
        getByRange: vi.fn(),
        getLabelByIndex: vi.fn(),
      });
    });

    it('should create valid filter query structure for status filters', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const statusFilter = result.current[0];

      // Validate the structure matches FilterModal type
      expect(statusFilter).toHaveProperty('id');
      expect(statusFilter).toHaveProperty('title');
      expect(statusFilter).toHaveProperty('itemFilterQuery');

      const query = statusFilter.itemFilterQuery;
      expect(query).toHaveProperty('tokens');
      expect(query).toHaveProperty('tokenGroups');
      expect(query).toHaveProperty('operation');

      expect(Array.isArray(query.tokens)).toBe(true);
      expect(Array.isArray(query.tokenGroups)).toBe(true);
      expect(query.operation).toBe('and');

      // Validate token group structure
      const tokenGroup = query.tokenGroups?.[0];
      expect(tokenGroup).toHaveProperty('operator', '=');
      expect(tokenGroup).toHaveProperty('propertyKey', 'StatusLabelled');
      expect(tokenGroup).toHaveProperty('value', 'Active');
    });

    it('should create valid filter query structure for "All third parties" filter', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const allFilter = result.current[result.current.length - 1];
      const query = allFilter.itemFilterQuery;

      expect(query.tokens).toEqual([]);
      expect(query.tokenGroups).toEqual([]);
      expect(query.operation).toBe('and');
    });
  });
});
