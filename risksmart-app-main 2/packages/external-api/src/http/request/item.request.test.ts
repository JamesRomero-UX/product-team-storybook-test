import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthenticatedRequest } from '../../types/request';
import type {
  ByIdQueryFetchFn,
  LinkedByIdQueryFetchFn,
} from '../../types/service';
import type { DataEntityTransformFn } from '../../types/transform';
import type { ProcessItemResponses } from '../response/item.response';
import { type QueryItemRequestConfig, queryItemRequests } from './item.request';

describe('item.request', () => {
  let mockProcessItemResponses: ProcessItemResponses;
  let mockConfig: QueryItemRequestConfig;
  let mockReq: AuthenticatedRequest;

  // Common mock data
  const mockAuthToken = 'Bearer test-token';
  const mockId = '123e4567-e89b-12d3-a456-426614174000';
  const mockLinkId = '987e6543-e89b-12d3-a456-426614174999';
  const mockBasePath = '/api/v1';

  const mockDataIn = {
    Id: mockId,
    Title: 'Test Item',
    Description: 'Test Description',
  };

  const mockDataOut = {
    id: mockId,
    title: 'Test Item',
    description: 'Test Description',
    customFields: {},
  };

  const mockTransformFn: DataEntityTransformFn<
    typeof mockDataIn,
    typeof mockDataOut
  > = vi.fn((data: typeof mockDataIn) => ({
    id: data.Id,
    title: data.Title,
    description: data.Description,
    customFields: {},
  }));

  beforeEach(() => {
    vi.clearAllMocks();

    mockProcessItemResponses = {
      processItemResponse: vi.fn(),
    } as unknown as ProcessItemResponses;

    mockConfig = {
      basePath: mockBasePath,
    };

    mockReq = {
      params: {},
      headers: {
        authorization: mockAuthToken,
      },
      requestLogger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
      },
    } as unknown as AuthenticatedRequest;
  });

  describe('queryItemRequests factory', () => {
    it('should create query item requests with correct methods', () => {
      const requests = queryItemRequests({
        config: mockConfig,
        processItemResponses: mockProcessItemResponses,
      });

      expect(requests).toHaveProperty('linkedItemByIdFetch');
      expect(requests).toHaveProperty('itemByIdFetch');
      expect(typeof requests.linkedItemByIdFetch).toBe('function');
      expect(typeof requests.itemByIdFetch).toBe('function');
    });
  });

  describe('itemByIdFetch', () => {
    const mockFetchFn: ByIdQueryFetchFn<typeof mockDataIn> = vi.fn();

    describe('happy path', () => {
      it('should fetch and process item by id with default basePath', async () => {
        mockReq.params.id = mockId;
        const mockResult = { data: mockDataIn };

        vi.mocked(mockFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessItemResponses.processItemResponse).mockReturnValue(
          mockDataOut
        );

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        const result = await requests.itemByIdFetch(
          mockFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(mockFetchFn).toHaveBeenCalledWith(mockId, {
          authToken: mockAuthToken,
        });

        expect(
          mockProcessItemResponses.processItemResponse
        ).toHaveBeenCalledWith({
          result: mockResult,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          id: mockId,
          basePath: mockBasePath,
        });

        expect(result).toEqual(mockDataOut);
      });

      it('should fetch and process item with custom basePath', async () => {
        mockReq.params.id = mockId;
        const mockResult = { data: mockDataIn };
        const customBasePath = '/api/v2';

        vi.mocked(mockFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessItemResponses.processItemResponse).mockReturnValue(
          mockDataOut
        );

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        const result = await requests.itemByIdFetch(
          mockFetchFn,
          mockTransformFn,
          mockReq,
          customBasePath
        );

        expect(
          mockProcessItemResponses.processItemResponse
        ).toHaveBeenCalledWith({
          result: mockResult,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          id: mockId,
          basePath: customBasePath,
        });

        expect(result).toEqual(mockDataOut);
      });

      it('should handle empty authorization header', async () => {
        mockReq.params.id = mockId;
        mockReq.headers = {};
        const mockResult = { data: mockDataIn };

        vi.mocked(mockFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessItemResponses.processItemResponse).mockReturnValue(
          mockDataOut
        );

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        await requests.itemByIdFetch(mockFetchFn, mockTransformFn, mockReq);

        expect(mockFetchFn).toHaveBeenCalledWith(mockId, {
          authToken: '',
        });
      });
    });

    describe('error handling - missing or invalid id', () => {
      it('should return null and log warning when id is missing', async () => {
        mockReq.params = {};

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        const result = await requests.itemByIdFetch(
          mockFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(result).toBeNull();
        expect(mockReq.requestLogger.warn).toHaveBeenCalledWith(
          {
            event: 'invalid_resource_id',
            id: undefined,
          },
          'Invalid resource id from path params'
        );
        expect(mockFetchFn).not.toHaveBeenCalled();
      });

      it('should return null and log warning when id is empty string', async () => {
        mockReq.params.id = '';

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        const result = await requests.itemByIdFetch(
          mockFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(result).toBeNull();
        expect(mockReq.requestLogger.warn).toHaveBeenCalledWith(
          {
            event: 'invalid_resource_id',
            id: '',
          },
          'Invalid resource id from path params'
        );
        expect(mockFetchFn).not.toHaveBeenCalled();
      });

      it('should return null and log warning when id is null', async () => {
        mockReq.params.id = null as unknown as string;

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        const result = await requests.itemByIdFetch(
          mockFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(result).toBeNull();
        expect(mockReq.requestLogger.warn).toHaveBeenCalledWith(
          {
            event: 'invalid_resource_id',
            id: null,
          },
          'Invalid resource id from path params'
        );
        expect(mockFetchFn).not.toHaveBeenCalled();
      });
    });

    describe('error handling - response processing', () => {
      it('should pass through null result from processItemResponse', async () => {
        mockReq.params.id = mockId;
        const mockResult = { data: mockDataIn };

        vi.mocked(mockFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessItemResponses.processItemResponse).mockReturnValue(
          null
        );

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        const result = await requests.itemByIdFetch(
          mockFetchFn,
          mockTransformFn,
          mockReq
        );

        expect(result).toBeNull();
      });

      it('should throw error when fetch function fails', async () => {
        mockReq.params.id = mockId;
        const fetchError = new Error('Database connection failed');

        vi.mocked(mockFetchFn).mockRejectedValue(fetchError);

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        await expect(
          requests.itemByIdFetch(mockFetchFn, mockTransformFn, mockReq)
        ).rejects.toThrow('Database connection failed');
      });
    });
  });

  describe('linkedItemByIdFetch', () => {
    const mockLinkedFetchFn: LinkedByIdQueryFetchFn<typeof mockDataIn> =
      vi.fn();
    const linkKeys = ['parentId', 'childId'];

    describe('happy path', () => {
      it('should fetch and process linked item with all required link keys', async () => {
        mockReq.params = {
          parentId: mockId,
          childId: mockLinkId,
          id: '111e1111-e89b-12d3-a456-426614174111',
        };

        const mockResult = { data: mockDataIn };
        const expectedLinkIds = {
          parentId: mockId,
          childId: mockLinkId,
        };

        vi.mocked(mockLinkedFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessItemResponses.processItemResponse).mockReturnValue(
          mockDataOut
        );

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        const result = await requests.linkedItemByIdFetch(
          mockLinkedFetchFn,
          mockTransformFn,
          mockReq,
          { linkKeys }
        );

        expect(mockLinkedFetchFn).toHaveBeenCalledWith(expectedLinkIds, {
          authToken: mockAuthToken,
        });

        expect(
          mockProcessItemResponses.processItemResponse
        ).toHaveBeenCalledWith({
          result: mockResult,
          dataTransformFn: mockTransformFn,
          req: mockReq,
          id: JSON.stringify(expectedLinkIds),
          basePath: mockBasePath,
          linkId: mockReq.params.id,
        });

        expect(result).toEqual(mockDataOut);
      });

      it('should use custom basePath when provided in opts', async () => {
        mockReq.params = {
          parentId: mockId,
          childId: mockLinkId,
          id: '111e1111-e89b-12d3-a456-426614174111',
        };

        const mockResult = { data: mockDataIn };
        const customBasePath = '/api/v3';

        vi.mocked(mockLinkedFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessItemResponses.processItemResponse).mockReturnValue(
          mockDataOut
        );

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        const result = await requests.linkedItemByIdFetch(
          mockLinkedFetchFn,
          mockTransformFn,
          mockReq,
          { linkKeys, basePath: customBasePath }
        );

        expect(
          mockProcessItemResponses.processItemResponse
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            basePath: customBasePath,
          })
        );

        expect(result).toEqual(mockDataOut);
      });

      it('should handle single link key', async () => {
        const singleLinkKey = ['parentId'];
        mockReq.params = {
          parentId: mockId,
          id: '111e1111-e89b-12d3-a456-426614174111',
        };

        const mockResult = { data: mockDataIn };

        vi.mocked(mockLinkedFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessItemResponses.processItemResponse).mockReturnValue(
          mockDataOut
        );

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        const result = await requests.linkedItemByIdFetch(
          mockLinkedFetchFn,
          mockTransformFn,
          mockReq,
          { linkKeys: singleLinkKey }
        );

        expect(mockLinkedFetchFn).toHaveBeenCalledWith(
          { parentId: mockId },
          { authToken: mockAuthToken }
        );

        expect(result).toEqual(mockDataOut);
      });

      it('should handle empty authorization header', async () => {
        mockReq.params = {
          parentId: mockId,
          childId: mockLinkId,
          id: '111e1111-e89b-12d3-a456-426614174111',
        };
        mockReq.headers = {};

        const mockResult = { data: mockDataIn };

        vi.mocked(mockLinkedFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessItemResponses.processItemResponse).mockReturnValue(
          mockDataOut
        );

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        await requests.linkedItemByIdFetch(
          mockLinkedFetchFn,
          mockTransformFn,
          mockReq,
          { linkKeys }
        );

        expect(mockLinkedFetchFn).toHaveBeenCalledWith(expect.any(Object), {
          authToken: '',
        });
      });
    });

    describe('error handling - missing link keys', () => {
      it('should return null and log error when first link key is missing', async () => {
        mockReq.params = {
          childId: mockLinkId,
        };

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        const result = await requests.linkedItemByIdFetch(
          mockLinkedFetchFn,
          mockTransformFn,
          mockReq,
          { linkKeys }
        );

        expect(result).toBeNull();
        expect(mockReq.requestLogger.error).toHaveBeenCalledWith(
          {
            event: 'required_entity_params_not_found',
            params: mockReq.params,
            required: linkKeys,
          },
          'required entity params not found in request parsing'
        );
        expect(mockLinkedFetchFn).not.toHaveBeenCalled();
      });

      it('should return null and log error when second link key is missing', async () => {
        mockReq.params = {
          parentId: mockId,
        };

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        const result = await requests.linkedItemByIdFetch(
          mockLinkedFetchFn,
          mockTransformFn,
          mockReq,
          { linkKeys }
        );

        expect(result).toBeNull();
        expect(mockReq.requestLogger.error).toHaveBeenCalledWith(
          {
            event: 'required_entity_params_not_found',
            params: mockReq.params,
            required: linkKeys,
          },
          'required entity params not found in request parsing'
        );
        expect(mockLinkedFetchFn).not.toHaveBeenCalled();
      });

      it('should return null and log error when all link keys are missing', async () => {
        mockReq.params = {};

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        const result = await requests.linkedItemByIdFetch(
          mockLinkedFetchFn,
          mockTransformFn,
          mockReq,
          { linkKeys }
        );

        expect(result).toBeNull();
        expect(mockReq.requestLogger.error).toHaveBeenCalledWith(
          {
            event: 'required_entity_params_not_found',
            params: mockReq.params,
            required: linkKeys,
          },
          'required entity params not found in request parsing'
        );
        expect(mockLinkedFetchFn).not.toHaveBeenCalled();
      });

      it('should return null when link key value is empty string', async () => {
        mockReq.params = {
          parentId: '',
          childId: mockLinkId,
        };

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        const result = await requests.linkedItemByIdFetch(
          mockLinkedFetchFn,
          mockTransformFn,
          mockReq,
          { linkKeys }
        );

        expect(result).toBeNull();
        expect(mockReq.requestLogger.error).toHaveBeenCalledWith(
          expect.objectContaining({
            event: 'required_entity_params_not_found',
          }),
          expect.any(String)
        );
      });
    });

    describe('error handling - response processing', () => {
      it('should pass through null result from processItemResponse', async () => {
        mockReq.params = {
          parentId: mockId,
          childId: mockLinkId,
          id: '111e1111-e89b-12d3-a456-426614174111',
        };

        const mockResult = { data: mockDataIn };

        vi.mocked(mockLinkedFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessItemResponses.processItemResponse).mockReturnValue(
          null
        );

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        const result = await requests.linkedItemByIdFetch(
          mockLinkedFetchFn,
          mockTransformFn,
          mockReq,
          { linkKeys }
        );

        expect(result).toBeNull();
      });

      it('should throw error when fetch function fails', async () => {
        mockReq.params = {
          parentId: mockId,
          childId: mockLinkId,
          id: '111e1111-e89b-12d3-a456-426614174111',
        };

        const fetchError = new Error('Service unavailable');

        vi.mocked(mockLinkedFetchFn).mockRejectedValue(fetchError);

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        await expect(
          requests.linkedItemByIdFetch(
            mockLinkedFetchFn,
            mockTransformFn,
            mockReq,
            { linkKeys }
          )
        ).rejects.toThrow('Service unavailable');
      });

      it('should throw error when processItemResponse throws', async () => {
        mockReq.params = {
          parentId: mockId,
          childId: mockLinkId,
          id: '111e1111-e89b-12d3-a456-426614174111',
        };

        const mockResult = { data: mockDataIn };
        const processingError = new Error('Transform failed');

        vi.mocked(mockLinkedFetchFn).mockResolvedValue(mockResult);
        vi.mocked(
          mockProcessItemResponses.processItemResponse
        ).mockImplementation(() => {
          throw processingError;
        });

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        await expect(
          requests.linkedItemByIdFetch(
            mockLinkedFetchFn,
            mockTransformFn,
            mockReq,
            { linkKeys }
          )
        ).rejects.toThrow('Transform failed');
      });
    });

    describe('edge cases', () => {
      it('should handle multiple link keys (more than 2)', async () => {
        const multipleLinkKeys = ['key1', 'key2', 'key3'];
        mockReq.params = {
          key1: mockId,
          key2: mockLinkId,
          key3: '333e3333-e89b-12d3-a456-426614174333',
          id: '111e1111-e89b-12d3-a456-426614174111',
        };

        const mockResult = { data: mockDataIn };

        vi.mocked(mockLinkedFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessItemResponses.processItemResponse).mockReturnValue(
          mockDataOut
        );

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        const result = await requests.linkedItemByIdFetch(
          mockLinkedFetchFn,
          mockTransformFn,
          mockReq,
          { linkKeys: multipleLinkKeys }
        );

        expect(mockLinkedFetchFn).toHaveBeenCalledWith(
          {
            key1: mockId,
            key2: mockLinkId,
            key3: '333e3333-e89b-12d3-a456-426614174333',
          },
          { authToken: mockAuthToken }
        );

        expect(result).toEqual(mockDataOut);
      });

      it('should handle provider id format in link ids', async () => {
        const providerId = 'provider|user123';
        mockReq.params = {
          parentId: providerId,
          childId: mockLinkId,
          id: '111e1111-e89b-12d3-a456-426614174111',
        };

        const mockResult = { data: mockDataIn };

        vi.mocked(mockLinkedFetchFn).mockResolvedValue(mockResult);
        vi.mocked(mockProcessItemResponses.processItemResponse).mockReturnValue(
          mockDataOut
        );

        const requests = queryItemRequests({
          config: mockConfig,
          processItemResponses: mockProcessItemResponses,
        });

        const result = await requests.linkedItemByIdFetch(
          mockLinkedFetchFn,
          mockTransformFn,
          mockReq,
          { linkKeys }
        );

        expect(mockLinkedFetchFn).toHaveBeenCalledWith(
          { parentId: providerId, childId: mockLinkId },
          { authToken: mockAuthToken }
        );

        expect(result).toEqual(mockDataOut);
      });
    });
  });
});
