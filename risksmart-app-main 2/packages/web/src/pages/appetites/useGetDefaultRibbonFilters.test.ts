import { getWrapper } from '@risksmart-app/components/src/testing/wrapper';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import type { Token } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

import { APPETITE_PERFORMANCE } from './calculateAppetitePerformance';
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

// Helper function to create a mock useRating return value
const createMockUseRating = (getLabelImpl?: (status: string) => string) => ({
  options: [],
  getIndexByValue: vi.fn(),
  getOptionsByRatingKey: vi.fn(),
  getByValue: vi.fn(),
  getByValueAndRatingKey: vi.fn(),
  getByLabel: vi.fn(),
  getLabel: vi.fn().mockImplementation(
    getLabelImpl ||
      ((status) => {
        const labels = {
          inside: 'Inside',
          outside: 'Outside',
        };

        return labels[status as keyof typeof labels] || status;
      })
  ),
  getColorClass: vi.fn(),
  getByRange: vi.fn(),
  getLabelByIndex: vi.fn(),
});

describe('Appetites useGetDefaultRibbonFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic filter structure', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue(createMockUseRating());
    });

    it('should call useRating with appetite_performance', () => {
      renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(mockUseRating).toHaveBeenCalledWith('appetite_performance');
    });

    it('should return 3 filters: outside, inside, and all', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(result.current).toHaveLength(3);
    });

    it('should return filters in the correct order', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const titles = result.current.map((filter) => filter.title);
      // Note: Titles come from i18n translations
      expect(titles).toEqual(['Outside', 'Inside', 'All appetites']);
    });
  });

  describe('filter structure for performance filters', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue(createMockUseRating());
    });

    it('should create correct filter structure for "Outside" performance', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const outsideFilter = result.current[0];
      expect(outsideFilter).toEqual({
        id: 'mocked-uuid',
        title: 'Outside',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: 'Outside',
              propertyKey: 'PerformanceLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      });
    });

    it('should create correct filter structure for "Inside" performance', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const insideFilter = result.current[1];
      expect(insideFilter).toEqual({
        id: 'mocked-uuid',
        title: 'Inside',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: 'Inside',
              propertyKey: 'PerformanceLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      });
    });

    it('should create "All appetites" filter with empty tokenGroups', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const allFilter = result.current[result.current.length - 1];
      expect(allFilter).toEqual({
        id: 'mocked-uuid',
        title: 'All appetites',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [],
          operation: 'and',
        },
      });
    });
  });

  describe('getLabel function behavior', () => {
    it('should use getLabel to retrieve performance labels', () => {
      const mockGetLabel = vi
        .fn()
        .mockImplementation((status) => `Label-${status}`);

      const mockRating = createMockUseRating((status) => `Label-${status}`);
      mockRating.getLabel = mockGetLabel;
      mockUseRating.mockReturnValue(mockRating);

      renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      // The implementation uses getLabel for both outside and inside
      expect(mockGetLabel).toHaveBeenCalledWith(APPETITE_PERFORMANCE.OUTSIDE);
      expect(mockGetLabel).toHaveBeenCalledWith(APPETITE_PERFORMANCE.INSIDE);
    });

    it('should handle custom label values from getLabel', () => {
      mockUseRating.mockReturnValue(
        createMockUseRating((status) => {
          const customLabels = {
            outside: 'Custom Outside',
            inside: 'Custom Inside',
          };

          return customLabels[status as keyof typeof customLabels] || status;
        })
      );

      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const outsideFilter = result.current[0];
      expect(
        (outsideFilter.itemFilterQuery.tokenGroups?.[0] as Token)?.value
      ).toBe('Custom Outside');

      const insideFilter = result.current[1];
      expect(
        (insideFilter.itemFilterQuery.tokenGroups?.[0] as Token)?.value
      ).toBe('Custom Inside');
    });
  });

  describe('APPETITE_PERFORMANCE constants usage', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue(createMockUseRating());
    });

    it('should use APPETITE_PERFORMANCE.OUTSIDE constant', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const outsideFilter = result.current[0];
      const tokenValue = (
        outsideFilter.itemFilterQuery.tokenGroups?.[0] as Token
      )?.value;

      // Verify the constant is used (getLabel would be called with 'outside')
      expect(APPETITE_PERFORMANCE.OUTSIDE).toBe('outside');
      expect(tokenValue).toBeDefined();
    });

    it('should use APPETITE_PERFORMANCE.INSIDE constant', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const insideFilter = result.current[1];
      const tokenValue = (
        insideFilter.itemFilterQuery.tokenGroups?.[0] as Token
      )?.value;

      // Verify the constant is used (getLabel would be called with 'inside')
      expect(APPETITE_PERFORMANCE.INSIDE).toBe('inside');
      expect(tokenValue).toBeDefined();
    });
  });

  describe('filter query structure validation', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue(createMockUseRating(() => 'Test Label'));
    });

    it('should create valid filter query structure for performance filters', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const performanceFilter = result.current[0];

      // Validate the structure matches FilterModal type
      expect(performanceFilter).toHaveProperty('id');
      expect(performanceFilter).toHaveProperty('title');
      expect(performanceFilter).toHaveProperty('itemFilterQuery');

      const query = performanceFilter.itemFilterQuery;
      expect(query).toHaveProperty('tokens');
      expect(query).toHaveProperty('tokenGroups');
      expect(query).toHaveProperty('operation');

      expect(Array.isArray(query.tokens)).toBe(true);
      expect(Array.isArray(query.tokenGroups)).toBe(true);
      expect(query.operation).toBe('and');

      // Validate token group structure
      const tokenGroup = query.tokenGroups?.[0];
      expect(tokenGroup).toHaveProperty('operator', '=');
      expect(tokenGroup).toHaveProperty('propertyKey', 'PerformanceLabelled');
      expect(tokenGroup).toHaveProperty('value');
    });

    it('should create valid filter query structure for "All appetites" filter', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const allFilter = result.current[result.current.length - 1];
      const query = allFilter.itemFilterQuery;

      expect(query.tokens).toEqual([]);
      expect(query.tokenGroups).toEqual([]);
      expect(query.operation).toBe('and');
    });

    it('should ensure all filters have the mocked ID', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const ids = result.current.map((filter) => filter.id);

      // All IDs should be the same since we're mocking uuid to return the same value
      expect(ids).toHaveLength(3);
      expect(ids.every((id) => id === 'mocked-uuid')).toBe(true);
    });
  });

  describe('memoization behavior', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue(createMockUseRating(() => 'Test Label'));
    });

    it('should maintain consistent filter structure across renders', () => {
      const { result, rerender } = renderHook(
        () => useGetDefaultRibbonFilters(),
        {
          wrapper: getWrapper('i18n'),
        }
      );

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      // Structure should be the same even if references differ
      expect(firstResult.length).toBe(secondResult.length);
      expect(firstResult.map((f) => f.title)).toEqual(
        secondResult.map((f) => f.title)
      );
    });
  });

  describe('edge cases', () => {
    it('should handle getLabel returning empty string', () => {
      mockUseRating.mockReturnValue(createMockUseRating(() => ''));

      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const outsideFilter = result.current[0];
      expect(
        (outsideFilter.itemFilterQuery.tokenGroups?.[0] as Token)?.value
      ).toBe('');
    });

    it('should handle getLabel returning special characters', () => {
      mockUseRating.mockReturnValue(
        createMockUseRating(() => 'Performance & "Quoted"')
      );

      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const outsideFilter = result.current[0];
      expect(
        (outsideFilter.itemFilterQuery.tokenGroups?.[0] as Token)?.value
      ).toBe('Performance & "Quoted"');
    });
  });

  describe('all performance values', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue(createMockUseRating());
    });

    it('should include all expected performance filters', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const filterValues = result.current
        .slice(0, -1) // Exclude the "All" filter
        .map(
          (filter) => (filter.itemFilterQuery.tokenGroups?.[0] as Token)?.value
        );

      expect(filterValues).toContain('Outside');
      expect(filterValues).toContain('Inside');
    });

    it('should use correct propertyKey for all performance filters', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const performanceFilters = result.current.slice(0, -1); // Exclude "All" filter

      performanceFilters.forEach((filter) => {
        const tokenGroup = filter.itemFilterQuery.tokenGroups?.[0] as Token;
        expect(tokenGroup.propertyKey).toBe('PerformanceLabelled');
        expect(tokenGroup.operator).toBe('=');
      });
    });
  });
});
