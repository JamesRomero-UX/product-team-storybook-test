import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FormConfigResponse } from '../../clients/client.interface';
import type { BaseQuerySchema } from '../../schemas/route-query.schema';
import type { TransformCustomFieldsFn } from '../../transformers/common/custom-fields.transformer';
import type { AuthenticatedRequest } from '../../types/request';
import type { DataEntityTransformFn } from '../../types/transform';
import { processItemResponses } from './item.response';

describe('item.response', () => {
  let mockQuerySchema: BaseQuerySchema;
  let mockTransformCustomFieldsFn: TransformCustomFieldsFn;
  let mockReq: AuthenticatedRequest;

  // Common mock data
  const mockId = '123e4567-e89b-12d3-a456-426614174000';
  const mockLinkId = '987e6543-e89b-12d3-a456-426614174999';
  const mockBasePath = '/api/v1';

  const mockDataIn = {
    Id: mockId,
    Title: 'Test Item',
    Description: 'Test Description',
    CustomAttributeData: { field1: 'value1', field2: 'value2' },
  };

  const mockDataOut = {
    id: mockId,
    title: 'Test Item',
    description: 'Test Description',
  };

  const mockCustomFields = {
    schemaUpdatedAt: '2024-01-01T00:00:00Z',
    fields: {
      field1: {
        data: { value: 'value1', id: 'field1', label: 'Field 1' },
      },
      field2: {
        data: { value: 'value2', id: 'field2', label: 'Field 2' },
      },
    },
  };

  const mockFormConfig: FormConfigResponse = {
    fields: [
      { id: 'field1', label: 'Field 1', type: 'text' },
      { id: 'field2', label: 'Field 2', type: 'text' },
    ],
  } as never;

  const mockTransformFn: DataEntityTransformFn<
    typeof mockDataIn,
    typeof mockDataOut
  > = vi.fn((data: typeof mockDataIn) => ({
    id: data.Id,
    title: data.Title,
    description: data.Description,
  }));

  beforeEach(() => {
    vi.clearAllMocks();

    mockQuerySchema = {
      safeParse: vi.fn(),
    } as unknown as BaseQuerySchema;

    mockTransformCustomFieldsFn = vi.fn();

    mockReq = {
      query: {},
      requestLogger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
      },
    } as unknown as AuthenticatedRequest;
  });

  describe('processItemResponses factory', () => {
    it('should create processItemResponses with correct method', () => {
      const processor = processItemResponses({
        querySchema: mockQuerySchema,
        transformCustomFieldsFn: mockTransformCustomFieldsFn,
      });

      expect(processor).toHaveProperty('processItemResponse');
      expect(typeof processor.processItemResponse).toBe('function');
    });
  });

  describe('processItemResponse', () => {
    describe('happy path - without custom fields', () => {
      it('should process item response without custom fields', () => {
        const result = {
          data: mockDataIn,
          form_configuration: null,
        };

        vi.mocked(mockQuerySchema.safeParse).mockReturnValue({
          success: true,
          data: {},
        });

        const processor = processItemResponses({
          querySchema: mockQuerySchema,
          transformCustomFieldsFn: mockTransformCustomFieldsFn,
        });

        const output = processor.processItemResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          id: mockId,
          basePath: mockBasePath,
        });

        expect(mockTransformFn).toHaveBeenCalledWith(mockDataIn, {
          basePath: mockBasePath,
          linkId: undefined,
        });

        expect(output).toEqual({
          ...mockDataOut,
          customFields: {},
        });

        expect(mockTransformCustomFieldsFn).not.toHaveBeenCalled();
      });

      it('should pass linkId to transform function when provided', () => {
        const result = {
          data: mockDataIn,
          form_configuration: null,
        };

        vi.mocked(mockQuerySchema.safeParse).mockReturnValue({
          success: true,
          data: {},
        });

        const processor = processItemResponses({
          querySchema: mockQuerySchema,
          transformCustomFieldsFn: mockTransformCustomFieldsFn,
        });

        processor.processItemResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          id: mockId,
          basePath: mockBasePath,
          linkId: mockLinkId,
        });

        expect(mockTransformFn).toHaveBeenCalledWith(mockDataIn, {
          basePath: mockBasePath,
          linkId: mockLinkId,
        });
      });

      it('should process item when hasCustomFields is false', () => {
        const result = {
          data: mockDataIn,
          form_configuration: mockFormConfig,
        };

        vi.mocked(mockQuerySchema.safeParse).mockReturnValue({
          success: true,
          data: {},
        });

        const processor = processItemResponses({
          querySchema: mockQuerySchema,
          transformCustomFieldsFn: mockTransformCustomFieldsFn,
        });

        const output = processor.processItemResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          id: mockId,
          basePath: mockBasePath,
          hasCustomFields: false,
        });

        expect(output).not.toHaveProperty('customFields');
        expect(mockTransformCustomFieldsFn).not.toHaveBeenCalled();
      });
    });

    describe('happy path - with custom fields', () => {
      it('should process item with custom fields when form_configuration is present', () => {
        const result = {
          data: mockDataIn,
          form_configuration: mockFormConfig,
        };

        vi.mocked(mockQuerySchema.safeParse).mockReturnValue({
          success: true,
          data: {},
        });

        vi.mocked(mockTransformCustomFieldsFn).mockReturnValue(
          mockCustomFields
        );

        const processor = processItemResponses({
          querySchema: mockQuerySchema,
          transformCustomFieldsFn: mockTransformCustomFieldsFn,
        });

        const output = processor.processItemResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          id: mockId,
          basePath: mockBasePath,
        });

        expect(mockTransformCustomFieldsFn).toHaveBeenCalledWith(
          mockDataIn.CustomAttributeData,
          mockFormConfig,
          { expandMeta: false }
        );

        expect(output).toEqual({
          ...mockDataOut,
          customFields: mockCustomFields,
        });
      });

      it('should expand custom fields meta when expand query includes customFields', () => {
        const result = {
          data: mockDataIn,
          form_configuration: mockFormConfig,
        };

        mockReq.query = { expand: 'customFields' };

        vi.mocked(mockQuerySchema.safeParse).mockReturnValue({
          success: true,
          data: { expand: 'customFields' },
        });

        vi.mocked(mockTransformCustomFieldsFn).mockReturnValue(
          mockCustomFields
        );

        const processor = processItemResponses({
          querySchema: mockQuerySchema,
          transformCustomFieldsFn: mockTransformCustomFieldsFn,
        });

        processor.processItemResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          id: mockId,
          basePath: mockBasePath,
        });

        expect(mockTransformCustomFieldsFn).toHaveBeenCalledWith(
          mockDataIn.CustomAttributeData,
          mockFormConfig,
          { expandMeta: true }
        );
      });

      it('should handle multiple expand fields with customFields included', () => {
        const result = {
          data: mockDataIn,
          form_configuration: mockFormConfig,
        };

        mockReq.query = { expand: 'relatedItems,customFields,metadata' };

        vi.mocked(mockQuerySchema.safeParse).mockReturnValue({
          success: true,
          data: { expand: 'relatedItems,customFields,metadata' },
        });

        vi.mocked(mockTransformCustomFieldsFn).mockReturnValue(
          mockCustomFields
        );

        const processor = processItemResponses({
          querySchema: mockQuerySchema,
          transformCustomFieldsFn: mockTransformCustomFieldsFn,
        });

        processor.processItemResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          id: mockId,
          basePath: mockBasePath,
        });

        expect(mockTransformCustomFieldsFn).toHaveBeenCalledWith(
          mockDataIn.CustomAttributeData,
          mockFormConfig,
          { expandMeta: true }
        );
      });

      it('should not expand custom fields meta when expand does not include customFields', () => {
        const result = {
          data: mockDataIn,
          form_configuration: mockFormConfig,
        };

        mockReq.query = { expand: 'relatedItems,metadata' };

        vi.mocked(mockQuerySchema.safeParse).mockReturnValue({
          success: true,
          data: { expand: 'relatedItems,metadata' },
        });

        vi.mocked(mockTransformCustomFieldsFn).mockReturnValue(
          mockCustomFields
        );

        const processor = processItemResponses({
          querySchema: mockQuerySchema,
          transformCustomFieldsFn: mockTransformCustomFieldsFn,
        });

        processor.processItemResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          id: mockId,
          basePath: mockBasePath,
        });

        expect(mockTransformCustomFieldsFn).toHaveBeenCalledWith(
          mockDataIn.CustomAttributeData,
          mockFormConfig,
          { expandMeta: false }
        );
      });
    });

    describe('happy path - edge cases with custom fields', () => {
      it('should not transform custom fields when form_configuration is null', () => {
        const result = {
          data: mockDataIn,
          form_configuration: null,
        };

        vi.mocked(mockQuerySchema.safeParse).mockReturnValue({
          success: true,
          data: {},
        });

        const processor = processItemResponses({
          querySchema: mockQuerySchema,
          transformCustomFieldsFn: mockTransformCustomFieldsFn,
        });

        const output = processor.processItemResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          id: mockId,
          basePath: mockBasePath,
        });

        expect(output).toEqual({
          ...mockDataOut,
          customFields: {},
        });

        expect(mockTransformCustomFieldsFn).not.toHaveBeenCalled();
      });

      it('should not transform custom fields when CustomAttributeData is missing', () => {
        const dataWithoutCustomAttrs = {
          Id: mockId,
          Title: 'Test Item',
          Description: 'Test Description',
        };

        const result = {
          data: dataWithoutCustomAttrs,
          form_configuration: mockFormConfig,
        };

        vi.mocked(mockQuerySchema.safeParse).mockReturnValue({
          success: true,
          data: {},
        });

        const transformFn: DataEntityTransformFn<
          typeof dataWithoutCustomAttrs,
          typeof mockDataOut
        > = vi.fn((data: typeof dataWithoutCustomAttrs) => ({
          id: data.Id,
          title: data.Title,
          description: data.Description,
        }));

        const processor = processItemResponses({
          querySchema: mockQuerySchema,
          transformCustomFieldsFn: mockTransformCustomFieldsFn,
        });

        const output = processor.processItemResponse({
          result,
          dataTransformFn: transformFn,
          req: mockReq,
          id: mockId,
          basePath: mockBasePath,
        });

        expect(output).toEqual({
          ...mockDataOut,
          customFields: {},
        });

        expect(mockTransformCustomFieldsFn).not.toHaveBeenCalled();
      });

      it('should handle when query parsing fails', () => {
        const result = {
          data: mockDataIn,
          form_configuration: mockFormConfig,
        };

        vi.mocked(mockQuerySchema.safeParse).mockReturnValue({
          success: false,
          error: new Error('Validation failed') as never,
        });

        vi.mocked(mockTransformCustomFieldsFn).mockReturnValue(
          mockCustomFields
        );

        const processor = processItemResponses({
          querySchema: mockQuerySchema,
          transformCustomFieldsFn: mockTransformCustomFieldsFn,
        });

        const output = processor.processItemResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          id: mockId,
          basePath: mockBasePath,
        });

        // Should still work but with expandMeta as false
        expect(mockTransformCustomFieldsFn).toHaveBeenCalledWith(
          mockDataIn.CustomAttributeData,
          mockFormConfig,
          { expandMeta: false }
        );

        expect(output).toEqual({
          ...mockDataOut,
          customFields: mockCustomFields,
        });
      });
    });

    describe('error handling - null result', () => {
      it('should return null and log warning when result is null', () => {
        const processor = processItemResponses({
          querySchema: mockQuerySchema,
          transformCustomFieldsFn: mockTransformCustomFieldsFn,
        });

        const output = processor.processItemResponse({
          result: null,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          id: mockId,
          basePath: mockBasePath,
        });

        expect(output).toBeNull();
        expect(mockReq.requestLogger.warn).toHaveBeenCalledWith(
          {
            event: 'entity_not_found',
            id: mockId,
          },
          'entity not returned from service'
        );

        expect(mockTransformFn).not.toHaveBeenCalled();
      });
    });

    describe('error handling - custom fields transformation', () => {
      it('should log error and continue when custom fields transformation fails', () => {
        const result = {
          data: mockDataIn,
          form_configuration: mockFormConfig,
        };

        const transformError = new Error('Invalid custom field data');

        vi.mocked(mockQuerySchema.safeParse).mockReturnValue({
          success: true,
          data: {},
        });

        vi.mocked(mockTransformCustomFieldsFn).mockImplementation(() => {
          throw transformError;
        });

        const processor = processItemResponses({
          querySchema: mockQuerySchema,
          transformCustomFieldsFn: mockTransformCustomFieldsFn,
        });

        const output = processor.processItemResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          id: mockId,
          basePath: mockBasePath,
        });

        expect(mockReq.requestLogger.error).toHaveBeenCalledWith(
          {
            event: 'id_entity_custom_fields_error',
            error: transformError,
            id: mockId,
          },
          'Error while trying to transform custom fields'
        );

        // Should still return the transformed data without custom fields
        expect(output).toEqual({
          ...mockDataOut,
          customFields: {},
        });
      });

      it('should handle different error types from custom fields transformation', () => {
        const result = {
          data: mockDataIn,
          form_configuration: mockFormConfig,
        };

        const stringError = Error('String error message');

        vi.mocked(mockQuerySchema.safeParse).mockReturnValue({
          success: true,
          data: {},
        });

        vi.mocked(mockTransformCustomFieldsFn).mockImplementation(() => {
          throw stringError;
        });

        const processor = processItemResponses({
          querySchema: mockQuerySchema,
          transformCustomFieldsFn: mockTransformCustomFieldsFn,
        });

        const output = processor.processItemResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          id: mockId,
          basePath: mockBasePath,
        });

        expect(mockReq.requestLogger.error).toHaveBeenCalledWith(
          expect.objectContaining({
            event: 'id_entity_custom_fields_error',
            error: stringError,
            id: mockId,
          }),
          expect.any(String)
        );

        expect(output).toEqual({
          ...mockDataOut,
          customFields: {},
        });
      });
    });

    describe('error handling - data transformation', () => {
      it('should throw error and log when data transformation fails', () => {
        const result = {
          data: mockDataIn,
          form_configuration: null,
        };

        const transformError = new Error('Transform failed');

        vi.mocked(mockQuerySchema.safeParse).mockReturnValue({
          success: true,
          data: {},
        });

        const failingTransformFn = vi.fn(() => {
          throw transformError;
        });

        const processor = processItemResponses({
          querySchema: mockQuerySchema,
          transformCustomFieldsFn: mockTransformCustomFieldsFn,
        });

        expect(() => {
          processor.processItemResponse({
            result,
            dataTransformFn: failingTransformFn,
            req: mockReq,
            id: mockId,
            basePath: mockBasePath,
          });
        }).toThrow('unable to transform response data for entity');

        expect(mockReq.requestLogger.error).toHaveBeenCalledWith(
          {
            event: 'entity_response_data_error',
            error: transformError,
            id: mockId,
          },
          'Error while trying to transform response entity data'
        );
      });

      it('should handle non-Error objects thrown during transformation', () => {
        const result = {
          data: mockDataIn,
          form_configuration: null,
        };

        vi.mocked(mockQuerySchema.safeParse).mockReturnValue({
          success: true,
          data: {},
        });

        const failingTransformFn = vi.fn(() => {
          throw Error('String error');
        });

        const processor = processItemResponses({
          querySchema: mockQuerySchema,
          transformCustomFieldsFn: mockTransformCustomFieldsFn,
        });

        expect(() => {
          processor.processItemResponse({
            result,
            dataTransformFn: failingTransformFn,
            req: mockReq,
            id: mockId,
            basePath: mockBasePath,
          });
        }).toThrow('unable to transform response data for entity');

        expect(mockReq.requestLogger.error).toHaveBeenCalledWith(
          {
            event: 'entity_response_data_error',
            error: expect.any(Error) as Error,
            id: mockId,
          },
          'Error while trying to transform response entity data'
        );
      });

      it('should throw error after custom fields were successfully transformed', () => {
        const result = {
          data: mockDataIn,
          form_configuration: mockFormConfig,
        };

        const transformError = new Error('Transform failed');

        vi.mocked(mockQuerySchema.safeParse).mockReturnValue({
          success: true,
          data: {},
        });

        vi.mocked(mockTransformCustomFieldsFn).mockReturnValue(
          mockCustomFields
        );

        const failingTransformFn = vi.fn(() => {
          throw transformError;
        });

        const processor = processItemResponses({
          querySchema: mockQuerySchema,
          transformCustomFieldsFn: mockTransformCustomFieldsFn,
        });

        expect(() => {
          processor.processItemResponse({
            result,
            dataTransformFn: failingTransformFn,
            req: mockReq,
            id: mockId,
            basePath: mockBasePath,
          });
        }).toThrow('unable to transform response data for entity');

        expect(mockTransformCustomFieldsFn).toHaveBeenCalled();
        expect(mockReq.requestLogger.error).toHaveBeenCalledWith(
          expect.objectContaining({
            event: 'entity_response_data_error',
          }),
          expect.any(String)
        );
      });
    });
  });
});
