import { renderHook } from '@testing-library/react';
import type { CustomAttributeSchema } from 'src/components/form/custom-attributes/CustomAttributeSchema';
import type { Mock } from 'vitest';
import { vi } from 'vitest';

import type { TableFields, TableRecord } from '../types';
import { useAddCustomAttributeFieldDefinitions } from './useAddCustomAttributeFieldDefinitions';

// Mock the convertSchemasToFieldConfigs utility
vi.mock('../utils/customAttributes', () => ({
  convertSchemasToFieldConfigs: vi.fn(),
}));

// Import the mocked function to use in tests
import { convertSchemasToFieldConfigs } from '../utils/customAttributes';

// Mock table record type for testing
interface TestTableRecord extends TableRecord {
  id: string;
  name: string;
  email: string;
  status: string;
}

describe('useAddCustomAttributeFieldDefinitions', () => {
  const mockTableFields: TableFields<TestTableRecord> = {
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
    status: {
      header: 'Status',
      sortingField: 'status',
      custom: false,
    },
  };

  const mockCustomAttributeSchema: CustomAttributeSchema = {
    Id: 'test-schema-id',
    Schema: {
      type: 'object',
      properties: {
        custom_field_1: {
          type: 'string',
          title: 'Custom Field 1',
        },
        custom_field_2: {
          type: 'string',
          title: 'Custom Field 2',
        },
      },
    },
    UiSchema: {
      type: 'VerticalLayout',
      elements: [
        {
          type: 'Control',
          label: 'Custom Field 1',
          scope: '#/properties/custom_field_1',
        },
        {
          type: 'Control',
          label: 'Custom Field 2',
          scope: '#/properties/custom_field_2',
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    (convertSchemasToFieldConfigs as Mock).mockReturnValue({
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
    });
  });

  it('should merge custom fields with existing table fields', () => {
    const { result } = renderHook(() =>
      useAddCustomAttributeFieldDefinitions({
        customAttributeSchema: mockCustomAttributeSchema,
        fields: mockTableFields,
        enableRelativeDates: false,
      })
    );

    expect(result.current).toEqual({
      // Original fields
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
      status: {
        header: 'Status',
        sortingField: 'status',
        custom: false,
      },
      // Custom fields
      custom_field_1: {
        header: 'Custom Field 1',
        sortingField: 'custom_field_1',
        custom: true,
        customFieldValue: expect.any(Function),
      },
      custom_field_2: {
        header: 'Custom Field 2',
        sortingField: 'custom_field_2',
        custom: true,
        customFieldValue: expect.any(Function),
      },
    });
  });

  it('should handle null customAttributeSchema', () => {
    (convertSchemasToFieldConfigs as Mock).mockReturnValue({});

    const { result } = renderHook(() =>
      useAddCustomAttributeFieldDefinitions({
        customAttributeSchema: null,
        fields: mockTableFields,
        enableRelativeDates: false,
      })
    );

    expect(convertSchemasToFieldConfigs).toHaveBeenCalledWith({
      customAttributeSchemas: [],
      enableRelativeDates: false,
    });

    expect(result.current).toEqual(mockTableFields);
  });

  it('should handle single customAttributeSchema object', () => {
    const { result } = renderHook(() =>
      useAddCustomAttributeFieldDefinitions({
        customAttributeSchema: mockCustomAttributeSchema,
        fields: mockTableFields,
        enableRelativeDates: true,
      })
    );

    expect(convertSchemasToFieldConfigs).toHaveBeenCalledWith({
      customAttributeSchemas: [mockCustomAttributeSchema],
      enableRelativeDates: true,
    });

    expect(result.current).toHaveProperty('custom_field_1');
    expect(result.current).toHaveProperty('custom_field_2');
  });

  it('should handle array of customAttributeSchemas', () => {
    const secondSchema: CustomAttributeSchema = {
      Id: 'second-schema-id',
      Schema: {
        type: 'object',
        properties: {
          another_custom_field: {
            type: 'string',
            title: 'Another Custom Field',
          },
        },
      },
      UiSchema: {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Control',
            label: 'Another Custom Field',
            scope: '#/properties/another_custom_field',
          },
        ],
      },
    };

    (convertSchemasToFieldConfigs as Mock).mockReturnValue({
      custom_field_1: {
        header: 'Custom Field 1',
        sortingField: 'custom_field_1',
        custom: true,
        customFieldValue: vi.fn(),
      },
      another_custom_field: {
        header: 'Another Custom Field',
        sortingField: 'another_custom_field',
        custom: true,
        customFieldValue: vi.fn(),
      },
    });

    const { result } = renderHook(() =>
      useAddCustomAttributeFieldDefinitions({
        customAttributeSchema: [mockCustomAttributeSchema, secondSchema],
        fields: mockTableFields,
        enableRelativeDates: false,
      })
    );

    expect(convertSchemasToFieldConfigs).toHaveBeenCalledWith({
      customAttributeSchemas: [mockCustomAttributeSchema, secondSchema],
      enableRelativeDates: false,
    });

    expect(result.current).toHaveProperty('custom_field_1');
    expect(result.current).toHaveProperty('another_custom_field');
  });

  it('should pass enableRelativeDates parameter correctly', () => {
    renderHook(() =>
      useAddCustomAttributeFieldDefinitions({
        customAttributeSchema: mockCustomAttributeSchema,
        fields: mockTableFields,
        enableRelativeDates: true,
      })
    );

    expect(convertSchemasToFieldConfigs).toHaveBeenCalledWith({
      customAttributeSchemas: [mockCustomAttributeSchema],
      enableRelativeDates: true,
    });

    renderHook(() =>
      useAddCustomAttributeFieldDefinitions({
        customAttributeSchema: mockCustomAttributeSchema,
        fields: mockTableFields,
        enableRelativeDates: false,
      })
    );

    expect(convertSchemasToFieldConfigs).toHaveBeenCalledWith({
      customAttributeSchemas: [mockCustomAttributeSchema],
      enableRelativeDates: false,
    });
  });

  it('should handle empty fields object', () => {
    const emptyFields: TableFields<TestTableRecord> = {};

    const { result } = renderHook(() =>
      useAddCustomAttributeFieldDefinitions({
        customAttributeSchema: mockCustomAttributeSchema,
        fields: emptyFields,
        enableRelativeDates: false,
      })
    );

    expect(result.current).toEqual({
      custom_field_1: {
        header: 'Custom Field 1',
        sortingField: 'custom_field_1',
        custom: true,
        customFieldValue: expect.any(Function),
      },
      custom_field_2: {
        header: 'Custom Field 2',
        sortingField: 'custom_field_2',
        custom: true,
        customFieldValue: expect.any(Function),
      },
    });
  });

  it('should handle empty custom attribute schemas', () => {
    (convertSchemasToFieldConfigs as Mock).mockReturnValue({});

    const { result } = renderHook(() =>
      useAddCustomAttributeFieldDefinitions({
        customAttributeSchema: [],
        fields: mockTableFields,
        enableRelativeDates: false,
      })
    );

    expect(convertSchemasToFieldConfigs).toHaveBeenCalledWith({
      customAttributeSchemas: [],
      enableRelativeDates: false,
    });

    expect(result.current).toEqual(mockTableFields);
  });

  it('should override existing fields if custom fields have same keys', () => {
    // Mock custom fields that have same keys as existing fields
    (convertSchemasToFieldConfigs as Mock).mockReturnValue({
      name: {
        header: 'Custom Name Field',
        sortingField: 'name',
        custom: true,
        customFieldValue: vi.fn(),
      },
      custom_field_1: {
        header: 'Custom Field 1',
        sortingField: 'custom_field_1',
        custom: true,
        customFieldValue: vi.fn(),
      },
    });

    const { result } = renderHook(() =>
      useAddCustomAttributeFieldDefinitions({
        customAttributeSchema: mockCustomAttributeSchema,
        fields: mockTableFields,
        enableRelativeDates: false,
      })
    );

    expect(result.current.name).toEqual({
      header: 'Custom Name Field',
      sortingField: 'name',
      custom: true,
      customFieldValue: expect.any(Function),
    });

    expect(result.current.custom_field_1).toEqual({
      header: 'Custom Field 1',
      sortingField: 'custom_field_1',
      custom: true,
      customFieldValue: expect.any(Function),
    });
  });

  describe('Memoization', () => {
    it('should memoize result when inputs do not change', () => {
      const { result, rerender } = renderHook(() =>
        useAddCustomAttributeFieldDefinitions({
          customAttributeSchema: mockCustomAttributeSchema,
          fields: mockTableFields,
          enableRelativeDates: false,
        })
      );

      const firstResult = result.current;

      rerender();

      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it('should recalculate when customAttributeSchema changes', () => {
      const { result, rerender } = renderHook(
        ({ schema }) =>
          useAddCustomAttributeFieldDefinitions({
            customAttributeSchema: schema,
            fields: mockTableFields,
            enableRelativeDates: false,
          }),
        {
          initialProps: { schema: mockCustomAttributeSchema },
        }
      );

      const firstResult = result.current;

      const newSchema: CustomAttributeSchema = {
        ...mockCustomAttributeSchema,
        Id: 'different-id',
      };

      rerender({ schema: newSchema });

      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
    });

    it('should recalculate when enableRelativeDates changes', () => {
      const { result, rerender } = renderHook(
        ({ enableRelativeDates }) =>
          useAddCustomAttributeFieldDefinitions({
            customAttributeSchema: mockCustomAttributeSchema,
            fields: mockTableFields,
            enableRelativeDates,
          }),
        {
          initialProps: { enableRelativeDates: false },
        }
      );

      const firstResult = result.current;

      rerender({ enableRelativeDates: true });

      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
    });

    it('should recalculate when fields change', () => {
      const { result, rerender } = renderHook(
        ({ fields }) =>
          useAddCustomAttributeFieldDefinitions({
            customAttributeSchema: mockCustomAttributeSchema,
            fields,
            enableRelativeDates: false,
          }),
        {
          initialProps: { fields: mockTableFields },
        }
      );

      const firstResult = result.current;

      const newFields: TableFields<TestTableRecord> = {
        ...mockTableFields,
        newField: {
          header: 'New Field',
          sortingField: 'newField',
          custom: false,
        },
      };

      rerender({ fields: newFields });

      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
      expect(secondResult).toHaveProperty('newField');
    });
  });

  describe('Type safety', () => {
    it('should work with different table record types', () => {
      interface DifferentRecord extends TableRecord {
        userId: number;
        username: string;
        active: boolean;
      }

      const differentFields: TableFields<DifferentRecord> = {
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
        active: {
          header: 'Active',
          sortingField: 'active',
          custom: false,
        },
      };

      const { result } = renderHook(() =>
        useAddCustomAttributeFieldDefinitions({
          customAttributeSchema: mockCustomAttributeSchema,
          fields: differentFields,
          enableRelativeDates: false,
        })
      );

      expect(result.current).toHaveProperty('userId');
      expect(result.current).toHaveProperty('username');
      expect(result.current).toHaveProperty('active');
      expect(result.current).toHaveProperty('custom_field_1');
      expect(result.current).toHaveProperty('custom_field_2');
    });
  });

  describe('Edge cases', () => {
    it('should handle convertSchemasToFieldConfigs returning undefined/null', () => {
      (convertSchemasToFieldConfigs as Mock).mockReturnValue(undefined);

      const { result } = renderHook(() =>
        useAddCustomAttributeFieldDefinitions({
          customAttributeSchema: mockCustomAttributeSchema,
          fields: mockTableFields,
          enableRelativeDates: false,
        })
      );

      // Should still return the original fields even if custom fields are undefined
      expect(result.current).toEqual({
        ...mockTableFields,
        undefined,
      });
    });

    it('should handle malformed custom attribute schema gracefully', () => {
      const malformedSchema = {
        Schema: null,
        UiSchema: null,
      } as unknown as CustomAttributeSchema;

      // The convertSchemasToFieldConfigs utility should handle malformed schemas
      (convertSchemasToFieldConfigs as Mock).mockReturnValue({});

      const { result } = renderHook(() =>
        useAddCustomAttributeFieldDefinitions({
          customAttributeSchema: malformedSchema,
          fields: mockTableFields,
          enableRelativeDates: false,
        })
      );

      expect(result.current).toEqual(mockTableFields);
    });
  });
});
