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

// Helper function to create a mock useRating return value
const createMockUseRating = (getLabelImpl?: (status: string) => string) => ({
  options: [
    { value: 1, label: 'Minimal' },
    { value: 2, label: 'Low' },
    { value: 3, label: 'Moderate' },
    { value: 4, label: 'High' },
    { value: 5, label: 'Critical' },
  ],
  getIndexByValue: vi.fn(),
  getOptionsByRatingKey: vi.fn(),
  getByValue: vi.fn(),
  getByValueAndRatingKey: vi.fn(),
  getByLabel: vi.fn(),
  getLabel: vi.fn().mockImplementation(
    getLabelImpl ||
      ((status) => {
        const labels = {
          minimal: 'Minimal',
          low: 'Low',
          moderate: 'Moderate',
          high: 'High',
          critical: 'Critical',
          unrated: 'Unrated',
        };

        return labels[status as keyof typeof labels] || status;
      })
  ),
  getColorClass: vi.fn(),
  getByRange: vi.fn(),
  getLabelByIndex: vi.fn(),
});

describe('Consequences useGetDefaultRibbonFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic filter structure', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue(createMockUseRating());
    });

    it('should call useRating with criticality', () => {
      renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(mockUseRating).toHaveBeenCalledWith('criticality');
    });

    it('should return correct number of filters', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(result.current).toHaveLength(7);
    });

    it('should return filters in the correct order', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const titles = result.current.map((filter) => filter.title);
      // Note: Titles come from i18n translations
      expect(titles).toEqual([
        'Minimal',
        'Low',
        'Moderate',
        'High',
        'Critical',
        'Unrated',
        'All consequences',
      ]);
    });
  });

  describe('filter structure for status filters', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue(createMockUseRating());
    });

    it('should create correct filter structure for "Minimal" status', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const minimalFilter = result.current[0];
      expect(minimalFilter).toEqual({
        id: 'mocked-uuid',
        title: 'Minimal',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: 'Minimal',
              propertyKey: 'CriticalityLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      });
    });

    it('should create "All consequences" filter with empty tokenGroups', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const allFilter = result.current[result.current.length - 1];
      expect(allFilter).toEqual({
        id: 'mocked-uuid',
        title: 'All consequences',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [],
          operation: 'and',
        },
      });
    });
  });

  describe('filter query structure validation', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue(createMockUseRating(() => 'Test Label'));
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
      expect(tokenGroup).toHaveProperty('propertyKey', 'CriticalityLabelled');
      expect(tokenGroup).toHaveProperty('value');
    });

    it('should create valid filter query structure for "All consequences" filter', () => {
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
      expect(ids).toHaveLength(7);
      expect(ids.every((id) => id === 'mocked-uuid')).toBe(true);
    });
  });

  describe('all status values', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue(createMockUseRating());
    });

    it('should include all expected status filters', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const filterValues = result.current
        .slice(0, -1) // Exclude the "All" filter
        .map(
          (filter) => (filter.itemFilterQuery.tokenGroups?.[0] as Token)?.value
        );

      expect(filterValues).toContain('Minimal');
      expect(filterValues).toContain('Low');
      expect(filterValues).toContain('Moderate');
      expect(filterValues).toContain('High');
      expect(filterValues).toContain('Critical');
      expect(filterValues).toContain('Unrated');
    });

    it('should use correct propertyKey for all status filters', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const statusFilters = result.current.slice(0, -1); // Exclude "All" filter

      statusFilters.forEach((filter) => {
        const tokenGroup = filter.itemFilterQuery.tokenGroups?.[0] as Token;
        expect(tokenGroup.propertyKey).toBe('CriticalityLabelled');
        expect(tokenGroup.operator).toBe('=');
      });
    });
  });
});
