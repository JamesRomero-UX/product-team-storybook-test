import { GetUsersDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { renderHook, waitFor } from '@testing-library/react';
import { getWrapper } from 'src/testing/wrapper';
import type { Mock } from 'vitest';
import { vi } from 'vitest';

// Import the mocked functions
import { buildUser } from '@/components/form/controlled-group-and-user-select/userBuilder';
import { useGetDepartments } from '@/hooks/queries';

import type { Dataset, TableRecord } from '../types';
import { getCustomAttributeDataForRecord } from '../utils/customAttributes';
import type { TableFieldsWithCustomAttributes } from './useAddCustomAttributeFieldData';
import { useAddCustomAttributeFieldData } from './useAddCustomAttributeFieldData';

// Mock the useGetDepartments hook
vi.mock('@/hooks/queries', () => ({
  useGetDepartments: vi.fn(),
}));

// Mock the getCustomAttributeDataForRecord utility
vi.mock('../utils/customAttributes', () => ({
  getCustomAttributeDataForRecord: vi.fn(),
}));

// Mock table record type for testing
interface TestTableRecord extends TableRecord {
  id: string;
  name: string;
  email: string;
  CustomAttributeData: Record<string, unknown>;
}

describe('useAddCustomAttributeFieldData', () => {
  const mockTableFields: TableFieldsWithCustomAttributes<TestTableRecord> = {
    id: {
      header: 'ID',
      sortingField: 'id',
      custom: false,
    },
    name: {
      header: 'Name',
      sortingField: 'name',
      custom: false,
    },
    email: {
      header: 'Email',
      sortingField: 'email',
      custom: false,
    },
    custom_field_1: {
      header: 'Custom Field 1',
      sortingField: 'custom_field_1',
      custom: true,
      customFieldValue: vi.fn(),
    },
  };

  const mockDataset: Dataset<TestTableRecord> = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      CustomAttributeData: { custom_field_1: 'value1' },
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      CustomAttributeData: { custom_field_1: 'value2' },
    },
  ];

  const mockUsersData = {
    user: [
      buildUser({ Id: 'user-1', FriendlyName: 'John Doe' }),
      buildUser({ Id: 'user-2', FriendlyName: 'Jane Smith' }),
    ],
  };

  const mockDepartmentsData = {
    department_type: [
      {
        DepartmentTypeId: 'dept-1',
        Name: 'Engineering',
      },
      {
        DepartmentTypeId: 'dept-2',
        Name: 'Marketing',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useGetDepartments
    (useGetDepartments as Mock).mockReturnValue({
      data: mockDepartmentsData,
    });
  });

  it('should return enhanced dataset with custom attribute data', async () => {
    const getUsersMock = {
      request: {
        query: GetUsersDocument,
      },
      result: {
        data: mockUsersData,
      },
    };

    const { result } = renderHook(
      () =>
        useAddCustomAttributeFieldData({
          data: mockDataset,
          tableFields: mockTableFields,
        }),
      { wrapper: getWrapper([getUsersMock], 'graphql') }
    );

    await waitFor(() => {
      expect(result.current).toEqual([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          CustomAttributeData: { custom_field_1: 'value1' },
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          CustomAttributeData: { custom_field_1: 'value2' },
        },
      ]);
    });
  });

  it('should handle undefined data gracefully', () => {
    const getUsersMock = {
      request: {
        query: GetUsersDocument,
      },
      result: {
        data: mockUsersData,
      },
    };

    const { result } = renderHook(
      () =>
        useAddCustomAttributeFieldData({
          data: undefined,
          tableFields: mockTableFields,
        }),
      { wrapper: getWrapper([getUsersMock], 'graphql') }
    );

    expect(result.current).toEqual([]);
  });

  it('should handle empty dataset', () => {
    const getUsersMock = {
      request: {
        query: GetUsersDocument,
      },
      result: {
        data: mockUsersData,
      },
    };

    const { result } = renderHook(
      () =>
        useAddCustomAttributeFieldData({
          data: [],
          tableFields: mockTableFields,
        }),
      { wrapper: getWrapper([getUsersMock], 'graphql') }
    );

    expect(result.current).toEqual([]);
  });

  it('should pass correct lookups to getCustomAttributeDataForRecord', async () => {
    const getUsersMock = {
      request: {
        query: GetUsersDocument,
      },
      result: {
        data: mockUsersData,
      },
    };

    renderHook(
      () =>
        useAddCustomAttributeFieldData({
          data: mockDataset,
          tableFields: mockTableFields,
        }),
      {
        wrapper: getWrapper([getUsersMock], 'graphql'),
      }
    );

    await waitFor(() => {
      for (const record of mockDataset) {
        expect(getCustomAttributeDataForRecord).toHaveBeenCalledWith(
          mockTableFields,
          record,
          {
            userLookup: {
              'user-1': 'John Doe',
              'user-2': 'Jane Smith',
            },
            departmentTypeLookup: {
              'dept-1': 'Engineering',
              'dept-2': 'Marketing',
            },
          }
        );
      }
    });
  });

  it('should create department lookup correctly', async () => {
    const getUsersMock = {
      request: {
        query: GetUsersDocument,
      },
      result: {
        data: mockUsersData,
      },
    };

    // Mock departments with some invalid entries
    (useGetDepartments as Mock).mockReturnValue({
      data: {
        department_type: [
          {
            DepartmentTypeId: 'dept-1',
            Name: 'Engineering',
          },
          {
            DepartmentTypeId: null, // Should be filtered out
            Name: 'Invalid Dept',
          },
          {
            DepartmentTypeId: 'dept-3',
            Name: null, // Should be filtered out
          },
          {
            DepartmentTypeId: 'dept-4',
            Name: 'Valid Department',
          },
        ],
      },
    });

    renderHook(
      () =>
        useAddCustomAttributeFieldData({
          data: mockDataset,
          tableFields: mockTableFields,
        }),
      { wrapper: getWrapper([getUsersMock], 'graphql') }
    );

    await waitFor(() => {
      expect(getCustomAttributeDataForRecord).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          departmentTypeLookup: {
            'dept-1': 'Engineering',
            'dept-4': 'Valid Department',
          },
        })
      );
    });
  });

  it('should handle missing user data', () => {
    const getUsersMock = {
      request: {
        query: GetUsersDocument,
      },
      result: {
        data: null,
      },
    };

    renderHook(
      () =>
        useAddCustomAttributeFieldData({
          data: mockDataset,
          tableFields: mockTableFields,
        }),
      { wrapper: getWrapper([getUsersMock], 'graphql') }
    );

    expect(getCustomAttributeDataForRecord).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        userLookup: undefined,
      })
    );
  });

  it('should handle missing department data', () => {
    const getUsersMock = {
      request: {
        query: GetUsersDocument,
      },
      result: {
        data: mockUsersData,
      },
    };

    // Mock missing department data
    (useGetDepartments as Mock).mockReturnValue({
      data: null,
    });

    renderHook(
      () =>
        useAddCustomAttributeFieldData({
          data: mockDataset,
          tableFields: mockTableFields,
        }),
      { wrapper: getWrapper([getUsersMock], 'graphql') }
    );

    expect(getCustomAttributeDataForRecord).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        departmentTypeLookup: undefined,
      })
    );
  });

  it('should handle GraphQL query errors gracefully', () => {
    const getUsersMock = {
      request: {
        query: GetUsersDocument,
      },
      error: new Error('GraphQL Error'),
    };

    const { result } = renderHook(
      () =>
        useAddCustomAttributeFieldData({
          data: mockDataset,
          tableFields: mockTableFields,
        }),
      { wrapper: getWrapper([getUsersMock], 'graphql') }
    );

    // Should still process data even if GraphQL fails
    expect(result.current).toHaveLength(2);
    expect(getCustomAttributeDataForRecord).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        userLookup: undefined,
      })
    );
  });

  describe('Memoization', () => {
    it('should memoize result when inputs do not change', () => {
      const getUsersMock = {
        request: {
          query: GetUsersDocument,
        },
        result: {
          data: mockUsersData,
        },
      };

      const { result, rerender } = renderHook(
        () =>
          useAddCustomAttributeFieldData({
            data: mockDataset,
            tableFields: mockTableFields,
          }),
        { wrapper: getWrapper([getUsersMock], 'graphql') }
      );

      const firstResult = result.current;

      rerender();

      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it('should recalculate when data changes', () => {
      const getUsersMock = {
        request: {
          query: GetUsersDocument,
        },
        result: {
          data: mockUsersData,
        },
      };

      const { result, rerender } = renderHook(
        ({ data }) =>
          useAddCustomAttributeFieldData({
            data,
            tableFields: mockTableFields,
          }),
        {
          wrapper: getWrapper([getUsersMock], 'graphql'),
          initialProps: { data: mockDataset },
        }
      );

      const firstResult = result.current;

      const newData = [
        ...mockDataset,
        {
          id: '3',
          name: 'New User',
          email: 'new@example.com',
          CustomAttributeData: {},
        },
      ];

      rerender({ data: newData });

      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
      expect(secondResult).toHaveLength(3);
    });

    it('should recalculate when tableFields change', () => {
      const getUsersMock = {
        request: {
          query: GetUsersDocument,
        },
        result: {
          data: mockUsersData,
        },
      };

      const { result, rerender } = renderHook(
        ({ tableFields }) =>
          useAddCustomAttributeFieldData({
            data: mockDataset,
            tableFields,
          }),
        {
          wrapper: getWrapper([getUsersMock], 'graphql'),
          initialProps: { tableFields: mockTableFields },
        }
      );

      const firstResult = result.current;

      const newTableFields: TableFieldsWithCustomAttributes<TestTableRecord> = {
        id: {
          header: 'ID',
          sortingField: 'id',
          custom: false,
        },
        name: {
          header: 'Name',
          sortingField: 'name',
          custom: false,
        },
        email: {
          header: 'Email',
          sortingField: 'email',
          custom: false,
        },
        custom_field_1: {
          header: 'Custom Field 1',
          sortingField: 'custom_field_1',
          custom: true,
          customFieldValue: vi.fn(),
        },
        custom_field_2: {
          header: 'Custom Field 2',
          sortingField: 'custom_field_2',
          custom: true,
          customFieldValue: vi.fn(),
        },
      };

      rerender({ tableFields: newTableFields });

      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
    });

    it('should recalculate when user lookup changes', () => {
      const getUsersMock1 = {
        request: {
          query: GetUsersDocument,
        },
        result: {
          data: mockUsersData,
        },
      };

      const getUsersMock2 = {
        request: {
          query: GetUsersDocument,
        },
        result: {
          data: {
            user: [
              {
                Id: 'user-3',
                FriendlyName: 'Different User',
              },
            ],
          },
        },
      };

      const wrapper1 = getWrapper([getUsersMock1], 'graphql');
      const wrapper2 = getWrapper([getUsersMock2], 'graphql');

      const { result: result1 } = renderHook(
        () =>
          useAddCustomAttributeFieldData({
            data: mockDataset,
            tableFields: mockTableFields,
          }),
        { wrapper: wrapper1 }
      );

      const { result: result2 } = renderHook(
        () =>
          useAddCustomAttributeFieldData({
            data: mockDataset,
            tableFields: mockTableFields,
          }),
        { wrapper: wrapper2 }
      );

      expect(result1.current).not.toBe(result2.current);
    });
  });

  describe('Type safety', () => {
    it('should work with different table record types', () => {
      interface DifferentRecord extends TableRecord {
        userId: number;
        username: string;
        CustomAttributeData: Record<string, unknown>;
      }

      const differentFields: TableFieldsWithCustomAttributes<DifferentRecord> =
        {
          userId: {
            header: 'User ID',
            sortingField: 'userId',
            custom: false,
          },
          username: {
            header: 'Username',
            sortingField: 'username',
            custom: false,
          },
          customField: {
            header: 'Custom Field',
            sortingField: 'customField',
            custom: true,
            customFieldValue: vi.fn(),
          },
        };

      const differentData: Dataset<DifferentRecord> = [
        {
          userId: 1,
          username: 'testuser',
          CustomAttributeData: {},
        },
      ];

      const getUsersMock = {
        request: {
          query: GetUsersDocument,
        },
        result: {
          data: mockUsersData,
        },
      };

      const { result } = renderHook(
        () =>
          useAddCustomAttributeFieldData({
            data: differentData,
            tableFields: differentFields,
          }),
        { wrapper: getWrapper([getUsersMock], 'graphql') }
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toHaveProperty('userId', 1);
      expect(result.current[0]).toHaveProperty('username', 'testuser');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty user and department arrays', async () => {
      const getUsersMock = {
        request: {
          query: GetUsersDocument,
        },
        result: {
          data: {
            user: [],
          },
        },
      };

      (useGetDepartments as Mock).mockReturnValue({
        data: {
          department_type: [],
        },
      });

      renderHook(
        () =>
          useAddCustomAttributeFieldData({
            data: mockDataset,
            tableFields: mockTableFields,
          }),
        { wrapper: getWrapper([getUsersMock], 'graphql') }
      );

      await waitFor(() => {
        expect(getCustomAttributeDataForRecord).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          {
            userLookup: {},
            departmentTypeLookup: {},
          }
        );
      });
    });

    it('should handle records without CustomAttributeData', () => {
      const dataWithoutCustomData = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      ] as Dataset<TestTableRecord>;

      const getUsersMock = {
        request: {
          query: GetUsersDocument,
        },
        result: {
          data: mockUsersData,
        },
      };

      const { result } = renderHook(
        () =>
          useAddCustomAttributeFieldData({
            data: dataWithoutCustomData,
            tableFields: mockTableFields,
          }),
        { wrapper: getWrapper([getUsersMock], 'graphql') }
      );

      expect(result.current).toHaveLength(1);
      expect(getCustomAttributeDataForRecord).toHaveBeenCalledWith(
        mockTableFields,
        dataWithoutCustomData[0],
        expect.any(Object)
      );
    });
  });
});
