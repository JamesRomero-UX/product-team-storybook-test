import { getCustomAttributeLabels } from '@risksmart-app/data-import/src/tools/exportUtils';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Unauthorized } from 'http-errors';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import {
  getHasuraClaims,
  getTenantNameFromClaims,
  getUserIdFromClaims,
} from 'src/requestHelpers';
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest';

import { handler } from './asosDataQuery';

// Mock dependencies
vi.mock('src/repositories/getBackendRestApiClient');
vi.mock('src/requestHelpers');
vi.mock('@risksmart-app/data-import/src/tools/exportUtils');

const mockGetBackendRestApiClient = vi.mocked(getBackendRestApiClient);
const mockGetHasuraClaims = vi.mocked(getHasuraClaims);
const mockGetTenantNameFromClaims = vi.mocked(getTenantNameFromClaims);
const mockGetUserIdFromClaims = vi.mocked(getUserIdFromClaims);
const mockGetCustomAttributeLabels = vi.mocked(getCustomAttributeLabels);

interface MockAsosClient {
  getAsosData: MockedFunction<() => Promise<unknown>>;
}

describe('asosDataQuery handler', () => {
  let mockEvent: APIGatewayProxyEventV2;
  let mockClient: MockAsosClient;

  beforeEach(() => {
    vi.clearAllMocks();

    mockEvent = {
      version: '2.0',
      routeKey: 'GET /asos-data',
      rawPath: '/asos-data',
      rawQueryString: '',
      headers: {
        authorization: 'Bearer test-token',
      },
      requestContext: {
        requestId: 'test-request-id',
        apiId: 'test-api-id',
        accountId: 'test-account-id',
        stage: 'test',
        domainName: 'test-domain',
        domainPrefix: 'test',
        http: {
          method: 'GET',
          path: '/asos-data',
          protocol: 'HTTP/1.1',
          sourceIp: '127.0.0.1',
          userAgent: 'test-agent',
        },
        routeKey: 'GET /asos-data',
        time: new Date().toISOString(),
        timeEpoch: Date.now(),
      },
      isBase64Encoded: false,
    };

    mockClient = {
      getAsosData: vi.fn(),
    };

    mockGetBackendRestApiClient.mockReturnValue(mockClient as never);
    mockGetHasuraClaims.mockReturnValue({
      'x-hasura-org-id': 'test-org',
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': ['user'],
      'x-hasura-user-id': 'test-user-id',
      'x-hasura-tenant-name': 'test-tenant',
    });
    mockGetTenantNameFromClaims.mockReturnValue('test-tenant');
    mockGetUserIdFromClaims.mockReturnValue('test-user-id');
    mockGetCustomAttributeLabels.mockReturnValue({});
  });

  describe('Authentication and Authorization', () => {
    it('should throw Unauthorized error when authorization header is missing', async () => {
      const eventWithoutAuth = {
        ...mockEvent,
        headers: {},
      };

      await expect(handler(eventWithoutAuth)).rejects.toThrow(Unauthorized);
      await expect(handler(eventWithoutAuth)).rejects.toThrow(
        'Invalid authorization credentials in request'
      );
    });

    it('should throw Unauthorized error when authorization header is undefined', async () => {
      const eventWithUndefinedAuth = {
        ...mockEvent,
        headers: {
          authorization: undefined,
        },
      };

      await expect(handler(eventWithUndefinedAuth)).rejects.toThrow(
        Unauthorized
      );
    });
  });

  describe('Data processing and custom attribute mapping', () => {
    it('should successfully process ASOS data and remove __typename fields', async () => {
      const mockAsosData = {
        form_configuration: [
          {
            ParentType: 'risk',
            customAttributeSchema: {
              field1: { label: 'Risk Field 1' },
            },
          },
        ],
        risks: [
          {
            __typename: 'risk',
            Id: 'risk-1',
            Title: 'Test Risk',
            CustomAttributeData: {
              field1: 'value1',
            },
          },
        ],
      };

      mockClient.getAsosData.mockResolvedValue(mockAsosData);
      mockGetCustomAttributeLabels.mockReturnValue({
        field1: 'Risk Field 1',
      });

      const result = await handler(mockEvent);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);

      // Verify __typename is removed
      expect(body.processedData.risks[0].__typename).toBeUndefined();

      // Verify CustomAttributeData is removed
      expect(body.processedData.risks[0].CustomAttributeData).toBeUndefined();

      // Verify custom attributes are mapped correctly
      expect(body.processedData.risks[0]['CA_Risk Field 1']).toBe('value1');

      // Verify original fields are preserved
      expect(body.processedData.risks[0].Id).toBe('risk-1');
      expect(body.processedData.risks[0].Title).toBe('Test Risk');
    });

    it('should handle risk assessment results with special ControlType logic', async () => {
      const mockAsosData = {
        form_configuration: [
          {
            ParentType: 'uncontrolled_risk_assessment_result',
            customAttributeSchema: {
              uncontrolled_field: { label: 'Uncontrolled Field' },
            },
          },
          {
            ParentType: 'controlled_risk_assessment_result',
            customAttributeSchema: {
              controlled_field: { label: 'Controlled Field' },
            },
          },
        ],
        assessment_results: [
          {
            __typename: 'risk_assessment_result',
            ControlType: 'Uncontrolled',
            Id: 'result-1',
            CustomAttributeData: {
              uncontrolled_field: 'uncontrolled_value',
            },
          },
          {
            __typename: 'risk_assessment_result',
            ControlType: 'Controlled',
            Id: 'result-2',
            CustomAttributeData: {
              controlled_field: 'controlled_value',
            },
          },
          {
            __typename: 'risk_assessment_result',
            // No ControlType - should default to controlled
            Id: 'result-3',
            CustomAttributeData: {
              controlled_field: 'default_controlled_value',
            },
          },
        ],
      };

      mockClient.getAsosData.mockResolvedValue(mockAsosData);
      mockGetCustomAttributeLabels
        .mockReturnValueOnce({
          uncontrolled_field: 'Uncontrolled Field',
        })
        .mockReturnValueOnce({
          controlled_field: 'Controlled Field',
        });

      const result = await handler(mockEvent);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);

      const results = body.processedData.assessment_results;

      // Uncontrolled result
      expect(results[0].__typename).toBeUndefined();
      expect(results[0].CustomAttributeData).toBeUndefined();
      expect(results[0]['CA_Uncontrolled Field']).toBe('uncontrolled_value');
      expect(results[0].ControlType).toBe('Uncontrolled');

      // Controlled result
      expect(results[1].__typename).toBeUndefined();
      expect(results[1].CustomAttributeData).toBeUndefined();
      expect(results[1]['CA_Controlled Field']).toBe('controlled_value');
      expect(results[1].ControlType).toBe('Controlled');

      // Default to controlled when ControlType is missing
      expect(results[2].__typename).toBeUndefined();
      expect(results[2].CustomAttributeData).toBeUndefined();
      expect(results[2]['CA_Controlled Field']).toBe(
        'default_controlled_value'
      );
    });

    it('should handle deeply nested objects with arrays', async () => {
      const mockAsosData = {
        form_configuration: [
          {
            ParentType: 'risk',
            customAttributeSchema: {
              risk_field: { label: 'Risk Field' },
            },
          },
          {
            ParentType: 'control',
            customAttributeSchema: {
              control_field: { label: 'Control Field' },
            },
          },
        ],
        risks: [
          {
            __typename: 'risk',
            Id: 'risk-1',
            CustomAttributeData: {
              risk_field: 'risk_value',
            },
            controls: [
              {
                __typename: 'control',
                Id: 'control-1',
                CustomAttributeData: {
                  control_field: 'control_value',
                },
                nested: {
                  __typename: 'nested_object',
                  data: 'nested_data',
                },
              },
            ],
          },
        ],
      };

      mockClient.getAsosData.mockResolvedValue(mockAsosData);
      mockGetCustomAttributeLabels
        .mockReturnValueOnce({
          risk_field: 'Risk Field',
        })
        .mockReturnValueOnce({
          control_field: 'Control Field',
        });

      const result = await handler(mockEvent);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);

      const risk = body.processedData.risks[0];
      const control = risk.controls[0];

      // Verify root level processing
      expect(risk.__typename).toBeUndefined();
      expect(risk.CustomAttributeData).toBeUndefined();
      expect(risk['CA_Risk Field']).toBe('risk_value');

      // Verify nested array processing
      expect(control.__typename).toBeUndefined();
      expect(control.CustomAttributeData).toBeUndefined();
      expect(control['CA_Control Field']).toBe('control_value');

      // Verify deeply nested object processing
      expect(control.nested.__typename).toBeUndefined();
      expect(control.nested.data).toBe('nested_data');
    });

    it('should handle missing custom attribute labels gracefully', async () => {
      const mockAsosData = {
        form_configuration: [
          {
            ParentType: 'unknown_type',
            customAttributeSchema: {
              field1: { label: 'Field 1' },
            },
          },
        ],
        items: [
          {
            __typename: 'unknown_type',
            Id: 'item-1',
            CustomAttributeData: {
              field1: 'value1',
            },
          },
        ],
      };

      mockClient.getAsosData.mockResolvedValue(mockAsosData);
      // Return empty labels - simulating no matching labels for the type
      mockGetCustomAttributeLabels.mockReturnValue({});

      const result = await handler(mockEvent);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);

      const item = body.processedData.items[0];

      // Should still remove __typename and CustomAttributeData
      expect(item.__typename).toBeUndefined();
      expect(item.CustomAttributeData).toBeUndefined();

      // Should not have any CA_ prefixed fields since no labels were found
      expect(
        Object.keys(item).filter((key) => key.startsWith('CA_'))
      ).toHaveLength(0);

      // Original fields should be preserved
      expect(item.Id).toBe('item-1');
    });

    it('should handle null and undefined values in nested structures', async () => {
      const mockAsosData = {
        form_configuration: [],
        items: [
          {
            __typename: 'item',
            Id: 'item-1',
            nullField: null,
            // Note: undefinedField is omitted because undefined properties are stripped in JSON serialization
            nested: {
              __typename: 'nested',
              nullNested: null,
              validField: 'valid',
            },
            arrayWithNulls: [
              null,
              {
                __typename: 'array_item',
                value: 'array_value',
              },
              null,
              // Note: undefined values become null in JSON serialization
            ],
          },
        ],
      };

      mockClient.getAsosData.mockResolvedValue(mockAsosData);

      const result = await handler(mockEvent);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);

      const item = body.processedData.items[0];

      // Should preserve null values (undefined properties are stripped during JSON serialization)
      expect(item.nullField).toBe(null);
      expect(item.undefinedField).toBe(undefined); // Property doesn't exist

      // Should process nested objects normally
      expect(item.nested.__typename).toBeUndefined();
      expect(item.nested.nullNested).toBe(null);
      expect(item.nested.validField).toBe('valid');

      // Should handle arrays with null values (undefined array elements become null)
      expect(item.arrayWithNulls[0]).toBe(null);
      expect(item.arrayWithNulls[1].__typename).toBeUndefined();
      expect(item.arrayWithNulls[1].value).toBe('array_value');
      expect(item.arrayWithNulls[2]).toBe(null);
    });

    it('should exclude form_configuration from processed data', async () => {
      const mockAsosData = {
        form_configuration: [
          {
            ParentType: 'risk',
            customAttributeSchema: {},
          },
        ],
        risks: [
          {
            __typename: 'risk',
            Id: 'risk-1',
          },
        ],
        controls: [
          {
            __typename: 'control',
            Id: 'control-1',
          },
        ],
      };

      mockClient.getAsosData.mockResolvedValue(mockAsosData);

      const result = await handler(mockEvent);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);

      // form_configuration should not be in processed data
      expect(body.processedData.form_configuration).toBeUndefined();

      // Other data should be present
      expect(body.processedData.risks).toBeDefined();
      expect(body.processedData.controls).toBeDefined();
    });

    it('should handle empty data gracefully', async () => {
      const mockAsosData = {
        form_configuration: [],
      };

      mockClient.getAsosData.mockResolvedValue(mockAsosData);

      const result = await handler(mockEvent);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.processedData).toEqual({});
    });

    it('should call all required functions with correct parameters', async () => {
      const mockAsosData = {
        form_configuration: [],
        test_data: [],
      };

      mockClient.getAsosData.mockResolvedValue(mockAsosData);

      await handler(mockEvent);

      expect(mockGetHasuraClaims).toHaveBeenCalledWith(mockEvent);
      expect(mockGetUserIdFromClaims).toHaveBeenCalledWith(mockEvent);
      expect(mockGetTenantNameFromClaims).toHaveBeenCalledWith(mockEvent);
      expect(mockGetBackendRestApiClient).toHaveBeenCalledWith({
        tenant: 'test-tenant',
        orgKey: 'test-org',
        userId: 'test-user-id',
        userRole: 'user',
      });
      expect(mockClient.getAsosData).toHaveBeenCalled();
    });

    it('should handle complex recursive scenarios with mixed data types', async () => {
      const mockAsosData = {
        form_configuration: [
          {
            ParentType: 'risk',
            customAttributeSchema: {
              complex_field: { label: 'Complex Field' },
            },
          },
        ],
        complex_data: [
          {
            __typename: 'risk',
            Id: 'complex-1',
            CustomAttributeData: {
              complex_field: 'complex_value',
            },
            nested_array: [
              {
                __typename: 'nested_item',
                value: 'array_value_1',
                deep_nested: {
                  __typename: 'deep_nested',
                  deep_value: 'deep_1',
                },
              },
              {
                __typename: 'nested_item',
                value: 'array_value_2',
                deep_nested: {
                  __typename: 'deep_nested',
                  deep_value: 'deep_2',
                },
              },
            ],
            nested_object: {
              __typename: 'nested_object',
              object_value: 'object_val',
              another_array: [
                {
                  __typename: 'another_item',
                  item_value: 'item_val',
                },
              ],
            },
          },
        ],
      };

      mockClient.getAsosData.mockResolvedValue(mockAsosData);
      mockGetCustomAttributeLabels.mockReturnValue({
        complex_field: 'Complex Field',
      });

      const result = await handler(mockEvent);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);

      const complexItem = body.processedData.complex_data[0];

      // Root level processing
      expect(complexItem.__typename).toBeUndefined();
      expect(complexItem.CustomAttributeData).toBeUndefined();
      expect(complexItem['CA_Complex Field']).toBe('complex_value');

      // Nested array processing
      expect(complexItem.nested_array[0].__typename).toBeUndefined();
      expect(complexItem.nested_array[0].value).toBe('array_value_1');
      expect(
        complexItem.nested_array[0].deep_nested.__typename
      ).toBeUndefined();
      expect(complexItem.nested_array[0].deep_nested.deep_value).toBe('deep_1');

      expect(complexItem.nested_array[1].__typename).toBeUndefined();
      expect(complexItem.nested_array[1].value).toBe('array_value_2');
      expect(
        complexItem.nested_array[1].deep_nested.__typename
      ).toBeUndefined();
      expect(complexItem.nested_array[1].deep_nested.deep_value).toBe('deep_2');

      // Nested object processing
      expect(complexItem.nested_object.__typename).toBeUndefined();
      expect(complexItem.nested_object.object_value).toBe('object_val');
      expect(
        complexItem.nested_object.another_array[0].__typename
      ).toBeUndefined();
      expect(complexItem.nested_object.another_array[0].item_value).toBe(
        'item_val'
      );
    });

    it('should handle empty arrays and objects in recursive processing', async () => {
      const mockAsosData = {
        form_configuration: [],
        test_data: [
          {
            __typename: 'test_item',
            Id: 'test-1',
            empty_array: [],
            empty_object: {},
            nested_with_empty: {
              __typename: 'nested',
              empty_nested_array: [],
              empty_nested_object: {},
              value: 'has_value',
            },
          },
        ],
      };

      mockClient.getAsosData.mockResolvedValue(mockAsosData);

      const result = await handler(mockEvent);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);

      const testItem = body.processedData.test_data[0];

      expect(testItem.__typename).toBeUndefined();
      expect(testItem.Id).toBe('test-1');
      expect(testItem.empty_array).toEqual([]);
      expect(testItem.empty_object).toEqual({});
      expect(testItem.nested_with_empty.__typename).toBeUndefined();
      expect(testItem.nested_with_empty.empty_nested_array).toEqual([]);
      expect(testItem.nested_with_empty.empty_nested_object).toEqual({});
      expect(testItem.nested_with_empty.value).toBe('has_value');
    });

    it('should handle multiple different entity types in the same dataset', async () => {
      const mockAsosData = {
        form_configuration: [
          {
            ParentType: 'risk',
            customAttributeSchema: {
              risk_attr: { label: 'Risk Attribute' },
            },
          },
          {
            ParentType: 'control',
            customAttributeSchema: {
              control_attr: { label: 'Control Attribute' },
            },
          },
          {
            ParentType: 'assessment',
            customAttributeSchema: {
              assessment_attr: { label: 'Assessment Attribute' },
            },
          },
        ],
        mixed_data: [
          {
            __typename: 'risk',
            Id: 'risk-1',
            CustomAttributeData: { risk_attr: 'risk_val' },
          },
          {
            __typename: 'control',
            Id: 'control-1',
            CustomAttributeData: { control_attr: 'control_val' },
          },
          {
            __typename: 'assessment',
            Id: 'assessment-1',
            CustomAttributeData: { assessment_attr: 'assessment_val' },
          },
        ],
      };

      mockClient.getAsosData.mockResolvedValue(mockAsosData);
      mockGetCustomAttributeLabels
        .mockReturnValueOnce({ risk_attr: 'Risk Attribute' })
        .mockReturnValueOnce({ control_attr: 'Control Attribute' })
        .mockReturnValueOnce({ assessment_attr: 'Assessment Attribute' });

      const result = await handler(mockEvent);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);

      const mixedData = body.processedData.mixed_data;

      // Risk item
      expect(mixedData[0].__typename).toBeUndefined();
      expect(mixedData[0].CustomAttributeData).toBeUndefined();
      expect(mixedData[0]['CA_Risk Attribute']).toBe('risk_val');

      // Control item
      expect(mixedData[1].__typename).toBeUndefined();
      expect(mixedData[1].CustomAttributeData).toBeUndefined();
      expect(mixedData[1]['CA_Control Attribute']).toBe('control_val');

      // Assessment item
      expect(mixedData[2].__typename).toBeUndefined();
      expect(mixedData[2].CustomAttributeData).toBeUndefined();
      expect(mixedData[2]['CA_Assessment Attribute']).toBe('assessment_val');
    });
  });

  describe('Error handling', () => {
    it('should propagate errors from getAsosData', async () => {
      const error = new Error('Database connection failed');
      mockClient.getAsosData.mockRejectedValue(error);

      await expect(handler(mockEvent)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle errors from getCustomAttributeLabels', async () => {
      const mockAsosData = {
        form_configuration: [
          {
            ParentType: 'risk',
            customAttributeSchema: { field1: { label: 'Field 1' } },
          },
        ],
        risks: [],
      };

      mockClient.getAsosData.mockResolvedValue(mockAsosData);
      mockGetCustomAttributeLabels.mockImplementation(() => {
        throw new Error('Custom attribute processing failed');
      });

      await expect(handler(mockEvent)).rejects.toThrow(
        'Custom attribute processing failed'
      );
    });
  });
});
