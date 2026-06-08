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

describe('Control Tests useGetDefaultRibbonFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when effectiveness options are available', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue({
        options: [
          { value: 1, label: 'Effective', color: 'green' },
          { value: 2, label: 'Ineffective', color: 'red' },
          { value: 3, label: 'Partially Effective', color: 'orange' },
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

    it('should call useRating with effectiveness', () => {
      renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(mockUseRating).toHaveBeenCalledWith('effectiveness');
    });

    it('should return filters for each effectiveness option plus "All"', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(result.current).toHaveLength(4);
      expect(result.current.map((filter) => filter.title)).toEqual([
        'Effective',
        'Ineffective',
        'Partially Effective',
        'All test results',
      ]);
    });

    it('should create correct filter structure for effectiveness options', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const effectiveFilter = result.current[0];
      expect(effectiveFilter).toEqual({
        id: 'mocked-uuid',
        title: 'Effective',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              operator: '=',
              propertyKey: 'OverallEffectivenessLabelled',
              value: 'Effective',
            },
          ],
          operation: 'and',
        },
      });
    });

    it('should create "All" filter with empty tokenGroups', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const allFilter = result.current[result.current.length - 1];
      expect(allFilter).toEqual({
        id: 'mocked-uuid',
        title: 'All test results',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [],
          operation: 'and',
        },
      });
    });
  });

  describe('when no effectiveness options are available', () => {
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

    it('should return only "All" filter', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(result.current).toHaveLength(1);
      expect(result.current[0].title).toBe('All test results');
    });
  });

  describe('memoization behavior', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue({
        options: [
          { value: 1, label: 'Effective', color: 'green' },
          { value: 2, label: 'Ineffective', color: 'red' },
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
        options: [{ value: 1, label: 'Highly Effective', color: 'blue' }],
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
      expect(secondResult[0].title).toBe('Highly Effective');
    });
  });

  describe('edge cases', () => {
    it('should handle options with special characters in labels', () => {
      mockUseRating.mockReturnValue({
        options: [
          { value: 1, label: 'Effective & Compliant', color: 'green' },
          { value: 2, label: 'Ineffective "Critical"', color: 'red' },
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

      expect(result.current[0].title).toBe('Effective & Compliant');
      expect(
        (result.current[0].itemFilterQuery.tokenGroups?.[0] as Token)?.value
      ).toBe('Effective & Compliant');
      expect(result.current[1].title).toBe('Ineffective "Critical"');
      expect(
        (result.current[1].itemFilterQuery.tokenGroups?.[0] as Token)?.value
      ).toBe('Ineffective "Critical"');
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
        options: [{ value: 1, label: 'Effective', color: 'green' }],
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

    it('should create valid filter query structure for effectiveness filters', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const effectivenessFilter = result.current[0];

      // Validate the structure matches FilterModal type
      expect(effectivenessFilter).toHaveProperty('id');
      expect(effectivenessFilter).toHaveProperty('title');
      expect(effectivenessFilter).toHaveProperty('itemFilterQuery');

      const query = effectivenessFilter.itemFilterQuery;
      expect(query).toHaveProperty('tokens');
      expect(query).toHaveProperty('tokenGroups');
      expect(query).toHaveProperty('operation');

      expect(Array.isArray(query.tokens)).toBe(true);
      expect(Array.isArray(query.tokenGroups)).toBe(true);
      expect(query.operation).toBe('and');

      // Validate token group structure
      const tokenGroup = query.tokenGroups?.[0];
      expect(tokenGroup).toHaveProperty('operator', '=');
      expect(tokenGroup).toHaveProperty(
        'propertyKey',
        'OverallEffectivenessLabelled'
      );
      expect(tokenGroup).toHaveProperty('value', 'Effective');
    });

    it('should create valid filter query structure for "All" filter', () => {
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
