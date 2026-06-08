import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  DocumentListQueryResponse,
  IClient,
} from '../../clients/client.interface';
import type { SeqIdQueryOpts, ServiceCallContext } from '../../types/service';
import { policiesService } from './policies.service';

describe('policies.service', () => {
  let mockClient: IClient;
  let mockContext: ServiceCallContext;
  let service: ReturnType<typeof policiesService>;

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
    } as unknown as IClient;

    mockContext = {
      authToken: 'Bearer test-token',
    };

    service = policiesService(mockClient);
  });

  describe('getPolicies', () => {
    const mockTrpcResponse: DocumentListQueryResponse = {
      document: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Policy 1',
          Purpose: 'Purpose 1',
          tags: [],
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          SequentialId: 1,
          DocumentType: 'governance',
          owners: [],
          contributors: [],
          parent: null,
        } as unknown as DocumentListQueryResponse['document'][0],
        {
          Id: '123e4567-e89b-12d3-a456-426614174001',
          Title: 'Test Policy 2',
          Purpose: 'Purpose 2',
          tags: [],
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-02T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-02T00:00:00Z',
          SequentialId: 2,
          DocumentType: 'compliance',
          owners: [],
          contributors: [],
          parent: null,
        } as unknown as DocumentListQueryResponse['document'][0],
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
      it('should fetch and return policies without filters', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryDocumentList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getPolicies(query, mockContext);

        expect(mockClient.queryDocumentList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.document,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should use default pagination values when not provided', async () => {
        const query = {} as SeqIdQueryOpts;

        vi.mocked(mockClient.queryDocumentList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getPolicies(query, mockContext);

        expect(result).toEqual({
          data: mockTrpcResponse.document,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: null,
          afterId: 10,
        };

        vi.mocked(mockClient.queryDocumentList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getPolicies(query, mockContext);

        expect(mockClient.queryDocumentList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.document,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with beforeId correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: 20,
          afterId: null,
        };

        vi.mocked(mockClient.queryDocumentList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getPolicies(query, mockContext);

        expect(mockClient.queryDocumentList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.document,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty policy list', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        const emptyResponse: DocumentListQueryResponse = {
          document: [],
          pageMetadata: {
            nextId: null,
            prevId: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        };

        vi.mocked(mockClient.queryDocumentList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getPolicies(query, mockContext);

        expect(result).toEqual({
          data: [],
          metadata: emptyResponse.pageMetadata,
        });
      });
    });

    describe('error handling', () => {
      it('should throw error when client.queryDocumentList fails', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryDocumentList).mockRejectedValue(clientError);

        await expect(service.getPolicies(query, mockContext)).rejects.toThrow(
          'tRPC client error'
        );
      });

      it('should handle non-Error objects thrown by client', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryDocumentList).mockRejectedValue(
          'string error'
        );

        await expect(service.getPolicies(query, mockContext)).rejects.toThrow(
          'string error'
        );
      });

      it('should throw error with detailed message on client failure', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const clientError = new Error('Database connection lost');

        vi.mocked(mockClient.queryDocumentList).mockRejectedValue(clientError);

        await expect(service.getPolicies(query, mockContext)).rejects.toThrow(
          'Database connection lost'
        );
      });
    });
  });

  describe('getPolicyById', () => {
    const mockTrpcDocument = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Policy 1',
      Purpose: 'Purpose 1',
      tags: [],
      ModifiedByUser: 'provider|user1',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      CreatedByUser: 'provider|user1',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      SequentialId: 1,
      DocumentType: 'governance',
      owners: [],
      contributors: [],
    } as unknown as NonNullable<
      Awaited<ReturnType<IClient['getDocumentById']>>
    >['document'];

    describe('happy path', () => {
      it('should fetch and return policy by id', async () => {
        const policyId = '123e4567-e89b-12d3-a456-426614174000';

        const mockResponse = {
          document: mockTrpcDocument,
          form_configuration: null,
        };
        vi.mocked(mockClient.getDocumentById).mockResolvedValue(mockResponse);

        const result = await service.getPolicyById(policyId, mockContext);

        expect(mockClient.getDocumentById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          policyId
        );

        expect(result).toEqual({
          data: mockResponse.document,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should return policy with form_configuration when present', async () => {
        const policyId = '123e4567-e89b-12d3-a456-426614174000';

        const mockFormConfig = {
          fields: [
            { name: 'field1', type: 'text', required: true },
            { name: 'field2', type: 'number', required: false },
          ],
        } as never;

        const mockResponse = {
          document: mockTrpcDocument,
          form_configuration: mockFormConfig,
        };
        vi.mocked(mockClient.getDocumentById).mockResolvedValue(mockResponse);

        const result = await service.getPolicyById(policyId, mockContext);

        expect(result).toEqual({
          data: mockResponse.document,
          form_configuration: mockFormConfig,
        });
      });

      it('should return null when policy is not found (null response)', async () => {
        const policyId = '999e9999-e89b-12d3-a456-426614174999';

        vi.mocked(mockClient.getDocumentById).mockResolvedValue(null);

        const result = await service.getPolicyById(policyId, mockContext);

        expect(result).toBeNull();
      });
    });

    describe('error handling', () => {
      it('should throw error when client fails with non "not found" error', async () => {
        const policyId = '123e4567-e89b-12d3-a456-426614174000';
        const clientError = new Error('Database connection failed');

        vi.mocked(mockClient.getDocumentById).mockRejectedValue(clientError);

        await expect(
          service.getPolicyById(policyId, mockContext)
        ).rejects.toThrow('Database connection failed');
      });

      it('should handle non-Error objects thrown by client', async () => {
        const policyId = '123e4567-e89b-12d3-a456-426614174000';

        vi.mocked(mockClient.getDocumentById).mockRejectedValue('string error');

        await expect(
          service.getPolicyById(policyId, mockContext)
        ).rejects.toThrow('string error');
      });
    });
  });

  describe('service factory', () => {
    it('should create service with correct methods', () => {
      expect(service).toHaveProperty('getPolicies');
      expect(service).toHaveProperty('getPolicyById');
      expect(typeof service.getPolicies).toBe('function');
      expect(typeof service.getPolicyById).toBe('function');
    });
  });
});
