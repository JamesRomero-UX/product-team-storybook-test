import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  IClient,
  ThirdPartyListQueryResponse,
} from '../../clients/client.interface';
import type { SeqIdQueryOpts, ServiceCallContext } from '../../types/service';
import { thirdPartyService } from './third-parties.service';

describe('third-parties.service', () => {
  let mockClient: IClient;
  let mockContext: ServiceCallContext;
  let service: ReturnType<typeof thirdPartyService>;

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
      queryThirdPartyList: vi.fn(),
      getThirdPartyById: vi.fn(),
    } as unknown as IClient;

    mockContext = {
      authToken: 'Bearer test-token',
    };

    service = thirdPartyService(mockClient);
  });

  describe('getThirdParties', () => {
    const mockTrpcResponse: ThirdPartyListQueryResponse = {
      thirdParty: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Name: 'Test Third Party 1',
          Description: 'Description 1',
          tags: [],
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          SequentialId: 1,
          owners: [],
          contributors: [],
        } as unknown as ThirdPartyListQueryResponse['thirdParty'][0],
        {
          Id: '123e4567-e89b-12d3-a456-426614174001',
          Name: 'Test Third Party 2',
          Description: 'Description 2',
          tags: [],
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-02T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-02T00:00:00Z',
          SequentialId: 2,
          owners: [],
          contributors: [],
        } as unknown as ThirdPartyListQueryResponse['thirdParty'][0],
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
      it('should fetch and return third parties without filters', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryThirdPartyList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getThirdParties(query, mockContext);

        expect(mockClient.queryThirdPartyList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.thirdParty,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should use default pagination values when not provided', async () => {
        const query = {} as SeqIdQueryOpts;

        vi.mocked(mockClient.queryThirdPartyList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getThirdParties(query, mockContext);

        expect(result).toEqual({
          data: mockTrpcResponse.thirdParty,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: null,
          afterId: 10,
        };

        vi.mocked(mockClient.queryThirdPartyList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getThirdParties(query, mockContext);

        expect(mockClient.queryThirdPartyList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.thirdParty,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with beforeId correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: 20,
          afterId: null,
        };

        vi.mocked(mockClient.queryThirdPartyList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getThirdParties(query, mockContext);

        expect(mockClient.queryThirdPartyList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.thirdParty,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty third party list', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        const emptyResponse: ThirdPartyListQueryResponse = {
          thirdParty: [],
          pageMetadata: {
            nextId: null,
            prevId: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        };

        vi.mocked(mockClient.queryThirdPartyList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getThirdParties(query, mockContext);

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

        vi.mocked(mockClient.queryThirdPartyList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getThirdParties(query, mockContext);

        expect(mockClient.queryThirdPartyList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.thirdParty,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client.queryThirdPartyList fails', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryThirdPartyList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getThirdParties(query, mockContext)
        ).rejects.toThrow('tRPC client error');
      });

      it('should handle non-Error objects thrown by client', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryThirdPartyList).mockRejectedValue(
          'string error'
        );

        await expect(
          service.getThirdParties(query, mockContext)
        ).rejects.toThrow('string error');
      });

      it('should throw error with detailed message on client failure', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const clientError = new Error('Database connection lost');

        vi.mocked(mockClient.queryThirdPartyList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getThirdParties(query, mockContext)
        ).rejects.toThrow('Database connection lost');
      });

      it('should handle network timeout errors', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const timeoutError = new Error('Network timeout');

        vi.mocked(mockClient.queryThirdPartyList).mockRejectedValue(
          timeoutError
        );

        await expect(
          service.getThirdParties(query, mockContext)
        ).rejects.toThrow('Network timeout');
      });
    });
  });

  describe('getThirdPartyById', () => {
    const mockTrpcThirdParty = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Name: 'Test Third Party 1',
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
      Awaited<ReturnType<IClient['getThirdPartyById']>>
    >['thirdParty'];

    describe('happy path', () => {
      it('should fetch and return third party by id', async () => {
        const thirdPartyId = '123e4567-e89b-12d3-a456-426614174000';

        const mockResponse = {
          thirdParty: mockTrpcThirdParty,
          form_configuration: null,
        };
        vi.mocked(mockClient.getThirdPartyById).mockResolvedValue(mockResponse);

        const result = await service.getThirdPartyById(
          thirdPartyId,
          mockContext
        );

        expect(mockClient.getThirdPartyById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          thirdPartyId
        );

        expect(result).toEqual({
          data: mockResponse.thirdParty,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should return third party with form_configuration when present', async () => {
        const thirdPartyId = '123e4567-e89b-12d3-a456-426614174000';

        const mockFormConfig = {
          fields: [
            { name: 'field1', type: 'text', required: true },
            { name: 'field2', type: 'number', required: false },
          ],
        } as never;

        const mockResponse = {
          thirdParty: mockTrpcThirdParty,
          form_configuration: mockFormConfig,
        };
        vi.mocked(mockClient.getThirdPartyById).mockResolvedValue(mockResponse);

        const result = await service.getThirdPartyById(
          thirdPartyId,
          mockContext
        );

        expect(result).toEqual({
          data: mockResponse.thirdParty,
          form_configuration: mockFormConfig,
        });
      });

      it('should return null when third party is not found (null response)', async () => {
        const thirdPartyId = '999e9999-e89b-12d3-a456-426614174999';

        vi.mocked(mockClient.getThirdPartyById).mockResolvedValue(null);

        const result = await service.getThirdPartyById(
          thirdPartyId,
          mockContext
        );

        expect(result).toBeNull();
      });

      it('should handle third party with all optional fields populated', async () => {
        const thirdPartyId = '123e4567-e89b-12d3-a456-426614174000';

        const completeThirdParty = {
          ...mockTrpcThirdParty,
          owners: [{ UserId: 'provider|owner1' }],
          contributors: [{ UserId: 'provider|contributor1' }],
          tags: [
            {
              type: {
                Name: 'vendor',
                Description: 'External vendor',
              },
            },
          ],
        };

        const mockResponse = {
          thirdParty: completeThirdParty,
          form_configuration: null,
        };
        vi.mocked(mockClient.getThirdPartyById).mockResolvedValue(
          mockResponse as never
        );

        const result = await service.getThirdPartyById(
          thirdPartyId,
          mockContext
        );

        expect(result).toEqual({
          data: completeThirdParty,
          form_configuration: null,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails with non "not found" error', async () => {
        const thirdPartyId = '123e4567-e89b-12d3-a456-426614174000';
        const clientError = new Error('Database connection failed');

        vi.mocked(mockClient.getThirdPartyById).mockRejectedValue(clientError);

        await expect(
          service.getThirdPartyById(thirdPartyId, mockContext)
        ).rejects.toThrow('Database connection failed');
      });

      it('should handle non-Error objects thrown by client', async () => {
        const thirdPartyId = '123e4567-e89b-12d3-a456-426614174000';

        vi.mocked(mockClient.getThirdPartyById).mockRejectedValue(
          'string error'
        );

        await expect(
          service.getThirdPartyById(thirdPartyId, mockContext)
        ).rejects.toThrow('string error');
      });

      it('should throw error for invalid UUID format', async () => {
        const invalidThirdPartyId = 'not-a-valid-uuid';
        const validationError = new Error('Invalid UUID format');

        vi.mocked(mockClient.getThirdPartyById).mockRejectedValue(
          validationError
        );

        await expect(
          service.getThirdPartyById(invalidThirdPartyId, mockContext)
        ).rejects.toThrow('Invalid UUID format');
      });

      it('should handle authorization errors', async () => {
        const thirdPartyId = '123e4567-e89b-12d3-a456-426614174000';
        const authError = new Error('Unauthorized access');

        vi.mocked(mockClient.getThirdPartyById).mockRejectedValue(authError);

        await expect(
          service.getThirdPartyById(thirdPartyId, mockContext)
        ).rejects.toThrow('Unauthorized access');
      });

      it('should handle network timeout errors', async () => {
        const thirdPartyId = '123e4567-e89b-12d3-a456-426614174000';
        const timeoutError = new Error('Request timeout');

        vi.mocked(mockClient.getThirdPartyById).mockRejectedValue(timeoutError);

        await expect(
          service.getThirdPartyById(thirdPartyId, mockContext)
        ).rejects.toThrow('Request timeout');
      });
    });
  });

  describe('service factory', () => {
    it('should create service with correct methods', () => {
      expect(service).toHaveProperty('getThirdParties');
      expect(service).toHaveProperty('getThirdPartyById');
      expect(typeof service.getThirdParties).toBe('function');
      expect(typeof service.getThirdPartyById).toBe('function');
    });

    it('should create independent service instances', () => {
      const service1 = thirdPartyService(mockClient);
      const service2 = thirdPartyService(mockClient);

      expect(service1).not.toBe(service2);
      expect(service1.getThirdParties).not.toBe(service2.getThirdParties);
      expect(service1.getThirdPartyById).not.toBe(service2.getThirdPartyById);
    });
  });
});
