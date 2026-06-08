import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  IClient,
  TagTypeByIdResponse,
  TagTypeListQueryResponse,
} from '../../clients/client.interface';
import type {
  IdDateTimeQueryOpts,
  ServiceCallContext,
} from '../../types/service';
import { tagsService } from './tags.service';

describe('tags.service', () => {
  let mockClient: IClient;
  let mockContext: ServiceCallContext;
  let service: ReturnType<typeof tagsService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      queryTagTypeList: vi.fn(),
      getTagTypeById: vi.fn(),
    } as unknown as IClient;

    mockContext = {
      authToken: 'Bearer test-token',
    };

    service = tagsService(mockClient);
  });

  describe('getTags', () => {
    const mockTrpcResponse: TagTypeListQueryResponse = {
      tagType: [
        {
          TagTypeId: '123e4567-e89b-12d3-a456-426614174000',
          Name: 'Critical',
          CreatedAtTimestamp: '2024-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2024-01-01T00:00:00.000Z',
        } as unknown as TagTypeListQueryResponse['tagType'][0],
      ],
      pageMetadata: {
        nextId: null,
        nextDateTime: null,
        prevId: null,
        prevDateTime: null,
        hasNext: false,
        hasPrev: false,
        count: 1,
      },
    };

    describe('happy path', () => {
      it('should fetch and return tags without filters', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryTagTypeList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getTags(query, mockContext);

        expect(mockClient.queryTagTypeList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          {
            limit: 10,
            afterDateTime: null,
            afterId: null,
            beforeDateTime: null,
            beforeId: null,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.tagType,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId and afterDateTime', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 5,
          beforeId: null,
          beforeDateTime: null,
          afterId: '123e4567-e89b-12d3-a456-426614174000',
          afterDateTime: '2024-01-01T00:00:00.000Z',
        };

        vi.mocked(mockClient.queryTagTypeList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getTags(query, mockContext);

        expect(mockClient.queryTagTypeList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          {
            limit: 5,
            afterDateTime: '2024-01-01T00:00:00.000Z',
            afterId: '123e4567-e89b-12d3-a456-426614174000',
            beforeDateTime: null,
            beforeId: null,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.tagType,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should pass filters.ids to the client query', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
          filters: { ids: ['123e4567-e89b-12d3-a456-426614174000'] },
        };

        vi.mocked(mockClient.queryTagTypeList).mockResolvedValue(
          mockTrpcResponse
        );

        await service.getTags(query, mockContext);

        expect(mockClient.queryTagTypeList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          {
            limit: 10,
            afterDateTime: null,
            afterId: null,
            beforeDateTime: null,
            beforeId: null,
            filter: { Id: ['123e4567-e89b-12d3-a456-426614174000'] },
          }
        );
      });

      it('should handle empty tag list', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        const emptyResponse: TagTypeListQueryResponse = {
          tagType: [],
          pageMetadata: {
            nextId: null,
            nextDateTime: null,
            prevId: null,
            prevDateTime: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        };

        vi.mocked(mockClient.queryTagTypeList).mockResolvedValue(emptyResponse);

        const result = await service.getTags(query, mockContext);

        expect(result).toEqual({
          data: [],
          metadata: emptyResponse.pageMetadata,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client.queryTagTypeList fails', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryTagTypeList).mockRejectedValue(clientError);

        await expect(service.getTags(query, mockContext)).rejects.toThrow(
          'tRPC client error'
        );
      });
    });
  });

  describe('getTagById', () => {
    const mockTagType = {
      TagTypeId: '123e4567-e89b-12d3-a456-426614174000',
      Name: 'Critical',
      CreatedAtTimestamp: '2024-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2024-01-01T00:00:00.000Z',
    } as unknown as NonNullable<TagTypeByIdResponse>['tagType'];

    describe('happy path', () => {
      it('should fetch and return tag by id', async () => {
        const id = '123e4567-e89b-12d3-a456-426614174000';

        const mockResponse = {
          tagType: mockTagType,
        };

        vi.mocked(mockClient.getTagTypeById).mockResolvedValue(
          mockResponse as unknown as TagTypeByIdResponse
        );

        const result = await service.getTagById(id, mockContext);

        expect(mockClient.getTagTypeById).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          id
        );

        expect(result).toEqual({
          data: mockTagType,
        });
      });

      it('should return null when tag is not found', async () => {
        const id = '999e9999-e89b-12d3-a456-426614174999';

        vi.mocked(mockClient.getTagTypeById).mockResolvedValue(null);

        const result = await service.getTagById(id, mockContext);

        expect(result).toBeNull();
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client.getTagTypeById fails', async () => {
        const id = '123e4567-e89b-12d3-a456-426614174000';
        const clientError = new Error('Database connection failed');

        vi.mocked(mockClient.getTagTypeById).mockRejectedValue(clientError);

        await expect(service.getTagById(id, mockContext)).rejects.toThrow(
          'Database connection failed'
        );
      });
    });
  });
});
