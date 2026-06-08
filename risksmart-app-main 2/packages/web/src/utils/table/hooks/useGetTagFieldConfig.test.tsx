/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TagPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import { renderHook } from '@testing-library/react';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import { useGetTags } from '@/hooks/queries';

import { useGetTagFieldConfig } from './useGetTagFieldConfig';

// Mock the useGetTags hook
vi.mock('@/hooks/queries', () => ({
  useGetTags: vi.fn(),
}));

// Mock the BadgeList component
vi.mock('@/components/BadgeList', () => {
  return {
    default: function MockBadgeList({ badges }: { badges: string[] }) {
      return <div data-testid={'badge-list'}>{badges.join(', ')}</div>;
    },
  };
});

const mockedUseGetTags = vi.mocked(useGetTags);

describe('useGetTagFieldConfig', () => {
  const mockTagTypes = [
    {
      TagTypeId: 'tag-1',
      Name: 'Security',
    },
    {
      TagTypeId: 'tag-2',
      Name: 'Compliance',
    },
    {
      TagTypeId: 'tag-3',
      Name: 'Operations',
    },
  ];

  const mockTags: TagPartsFragment[] = [
    {
      __typename: 'tag',
      TagTypeId: 'tag-1',
      ParentId: 'parent-1',
      type: {
        __typename: 'tag_type',
        Name: 'Security',
        Description: 'Security Related',
      },
    },
    {
      __typename: 'tag',
      TagTypeId: 'tag-2',
      ParentId: 'parent-1',
      type: {
        __typename: 'tag_type',
        Name: 'Compliance',
        Description: 'Compliance Related',
      },
    },
  ];

  type MockRecord = {
    Id: string;
    tags: TagPartsFragment[];
  };

  beforeEach(() => {
    mockedUseGetTags.mockReturnValue({
      data: {
        tag_type: mockTagTypes,
      },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should return cell component that renders BadgeList', () => {
      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      const mockItem: MockRecord = {
        Id: 'test-1',
        tags: mockTags,
      };

      const cellElement = result.current.cell?.(mockItem);
      expect(cellElement).toBeDefined();
    });

    it('should create correct filter options', () => {
      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      expect(result.current.filterOptions?.filteringOptions).toEqual([
        { value: 'tag-1', label: 'Security' },
        { value: 'tag-2', label: 'Compliance' },
        { value: 'tag-3', label: 'Operations' },
        { value: 'null', label: 'Blank' },
      ]);
    });

    it('should export tag names as comma-separated string', () => {
      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      const mockItem: MockRecord = {
        Id: 'test-1',
        tags: mockTags,
      };

      expect(result.current.exportVal?.(mockItem)).toBe('Security,Compliance');
    });
  });

  describe('sorting functionality', () => {
    it('should sort tags alphabetically', () => {
      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      const itemA: MockRecord = {
        Id: 'test-1',
        tags: [
          {
            __typename: 'tag',
            TagTypeId: 'tag-1',
            ParentId: 'parent-1',
            type: {
              __typename: 'tag_type',
              Name: 'Zebra',
              Description: '',
            },
          },
        ],
      };

      const itemB: MockRecord = {
        Id: 'test-2',
        tags: [
          {
            __typename: 'tag',
            TagTypeId: 'tag-2',
            ParentId: 'parent-2',
            type: {
              __typename: 'tag_type',
              Name: 'Apple',
              Description: '',
            },
          },
        ],
      };

      const sortResult = result.current.sortingComparator?.(itemA, itemB);
      expect(sortResult).toBeGreaterThan(0); // 'Zebra' should come after 'Apple'
    });

    it('should sort multiple tags per item correctly', () => {
      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      const itemA: MockRecord = {
        Id: 'test-1',
        tags: [
          {
            __typename: 'tag',
            TagTypeId: 'tag-1',
            ParentId: 'parent-1',
            type: {
              __typename: 'tag_type',
              Name: 'Charlie',
              Description: '',
            },
          },
          {
            __typename: 'tag',
            TagTypeId: 'tag-2',
            ParentId: 'parent-1',
            type: {
              __typename: 'tag_type',
              Name: 'Alpha',
              Description: '',
            },
          },
        ],
      };

      const itemB: MockRecord = {
        Id: 'test-2',
        tags: [
          {
            __typename: 'tag',
            TagTypeId: 'tag-3',
            ParentId: 'parent-2',
            type: {
              __typename: 'tag_type',
              Name: 'Bravo',
              Description: '',
            },
          },
        ],
      };

      const sortResult = result.current.sortingComparator?.(itemA, itemB);
      expect(sortResult).toBeLessThan(0); // "Alpha, Charlie" should come before "Bravo"
    });

    it('should handle items with empty tags', () => {
      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      const itemA: MockRecord = {
        Id: 'test-1',
        tags: [],
      };

      const itemB: MockRecord = {
        Id: 'test-2',
        tags: [
          {
            __typename: 'tag',
            TagTypeId: 'tag-1',
            ParentId: 'parent-1',
            type: {
              __typename: 'tag_type',
              Name: 'Security',
              Description: '',
            },
          },
        ],
      };

      const sortResult = result.current.sortingComparator?.(itemA, itemB);
      expect(sortResult).toBeLessThan(0); // Empty tags should come first
    });

    it('should handle items with null tag types', () => {
      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      const itemA: MockRecord = {
        Id: 'test-1',
        tags: [
          {
            __typename: 'tag',
            TagTypeId: 'tag-1',
            ParentId: 'parent-1',
            type: null,
          },
        ],
      };

      const itemB: MockRecord = {
        Id: 'test-2',
        tags: [
          {
            __typename: 'tag',
            TagTypeId: 'tag-2',
            ParentId: 'parent-1',
            type: {
              __typename: 'tag_type',
              Name: 'Security',
              Description: '',
            },
          },
        ],
      };

      const sortResult = result.current.sortingComparator?.(itemA, itemB);
      expect(sortResult).toBeLessThan(0); // Null types should be filtered out and come first
    });
  });

  describe('error handling', () => {
    it('should handle undefined tags query data', () => {
      mockedUseGetTags.mockReturnValue({
        data: undefined,
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      } as any);

      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      expect(result.current.filterOptions?.filteringOptions).toEqual([
        { value: 'null', label: 'Blank' },
      ]);
    });

    it('should handle undefined tag_type in query data', () => {
      mockedUseGetTags.mockReturnValue({
        data: {
          tag_type: undefined,
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      } as any);

      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      expect(result.current.filterOptions?.filteringOptions).toEqual([
        { value: 'null', label: 'Blank' },
      ]);
    });

    it('should handle loading state', () => {
      mockedUseGetTags.mockReturnValue({
        data: undefined,
        loading: true,
        error: undefined,
        refetch: vi.fn(),
      } as any);

      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      expect(result.current.filterOptions?.filteringOptions).toEqual([
        { value: 'null', label: 'Blank' },
      ]);
    });

    it('should handle error state', () => {
      mockedUseGetTags.mockReturnValue({
        data: undefined,
        loading: false,
        error: new Error('Failed to load tags'),
        refetch: vi.fn(),
      } as any);

      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      expect(result.current.filterOptions?.filteringOptions).toEqual([
        { value: 'null', label: 'Blank' },
      ]);
    });
  });

  describe('export functionality', () => {
    it('should export empty string for items with no tags', () => {
      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      const mockItem: MockRecord = {
        Id: 'test-1',
        tags: [],
      };

      expect(result.current.exportVal?.(mockItem)).toBe('');
    });

    it('should handle tags with null types in export', () => {
      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      const mockItem: MockRecord = {
        Id: 'test-1',
        tags: [
          {
            __typename: 'tag',
            TagTypeId: 'tag-1',
            ParentId: 'parent-1',
            type: {
              __typename: 'tag_type',
              Name: 'Security',
              Description: '',
            },
          },
          {
            __typename: 'tag',
            TagTypeId: 'tag-2',
            ParentId: 'parent-1',
            type: null,
          },
        ],
      };

      expect(result.current.exportVal?.(mockItem)).toBe('Security,');
    });
  });

  describe('filter functionality', () => {
    it('should create filtering properties correctly', () => {
      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      expect(result.current.filterOptions?.filteringProperties).toBeDefined();
      expect(
        result.current.filterOptions?.filteringProperties?.operators
      ).toBeDefined();
      expect(
        result.current.filterOptions?.filteringProperties?.operators?.length
      ).toBeGreaterThan(0);
    });

    it('should include blank option in filtering options', () => {
      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      const options = result.current.filterOptions?.filteringOptions;
      expect(options).toContainEqual({ value: 'null', label: 'Blank' });
    });

    it('should match blank filter for items with no tags', () => {
      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      const operators =
        result.current.filterOptions?.filteringProperties?.operators ?? [];
      const equalsOp = operators.find((op: any) => op.operator === '=') as any;
      const matchFn = equalsOp?.match;

      // Item with no tags should match blank
      expect(matchFn([], 'null')).toBe(true);
      // Item with tags should not match blank
      expect(matchFn([{ TagTypeId: 'tag-1', Name: 'Security' }], 'null')).toBe(
        false
      );
    });

    it('should match not-blank filter for items with tags', () => {
      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      const operators =
        result.current.filterOptions?.filteringProperties?.operators ?? [];
      const notEqualsOp = operators.find(
        (op: any) => op.operator === '!='
      ) as any;
      const matchFn = notEqualsOp?.match;

      // Item with tags should match not-blank
      expect(matchFn([{ TagTypeId: 'tag-1', Name: 'Security' }], 'null')).toBe(
        true
      );
      // Item with no tags should not match not-blank
      expect(matchFn([], 'null')).toBe(false);
    });

    it('should format blank filter value as "Blank"', () => {
      const { result } = renderHook(() => useGetTagFieldConfig(), {
        wrapper: getWrapper([], 'i18n', 'graphql'),
      });

      const operators =
        result.current.filterOptions?.filteringProperties?.operators ?? [];
      const equalsOp = operators.find((op: any) => op.operator === '=') as any;
      const formatFn = equalsOp?.format;

      expect(formatFn('null')).toBe('Blank');
    });
  });
});
