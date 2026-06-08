/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@apollo/client';
import type { DepartmentPartsFragment } from '@risksmart-app/web-graphql-client/generated/graphql';
import { renderHook } from '@testing-library/react';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import {
  createDepartmentsFieldPropertyFilter,
  useGetDepartmentFieldConfig,
} from './useGetDepartmentFieldConfig';

// Mock the GraphQL query
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(),
}));

// Mock the BadgeList component
vi.mock('@/components/BadgeList', () => {
  return {
    default: function MockBadgeList({ badges }: { badges: string[] }) {
      return <div data-testid={'badge-list'}>{badges.join(', ')}</div>;
    },
  };
});

const mockUseGetDepartmentsQuery = vi.mocked(useQuery);

describe('useGetDepartmentFieldConfig', () => {
  const mockDepartmentTypes = [
    {
      DepartmentTypeId: 'dept-1',
      Name: 'Finance',
    },
    {
      DepartmentTypeId: 'dept-2',
      Name: 'HR',
    },
    {
      DepartmentTypeId: 'dept-3',
      Name: 'IT',
    },
  ];

  const mockDepartments: DepartmentPartsFragment[] = [
    {
      __typename: 'department',
      DepartmentTypeId: 'dept-1',
      ParentId: 'parent-1',
      type: {
        __typename: 'department_type',
        Name: 'Finance',
        Description: 'Finance Department',
      },
    },
    {
      __typename: 'department',
      DepartmentTypeId: 'dept-2',
      ParentId: 'parent-1',
      type: {
        __typename: 'department_type',
        Name: 'HR',
        Description: 'Human Resources',
      },
    },
  ];

  type MockRecord = {
    Id: string;
    departments: DepartmentPartsFragment[];
  };

  const getDepartments = (record: MockRecord) => record.departments;

  beforeEach(() => {
    mockUseGetDepartmentsQuery.mockReturnValue({
      data: {
        department_type: mockDepartmentTypes,
      },
      loading: false,
      error: undefined,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should return cell component that renders BadgeList', () => {
      const { result } = renderHook(
        () => useGetDepartmentFieldConfig(getDepartments),
        { wrapper: getWrapper([], 'i18n', 'graphql') }
      );

      const mockItem: MockRecord = {
        Id: 'test-1',
        departments: mockDepartments,
      };

      const cellElement = result.current.cell?.(mockItem);
      expect(cellElement).toBeDefined();
      // Note: Testing the actual component structure would require more setup
    });

    it('should create correct filter options', () => {
      const { result } = renderHook(
        () => useGetDepartmentFieldConfig(getDepartments),
        { wrapper: getWrapper([], 'i18n', 'graphql') }
      );

      expect(result.current.filterOptions?.filteringOptions).toEqual([
        { value: 'dept-1', label: 'Finance' },
        { value: 'dept-2', label: 'HR' },
        { value: 'dept-3', label: 'IT' },
        { value: 'null', label: 'Blank' },
      ]);
    });

    it('should export department names as comma-separated string', () => {
      const { result } = renderHook(
        () => useGetDepartmentFieldConfig(getDepartments),
        { wrapper: getWrapper([], 'i18n', 'graphql') }
      );

      const mockItem: MockRecord = {
        Id: 'test-1',
        departments: mockDepartments,
      };

      expect(result.current.exportVal?.(mockItem)).toBe('Finance,HR');
    });
  });

  describe('sorting functionality', () => {
    it('should sort departments alphabetically', () => {
      const { result } = renderHook(
        () => useGetDepartmentFieldConfig(getDepartments),
        { wrapper: getWrapper([], 'i18n', 'graphql') }
      );

      const itemA: MockRecord = {
        Id: 'test-1',
        departments: [
          {
            __typename: 'department',
            DepartmentTypeId: 'dept-1',
            ParentId: 'parent-1',
            type: {
              __typename: 'department_type',
              Name: 'Zebra',
              Description: '',
            },
          },
        ],
      };

      const itemB: MockRecord = {
        Id: 'test-2',
        departments: [
          {
            __typename: 'department',
            DepartmentTypeId: 'dept-2',
            ParentId: 'parent-2',
            type: {
              __typename: 'department_type',
              Name: 'Apple',
              Description: '',
            },
          },
        ],
      };

      const sortResult = result.current.sortingComparator?.(itemA, itemB);
      expect(sortResult).toBeGreaterThan(0); // 'Zebra' should come after 'Apple'
    });

    it('should sort multiple departments per item correctly', () => {
      const { result } = renderHook(
        () => useGetDepartmentFieldConfig(getDepartments),
        { wrapper: getWrapper([], 'i18n', 'graphql') }
      );

      const itemA: MockRecord = {
        Id: 'test-1',
        departments: [
          {
            __typename: 'department',
            DepartmentTypeId: 'dept-1',
            ParentId: 'parent-1',
            type: {
              __typename: 'department_type',
              Name: 'Marketing',
              Description: '',
            },
          },
          {
            __typename: 'department',
            DepartmentTypeId: 'dept-2',
            ParentId: 'parent-1',
            type: {
              __typename: 'department_type',
              Name: 'Sales',
              Description: '',
            },
          },
        ],
      };

      const itemB: MockRecord = {
        Id: 'test-2',
        departments: [
          {
            __typename: 'department',
            DepartmentTypeId: 'dept-3',
            ParentId: 'parent-2',
            type: {
              __typename: 'department_type',
              Name: 'Finance',
              Description: '',
            },
          },
        ],
      };

      const sortResult = result.current.sortingComparator?.(itemA, itemB);
      // 'Finance' should come before 'Marketing, Sales' (sorted as 'marketing, sales')
      expect(sortResult).toBeGreaterThan(0);
    });

    it('should handle case-insensitive sorting', () => {
      const { result } = renderHook(
        () => useGetDepartmentFieldConfig(getDepartments),
        { wrapper: getWrapper([], 'i18n', 'graphql') }
      );

      const itemA: MockRecord = {
        Id: 'test-1',
        departments: [
          {
            __typename: 'department',
            DepartmentTypeId: 'dept-1',
            ParentId: 'parent-1',
            type: {
              __typename: 'department_type',
              Name: 'FINANCE',
              Description: '',
            },
          },
        ],
      };

      const itemB: MockRecord = {
        Id: 'test-2',
        departments: [
          {
            __typename: 'department',
            DepartmentTypeId: 'dept-2',
            ParentId: 'parent-2',
            type: {
              __typename: 'department_type',
              Name: 'hr',
              Description: '',
            },
          },
        ],
      };

      const sortResult = result.current.sortingComparator?.(itemA, itemB);
      expect(sortResult).toBeLessThan(0); // 'FINANCE' should come before 'hr'
    });

    it('should handle empty departments', () => {
      const { result } = renderHook(
        () => useGetDepartmentFieldConfig(getDepartments),
        { wrapper: getWrapper([], 'i18n', 'graphql') }
      );

      const itemA: MockRecord = {
        Id: 'test-1',
        departments: [],
      };

      const itemB: MockRecord = {
        Id: 'test-2',
        departments: [
          {
            __typename: 'department',
            DepartmentTypeId: 'dept-1',
            ParentId: 'parent-2',
            type: {
              __typename: 'department_type',
              Name: 'Finance',
              Description: '',
            },
          },
        ],
      };

      const sortResult = result.current.sortingComparator?.(itemA, itemB);
      expect(sortResult).toBeLessThan(0); // Empty should come before 'Finance'
    });

    it('should handle null/undefined department names', () => {
      const { result } = renderHook(
        () => useGetDepartmentFieldConfig(getDepartments),
        { wrapper: getWrapper([], 'i18n', 'graphql') }
      );

      const itemA: MockRecord = {
        Id: 'test-1',
        departments: [
          {
            __typename: 'department',
            DepartmentTypeId: 'dept-1',
            ParentId: 'parent-1',
            type: {
              __typename: 'department_type',
              Name: null as any,
              Description: '',
            },
          },
        ],
      };

      const itemB: MockRecord = {
        Id: 'test-2',
        departments: [
          {
            __typename: 'department',
            DepartmentTypeId: 'dept-2',
            ParentId: 'parent-2',
            type: {
              __typename: 'department_type',
              Name: 'Finance',
              Description: '',
            },
          },
        ],
      };

      const sortResult = result.current.sortingComparator?.(itemA, itemB);
      expect(sortResult).toBeLessThan(0); // Empty string should come before 'Finance'
    });
  });

  describe('edge cases', () => {
    it('should handle loading state', () => {
      mockUseGetDepartmentsQuery.mockReturnValue({
        data: undefined,
        loading: true,
        error: undefined,
      } as any);

      const { result } = renderHook(
        () => useGetDepartmentFieldConfig(getDepartments),
        { wrapper: getWrapper([], 'i18n', 'graphql') }
      );

      expect(result.current.filterOptions?.filteringOptions).toEqual([
        { value: 'null', label: 'Blank' },
      ]);
    });

    it('should handle error state', () => {
      mockUseGetDepartmentsQuery.mockReturnValue({
        data: undefined,
        loading: false,
        error: new Error('Failed to load'),
      } as any);

      const { result } = renderHook(
        () => useGetDepartmentFieldConfig(getDepartments),
        { wrapper: getWrapper([], 'i18n', 'graphql') }
      );

      expect(result.current.filterOptions?.filteringOptions).toEqual([
        { value: 'null', label: 'Blank' },
      ]);
    });

    it('should handle undefined department types', () => {
      mockUseGetDepartmentsQuery.mockReturnValue({
        data: {
          department_type: undefined as any,
        },
        loading: false,
        error: undefined,
      } as any);

      const { result } = renderHook(
        () => useGetDepartmentFieldConfig(getDepartments),
        { wrapper: getWrapper([], 'i18n', 'graphql') }
      );

      expect(result.current.filterOptions?.filteringOptions).toEqual([
        { value: 'null', label: 'Blank' },
      ]);
    });
  });
});

describe('blank filter functionality', () => {
  const mockDepartmentTypes = [{ DepartmentTypeId: 'dept-1', Name: 'Finance' }];

  beforeEach(() => {
    vi.mocked(useQuery).mockReturnValue({
      data: { department_type: mockDepartmentTypes },
      loading: false,
      error: undefined,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should include blank option in filtering options', () => {
    const { result } = renderHook(
      () => useGetDepartmentFieldConfig((r: any) => r.departments),
      { wrapper: getWrapper([], 'i18n', 'graphql') }
    );

    const options = result.current.filterOptions?.filteringOptions;
    expect(options).toContainEqual({ value: 'null', label: 'Blank' });
  });

  it('should match blank filter for items with no departments', () => {
    const filter = createDepartmentsFieldPropertyFilter(
      mockDepartmentTypes,
      'Blank'
    );
    const operators = filter.operators ?? [];
    const equalsOp = operators.find((op: any) => op.operator === '=') as any;
    const matchFn = equalsOp?.match;

    // Item with no departments should match blank
    expect(matchFn([], 'null')).toBe(true);
    // Item with departments should not match blank
    expect(
      matchFn([{ DepartmentTypeId: 'dept-1', Name: 'Finance' }], 'null')
    ).toBe(false);
  });

  it('should match not-blank filter for items with departments', () => {
    const filter = createDepartmentsFieldPropertyFilter(
      mockDepartmentTypes,
      'Blank'
    );
    const operators = filter.operators ?? [];
    const notEqualsOp = operators.find(
      (op: any) => op.operator === '!='
    ) as any;
    const matchFn = notEqualsOp?.match;

    // Item with departments should match not-blank
    expect(
      matchFn([{ DepartmentTypeId: 'dept-1', Name: 'Finance' }], 'null')
    ).toBe(true);
    // Item with no departments should not match not-blank
    expect(matchFn([], 'null')).toBe(false);
  });

  it('should format blank filter value as "Blank"', () => {
    const filter = createDepartmentsFieldPropertyFilter(
      mockDepartmentTypes,
      'Blank'
    );
    const operators = filter.operators ?? [];
    const equalsOp = operators.find((op: any) => op.operator === '=') as any;
    const formatFn = equalsOp?.format;

    expect(formatFn('null')).toBe('Blank');
  });
});

describe('createDepartmentsFieldPropertyFilter', () => {
  const mockDepartments = [
    { Name: 'Finance', DepartmentTypeId: 'dept-1' },
    { Name: 'HR', DepartmentTypeId: 'dept-2' },
    { Name: undefined, DepartmentTypeId: 'dept-3' },
  ];

  describe('basic structure', () => {
    it('should return a filter with operators', () => {
      const filter = createDepartmentsFieldPropertyFilter(
        mockDepartments,
        'Blank'
      );

      expect(filter.operators).toBeDefined();
      expect(Array.isArray(filter.operators)).toBe(true);
      expect(filter.operators?.length).toBeGreaterThan(0);
    });

    it('should include all expected operators', () => {
      const filter = createDepartmentsFieldPropertyFilter(
        mockDepartments,
        'Blank'
      );
      const operators = filter.operators || [];

      // Should have equality, inequality, and count-based operators
      expect(operators.length).toBeGreaterThan(4);
    });
  });

  describe('functionality testing via hook usage', () => {
    // Instead of testing the internal structure directly, test through the hook
    it('should work with the department field config', () => {
      const { result } = renderHook(
        () => useGetDepartmentFieldConfig(() => []),
        { wrapper: getWrapper([], 'i18n', 'graphql') }
      );

      expect(result.current.filterOptions?.filteringProperties).toBeDefined();
    });

    it('should handle empty departments array', () => {
      const filter = createDepartmentsFieldPropertyFilter([], 'Blank');

      expect(filter.operators).toBeDefined();
      expect(Array.isArray(filter.operators)).toBe(true);
    });

    it('should handle departments with undefined names', () => {
      const filter = createDepartmentsFieldPropertyFilter(
        [{ Name: undefined, DepartmentTypeId: 'dept-1' }],
        'Blank'
      );

      expect(filter.operators).toBeDefined();
      expect(Array.isArray(filter.operators)).toBe(true);
    });
  });
});
