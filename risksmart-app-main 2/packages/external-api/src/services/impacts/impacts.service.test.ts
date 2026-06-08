import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  IClient,
  ImpactListQueryResponse,
} from '../../clients/client.interface';
import type { SeqIdQueryOpts, ServiceCallContext } from '../../types/service';
import { impactService } from './impacts.service';

describe('impacts.service', () => {
  let mockClient: IClient;
  let mockContext: ServiceCallContext;
  let service: ReturnType<typeof impactService>;

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
      queryImpactList: vi.fn(),
      getImpactById: vi.fn(),
    } as unknown as IClient;

    mockContext = {
      authToken: 'Bearer test-token',
    };

    service = impactService(mockClient);
  });

  describe('getImpacts', () => {
    const mockTrpcResponse: ImpactListQueryResponse = {
      impact: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Name: 'Test Impact 1',
          Rationale: 'Rationale 1',
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          SequentialId: 1,
          LikelihoodAppetite: 3,
          ImpactAppetite: 4,
          RatingGuidance: 'Rating guidance 1',
          owners: [],
          contributors: [],
          parents: [],
        } as unknown as ImpactListQueryResponse['impact'][0],
        {
          Id: '123e4567-e89b-12d3-a456-426614174001',
          Name: 'Test Impact 2',
          Rationale: 'Rationale 2',
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-02T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-02T00:00:00Z',
          SequentialId: 2,
          LikelihoodAppetite: 2,
          ImpactAppetite: 5,
          RatingGuidance: 'Rating guidance 2',
          owners: [],
          contributors: [],
          parents: [],
        } as unknown as ImpactListQueryResponse['impact'][0],
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
      it('should fetch and return impacts without filters', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryImpactList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getImpacts(query, mockContext);

        expect(mockClient.queryImpactList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.impact,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should use default pagination values when not provided', async () => {
        const query = {} as SeqIdQueryOpts;

        vi.mocked(mockClient.queryImpactList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getImpacts(query, mockContext);

        expect(result).toEqual({
          data: mockTrpcResponse.impact,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: null,
          afterId: 10,
        };

        vi.mocked(mockClient.queryImpactList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getImpacts(query, mockContext);

        expect(mockClient.queryImpactList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.impact,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with beforeId correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: 20,
          afterId: null,
        };

        vi.mocked(mockClient.queryImpactList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getImpacts(query, mockContext);

        expect(mockClient.queryImpactList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.impact,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty impact list', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        const emptyResponse: ImpactListQueryResponse = {
          impact: [],
          pageMetadata: {
            nextId: null,
            prevId: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        };

        vi.mocked(mockClient.queryImpactList).mockResolvedValue(emptyResponse);

        const result = await service.getImpacts(query, mockContext);

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

        vi.mocked(mockClient.queryImpactList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getImpacts(query, mockContext);

        expect(mockClient.queryImpactList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.impact,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client.queryImpactList fails', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryImpactList).mockRejectedValue(clientError);

        await expect(service.getImpacts(query, mockContext)).rejects.toThrow(
          'tRPC client error'
        );
      });

      it('should handle non-Error objects thrown by client', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryImpactList).mockRejectedValue('string error');

        await expect(service.getImpacts(query, mockContext)).rejects.toThrow(
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

        vi.mocked(mockClient.queryImpactList).mockRejectedValue(clientError);

        await expect(service.getImpacts(query, mockContext)).rejects.toThrow(
          'Database connection lost'
        );
      });

      it('should handle network timeout errors', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const timeoutError = new Error('Network timeout');

        vi.mocked(mockClient.queryImpactList).mockRejectedValue(timeoutError);

        await expect(service.getImpacts(query, mockContext)).rejects.toThrow(
          'Network timeout'
        );
      });
    });
  });

  describe('getImpactById', () => {
    const mockTrpcImpact = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Name: 'Test Impact 1',
      Rationale: 'Rationale 1',
      ModifiedByUser: 'provider|user1',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      CreatedByUser: 'provider|user1',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      SequentialId: 1,
      LikelihoodAppetite: 3,
      ImpactAppetite: 4,
      RatingGuidance: 'Rating guidance 1',
      owners: [],
      contributors: [],
      ancestorContributors: [],
      appetites: [],
      parents: [],
    } as unknown as NonNullable<
      Awaited<ReturnType<IClient['getImpactById']>>
    >['impact'];

    describe('happy path', () => {
      it('should fetch and return impact by id', async () => {
        const impactId = '123e4567-e89b-12d3-a456-426614174000';

        const mockResponse = {
          impact: mockTrpcImpact,
          form_configuration: null,
        };
        vi.mocked(mockClient.getImpactById).mockResolvedValue(mockResponse);

        const result = await service.getImpactById(impactId, mockContext);

        expect(mockClient.getImpactById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          impactId
        );

        expect(result).toEqual({
          data: mockResponse.impact,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should return impact with form_configuration when present', async () => {
        const impactId = '123e4567-e89b-12d3-a456-426614174000';

        const mockFormConfig = {
          fields: [
            { name: 'field1', type: 'text', required: true },
            { name: 'field2', type: 'number', required: false },
          ],
        } as never;

        const mockResponse = {
          impact: mockTrpcImpact,
          form_configuration: mockFormConfig,
        };
        vi.mocked(mockClient.getImpactById).mockResolvedValue(mockResponse);

        const result = await service.getImpactById(impactId, mockContext);

        expect(result).toEqual({
          data: mockResponse.impact,
          form_configuration: mockFormConfig,
        });
      });

      it('should return null when impact is not found (null response)', async () => {
        const impactId = '999e9999-e89b-12d3-a456-426614174999';

        vi.mocked(mockClient.getImpactById).mockResolvedValue(null);

        const result = await service.getImpactById(impactId, mockContext);

        expect(result).toBeNull();
      });

      it('should handle impact with all optional fields populated', async () => {
        const impactId = '123e4567-e89b-12d3-a456-426614174000';

        const completeImpact = {
          ...mockTrpcImpact,
          owners: [{ UserId: 'provider|owner1' }],
          contributors: [{ UserId: 'provider|contributor1' }],
          ancestorContributors: [
            {
              Id: '323e4567-e89b-12d3-a456-426614174001',
              ObjectType: 'risk',
              ContributorType: 'owner',
              AncestorId: '423e4567-e89b-12d3-a456-426614174001',
              UserGroupId: null,
              UserId: 'provider|ancestor-user-1',
            },
          ],
          appetites: [
            { Id: 'appetite-1', SequentialId: 1 },
            { Id: 'appetite-2', SequentialId: 2 },
          ],
          parents: [
            {
              parent: {
                Id: 'provider|parent-1',
                ObjectType: 'risk',
                SequentialId: 1,
              },
            },
          ],
        };

        const mockResponse = {
          impact: completeImpact,
          form_configuration: null,
        };
        vi.mocked(mockClient.getImpactById).mockResolvedValue(
          mockResponse as never
        );

        const result = await service.getImpactById(impactId, mockContext);

        expect(result).toEqual({
          data: completeImpact,
          form_configuration: null,
        });
      });

      it('should handle impact with null appetite values', async () => {
        const impactId = '123e4567-e89b-12d3-a456-426614174000';

        const impactWithNullAppetites = {
          ...mockTrpcImpact,
          LikelihoodAppetite: null,
          ImpactAppetite: null,
          RatingGuidance: null,
        };

        const mockResponse = {
          impact: impactWithNullAppetites,
          form_configuration: null,
        };
        vi.mocked(mockClient.getImpactById).mockResolvedValue(
          mockResponse as never
        );

        const result = await service.getImpactById(impactId, mockContext);

        expect(result).toEqual({
          data: impactWithNullAppetites,
          form_configuration: null,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails with non "not found" error', async () => {
        const impactId = '123e4567-e89b-12d3-a456-426614174000';
        const clientError = new Error('Database connection failed');

        vi.mocked(mockClient.getImpactById).mockRejectedValue(clientError);

        await expect(
          service.getImpactById(impactId, mockContext)
        ).rejects.toThrow('Database connection failed');
      });

      it('should handle non-Error objects thrown by client', async () => {
        const impactId = '123e4567-e89b-12d3-a456-426614174000';

        vi.mocked(mockClient.getImpactById).mockRejectedValue('string error');

        await expect(
          service.getImpactById(impactId, mockContext)
        ).rejects.toThrow('string error');
      });

      it('should throw error for invalid UUID format', async () => {
        const invalidImpactId = 'not-a-valid-uuid';
        const validationError = new Error('Invalid UUID format');

        vi.mocked(mockClient.getImpactById).mockRejectedValue(validationError);

        await expect(
          service.getImpactById(invalidImpactId, mockContext)
        ).rejects.toThrow('Invalid UUID format');
      });

      it('should handle authorization errors', async () => {
        const impactId = '123e4567-e89b-12d3-a456-426614174000';
        const authError = new Error('Unauthorized access');

        vi.mocked(mockClient.getImpactById).mockRejectedValue(authError);

        await expect(
          service.getImpactById(impactId, mockContext)
        ).rejects.toThrow('Unauthorized access');
      });

      it('should handle network timeout errors', async () => {
        const impactId = '123e4567-e89b-12d3-a456-426614174000';
        const timeoutError = new Error('Request timeout');

        vi.mocked(mockClient.getImpactById).mockRejectedValue(timeoutError);

        await expect(
          service.getImpactById(impactId, mockContext)
        ).rejects.toThrow('Request timeout');
      });
    });
  });

  describe('service factory', () => {
    it('should create service with correct methods', () => {
      expect(service).toHaveProperty('getImpacts');
      expect(service).toHaveProperty('getImpactById');
      expect(typeof service.getImpacts).toBe('function');
      expect(typeof service.getImpactById).toBe('function');
    });

    it('should create independent service instances', () => {
      const service1 = impactService(mockClient);
      const service2 = impactService(mockClient);

      expect(service1).not.toBe(service2);
      expect(service1.getImpacts).not.toBe(service2.getImpacts);
      expect(service1.getImpactById).not.toBe(service2.getImpactById);
    });
  });
});
