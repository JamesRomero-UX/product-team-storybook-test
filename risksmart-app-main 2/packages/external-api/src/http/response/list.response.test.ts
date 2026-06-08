import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { QueryMetaDataResponse } from '../../schemas/route-query.schema';
import type { TransformPageInfoData } from '../../transformers/common/page-info.transformer';
import type { AuthenticatedRequest } from '../../types/request';
import type { DateTimeUuidMetadata, Metadata } from '../../types/service';
import type { ListDataTransformFn } from '../../types/transform';
import { processListResponses } from './list.response';

describe('list.response', () => {
  let mockPageDataTransformer: TransformPageInfoData;
  let mockReq: AuthenticatedRequest;

  // Common mock data
  const mockBasePath = '/api/v1';
  const mockLinkId = '123e4567-e89b-12d3-a456-426614174000';
  const mockResourceName = 'items';

  const mockDataIn = [
    {
      Id: '111e1111-e89b-12d3-a456-426614174111',
      Title: 'Item 1',
      SequentialId: 1,
    },
    {
      Id: '222e2222-e89b-12d3-a456-426614174222',
      Title: 'Item 2',
      SequentialId: 2,
    },
  ];

  const mockDataOut = [
    {
      id: '111e1111-e89b-12d3-a456-426614174111',
      title: 'Item 1',
      href: '/api/v1/items/111e1111-e89b-12d3-a456-426614174111',
    },
    {
      id: '222e2222-e89b-12d3-a456-426614174222',
      title: 'Item 2',
      href: '/api/v1/items/222e2222-e89b-12d3-a456-426614174222',
    },
  ];

  const mockMetadata: Metadata = {
    nextId: 3,
    prevId: null,
    hasNext: true,
    hasPrev: false,
    count: 2,
  };

  const mockDateTimeMetadata: DateTimeUuidMetadata = {
    nextId: '333e3333-e89b-12d3-a456-426614174333',
    nextDateTime: '2024-01-03T00:00:00Z',
    prevId: '000e0000-e89b-12d3-a456-426614174000',
    prevDateTime: '2024-01-01T00:00:00Z',
    hasNext: true,
    hasPrev: false,
    count: 2,
  };

  const mockPageInfo: QueryMetaDataResponse = {
    count: 2,
    beforeCursor: null,
    afterCursor: 'cursor-after',
    nextPage: '/api/v1/items?start_after=cursor-after',
    prevPage: null,
    hasMore: true,
  };

  const mockTransformFn: ListDataTransformFn<
    typeof mockDataIn,
    typeof mockDataOut
  > = vi.fn(() => mockDataOut);

  beforeEach(() => {
    vi.clearAllMocks();

    mockPageDataTransformer = vi.fn();

    mockReq = {
      baseUrl: `${mockBasePath}/${mockResourceName}`,
      requestLogger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
      },
    } as unknown as AuthenticatedRequest;
  });

  describe('processListResponses factory', () => {
    it('should create processListResponses with correct method', () => {
      const processor = processListResponses({
        pageDataTransformer: mockPageDataTransformer,
      });

      expect(processor).toHaveProperty('processListResponse');
      expect(typeof processor.processListResponse).toBe('function');
    });
  });

  describe('processListResponse', () => {
    describe('happy path - with sequential ID metadata', () => {
      it('should process list response with metadata and forward pagination', () => {
        const result = {
          data: mockDataIn,
          metadata: mockMetadata,
        };

        vi.mocked(mockPageDataTransformer).mockReturnValue(mockPageInfo);

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        const output = processor.processListResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          pageSize: 10,
          hasBeforeCursor: false,
          basePath: mockBasePath,
        });

        expect(mockTransformFn).toHaveBeenCalledWith(result, {
          basePath: mockBasePath,
          linkId: undefined,
          resourceName: mockResourceName,
        });

        expect(mockPageDataTransformer).toHaveBeenCalledWith(
          {
            ...mockMetadata,
            pageSize: 10,
          },
          {
            req: mockReq,
            isForward: true,
          }
        );

        expect(output).toEqual({
          data: mockDataOut,
          pageInfo: mockPageInfo,
        });
      });

      it('should process list response with backward pagination', () => {
        const result = {
          data: mockDataIn,
          metadata: mockMetadata,
        };

        vi.mocked(mockPageDataTransformer).mockReturnValue(mockPageInfo);

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        processor.processListResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          pageSize: 10,
          hasBeforeCursor: true,
          basePath: mockBasePath,
        });

        expect(mockPageDataTransformer).toHaveBeenCalledWith(
          expect.any(Object),
          {
            req: mockReq,
            isForward: false,
          }
        );
      });

      it('should handle pageSize as null or undefined', () => {
        const result = {
          data: mockDataIn,
          metadata: mockMetadata,
        };

        vi.mocked(mockPageDataTransformer).mockReturnValue(mockPageInfo);

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        processor.processListResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          pageSize: null,
          hasBeforeCursor: false,
          basePath: mockBasePath,
        });

        expect(mockPageDataTransformer).toHaveBeenCalledWith(
          {
            ...mockMetadata,
            pageSize: undefined,
          },
          expect.any(Object)
        );
      });

      it('should handle pageSize as undefined', () => {
        const result = {
          data: mockDataIn,
          metadata: mockMetadata,
        };

        vi.mocked(mockPageDataTransformer).mockReturnValue(mockPageInfo);

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        processor.processListResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          pageSize: undefined,
          hasBeforeCursor: false,
          basePath: mockBasePath,
        });

        expect(mockPageDataTransformer).toHaveBeenCalledWith(
          {
            ...mockMetadata,
            pageSize: undefined,
          },
          expect.any(Object)
        );
      });
    });

    describe('happy path - with datetime UUID metadata', () => {
      it('should process list response with datetime UUID metadata', () => {
        const result = {
          data: mockDataIn,
          metadata: mockDateTimeMetadata,
        };

        vi.mocked(mockPageDataTransformer).mockReturnValue(mockPageInfo);

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        const output = processor.processListResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          pageSize: 10,
          hasBeforeCursor: false,
          basePath: mockBasePath,
        });

        expect(mockTransformFn).toHaveBeenCalledWith(result, {
          basePath: mockBasePath,
          linkId: undefined,
          resourceName: mockResourceName,
        });

        expect(mockPageDataTransformer).toHaveBeenCalledWith(
          {
            ...mockDateTimeMetadata,
            pageSize: 10,
          },
          {
            req: mockReq,
            isForward: true,
          }
        );

        expect(output).toEqual({
          data: mockDataOut,
          pageInfo: mockPageInfo,
        });
      });
    });

    describe('happy path - with linkId', () => {
      it('should pass linkId to transform function when provided', () => {
        const result = {
          data: mockDataIn,
          metadata: mockMetadata,
        };

        vi.mocked(mockPageDataTransformer).mockReturnValue(mockPageInfo);

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        processor.processListResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          pageSize: 10,
          hasBeforeCursor: false,
          basePath: mockBasePath,
          linkId: mockLinkId,
        });

        expect(mockTransformFn).toHaveBeenCalledWith(result, {
          basePath: mockBasePath,
          linkId: mockLinkId,
          resourceName: mockResourceName,
        });
      });
    });

    describe('happy path - resource name extraction', () => {
      it('should extract resource name from baseUrl', () => {
        const result = {
          data: mockDataIn,
          metadata: mockMetadata,
        };

        mockReq.baseUrl = '/api/v1/risks';

        vi.mocked(mockPageDataTransformer).mockReturnValue(mockPageInfo);

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        processor.processListResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          pageSize: 10,
          hasBeforeCursor: false,
          basePath: mockBasePath,
        });

        expect(mockTransformFn).toHaveBeenCalledWith(result, {
          basePath: mockBasePath,
          linkId: undefined,
          resourceName: 'risks',
        });
      });

      it('should handle baseUrl with trailing slash', () => {
        const result = {
          data: mockDataIn,
          metadata: mockMetadata,
        };

        mockReq.baseUrl = '/api/v1/controls/';

        vi.mocked(mockPageDataTransformer).mockReturnValue(mockPageInfo);

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        processor.processListResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          pageSize: 10,
          hasBeforeCursor: false,
          basePath: mockBasePath,
        });

        expect(mockTransformFn).toHaveBeenCalledWith(result, {
          basePath: mockBasePath,
          linkId: undefined,
          resourceName: 'controls/',
        });
      });

      it('should handle baseUrl with nested paths', () => {
        const result = {
          data: mockDataIn,
          metadata: mockMetadata,
        };

        mockReq.baseUrl = '/api/v1/risks/123/controls';

        vi.mocked(mockPageDataTransformer).mockReturnValue(mockPageInfo);

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        processor.processListResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          pageSize: 10,
          hasBeforeCursor: false,
          basePath: mockBasePath,
        });

        expect(mockTransformFn).toHaveBeenCalledWith(result, {
          basePath: mockBasePath,
          linkId: undefined,
          resourceName: 'risks/123/controls',
        });
      });

      it('should handle empty resource name when baseUrl equals basePath', () => {
        const result = {
          data: mockDataIn,
          metadata: mockMetadata,
        };

        mockReq.baseUrl = mockBasePath;

        vi.mocked(mockPageDataTransformer).mockReturnValue(mockPageInfo);

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        processor.processListResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          pageSize: 10,
          hasBeforeCursor: false,
          basePath: mockBasePath,
        });

        expect(mockTransformFn).toHaveBeenCalledWith(result, {
          basePath: mockBasePath,
          linkId: undefined,
          resourceName: '',
        });
      });
    });

    describe('happy path - empty list', () => {
      it('should handle empty data list', () => {
        const result = {
          data: [],
          metadata: { ...mockMetadata, count: 0, hasNext: false },
        };

        const emptyPageInfo = {
          ...mockPageInfo,
          count: 0,
          hasMore: false,
        };

        const emptyTransformFn: ListDataTransformFn<never[], never[]> = vi.fn(
          () => []
        );

        vi.mocked(mockPageDataTransformer).mockReturnValue(emptyPageInfo);

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        const output = processor.processListResponse({
          result,
          dataTransformFn: emptyTransformFn,
          req: mockReq,
          pageSize: 10,
          hasBeforeCursor: false,
          basePath: mockBasePath,
        });

        expect(output).toEqual({
          data: [],
          pageInfo: emptyPageInfo,
        });
      });
    });

    describe('error handling - transformation errors', () => {
      it('should throw error and log when data transformation fails', () => {
        const result = {
          data: mockDataIn,
          metadata: mockMetadata,
        };

        const transformError = new Error('Transform failed');

        const failingTransformFn = vi.fn(() => {
          throw transformError;
        });

        vi.mocked(mockPageDataTransformer).mockReturnValue(mockPageInfo);

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        expect(() => {
          processor.processListResponse({
            result,
            dataTransformFn: failingTransformFn,
            req: mockReq,
            pageSize: 10,
            hasBeforeCursor: false,
            basePath: mockBasePath,
          });
        }).toThrow('unable to transform response data for list');

        expect(mockReq.requestLogger.error).toHaveBeenCalledWith(
          {
            event: 'list_response_data_error',
            error: transformError,
          },
          'Error while trying to transform response list data'
        );

        // pageDataTransformer should not be called if transform fails
        expect(mockPageDataTransformer).not.toHaveBeenCalled();
      });

      it('should handle non-Error objects thrown during transformation', () => {
        const result = {
          data: mockDataIn,
          metadata: mockMetadata,
        };

        const failingTransformFn = vi.fn(() => {
          throw Error('String error');
        });

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        expect(() => {
          processor.processListResponse({
            result,
            dataTransformFn: failingTransformFn,
            req: mockReq,
            pageSize: 10,
            hasBeforeCursor: false,
            basePath: mockBasePath,
          });
        }).toThrow('unable to transform response data for list');

        expect(mockReq.requestLogger.error).toHaveBeenCalledWith(
          {
            event: 'list_response_data_error',
            error: expect.any(Error) as Error,
          },
          'Error while trying to transform response list data'
        );
      });

      it('should throw error when page info transformation fails after data transform succeeds', () => {
        const result = {
          data: mockDataIn,
          metadata: mockMetadata,
        };

        const pageTransformError = new Error('Page transform failed');

        vi.mocked(mockPageDataTransformer).mockImplementation(() => {
          throw pageTransformError;
        });

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        // The error from pageDataTransformer will be caught and re-thrown with a generic message
        expect(() => {
          processor.processListResponse({
            result,
            dataTransformFn: mockTransformFn,
            req: mockReq,
            pageSize: 10,
            hasBeforeCursor: false,
            basePath: mockBasePath,
          });
        }).toThrow('unable to transform response data for list');

        expect(mockReq.requestLogger.error).toHaveBeenCalledWith(
          {
            event: 'list_response_data_error',
            error: pageTransformError,
          },
          'Error while trying to transform response list data'
        );

        // Data transform should have been called first
        expect(mockTransformFn).toHaveBeenCalled();
      });
    });

    describe('edge cases', () => {
      it('should handle zero pageSize', () => {
        const result = {
          data: mockDataIn,
          metadata: mockMetadata,
        };

        vi.mocked(mockPageDataTransformer).mockReturnValue(mockPageInfo);

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        processor.processListResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          pageSize: 0,
          hasBeforeCursor: false,
          basePath: mockBasePath,
        });

        expect(mockPageDataTransformer).toHaveBeenCalledWith(
          {
            ...mockMetadata,
            pageSize: 0,
          },
          expect.any(Object)
        );
      });

      it('should handle large pageSize', () => {
        const result = {
          data: mockDataIn,
          metadata: mockMetadata,
        };

        vi.mocked(mockPageDataTransformer).mockReturnValue(mockPageInfo);

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        processor.processListResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          pageSize: 1000,
          hasBeforeCursor: false,
          basePath: mockBasePath,
        });

        expect(mockPageDataTransformer).toHaveBeenCalledWith(
          {
            ...mockMetadata,
            pageSize: 1000,
          },
          expect.any(Object)
        );
      });

      it('should handle baseUrl with special characters', () => {
        const result = {
          data: mockDataIn,
          metadata: mockMetadata,
        };

        mockReq.baseUrl = '/api/v1/my-resources_123';

        vi.mocked(mockPageDataTransformer).mockReturnValue(mockPageInfo);

        const processor = processListResponses({
          pageDataTransformer: mockPageDataTransformer,
        });

        processor.processListResponse({
          result,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          pageSize: 10,
          hasBeforeCursor: false,
          basePath: mockBasePath,
        });

        expect(mockTransformFn).toHaveBeenCalledWith(result, {
          basePath: mockBasePath,
          linkId: undefined,
          resourceName: 'my-resources_123',
        });
      });
    });
  });
});
