import { getWrapper } from '@risksmart-app/components/src/testing/wrapper';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import type { Token } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

import { useGetDefaultRibbonFilters } from './useGetDefaultRibbonFilters';

// Mock uuid to have predictable IDs in tests
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mocked-uuid'),
}));

describe('Questionnaire Template useGetDefaultRibbonFilters', () => {
  describe('basic filter structure', () => {
    it('should return 4 filters', () => {
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
      expect(titles).toEqual([
        'Published',
        'Archived',
        'Draft',
        'All questionnaires',
      ]);
    });
  });

  describe('filter structure for status filters', () => {
    it('should create correct filter structure for "Published" status', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const publishedFilter = result.current[0];
      expect(publishedFilter).toEqual({
        id: 'mocked-uuid',
        title: 'Published',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: 'published',
              propertyKey: 'LatestStatus',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      });
    });

    it('should create correct filter structure for "Archived" status', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const archivedFilter = result.current[1];
      expect(archivedFilter).toEqual({
        id: 'mocked-uuid',
        title: 'Archived',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [
            {
              value: 'archived',
              propertyKey: 'LatestStatus',
              operator: '=',
            },
          ],
          operation: 'and',
        },
      });
    });

    it('should create correct filter structure for "Draft" status', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const draftFilter = result.current[2];
      expect(draftFilter.itemFilterQuery.tokenGroups?.[0]).toMatchObject({
        operator: '=',
        propertyKey: 'LatestStatus',
        value: 'draft',
      });
    });

    it('should create "All questionnaires" filter with empty tokenGroups', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const allFilter = result.current[result.current.length - 1];
      expect(allFilter).toEqual({
        id: 'mocked-uuid',
        title: 'All questionnaires',
        itemFilterQuery: {
          tokens: [],
          tokenGroups: [],
          operation: 'and',
        },
      });
    });
  });

  describe('filter query structure validation', () => {
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
      expect(tokenGroup).toHaveProperty('propertyKey', 'LatestStatus');
      expect(tokenGroup).toHaveProperty('value');
    });

    it('should ensure all filters have the mocked ID', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const ids = result.current.map((filter) => filter.id);

      // All IDs should be the same since we're mocking uuid to return the same value
      expect(ids.every((id) => id === 'mocked-uuid')).toBe(true);
    });
  });

  describe('all status values', () => {
    it('should include all expected status filters', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const filterValues = result.current
        .slice(0, -1) // Exclude the "All" filter
        .map(
          (filter) => (filter.itemFilterQuery.tokenGroups?.[0] as Token)?.value
        );

      expect(filterValues).toContain('published');
      expect(filterValues).toContain('archived');
      expect(filterValues).toContain('draft');
    });

    it('should use correct propertyKey for all status filters', () => {
      const { result } = renderHook(() => useGetDefaultRibbonFilters(), {
        wrapper: getWrapper('i18n'),
      });

      const statusFilters = result.current.slice(0, -1); // Exclude "All" filter

      statusFilters.forEach((filter) => {
        const tokenGroup = filter.itemFilterQuery.tokenGroups?.[0] as Token;
        expect(tokenGroup.propertyKey).toBe('LatestStatus');
        expect(tokenGroup.operator).toBe('=');
      });
    });
  });
});
