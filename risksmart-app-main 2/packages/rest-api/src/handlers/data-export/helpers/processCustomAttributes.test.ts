import {
  flattenJSON,
  getCustomAttributeLabels,
} from '@risksmart-app/data-import/src/tools/exportUtils';
import type { GetNormalisedExportDataQuery } from 'generated/graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { processCustomAttributes } from './processCustomAttributes';

vi.mock('@risksmart-app/data-import/src/tools/exportUtils', () => ({
  getCustomAttributeLabels: vi.fn(),
  flattenJSON: vi.fn(),
}));

const mockGetCustomAttributeLabels = vi.mocked(getCustomAttributeLabels);
const mockFlattenJSON = vi.mocked(flattenJSON);

describe('processCustomAttributes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process custom attributes and flatten data', () => {
    const mockData = {
      __typename: 'query_root',
      form_configuration: [
        {
          ParentType: 'risk',
          customAttributeSchema: {
            Id: 'schema-1',
            Schema: { type: 'object' } as never,
            UiSchema: { type: 'VerticalLayout' } as never,
          },
        },
      ],
      risk: [
        {
          Id: 'risk-1',
          Title: 'Test Risk',
          CustomAttributeData: { priority: 'High' },
        } as never,
      ],
    };

    mockGetCustomAttributeLabels.mockReturnValue({ priority: 'Priority' });
    mockFlattenJSON.mockImplementation((item) => ({
      ...item,
      CA_Priority: item.CustomAttributeData?.priority,
      CustomAttributeData: undefined,
    }));

    const result = processCustomAttributes(
      mockData as unknown as GetNormalisedExportDataQuery
    );

    expect(result).toEqual({
      risk: [
        {
          Id: 'risk-1',
          Title: 'Test Risk',
          CA_Priority: 'High',
          CustomAttributeData: undefined,
        },
      ],
      form_configuration: mockData.form_configuration,
    });
    expect(result).not.toHaveProperty('__typename');
    expect(mockGetCustomAttributeLabels).toHaveBeenCalledWith(
      mockData.form_configuration[0]!.customAttributeSchema
    );
    expect(mockFlattenJSON).toHaveBeenCalledWith(mockData.risk[0], {}, '', {
      priority: 'Priority',
    });
  });

  it('should keep form_configuration by default', () => {
    const mockData = {
      __typename: 'query_root',
      form_configuration: [
        {
          ParentType: 'action',
          customAttributeSchema: {
            Id: 'schema-1',
            Schema: { type: 'object' } as never,
            UiSchema: { type: 'VerticalLayout' } as never,
          },
        },
      ],
      action: [
        {
          Id: 'action-1',
          Title: 'Test Action',
        } as never,
      ],
    };

    mockGetCustomAttributeLabels.mockReturnValue({});
    mockFlattenJSON.mockImplementation((item) => item);

    const result = processCustomAttributes(
      mockData as unknown as GetNormalisedExportDataQuery
    );

    expect(result).not.toHaveProperty('__typename');
    expect(result).toHaveProperty('form_configuration');
    expect(result).toHaveProperty('action');
  });

  it('should filter out form_configuration when excludeFormConfiguration is true', () => {
    const mockData = {
      __typename: 'query_root',
      form_configuration: [
        {
          ParentType: 'action',
          customAttributeSchema: {
            Id: 'schema-1',
            Schema: { type: 'object' } as never,
            UiSchema: { type: 'VerticalLayout' } as never,
          },
        },
      ],
      action: [
        {
          Id: 'action-1',
          Title: 'Test Action',
        } as never,
      ],
    };

    mockGetCustomAttributeLabels.mockReturnValue({});
    mockFlattenJSON.mockImplementation((item) => item);

    const result = processCustomAttributes(
      mockData as unknown as GetNormalisedExportDataQuery,
      true
    );

    expect(result).not.toHaveProperty('__typename');
    expect(result).not.toHaveProperty('form_configuration');
    expect(result).toHaveProperty('action');
  });

  it('should handle entities with no matching form_configuration', () => {
    const mockData = {
      __typename: 'query_root',
      form_configuration: [
        {
          ParentType: 'risk',
          customAttributeSchema: {
            Id: 'schema-1',
            Schema: { type: 'object' } as never,
            UiSchema: { type: 'VerticalLayout' } as never,
          },
        },
      ],
      action: [
        {
          Id: 'action-1',
          Title: 'Test Action',
          CustomAttributeData: { status: 'Open' },
        } as never,
      ],
    };

    mockGetCustomAttributeLabels.mockReturnValue({ risk_level: 'Risk Level' });
    mockFlattenJSON.mockImplementation((item) => item);

    const result = processCustomAttributes(
      mockData as unknown as GetNormalisedExportDataQuery
    );

    expect(result).toEqual({
      action: [
        {
          Id: 'action-1',
          Title: 'Test Action',
          CustomAttributeData: { status: 'Open' },
        },
      ],
      form_configuration: mockData.form_configuration,
    });
    expect(result).not.toHaveProperty('__typename');
    // flattenJSON should be called with undefined labels for action
    expect(mockFlattenJSON).toHaveBeenCalledWith(
      mockData.action[0],
      {},
      '',
      undefined
    );
  });

  it('should handle empty form_configuration', () => {
    const mockData = {
      __typename: 'query_root',
      form_configuration: [],
      risk: [
        {
          Id: 'risk-1',
          Title: 'Test Risk',
        } as never,
      ],
    };

    mockFlattenJSON.mockImplementation((item) => item);

    const result = processCustomAttributes(
      mockData as unknown as GetNormalisedExportDataQuery
    );

    expect(result).toEqual({
      risk: [
        {
          Id: 'risk-1',
          Title: 'Test Risk',
        },
      ],
      form_configuration: [],
    });
    expect(mockGetCustomAttributeLabels).not.toHaveBeenCalled();
    expect(mockFlattenJSON).toHaveBeenCalledWith(
      mockData.risk[0],
      {},
      '',
      undefined
    );
  });

  it('should pass through non-array values unchanged', () => {
    const mockData = {
      __typename: 'query_root',
      form_configuration: [],
      risk: [
        {
          Id: 'risk-1',
          Title: 'Test Risk',
        } as never,
      ],
      node: 'some-string-value' as never,
    };

    mockFlattenJSON.mockImplementation((item) => item);

    const result = processCustomAttributes(
      mockData as unknown as GetNormalisedExportDataQuery
    );

    expect(result).toEqual({
      risk: [
        {
          Id: 'risk-1',
          Title: 'Test Risk',
        },
      ],
      node: 'some-string-value',
      form_configuration: [],
    });
  });

  it('should handle multiple entity types with different schemas', () => {
    const mockData = {
      __typename: 'query_root',
      form_configuration: [
        {
          ParentType: 'risk',
          customAttributeSchema: {
            Id: 'schema-1',
            Schema: { type: 'object' } as never,
            UiSchema: { type: 'VerticalLayout' } as never,
          },
        },
        {
          ParentType: 'action',
          customAttributeSchema: {
            Id: 'schema-2',
            Schema: { type: 'object' } as never,
            UiSchema: { type: 'VerticalLayout' } as never,
          },
        },
      ],
      risk: [
        {
          Id: 'risk-1',
          Title: 'Test Risk',
          CustomAttributeData: { priority: 'High' },
        } as never,
      ],
      action: [
        {
          Id: 'action-1',
          Title: 'Test Action',
          CustomAttributeData: { status: 'Open' },
        } as never,
      ],
    };

    mockGetCustomAttributeLabels
      .mockReturnValueOnce({ priority: 'Priority' })
      .mockReturnValueOnce({ status: 'Status' });
    mockFlattenJSON
      .mockImplementationOnce((item) => ({
        ...item,
        CA_Priority: item.CustomAttributeData?.priority,
        CustomAttributeData: undefined,
      }))
      .mockImplementationOnce((item) => ({
        ...item,
        CA_Status: item.CustomAttributeData?.status,
        CustomAttributeData: undefined,
      }));

    const result = processCustomAttributes(
      mockData as unknown as GetNormalisedExportDataQuery
    );

    expect(result).toEqual({
      risk: [
        {
          Id: 'risk-1',
          Title: 'Test Risk',
          CA_Priority: 'High',
          CustomAttributeData: undefined,
        },
      ],
      action: [
        {
          Id: 'action-1',
          Title: 'Test Action',
          CA_Status: 'Open',
          CustomAttributeData: undefined,
        },
      ],
      form_configuration: mockData.form_configuration,
    });
    expect(mockGetCustomAttributeLabels).toHaveBeenCalledTimes(2);
  });

  it('should handle empty entity arrays', () => {
    const mockData = {
      __typename: 'query_root',
      form_configuration: [
        {
          ParentType: 'risk',
          customAttributeSchema: {
            Id: 'schema-1',
            Schema: { type: 'object' } as never,
            UiSchema: { type: 'VerticalLayout' } as never,
          },
        },
      ],
      risk: [],
    };

    mockGetCustomAttributeLabels.mockReturnValue({ priority: 'Priority' });

    const result = processCustomAttributes(
      mockData as unknown as GetNormalisedExportDataQuery
    );

    expect(result).toEqual({
      risk: [],
      form_configuration: mockData.form_configuration,
    });
    expect(mockFlattenJSON).not.toHaveBeenCalled();
  });
});
