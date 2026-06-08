import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  IClient,
  LinkedItemsListResponse,
} from '../../clients/client.interface';
import type {
  IdDateTimeQueryOpts,
  ServiceCallContext,
} from '../../types/service';
import { linkedItemsService } from './linked-items.service';

describe('linked-items.service', () => {
  let mockClient: IClient;
  let mockContext: ServiceCallContext;
  let service: ReturnType<typeof linkedItemsService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      queryLinkedItemsList: vi.fn(),
    } as unknown as IClient;

    mockContext = {
      authToken: 'Bearer test-token',
    };

    service = linkedItemsService(mockClient);
  });

  describe('getLinkedItems', () => {
    const mockTrpcResponse = {
      linkedItem: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Source: '523e4567-e89b-12d3-a456-426614174003',
          Target: '223e4567-e89b-12d3-a456-426614174001',
          RelationshipType: 'relates_to',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          ModifiedAtTimestamp: '2024-01-02T00:00:00Z',
          CreatedByUser: 'provider|user1',
          ModifiedByUser: 'provider|user1',
          target_node: {
            ObjectType: 'risk',
          },
          target_risk: {
            Title: 'Test Risk',
          },
          target_acceptance: null,
          target_action: null,
          target_assessment: null,
          target_control: null,
          target_indicator: null,
          target_issue: null,
          target_obligation: null,
          target_third_party: null,
          target_appetite: null,
        } as LinkedItemsListResponse['linkedItem'][0],
        {
          Id: '223e4567-e89b-12d3-a456-426614174002',
          Source: '523e4567-e89b-12d3-a456-426614174003',
          Target: '323e4567-e89b-12d3-a456-426614174004',
          RelationshipType: 'depends_on',
          CreatedAtTimestamp: '2024-01-03T00:00:00Z',
          ModifiedAtTimestamp: '2024-01-04T00:00:00Z',
          CreatedByUser: 'provider|user2',
          ModifiedByUser: 'provider|user2',
          target_node: {
            ObjectType: 'action',
          },
          target_risk: null,
          target_acceptance: null,
          target_action: {
            Title: 'Test Action',
          },
          target_assessment: null,
          target_control: null,
          target_indicator: null,
          target_issue: null,
          target_obligation: null,
          target_third_party: null,
          target_appetite: null,
        } as LinkedItemsListResponse['linkedItem'][0],
      ],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 2,
      },
    } as LinkedItemsListResponse;

    describe('happy path', () => {
      it('should fetch and return linked items without filters', async () => {
        const linkId = 'risk-123';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
          beforeDateTime: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryLinkedItemsList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getLinkedItems(linkId, query, mockContext);

        expect(mockClient.queryLinkedItemsList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            limit: 10,
            afterDateTime: null,
            afterId: null,
            beforeDateTime: null,
            beforeId: null,
            linkId: 'risk-123',
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.linkedItem,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should use default pagination values when not provided', async () => {
        const linkId = 'risk-123';
        const query = {} as IdDateTimeQueryOpts;

        vi.mocked(mockClient.queryLinkedItemsList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getLinkedItems(linkId, query, mockContext);

        expect(result).toEqual({
          data: mockTrpcResponse.linkedItem,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId correctly', async () => {
        const linkId = 'risk-123';
        const query: IdDateTimeQueryOpts = {
          limit: 5,
          beforeId: null,
          afterId: 'after-id-123',
          beforeDateTime: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryLinkedItemsList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getLinkedItems(linkId, query, mockContext);

        expect(mockClient.queryLinkedItemsList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            limit: 5,
            afterDateTime: null,
            afterId: 'after-id-123',
            beforeDateTime: null,
            beforeId: null,
            linkId: 'risk-123',
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.linkedItem,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with beforeId correctly', async () => {
        const linkId = 'risk-123';
        const query: IdDateTimeQueryOpts = {
          limit: 5,
          beforeId: 'before-id-456',
          afterId: null,
          beforeDateTime: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryLinkedItemsList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getLinkedItems(linkId, query, mockContext);

        expect(mockClient.queryLinkedItemsList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            limit: 5,
            afterDateTime: null,
            afterId: null,
            beforeDateTime: null,
            beforeId: 'before-id-456',
            linkId: 'risk-123',
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.linkedItem,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterDateTime correctly', async () => {
        const linkId = 'risk-123';
        const query: IdDateTimeQueryOpts = {
          limit: 5,
          beforeId: null,
          afterId: null,
          beforeDateTime: null,
          afterDateTime: '2024-01-01T00:00:00Z',
        };

        vi.mocked(mockClient.queryLinkedItemsList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getLinkedItems(linkId, query, mockContext);

        expect(mockClient.queryLinkedItemsList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            limit: 5,
            afterDateTime: '2024-01-01T00:00:00Z',
            afterId: null,
            beforeDateTime: null,
            beforeId: null,
            linkId: 'risk-123',
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.linkedItem,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with beforeDateTime correctly', async () => {
        const linkId = 'risk-123';
        const query: IdDateTimeQueryOpts = {
          limit: 5,
          beforeId: null,
          afterId: null,
          beforeDateTime: '2024-01-31T23:59:59Z',
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryLinkedItemsList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getLinkedItems(linkId, query, mockContext);

        expect(mockClient.queryLinkedItemsList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            limit: 5,
            afterDateTime: null,
            afterId: null,
            beforeDateTime: '2024-01-31T23:59:59Z',
            beforeId: null,
            linkId: 'risk-123',
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.linkedItem,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with all parameters', async () => {
        const linkId = 'risk-123';
        const query: IdDateTimeQueryOpts = {
          limit: 20,
          beforeId: 'before-id-456',
          afterId: 'after-id-123',
          beforeDateTime: '2024-01-31T23:59:59Z',
          afterDateTime: '2024-01-01T00:00:00Z',
        };

        vi.mocked(mockClient.queryLinkedItemsList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getLinkedItems(linkId, query, mockContext);

        expect(mockClient.queryLinkedItemsList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            limit: 20,
            afterDateTime: '2024-01-01T00:00:00Z',
            afterId: 'after-id-123',
            beforeDateTime: '2024-01-31T23:59:59Z',
            beforeId: 'before-id-456',
            linkId: 'risk-123',
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.linkedItem,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty linked items list', async () => {
        const linkId = 'risk-123';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
          beforeDateTime: null,
          afterDateTime: null,
        };

        const emptyResponse = {
          linkedItem: [],
          pageMetadata: {
            nextId: null,
            prevId: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        } as unknown as LinkedItemsListResponse;

        vi.mocked(mockClient.queryLinkedItemsList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getLinkedItems(linkId, query, mockContext);

        expect(result).toEqual({
          data: [],
          metadata: emptyResponse.pageMetadata,
        });
      });

      it('should handle different linkId values', async () => {
        const linkId = 'action-456';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
          beforeDateTime: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryLinkedItemsList).mockResolvedValue(
          mockTrpcResponse
        );

        await service.getLinkedItems(linkId, query, mockContext);

        expect(mockClient.queryLinkedItemsList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          expect.objectContaining({
            linkId: 'action-456',
          })
        );
      });

      it('should pass through authorization token correctly', async () => {
        const linkId = 'risk-123';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
          beforeDateTime: null,
          afterDateTime: null,
        };

        const customContext: ServiceCallContext = {
          authToken: 'Bearer custom-token-xyz',
        };

        vi.mocked(mockClient.queryLinkedItemsList).mockResolvedValue(
          mockTrpcResponse
        );

        await service.getLinkedItems(linkId, query, customContext);

        expect(mockClient.queryLinkedItemsList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer custom-token-xyz',
          },
          expect.anything()
        );
      });
    });

    describe('error handling', () => {
      it('should throw error when client.queryLinkedItemsList fails', async () => {
        const linkId = 'risk-123';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
          beforeDateTime: null,
          afterDateTime: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryLinkedItemsList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getLinkedItems(linkId, query, mockContext)
        ).rejects.toThrow('tRPC client error');
      });

      it('should handle non-Error objects thrown by client', async () => {
        const linkId = 'risk-123';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
          beforeDateTime: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryLinkedItemsList).mockRejectedValue(
          'string error'
        );

        await expect(
          service.getLinkedItems(linkId, query, mockContext)
        ).rejects.toThrow('string error');
      });

      it('should throw error with detailed message on client failure', async () => {
        const linkId = 'risk-123';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
          beforeDateTime: null,
          afterDateTime: null,
        };
        const clientError = new Error('Database connection lost');

        vi.mocked(mockClient.queryLinkedItemsList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getLinkedItems(linkId, query, mockContext)
        ).rejects.toThrow('Database connection lost');
      });

      it('should throw error when network fails', async () => {
        const linkId = 'risk-123';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
          beforeDateTime: null,
          afterDateTime: null,
        };
        const networkError = new Error('Network request failed');

        vi.mocked(mockClient.queryLinkedItemsList).mockRejectedValue(
          networkError
        );

        await expect(
          service.getLinkedItems(linkId, query, mockContext)
        ).rejects.toThrow('Network request failed');
      });

      it('should throw error when unauthorized', async () => {
        const linkId = 'risk-123';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
          beforeDateTime: null,
          afterDateTime: null,
        };
        const authError = new Error('Unauthorized');

        vi.mocked(mockClient.queryLinkedItemsList).mockRejectedValue(authError);

        await expect(
          service.getLinkedItems(linkId, query, mockContext)
        ).rejects.toThrow('Unauthorized');
      });
    });
  });

  describe('service factory', () => {
    it('should create service with correct methods', () => {
      expect(service).toHaveProperty('getLinkedItems');
      expect(typeof service.getLinkedItems).toBe('function');
    });

    it('should create independent service instances', () => {
      const service1 = linkedItemsService(mockClient);
      const service2 = linkedItemsService(mockClient);

      expect(service1).not.toBe(service2);
      expect(service1.getLinkedItems).not.toBe(service2.getLinkedItems);
    });
  });
});
