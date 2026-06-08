import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  QueryCursor,
  QueryMetaDataResponse,
} from '../../schemas/route-query.schema';
import type { AuthenticatedRequest } from '../../types/request';
import type {
  LinkedListIdDateTimeQueryFetchFn,
  LinkedListQueryFetchFn,
  ListDateTimeQueryFetchFn,
  ListQueryFetchFn,
  Metadata,
} from '../../types/service';
import type { ListDataTransformFn } from '../../types/transform';
import type { ProcessListResponses } from '../response/list.response';
import { type QueryListRequestConfig, queryListRequests } from './list.request';

describe('list.request', () => {
  let mockProcessListResponses: ProcessListResponses;
  let mockConfig: QueryListRequestConfig;
  let mockReq: AuthenticatedRequest;

  // Common mock data
  const mockAuthToken = 'Bearer test-token';
  const mockBasePath = '/api/v1';
  const mockLinkId = '123e4567-e89b-12d3-a456-426614174000';

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

    mockProcessListResponses = {
      processListResponse: vi.fn(),
    } as unknown as ProcessListResponses;

    mockConfig = {
      basePath: mockBasePath,
      defaultPageLimit: 25,
      cursorDelimiter: '|',
    };

    mockReq = {
      params: {},
      headers: {
        authorization: mockAuthToken,
      },
      listQueryOptions: null,
      requestLogger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
      },
    } as unknown as AuthenticatedRequest;
  });

  describe('queryListRequests factory', () => {
    it('should create query list requests with correct methods', () => {
      const requests = queryListRequests({
        config: mockConfig,
        processListResponses: mockProcessListResponses,
      });

      expect(requests).toHaveProperty('listQueryFetch');
      expect(requests).toHaveProperty('linkedListQueryFetch');
      expect(requests).toHaveProperty('linkedListQueryFetchByIdDateTime');
      expect(requests).toHaveProperty('listQueryFetchByIdDateTime');
      expect(typeof requests.listQueryFetch).toBe('function');
      expect(typeof requests.linkedListQueryFetch).toBe('function');
      expect(typeof requests.linkedListQueryFetchByIdDateTime).toBe('function');
      expect(typeof requests.listQueryFetchByIdDateTime).toBe('function');
    });
  });

  describe('listQueryFetch', () => {
    const mockFetchFn: ListQueryFetchFn<typeof mockDataIn> = vi.fn();
    const mockResult = {
      data: mockDataIn,
      metadata: mockMetadata,
    };

    describe('happy path', () => {
      it('should fetch and process list with default pagination', async () => {
        vi.mocked(mockFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        const result = await requests.listQueryFetch(
          mockFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockFetchFn).toHaveBeenCalledWith(
          {
            limit: mockConfig.defaultPageLimit,
            beforeId: null,
            afterId: null,
          },
          {
            authToken: mockAuthToken,
          }
        );

        expect(
          mockProcessListResponses.processListResponse
        ).toHaveBeenCalledWith({
          result: mockResult,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          pageSize: undefined,
          hasBeforeCursor: false,
          basePath: mockBasePath,
        });

        expect(result).toEqual({
          data: mockDataOut,
          pageInfo: mockPageInfo,
        });
      });

      it('should fetch with custom pageSize from listQueryOptions', async () => {
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: null,
        };

        vi.mocked(mockFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        const result = await requests.listQueryFetch(
          mockFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockFetchFn).toHaveBeenCalledWith(
          {
            limit: 10,
            beforeId: null,
            afterId: null,
          },
          {
            authToken: mockAuthToken,
          }
        );

        expect(result).toEqual({
          data: mockDataOut,
          pageInfo: mockPageInfo,
        });
      });

      it('should fetch with afterCursor pagination', async () => {
        mockReq.listQueryOptions = {
          pageSize: 15,
          beforeCursor: null,
          afterCursor: {
            cursorId: '5',
            idType: 'sequentialId',
            type: 'after',
            version: 1,
          },
        };

        vi.mocked(mockFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.listQueryFetch(mockFetchFn, mockTransformFn, mockReq);

        expect(mockFetchFn).toHaveBeenCalledWith(
          {
            limit: 15,
            beforeId: null,
            afterId: 5,
          },
          {
            authToken: mockAuthToken,
          }
        );
      });

      it('should fetch with beforeCursor pagination', async () => {
        mockReq.listQueryOptions = {
          pageSize: 20,
          beforeCursor: {
            cursorId: '10',
            idType: 'sequentialId',
            type: 'before',
            version: 1,
          },
          afterCursor: null,
        };

        vi.mocked(mockFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.listQueryFetch(mockFetchFn, mockTransformFn, mockReq);

        expect(mockFetchFn).toHaveBeenCalledWith(
          {
            limit: 20,
            beforeId: 10,
            afterId: null,
          },
          {
            authToken: mockAuthToken,
          }
        );
      });

      it('should use custom basePath when provided', async () => {
        const customBasePath = '/api/v2';

        vi.mocked(mockFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.listQueryFetch(
          mockFetchFn,
          mockTransformFn,
          mockReq,
          customBasePath
        );

        expect(
          mockProcessListResponses.processListResponse
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            basePath: customBasePath,
          })
        );
      });

      it('should handle empty authorization header', async () => {
        mockReq.headers = {};

        vi.mocked(mockFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.listQueryFetch(mockFetchFn, mockTransformFn, mockReq);

        expect(mockFetchFn).toHaveBeenCalledWith(expect.any(Object), {
          authToken: '',
        });
      });

      it('should handle empty result list', async () => {
        const emptyResult = {
          data: [],
          metadata: { ...mockMetadata, count: 0, hasNext: false },
        };

        vi.mocked(mockFetchFn).mockResolvedValue(emptyResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: [],
            pageInfo: { ...mockPageInfo, count: 0, hasMore: false },
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        const result = await requests.listQueryFetch(
          mockFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(result.data).toEqual([]);
        expect(result.pageInfo.count).toBe(0);
      });
    });

    describe('edge cases - cursor parsing', () => {
      it('should handle non-numeric cursorId in afterCursor', async () => {
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: 'not-a-number',
            idType: 'sequentialId',
            type: 'after',
            version: 1,
          },
        };

        vi.mocked(mockFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.listQueryFetch(mockFetchFn, mockTransformFn, mockReq);

        expect(mockFetchFn).toHaveBeenCalledWith(
          {
            limit: 10,
            beforeId: null,
            afterId: null,
          },
          {
            authToken: mockAuthToken,
          }
        );
      });

      it('should handle non-numeric cursorId in beforeCursor', async () => {
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: {
            cursorId: 'invalid',
            idType: 'sequentialId',
            type: 'before',
            version: 1,
          },
          afterCursor: null,
        };

        vi.mocked(mockFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.listQueryFetch(mockFetchFn, mockTransformFn, mockReq);

        expect(mockFetchFn).toHaveBeenCalledWith(
          {
            limit: 10,
            beforeId: null,
            afterId: null,
          },
          {
            authToken: mockAuthToken,
          }
        );
      });
    });

    describe('error handling', () => {
      it('should throw error when fetch function fails', async () => {
        const fetchError = new Error('Database connection failed');

        vi.mocked(mockFetchFn).mockRejectedValue(fetchError);

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await expect(
          requests.listQueryFetch(mockFetchFn, mockTransformFn, mockReq)
        ).rejects.toThrow('Database connection failed');
      });

      it('should throw error when processListResponse throws', async () => {
        const processingError = new Error('Transform failed');

        vi.mocked(mockFetchFn).mockResolvedValue(mockResult);
        vi.mocked(
          mockProcessListResponses.processListResponse
        ).mockImplementation(() => {
          throw processingError;
        });

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await expect(
          requests.listQueryFetch(mockFetchFn, mockTransformFn, mockReq)
        ).rejects.toThrow('Transform failed');
      });
    });
  });

  describe('linkedListQueryFetch', () => {
    const mockSeqFetchFn: LinkedListQueryFetchFn<typeof mockDataIn> = vi.fn();
    const mockResult = {
      data: mockDataIn,
      metadata: mockMetadata,
    };

    describe('happy path - sequential ID pagination', () => {
      it('should fetch linked list with sequential ID pagination', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: '5',
            idType: 'sequentialId',
            type: 'after',
            version: 1,
          },
        };

        vi.mocked(mockSeqFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        const result = await requests.linkedListQueryFetch(
          mockSeqFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockSeqFetchFn).toHaveBeenCalledWith(
          mockLinkId,
          {
            limit: 10,
            beforeId: null,
            afterId: 5,
          },
          {
            authToken: mockAuthToken,
          }
        );

        expect(result).toEqual({
          data: mockDataOut,
          pageInfo: mockPageInfo,
        });
      });

      it('should fetch with afterCursor for sequential ID', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: '12',
            idType: 'sequentialId',
            type: 'after',
            version: 1,
          },
        };

        vi.mocked(mockSeqFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.linkedListQueryFetch(
          mockSeqFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockSeqFetchFn).toHaveBeenCalledWith(
          mockLinkId,
          {
            limit: 10,
            beforeId: null,
            afterId: 12,
          },
          {
            authToken: mockAuthToken,
          }
        );
      });

      it('should fetch with beforeCursor for sequential ID', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 15,
          beforeCursor: {
            cursorId: '20',
            idType: 'sequentialId',
            type: 'before',
            version: 1,
          },
          afterCursor: null,
        };

        vi.mocked(mockSeqFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.linkedListQueryFetch(
          mockSeqFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockSeqFetchFn).toHaveBeenCalledWith(
          mockLinkId,
          {
            limit: 15,
            beforeId: 20,
            afterId: null,
          },
          {
            authToken: mockAuthToken,
          }
        );
      });
    });

    describe('happy path - other options', () => {
      it('should use custom basePath when provided', async () => {
        mockReq.params.id = mockLinkId;
        const customBasePath = '/api/v3';

        vi.mocked(mockSeqFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.linkedListQueryFetch(
          mockSeqFetchFn,
          mockTransformFn,
          mockReq,
          customBasePath
        );

        expect(
          mockProcessListResponses.processListResponse
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            basePath: customBasePath,
          })
        );
      });

      it('should handle empty authorization header', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.headers = {};

        vi.mocked(mockSeqFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.linkedListQueryFetch(
          mockSeqFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockSeqFetchFn).toHaveBeenCalledWith(
          mockLinkId,
          expect.any(Object),
          {
            authToken: '',
          }
        );
      });

      it('should pass linkId to processListResponse', async () => {
        mockReq.params.id = mockLinkId;

        vi.mocked(mockSeqFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.linkedListQueryFetch(
          mockSeqFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(
          mockProcessListResponses.processListResponse
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            linkId: mockLinkId,
          })
        );
      });
    });

    describe('error handling - missing link id', () => {
      it('should return HttpError and log warning when link id is missing', async () => {
        mockReq.params = {};

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await expect(
          requests.linkedListQueryFetch(
            mockSeqFetchFn,
            mockTransformFn,
            mockReq
          )
        ).rejects.toMatchObject({
          status: 400,
          message: 'Invalid nested resource ID provided.',
        });

        expect(mockReq.requestLogger.warn).toHaveBeenCalledWith(
          {
            event: 'invalid_resource_id',
            id: undefined,
            path: undefined,
          },
          'Invalid resource id from path params'
        );
        expect(mockSeqFetchFn).not.toHaveBeenCalled();
      });

      it('should return HttpError and log warning when link id is empty string', async () => {
        mockReq.params.id = '';

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await expect(
          requests.linkedListQueryFetch(
            mockSeqFetchFn,
            mockTransformFn,
            mockReq
          )
        ).rejects.toMatchObject({
          status: 400,
          message: 'Invalid nested resource ID provided.',
        });

        expect(mockReq.requestLogger.warn).toHaveBeenCalledWith(
          {
            event: 'invalid_resource_id',
            id: '',
            path: undefined,
          },
          'Invalid resource id from path params'
        );
        expect(mockSeqFetchFn).not.toHaveBeenCalled();
      });

      it('should return HttpError when link id is null', async () => {
        mockReq.params.id = null as unknown as string;

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await expect(
          requests.linkedListQueryFetch(
            mockSeqFetchFn,
            mockTransformFn,
            mockReq
          )
        ).rejects.toMatchObject({
          status: 400,
          message: 'Invalid nested resource ID provided.',
        });

        expect(mockReq.requestLogger.warn).toHaveBeenCalledWith(
          expect.objectContaining({
            event: 'invalid_resource_id',
            id: null,
          }),
          'Invalid resource id from path params'
        );
        expect(mockSeqFetchFn).not.toHaveBeenCalled();
      });
    });

    describe('error handling - null result', () => {
      it('should return null when fetch function returns null', async () => {
        mockReq.params.id = mockLinkId;

        vi.mocked(mockSeqFetchFn).mockResolvedValue(null as never);

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        const result = await requests.linkedListQueryFetch(
          mockSeqFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(result).toBeNull();
        expect(
          mockProcessListResponses.processListResponse
        ).not.toHaveBeenCalled();
      });
    });

    describe('error handling - fetch and processing errors', () => {
      it('should throw error when fetch function fails', async () => {
        mockReq.params.id = mockLinkId;
        const fetchError = new Error('Service unavailable');

        vi.mocked(mockSeqFetchFn).mockRejectedValue(fetchError);

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await expect(
          requests.linkedListQueryFetch(
            mockSeqFetchFn,
            mockTransformFn,
            mockReq
          )
        ).rejects.toThrow('Service unavailable');
      });

      it('should throw error when processListResponse throws', async () => {
        mockReq.params.id = mockLinkId;
        const processingError = new Error('Transform failed');

        vi.mocked(mockSeqFetchFn).mockResolvedValue(mockResult);
        vi.mocked(
          mockProcessListResponses.processListResponse
        ).mockImplementation(() => {
          throw processingError;
        });

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await expect(
          requests.linkedListQueryFetch(
            mockSeqFetchFn,
            mockTransformFn,
            mockReq
          )
        ).rejects.toThrow('Transform failed');
      });
    });

    describe('error handling - invalid cursor type', () => {
      it('should return HttpError when uuidDateTime cursor is provided', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: 'uuid-123|2024-01-01T00:00:00Z',
            idType: 'uuidDateTime',
            type: 'after',
            version: 1,
          },
        };

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await expect(
          requests.linkedListQueryFetch(
            mockSeqFetchFn,
            mockTransformFn,
            mockReq
          )
        ).rejects.toMatchObject({
          status: 400,
          message: 'Incorrect cursor provided in query',
        });

        expect(mockSeqFetchFn).not.toHaveBeenCalled();
      });

      it('should accept no cursor type (defaults to sequentialId)', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: null,
        };

        vi.mocked(mockSeqFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        const result = await requests.linkedListQueryFetch(
          mockSeqFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockSeqFetchFn).toHaveBeenCalled();
        expect(result).toEqual({
          data: mockDataOut,
          pageInfo: mockPageInfo,
        });
      });
    });
  });

  describe('linkedListQueryFetchByIdDateTime', () => {
    const mockDateTimeFetchFn: LinkedListIdDateTimeQueryFetchFn<
      typeof mockDataIn
    > = vi.fn();
    const mockResult = {
      data: mockDataIn,
      metadata: mockMetadata,
    };

    describe('happy path', () => {
      it('should fetch linked list with uuidDateTime pagination using afterCursor', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: 'uuid-123|2024-01-01T00:00:00Z',
            idType: 'uuidDateTime',
            type: 'after',
            version: 1,
          },
        };

        vi.mocked(mockDateTimeFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        const result = await requests.linkedListQueryFetchByIdDateTime(
          mockDateTimeFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockDateTimeFetchFn).toHaveBeenCalledWith(
          mockLinkId,
          {
            limit: 10,
            beforeId: null,
            beforeDateTime: null,
            afterId: 'uuid-123',
            afterDateTime: '2024-01-01T00:00:00Z',
          },
          {
            authToken: mockAuthToken,
          }
        );

        expect(result).toEqual({
          data: mockDataOut,
          pageInfo: mockPageInfo,
        });
      });

      it('should fetch with beforeCursor for uuidDateTime', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 15,
          beforeCursor: {
            cursorId: 'uuid-456|2024-02-01T00:00:00Z',
            idType: 'uuidDateTime',
            type: 'before',
            version: 1,
          },
          afterCursor: null,
        };

        vi.mocked(mockDateTimeFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        const result = await requests.linkedListQueryFetchByIdDateTime(
          mockDateTimeFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockDateTimeFetchFn).toHaveBeenCalledWith(
          mockLinkId,
          {
            limit: 15,
            beforeId: 'uuid-456',
            beforeDateTime: '2024-02-01T00:00:00Z',
            afterId: null,
            afterDateTime: null,
          },
          {
            authToken: mockAuthToken,
          }
        );

        expect(result).toEqual({
          data: mockDataOut,
          pageInfo: mockPageInfo,
        });
      });

      it('should handle cursor with no delimiter (only ID)', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: 'uuid-only-no-delimiter',
            idType: 'uuidDateTime',
            type: 'after',
            version: 1,
          },
        };

        vi.mocked(mockDateTimeFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        const result = await requests.linkedListQueryFetchByIdDateTime(
          mockDateTimeFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockDateTimeFetchFn).toHaveBeenCalledWith(
          mockLinkId,
          {
            limit: 10,
            beforeId: null,
            beforeDateTime: null,
            afterId: 'uuid-only-no-delimiter',
            afterDateTime: null,
          },
          {
            authToken: mockAuthToken,
          }
        );

        expect(result).toEqual({
          data: mockDataOut,
          pageInfo: mockPageInfo,
        });
      });

      it('should use default page limit when pageSize is not specified', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 25,
          beforeCursor: null,
          afterCursor: {
            cursorId: 'uuid-789|2024-03-01T00:00:00Z',
            idType: 'uuidDateTime',
            type: 'after',
            version: 1,
          },
        };

        vi.mocked(mockDateTimeFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.linkedListQueryFetchByIdDateTime(
          mockDateTimeFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockDateTimeFetchFn).toHaveBeenCalledWith(
          mockLinkId,
          expect.objectContaining({
            limit: mockConfig.defaultPageLimit,
          }),
          expect.any(Object)
        );
      });

      it('should handle both before and after cursors', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 20,
          beforeCursor: {
            cursorId: 'uuid-before|2024-01-15T12:00:00Z',
            idType: 'uuidDateTime',
            type: 'before',
            version: 1,
          },
          afterCursor: {
            cursorId: 'uuid-after|2024-01-01T00:00:00Z',
            idType: 'uuidDateTime',
            type: 'after',
            version: 1,
          },
        };

        vi.mocked(mockDateTimeFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.linkedListQueryFetchByIdDateTime(
          mockDateTimeFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockDateTimeFetchFn).toHaveBeenCalledWith(
          mockLinkId,
          {
            limit: 20,
            beforeId: 'uuid-before',
            beforeDateTime: '2024-01-15T12:00:00Z',
            afterId: 'uuid-after',
            afterDateTime: '2024-01-01T00:00:00Z',
          },
          {
            authToken: mockAuthToken,
          }
        );
      });

      it('should use custom basePath when provided', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: 'uuid-123|2024-01-01T00:00:00Z',
            idType: 'uuidDateTime',
            type: 'after',
            version: 1,
          },
        };
        const customBasePath = '/api/v2';

        vi.mocked(mockDateTimeFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.linkedListQueryFetchByIdDateTime(
          mockDateTimeFetchFn,
          mockTransformFn,
          mockReq,
          customBasePath
        );

        expect(
          mockProcessListResponses.processListResponse
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            basePath: customBasePath,
          })
        );
      });

      it('should handle empty authorization header', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.headers = {};
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: 'uuid-123|2024-01-01T00:00:00Z',
            idType: 'uuidDateTime',
            type: 'after',
            version: 1,
          },
        };

        vi.mocked(mockDateTimeFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.linkedListQueryFetchByIdDateTime(
          mockDateTimeFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockDateTimeFetchFn).toHaveBeenCalledWith(
          mockLinkId,
          expect.any(Object),
          {
            authToken: '',
          }
        );
      });

      it('should pass linkId to processListResponse', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: 'uuid-123|2024-01-01T00:00:00Z',
            idType: 'uuidDateTime',
            type: 'after',
            version: 1,
          },
        };

        vi.mocked(mockDateTimeFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.linkedListQueryFetchByIdDateTime(
          mockDateTimeFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(
          mockProcessListResponses.processListResponse
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            linkId: mockLinkId,
          })
        );
      });

      it('should pass hasBeforeCursor as true when beforeCursor is present', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: {
            cursorId: 'uuid-before|2024-01-15T12:00:00Z',
            idType: 'uuidDateTime',
            type: 'before',
            version: 1,
          },
          afterCursor: null,
        };

        vi.mocked(mockDateTimeFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.linkedListQueryFetchByIdDateTime(
          mockDateTimeFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(
          mockProcessListResponses.processListResponse
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            hasBeforeCursor: true,
          })
        );
      });

      it('should pass hasBeforeCursor as false when no beforeCursor', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: 'uuid-after|2024-01-01T00:00:00Z',
            idType: 'uuidDateTime',
            type: 'after',
            version: 1,
          },
        };

        vi.mocked(mockDateTimeFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.linkedListQueryFetchByIdDateTime(
          mockDateTimeFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(
          mockProcessListResponses.processListResponse
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            hasBeforeCursor: false,
          })
        );
      });
    });

    describe('error handling - missing link id', () => {
      it.each([
        { label: 'missing', params: {} as Record<string, string> },
        { label: 'empty string', params: { id: '' } },
        { label: 'null', params: { id: null as unknown as string } },
      ])(
        'should throw HttpError when link id is $label',
        async ({ params }) => {
          mockReq.params = params;

          const requests = queryListRequests({
            config: mockConfig,
            processListResponses: mockProcessListResponses,
          });

          await expect(
            requests.linkedListQueryFetchByIdDateTime(
              mockDateTimeFetchFn,
              mockTransformFn,
              mockReq
            )
          ).rejects.toMatchObject({
            status: 400,
            message: 'Invalid nested resource ID provided.',
          });

          expect(mockDateTimeFetchFn).not.toHaveBeenCalled();
        }
      );
    });

    describe('error handling - invalid cursor type', () => {
      it('should throw HttpError when sequentialId cursor is provided', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: '123',
            idType: 'sequentialId',
            type: 'after',
            version: 1,
          },
        };

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await expect(
          requests.linkedListQueryFetchByIdDateTime(
            mockDateTimeFetchFn,
            mockTransformFn,
            mockReq
          )
        ).rejects.toMatchObject({
          status: 400,
          message: 'Incorrect cursor provided in query',
        });

        expect(mockDateTimeFetchFn).not.toHaveBeenCalled();
      });

      it('should accept no cursor type (defaults to uuidDateTime)', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: null,
        };

        vi.mocked(mockDateTimeFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        const result = await requests.linkedListQueryFetchByIdDateTime(
          mockDateTimeFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockDateTimeFetchFn).toHaveBeenCalled();
        expect(result).toEqual({
          data: mockDataOut,
          pageInfo: mockPageInfo,
        });
      });
    });

    describe('error handling - null result', () => {
      it('should return null when fetch function returns null', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: 'uuid-123|2024-01-01T00:00:00Z',
            idType: 'uuidDateTime',
            type: 'after',
            version: 1,
          },
        };

        vi.mocked(mockDateTimeFetchFn).mockResolvedValue(null as never);

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        const result = await requests.linkedListQueryFetchByIdDateTime(
          mockDateTimeFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(result).toBeNull();
        expect(
          mockProcessListResponses.processListResponse
        ).not.toHaveBeenCalled();
      });
    });

    describe('error handling - fetch and processing errors', () => {
      it('should throw error when fetch function fails', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: 'uuid-123|2024-01-01T00:00:00Z',
            idType: 'uuidDateTime',
            type: 'after',
            version: 1,
          },
        };
        const fetchError = new Error('Network timeout');

        vi.mocked(mockDateTimeFetchFn).mockRejectedValue(fetchError);

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await expect(
          requests.linkedListQueryFetchByIdDateTime(
            mockDateTimeFetchFn,
            mockTransformFn,
            mockReq
          )
        ).rejects.toThrow('Network timeout');
      });

      it('should throw error when processListResponse throws', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: 'uuid-123|2024-01-01T00:00:00Z',
            idType: 'uuidDateTime',
            type: 'after',
            version: 1,
          },
        };
        const processingError = new Error('Invalid data format');

        vi.mocked(mockDateTimeFetchFn).mockResolvedValue(mockResult);
        vi.mocked(
          mockProcessListResponses.processListResponse
        ).mockImplementation(() => {
          throw processingError;
        });

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await expect(
          requests.linkedListQueryFetchByIdDateTime(
            mockDateTimeFetchFn,
            mockTransformFn,
            mockReq
          )
        ).rejects.toThrow('Invalid data format');
      });
    });

    describe('edge cases - cursor splitting', () => {
      it('should handle cursor with multiple delimiters (takes first split)', async () => {
        mockReq.params.id = mockLinkId;

        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: 'uuid-123|2024-01-01T00:00:00Z|extra-data',
            idType: 'uuidDateTime',
            type: 'after',
            version: 1,
          },
        };

        vi.mocked(mockDateTimeFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.linkedListQueryFetchByIdDateTime(
          mockDateTimeFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockDateTimeFetchFn).toHaveBeenCalledWith(
          mockLinkId,
          {
            limit: 10,
            beforeId: null,
            beforeDateTime: null,
            afterId: 'uuid-123',
            afterDateTime: '2024-01-01T00:00:00Z',
          },
          expect.any(Object)
        );
      });

      it('should handle empty string after delimiter', async () => {
        mockReq.params.id = mockLinkId;
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: 'uuid-123|',
            idType: 'uuidDateTime',
            type: 'after',
            version: 1,
          },
        };

        vi.mocked(mockDateTimeFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue(
          {
            data: mockDataOut,
            pageInfo: mockPageInfo,
          }
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.linkedListQueryFetchByIdDateTime(
          mockDateTimeFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockDateTimeFetchFn).toHaveBeenCalledWith(
          mockLinkId,
          {
            limit: 10,
            beforeId: null,
            beforeDateTime: null,
            afterId: 'uuid-123',
            afterDateTime: '',
          },
          expect.any(Object)
        );
      });
    });
  });

  describe('listQueryFetchByIdDateTime', () => {
    const mockTopLevelFetchFn: ListDateTimeQueryFetchFn<typeof mockDataIn> =
      vi.fn();
    const mockResult = { data: mockDataIn, metadata: mockMetadata };

    // Shared cursor fixtures
    const sharedAfterCursor: QueryCursor = {
      cursorId: 'uuid-123|2024-01-01T00:00:00Z',
      idType: 'uuidDateTime',
      type: 'after',
      version: 1,
    };
    const sharedBeforeCursor: QueryCursor = {
      cursorId: 'uuid-456|2024-02-01T00:00:00Z',
      idType: 'uuidDateTime',
      type: 'before',
      version: 1,
    };

    beforeEach(() => {
      vi.mocked(mockTopLevelFetchFn).mockResolvedValue(mockResult);
      vi.mocked(mockProcessListResponses.processListResponse).mockReturnValue({
        data: mockDataOut,
        pageInfo: mockPageInfo,
      });
    });

    describe('happy path - cursor parsing and fetch args', () => {
      it.each([
        {
          label: 'afterCursor only',
          listQueryOptions: {
            pageSize: 10,
            beforeCursor: null,
            afterCursor: sharedAfterCursor,
          },
          expectedQuery: {
            limit: 10,
            beforeId: null,
            beforeDateTime: null,
            afterId: 'uuid-123',
            afterDateTime: '2024-01-01T00:00:00Z',
          },
        },
        {
          label: 'beforeCursor only',
          listQueryOptions: {
            pageSize: 15,
            beforeCursor: sharedBeforeCursor,
            afterCursor: null,
          },
          expectedQuery: {
            limit: 15,
            beforeId: 'uuid-456',
            beforeDateTime: '2024-02-01T00:00:00Z',
            afterId: null,
            afterDateTime: null,
          },
        },
        {
          label: 'both cursors',
          listQueryOptions: {
            pageSize: 20,
            beforeCursor: sharedBeforeCursor,
            afterCursor: sharedAfterCursor,
          },
          expectedQuery: {
            limit: 20,
            beforeId: 'uuid-456',
            beforeDateTime: '2024-02-01T00:00:00Z',
            afterId: 'uuid-123',
            afterDateTime: '2024-01-01T00:00:00Z',
          },
        },
        {
          label: 'no cursors (all nulls)',
          listQueryOptions: {
            pageSize: 10,
            beforeCursor: null,
            afterCursor: null,
          },
          expectedQuery: {
            limit: 10,
            beforeId: null,
            beforeDateTime: null,
            afterId: null,
            afterDateTime: null,
          },
        },
      ])(
        'should parse $label and call fetch with correct args',
        async ({ listQueryOptions, expectedQuery }) => {
          mockReq.listQueryOptions = listQueryOptions;

          const requests = queryListRequests({
            config: mockConfig,
            processListResponses: mockProcessListResponses,
          });

          const result = await requests.listQueryFetchByIdDateTime(
            mockTopLevelFetchFn,
            mockTransformFn,
            mockReq
          );

          expect(mockTopLevelFetchFn).toHaveBeenCalledWith(expectedQuery, {
            authToken: mockAuthToken,
          });
          expect(result).toEqual({ data: mockDataOut, pageInfo: mockPageInfo });
        }
      );

      it('should use config default page limit when listQueryOptions is absent', async () => {
        mockReq.listQueryOptions = undefined;

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.listQueryFetchByIdDateTime(
          mockTopLevelFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockTopLevelFetchFn).toHaveBeenCalledWith(
          expect.objectContaining({ limit: mockConfig.defaultPageLimit }),
          expect.any(Object)
        );
      });
    });

    describe('happy path - processListResponse args', () => {
      it.each([
        {
          label: 'beforeCursor present',
          listQueryOptions: {
            pageSize: 10,
            beforeCursor: sharedBeforeCursor,
            afterCursor: null,
          },
          expectedHasBeforeCursor: true,
        },
        {
          label: 'no beforeCursor',
          listQueryOptions: {
            pageSize: 10,
            beforeCursor: null,
            afterCursor: null,
          },
          expectedHasBeforeCursor: false,
        },
      ])(
        'should pass hasBeforeCursor=$expectedHasBeforeCursor when $label',
        async ({ listQueryOptions, expectedHasBeforeCursor }) => {
          mockReq.listQueryOptions = listQueryOptions;

          const requests = queryListRequests({
            config: mockConfig,
            processListResponses: mockProcessListResponses,
          });

          await requests.listQueryFetchByIdDateTime(
            mockTopLevelFetchFn,
            mockTransformFn,
            mockReq
          );

          expect(
            mockProcessListResponses.processListResponse
          ).toHaveBeenCalledWith(
            expect.objectContaining({
              hasBeforeCursor: expectedHasBeforeCursor,
            })
          );
        }
      );

      it('should use custom basePath when provided', async () => {
        const customBasePath = '/api/v2';
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: null,
        };

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.listQueryFetchByIdDateTime(
          mockTopLevelFetchFn,
          mockTransformFn,
          mockReq,
          customBasePath
        );

        expect(
          mockProcessListResponses.processListResponse
        ).toHaveBeenCalledWith(
          expect.objectContaining({ basePath: customBasePath })
        );
      });

      it('should not pass linkId to processListResponse', async () => {
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: null,
        };

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.listQueryFetchByIdDateTime(
          mockTopLevelFetchFn,
          mockTransformFn,
          mockReq
        );

        const callArg = vi.mocked(mockProcessListResponses.processListResponse)
          .mock.calls[0]?.[0];
        expect(callArg).toBeDefined();
        expect(Object.keys(callArg!)).not.toContain('linkId');
      });

      it('should fall back to empty authToken when authorization header is absent', async () => {
        mockReq.headers = {};
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: null,
        };

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await requests.listQueryFetchByIdDateTime(
          mockTopLevelFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockTopLevelFetchFn).toHaveBeenCalledWith(expect.any(Object), {
          authToken: '',
        });
      });
    });

    describe('error handling - invalid cursor type', () => {
      it('should throw 400 when sequentialId cursor is provided', async () => {
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: {
            cursorId: '123',
            idType: 'sequentialId',
            type: 'after',
            version: 1,
          },
        };

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await expect(
          requests.listQueryFetchByIdDateTime(
            mockTopLevelFetchFn,
            mockTransformFn,
            mockReq
          )
        ).rejects.toMatchObject({
          status: 400,
          message: 'Incorrect cursor provided in query',
        });

        expect(mockTopLevelFetchFn).not.toHaveBeenCalled();
      });
    });

    describe('error handling - fetch and processing errors', () => {
      it('should throw when fetch function rejects', async () => {
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: null,
        };
        vi.mocked(mockTopLevelFetchFn).mockRejectedValue(
          new Error('Service unavailable')
        );

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await expect(
          requests.listQueryFetchByIdDateTime(
            mockTopLevelFetchFn,
            mockTransformFn,
            mockReq
          )
        ).rejects.toThrow('Service unavailable');
      });

      it('should throw when processListResponse throws', async () => {
        mockReq.listQueryOptions = {
          pageSize: 10,
          beforeCursor: null,
          afterCursor: null,
        };
        vi.mocked(
          mockProcessListResponses.processListResponse
        ).mockImplementation(() => {
          throw new Error('Transform failed');
        });

        const requests = queryListRequests({
          config: mockConfig,
          processListResponses: mockProcessListResponses,
        });

        await expect(
          requests.listQueryFetchByIdDateTime(
            mockTopLevelFetchFn,
            mockTransformFn,
            mockReq
          )
        ).rejects.toThrow('Transform failed');
      });
    });

    describe('edge cases - cursor splitting', () => {
      it.each([
        {
          label: 'no delimiter (only ID)',
          cursorId: 'uuid-only-no-delimiter',
          expectedAfterId: 'uuid-only-no-delimiter',
          expectedAfterDateTime: null as string | null,
        },
        {
          label: 'multiple delimiters (takes first two parts)',
          cursorId: 'uuid-123|2024-01-01T00:00:00Z|extra-data',
          expectedAfterId: 'uuid-123',
          expectedAfterDateTime: '2024-01-01T00:00:00Z' as string | null,
        },
        {
          label: 'empty string after delimiter',
          cursorId: 'uuid-123|',
          expectedAfterId: 'uuid-123',
          expectedAfterDateTime: '' as string | null,
        },
      ])(
        'should handle $label',
        async ({ cursorId, expectedAfterId, expectedAfterDateTime }) => {
          mockReq.listQueryOptions = {
            pageSize: 10,
            beforeCursor: null,
            afterCursor: {
              cursorId,
              idType: 'uuidDateTime',
              type: 'after',
              version: 1,
            },
          };

          const requests = queryListRequests({
            config: mockConfig,
            processListResponses: mockProcessListResponses,
          });

          await requests.listQueryFetchByIdDateTime(
            mockTopLevelFetchFn,
            mockTransformFn,
            mockReq
          );

          expect(mockTopLevelFetchFn).toHaveBeenCalledWith(
            {
              limit: 10,
              beforeId: null,
              beforeDateTime: null,
              afterId: expectedAfterId,
              afterDateTime: expectedAfterDateTime,
            },
            expect.any(Object)
          );
        }
      );
    });
  });
});
