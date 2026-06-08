import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  IClient,
  ObligationListQueryResponse,
} from '../../clients/client.interface';
import type { SeqIdQueryOpts, ServiceCallContext } from '../../types/service';
import { obligationsService } from './obligations.service';

describe('obligations.service', () => {
  let mockClient: IClient;
  let mockContext: ServiceCallContext;
  let service: ReturnType<typeof obligationsService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      queryRiskList: vi.fn(),
      getRiskById: vi.fn(),
      getControlById: vi.fn(),
      queryControlList: vi.fn(),
      queryActionList: vi.fn(),
      getActionById: vi.fn(),
      queryIssueList: vi.fn(),
      getIssueById: vi.fn(),
      queryDocumentList: vi.fn(),
      getDocumentById: vi.fn(),
      queryObligationList: vi.fn(),
      getObligationById: vi.fn(),
    } as unknown as IClient;

    mockContext = {
      authToken: 'Bearer test-token',
    };

    service = obligationsService(mockClient);
  });

  describe('getObligations', () => {
    const mockTrpcResponse: ObligationListQueryResponse = {
      obligation: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Obligation 1',
          Description: 'Description 1',
          tags: [],
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          SequentialId: 1,
          owners: [],
          contributors: [],
          parents: [],
        } as unknown as ObligationListQueryResponse['obligation'][0],
        {
          Id: '123e4567-e89b-12d3-a456-426614174001',
          Title: 'Test Obligation 2',
          Description: 'Description 2',
          tags: [],
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-02T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-02T00:00:00Z',
          SequentialId: 2,
          owners: [],
          contributors: [],
          parents: [],
        } as unknown as ObligationListQueryResponse['obligation'][0],
      ],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 2,
      },
    };

    describe('happy path', () => {
      it('should fetch and return obligations without filters', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryObligationList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getObligations(query, mockContext);

        expect(mockClient.queryObligationList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            afterSequentialId: null,
            beforeSequentialId: null,
            limit: 10,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.obligation,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should use default pagination values when not provided', async () => {
        const query = {} as SeqIdQueryOpts;

        vi.mocked(mockClient.queryObligationList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getObligations(query, mockContext);

        expect(result).toEqual({
          data: mockTrpcResponse.obligation,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: null,
          afterId: 10,
        };

        vi.mocked(mockClient.queryObligationList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getObligations(query, mockContext);

        expect(mockClient.queryObligationList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            afterSequentialId: 10,
            beforeSequentialId: null,
            limit: 5,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.obligation,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with beforeId correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: 20,
          afterId: null,
        };

        vi.mocked(mockClient.queryObligationList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getObligations(query, mockContext);

        expect(mockClient.queryObligationList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            afterSequentialId: null,
            beforeSequentialId: 20,
            limit: 5,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.obligation,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty obligation list', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        const emptyResponse: ObligationListQueryResponse = {
          obligation: [],
          pageMetadata: {
            nextId: null,
            prevId: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        };

        vi.mocked(mockClient.queryObligationList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getObligations(query, mockContext);

        expect(result).toEqual({
          data: [],
          metadata: emptyResponse.pageMetadata,
        });
      });

      it('should handle pagination with both afterId and beforeId (afterId takes precedence)', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: 20,
          afterId: 10,
        };

        vi.mocked(mockClient.queryObligationList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getObligations(query, mockContext);

        expect(mockClient.queryObligationList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            afterSequentialId: 10,
            beforeSequentialId: 20,
            limit: 5,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.obligation,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client.queryObligationList fails', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryObligationList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getObligations(query, mockContext)
        ).rejects.toThrow('tRPC client error');
      });

      it('should handle non-Error objects thrown by client', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryObligationList).mockRejectedValue(
          'string error'
        );

        await expect(
          service.getObligations(query, mockContext)
        ).rejects.toThrow('string error');
      });

      it('should throw error with detailed message on client failure', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const clientError = new Error('Database connection lost');

        vi.mocked(mockClient.queryObligationList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getObligations(query, mockContext)
        ).rejects.toThrow('Database connection lost');
      });

      it('should handle network timeout errors', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const timeoutError = new Error('Network timeout');

        vi.mocked(mockClient.queryObligationList).mockRejectedValue(
          timeoutError
        );

        await expect(
          service.getObligations(query, mockContext)
        ).rejects.toThrow('Network timeout');
      });
    });
  });

  describe('getObligationById', () => {
    const mockTrpcObligation = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Obligation 1',
      Description: 'Description 1',
      tags: [],
      ModifiedByUser: 'provider|user1',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      CreatedByUser: 'provider|user1',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      SequentialId: 1,
      owners: [],
      contributors: [],
    } as unknown as NonNullable<
      Awaited<ReturnType<IClient['getObligationById']>>
    >['obligation'];

    describe('happy path', () => {
      it('should fetch and return obligation by id', async () => {
        const obligationId = '123e4567-e89b-12d3-a456-426614174000';

        const mockResponse = {
          obligation: mockTrpcObligation,
          form_configuration: null,
        };
        vi.mocked(mockClient.getObligationById).mockResolvedValue(mockResponse);

        const result = await service.getObligationById(
          obligationId,
          mockContext
        );

        expect(mockClient.getObligationById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          obligationId
        );

        expect(result).toEqual({
          data: mockResponse.obligation,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should return obligation with form_configuration when present', async () => {
        const obligationId = '123e4567-e89b-12d3-a456-426614174000';

        const mockFormConfig = {
          fields: [
            { name: 'field1', type: 'text', required: true },
            { name: 'field2', type: 'number', required: false },
          ],
        } as never;

        const mockResponse = {
          obligation: mockTrpcObligation,
          form_configuration: mockFormConfig,
        };
        vi.mocked(mockClient.getObligationById).mockResolvedValue(mockResponse);

        const result = await service.getObligationById(
          obligationId,
          mockContext
        );

        expect(result).toEqual({
          data: mockResponse.obligation,
          form_configuration: mockFormConfig,
        });
      });

      it('should return null when obligation is not found (null response)', async () => {
        const obligationId = '999e9999-e89b-12d3-a456-426614174999';

        vi.mocked(mockClient.getObligationById).mockResolvedValue(null);

        const result = await service.getObligationById(
          obligationId,
          mockContext
        );

        expect(result).toBeNull();
      });

      it('should handle obligation with all optional fields populated', async () => {
        const obligationId = '123e4567-e89b-12d3-a456-426614174000';

        const completeObligation = {
          ...mockTrpcObligation,
          owners: [{ UserId: 'provider|owner1' }],
          contributors: [{ UserId: 'provider|contributor1' }],
          tags: [
            {
              type: {
                Name: 'compliance',
                Description: 'Compliance obligation',
              },
            },
          ],
        };

        const mockResponse = {
          obligation: completeObligation,
          form_configuration: null,
        };
        vi.mocked(mockClient.getObligationById).mockResolvedValue(
          mockResponse as never
        );

        const result = await service.getObligationById(
          obligationId,
          mockContext
        );

        expect(result).toEqual({
          data: completeObligation,
          form_configuration: null,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails with non "not found" error', async () => {
        const obligationId = '123e4567-e89b-12d3-a456-426614174000';
        const clientError = new Error('Database connection failed');

        vi.mocked(mockClient.getObligationById).mockRejectedValue(clientError);

        await expect(
          service.getObligationById(obligationId, mockContext)
        ).rejects.toThrow('Database connection failed');
      });

      it('should handle non-Error objects thrown by client', async () => {
        const obligationId = '123e4567-e89b-12d3-a456-426614174000';

        vi.mocked(mockClient.getObligationById).mockRejectedValue(
          'string error'
        );

        await expect(
          service.getObligationById(obligationId, mockContext)
        ).rejects.toThrow('string error');
      });

      it('should throw error for invalid UUID format', async () => {
        const invalidObligationId = 'not-a-valid-uuid';
        const validationError = new Error('Invalid UUID format');

        vi.mocked(mockClient.getObligationById).mockRejectedValue(
          validationError
        );

        await expect(
          service.getObligationById(invalidObligationId, mockContext)
        ).rejects.toThrow('Invalid UUID format');
      });

      it('should handle authorization errors', async () => {
        const obligationId = '123e4567-e89b-12d3-a456-426614174000';
        const authError = new Error('Unauthorized access');

        vi.mocked(mockClient.getObligationById).mockRejectedValue(authError);

        await expect(
          service.getObligationById(obligationId, mockContext)
        ).rejects.toThrow('Unauthorized access');
      });

      it('should handle network timeout errors', async () => {
        const obligationId = '123e4567-e89b-12d3-a456-426614174000';
        const timeoutError = new Error('Request timeout');

        vi.mocked(mockClient.getObligationById).mockRejectedValue(timeoutError);

        await expect(
          service.getObligationById(obligationId, mockContext)
        ).rejects.toThrow('Request timeout');
      });
    });
  });

  describe('service factory', () => {
    it('should create service with correct methods', () => {
      expect(service).toHaveProperty('getObligations');
      expect(service).toHaveProperty('getObligationById');
      expect(typeof service.getObligations).toBe('function');
      expect(typeof service.getObligationById).toBe('function');
    });

    it('should create independent service instances', () => {
      const service1 = obligationsService(mockClient);
      const service2 = obligationsService(mockClient);

      expect(service1).not.toBe(service2);
      expect(service1.getObligations).not.toBe(service2.getObligations);
      expect(service1.getObligationById).not.toBe(service2.getObligationById);
    });
  });
});
