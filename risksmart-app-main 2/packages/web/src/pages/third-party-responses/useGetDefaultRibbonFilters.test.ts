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
          completed: 'Completed',
          awaiting_review: 'Awaiting review',
          in_progress: 'In progress',
          not_started: 'Not started',
          rejected: 'Rejected',
        };

        return labels[status as keyof typeof labels] || status;
      })
  ),
  getColorClass: vi.fn(),
  getByRange: vi.fn(),
  getLabelByIndex: vi.fn(),
});

describe('Third Party Responses useGetDefaultRibbonFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic filter structure', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue(createMockUseRating());
    });

    it('should call useRating with third_party_response_status', () => {
      renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(mockUseRating).toHaveBeenCalledWith('third_party_response_status');
    });

    it('should return 6 filters: completed, awaiting_review, in_progress, not_started, rejected, and all', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(result.current).toHaveLength(6);
    });

    it('should return filters in the correct order', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const titles = result.current.map((filter) => filter.title);
      // Note: Titles come from i18n translations
      expect(titles).toEqual([
        'Completed',
        'Awaiting review',
        'In progress',
        'Not started',
        'Rejected',
        'All responses',
      ]);
    });
  });

  describe('filter structure for status filters', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue(createMockUseRating());
    });

    it('should create correct filter structure for "Completed" status', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const completedFilter = result.current[0];
      expect(completedFilter).toEqual({
        id: 'mocked-uuid',
        title: 'Completed',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: 'Completed',
              propertyKey: 'StatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      });
    });

    it('should create correct filter structure for "review" status', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const awaitingReviewFilter = result.current[1];
      expect(awaitingReviewFilter).toEqual({
        id: 'mocked-uuid',
        title: 'Awaiting review',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: 'Awaiting review',
              propertyKey: 'StatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      });
    });

    it('should create correct filter structure for "In progress" status', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const inProgressFilter = result.current[2];
      expect(inProgressFilter.itemFilterQuery.tokenGroups?.[0]).toMatchObject({
        operator: '=',
        propertyKey: 'StatusLabelled',
        value: 'In progress',
      });
    });

    it('should create correct filter structure for "Not started" status', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const notStartedFilter = result.current[3];
      expect(notStartedFilter.itemFilterQuery.tokenGroups?.[0]).toMatchObject({
        operator: '=',
        propertyKey: 'StatusLabelled',
        value: 'Not started',
      });
    });

    it('should create correct filter structure for "Rejected" status', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const rejectedFilter = result.current[4];
      expect(rejectedFilter.itemFilterQuery.tokenGroups?.[0]).toMatchObject({
        operator: '=',
        propertyKey: 'StatusLabelled',
        value: 'Rejected',
      });
    });

    it('should create "All responses" filter with empty tokenGroups', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const allFilter = result.current[result.current.length - 1];
      expect(allFilter).toEqual({
        id: 'mocked-uuid',
        title: 'All responses',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [],
          operation: 'and',
        },
      });
    });
  });

  describe('getLabel function behavior', () => {
    it('should use getLabel to retrieve status labels', () => {
      const mockGetLabel = vi
        .fn()
        .mockImplementation((status) => `Label-${status}`);

      const mockRating = createMockUseRating((status) => `Label-${status}`);
      mockRating.getLabel = mockGetLabel;
      mockUseRating.mockReturnValue(mockRating);

      renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      // The implementation uses getLabel for all status enums
      expect(mockGetLabel).toHaveBeenCalledWith('completed');
      expect(mockGetLabel).toHaveBeenCalledWith('awaiting_review');
      expect(mockGetLabel).toHaveBeenCalledWith('in_progress');
      expect(mockGetLabel).toHaveBeenCalledWith('not_started');
      expect(mockGetLabel).toHaveBeenCalledWith('rejected');
    });

    it('should handle custom label values from getLabel', () => {
      mockUseRating.mockReturnValue(
        createMockUseRating((status) => {
          const customLabels = {
            completed: 'Custom Completed',
            awaiting_review: 'Custom Awaiting review',
          };

          return customLabels[status as keyof typeof customLabels] || status;
        })
      );

      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const completedFilter = result.current[0];
      expect(
        (completedFilter.itemFilterQuery.tokenGroups?.[0] as Token)?.value
      ).toBe('Custom Completed');

      const awaitingReviewFilter = result.current[1];
      expect(
        (awaitingReviewFilter.itemFilterQuery.tokenGroups?.[0] as Token)?.value
      ).toBe('Custom Awaiting review');
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

    it('should create valid filter query structure for "All responses" filter', () => {
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
      expect(ids).toHaveLength(6);
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

      const completedFilter = result.current[0];
      expect(
        (completedFilter.itemFilterQuery.tokenGroups?.[0] as Token)?.value
      ).toBe('');
    });

    it('should handle getLabel returning special characters', () => {
      mockUseRating.mockReturnValue(
        createMockUseRating(() => 'Status & "Quoted"')
      );

      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const completedFilter = result.current[0];
      expect(
        (completedFilter.itemFilterQuery.tokenGroups?.[0] as Token)?.value
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

      expect(filterValues).toContain('Completed');
      expect(filterValues).toContain('Awaiting review');
      expect(filterValues).toContain('In progress');
      expect(filterValues).toContain('Not started');
      expect(filterValues).toContain('Rejected');
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
