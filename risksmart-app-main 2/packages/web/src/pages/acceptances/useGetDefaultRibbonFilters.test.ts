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
          open: 'Open',
          closed: 'Closed',
          declined: 'Declined',
          pending: 'Draft',
        };

        return labels[status as keyof typeof labels] || status;
      })
  ),
  getColorClass: vi.fn(),
  getByRange: vi.fn(),
  getLabelByIndex: vi.fn(),
});

describe('Acceptances useGetDefaultRibbonFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic filter structure', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue(createMockUseRating());
    });

    it('should call useRating with acceptance_status', () => {
      renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(mockUseRating).toHaveBeenCalledWith('acceptance_status');
    });

    it('should return 5 filters: open, closed, declined, draft, and all', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(result.current).toHaveLength(5);
    });

    it('should return filters in the correct order', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const titles = result.current.map((filter) => filter.title);
      // Note: Titles come from i18n translations
      expect(titles).toEqual([
        'Open',
        'Closed',
        'Declined',
        'Draft',
        'All acceptances',
      ]);
    });
  });

  describe('filter structure for status filters', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue(createMockUseRating());
    });

    it('should create correct filter structure for "Open" status', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const openFilter = result.current[0];
      expect(openFilter).toEqual({
        id: 'mocked-uuid',
        title: 'Open',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: 'Open',
              propertyKey: 'StatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      });
    });

    it('should create correct filter structure for "Closed" status', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const closedFilter = result.current[1];
      expect(closedFilter).toEqual({
        id: 'mocked-uuid',
        title: 'Closed',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: 'Closed',
              propertyKey: 'StatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      });
    });

    it('should create correct filter structure for "Declined" status', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const declinedFilter = result.current[2];
      expect(declinedFilter.itemFilterQuery.tokenGroups?.[0]).toMatchObject({
        operator: '=',
        propertyKey: 'StatusLabelled',
        value: 'Declined',
      });
    });

    it('should create correct filter structure for "Draft" status', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const draftFilter = result.current[3];
      expect(draftFilter.itemFilterQuery.tokenGroups?.[0]).toMatchObject({
        operator: '=',
        propertyKey: 'StatusLabelled',
        value: 'Draft',
      });
    });

    it('should create "All acceptances" filter with empty tokenGroups', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const allFilter = result.current[result.current.length - 1];
      expect(allFilter).toEqual({
        id: 'mocked-uuid',
        title: 'All acceptances',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [],
          operation: 'and',
        },
      });
    });
  });

  describe('getLabel function behavior', () => {
    it('should use getLabel to retrieve status labels for open and closed', () => {
      const mockGetLabel = vi
        .fn()
        .mockImplementation((status) => `Label-${status}`);

      const mockRating = createMockUseRating((status) => `Label-${status}`);
      mockRating.getLabel = mockGetLabel;
      mockUseRating.mockReturnValue(mockRating);

      renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      // The implementation uses getLabel for open and closed, but hardcoded strings for declined and draft
      expect(mockGetLabel).toHaveBeenCalledWith('open');
      expect(mockGetLabel).toHaveBeenCalledWith('closed');
    });

    it('should handle custom label values from getLabel', () => {
      mockUseRating.mockReturnValue(
        createMockUseRating((status) => {
          const customLabels = {
            open: 'Custom Open',
            closed: 'Custom Closed',
          };

          return customLabels[status as keyof typeof customLabels] || status;
        })
      );

      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const openFilter = result.current[0];
      expect(
        (openFilter.itemFilterQuery.tokenGroups?.[0] as Token)?.value
      ).toBe('Custom Open');

      const closedFilter = result.current[1];
      expect(
        (closedFilter.itemFilterQuery.tokenGroups?.[0] as Token)?.value
      ).toBe('Custom Closed');
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
      expect(tokenGroup).toHaveProperty('propertyKey', 'StatusLabelled');
      expect(tokenGroup).toHaveProperty('value');
    });

    it('should create valid filter query structure for "All acceptances" filter', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const allFilter = result.current[result.current.length - 1];
      const query = allFilter.itemFilterQuery;

      expect(query.tokens).toEqual([]);
      expect(query.tokenGroups).toEqual([]);
      expect(query.operation).toBe('and');
    });

    it('should ensure all filters have an ID', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const ids = result.current.map((filter) => filter.id);

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

      const openFilter = result.current[0];
      expect(
        (openFilter.itemFilterQuery.tokenGroups?.[0] as Token)?.value
      ).toBe('');
    });

    it('should handle getLabel returning special characters', () => {
      mockUseRating.mockReturnValue(
        createMockUseRating(() => 'Status & "Quoted"')
      );

      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const openFilter = result.current[0];
      expect(
        (openFilter.itemFilterQuery.tokenGroups?.[0] as Token)?.value
      ).toBe('Status & "Quoted"');
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

      expect(filterValues).toContain('Open');
      expect(filterValues).toContain('Closed');
      expect(filterValues).toContain('Declined');
      expect(filterValues).toContain('Draft');
    });

    it('should use correct propertyKey for all status filters', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const statusFilters = result.current.slice(0, -1); // Exclude "All" filter

      statusFilters.forEach((filter) => {
        const tokenGroup = filter.itemFilterQuery.tokenGroups?.[0] as Token;
        expect(tokenGroup.propertyKey).toBe('StatusLabelled');
        expect(tokenGroup.operator).toBe('=');
      });
    });
  });
});
