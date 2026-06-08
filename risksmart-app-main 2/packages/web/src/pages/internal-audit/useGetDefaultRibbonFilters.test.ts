import { getWrapper } from '@risksmart-app/components/src/testing/wrapper';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

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
          notscheduled: 'Not scheduled',
          planned: 'Planned',
          inprogress: 'In Progress',
          unallocated: 'Unallocated',
        };

        return labels[status as keyof typeof labels] || status;
      })
  ),
  getColorClass: vi.fn(),
  getByRange: vi.fn(),
  getLabelByIndex: vi.fn(),
});

describe('Internal Audit useGetDefaultRibbonFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic filter structure', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue(createMockUseRating());
    });

    it('should call useRating with internal_audit_entity_status and internal_audit', () => {
      renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(mockUseRating).toHaveBeenCalledWith(
        'internal_audit_entity_status',
        'internal_audit'
      );
    });

    it('should return 4 filters: not_scheduled, planned, unallocated, and all', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      expect(result.current).toHaveLength(4);
    });

    it('should return filters in the correct order', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const titles = result.current.map((filter) => filter.title);
      // Note: Titles come from i18n translations
      expect(titles).toEqual([
        'Not scheduled',
        'Planned',
        'Unallocated',
        'All internal audits',
      ]);
    });
  });

  describe('filter structure for status filters', () => {
    beforeEach(() => {
      mockUseRating.mockReturnValue(createMockUseRating());
    });

    it('should create correct filter structure for "Not scheduled" status', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const notScheduledFilter = result.current[0];
      expect(notScheduledFilter).toEqual({
        id: 'mocked-uuid',
        title: 'Not scheduled',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: 'Not scheduled',
              propertyKey: 'ReportStatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      });
    });

    it('should create correct filter structure for "Planned" status', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const plannedFilter = result.current[1];
      expect(plannedFilter).toEqual({
        id: 'mocked-uuid',
        title: 'Planned',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: 'Planned',
              propertyKey: 'ReportStatusLabelled',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      });
    });

    it('should create correct filter structure for "Unallocated" status', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const unallocatedFilter = result.current[2];
      expect(unallocatedFilter.itemFilterQuery.tokenGroups?.[0]).toMatchObject({
        operator: '=',
        propertyKey: 'ReportStatusLabelled',
        value: 'Unallocated',
      });
    });

    it('should create "All internal audits" filter with empty tokenGroups', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const allFilter = result.current[result.current.length - 1];
      expect(allFilter).toEqual({
        id: 'mocked-uuid',
        title: 'All internal audits',
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
      expect(tokenGroup).toHaveProperty('propertyKey', 'ReportStatusLabelled');
      expect(tokenGroup).toHaveProperty('value');
    });

    it('should create valid filter query structure for "All internal audits" filter', () => {
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
      expect(ids).toHaveLength(4);
      expect(ids.every((id) => id === 'mocked-uuid')).toBe(true);
    });
  });
});
