import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  EnterpriseRiskChildRiskListQueryResponse,
  EnterpriseRiskListQueryResponse,
  IClient,
} from '../../clients/client.interface';
import type { SeqIdQueryOpts, ServiceCallContext } from '../../types/service';
import { enterpriseRisksService } from './enterprise-risks.service';

describe('enterprise-risks.service', () => {
  let mockClient: IClient;
  let mockContext: ServiceCallContext;
  let service: ReturnType<typeof enterpriseRisksService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      queryEnterpriseRiskList: vi.fn(),
      getEnterpriseRiskById: vi.fn(),
      queryEnterpriseChildRisks: vi.fn(),
    } as unknown as IClient;

    mockContext = {
      authToken: 'Bearer test-token',
    };

    service = enterpriseRisksService(mockClient);
  });

  describe('getEnterpriseRisks', () => {
    const mockTrpcResponse: EnterpriseRiskListQueryResponse = {
      enterpriseRisk: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Enterprise Risk 1',
          Description: 'Description 1',
          tags: [],
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          SequentialId: 1,
          owners: [],
          contributors: [],
          Tier: 2,
          Treatment: 'mitigate',
          ParentId: null,
        } as unknown as EnterpriseRiskListQueryResponse['enterpriseRisk'][0],
        {
          Id: '123e4567-e89b-12d3-a456-426614174001',
          Title: 'Test Enterprise Risk 2',
          Description: 'Description 2',
          tags: [],
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-02T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-02T00:00:00Z',
          SequentialId: 2,
          owners: [],
          contributors: [],
          Tier: 1,
          Treatment: 'accept',
          ParentId: null,
        } as unknown as EnterpriseRiskListQueryResponse['enterpriseRisk'][0],
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
      it('should fetch and return enterprise risks without filters', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryEnterpriseRiskList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getEnterpriseRisks(query, mockContext);

        expect(mockClient.queryEnterpriseRiskList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.enterpriseRisk,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should use default pagination values when not provided', async () => {
        const query = {} as SeqIdQueryOpts;

        vi.mocked(mockClient.queryEnterpriseRiskList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getEnterpriseRisks(query, mockContext);

        expect(result).toEqual({
          data: mockTrpcResponse.enterpriseRisk,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: null,
          afterId: 10,
        };

        vi.mocked(mockClient.queryEnterpriseRiskList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getEnterpriseRisks(query, mockContext);

        expect(mockClient.queryEnterpriseRiskList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.enterpriseRisk,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with beforeId correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: 20,
          afterId: null,
        };

        vi.mocked(mockClient.queryEnterpriseRiskList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getEnterpriseRisks(query, mockContext);

        expect(mockClient.queryEnterpriseRiskList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.enterpriseRisk,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty enterprise risk list', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        const emptyResponse: EnterpriseRiskListQueryResponse = {
          enterpriseRisk: [],
          pageMetadata: {
            nextId: null,
            prevId: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        };

        vi.mocked(mockClient.queryEnterpriseRiskList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getEnterpriseRisks(query, mockContext);

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

        vi.mocked(mockClient.queryEnterpriseRiskList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getEnterpriseRisks(query, mockContext);

        expect(mockClient.queryEnterpriseRiskList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.enterpriseRisk,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client.queryEnterpriseRiskList fails', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryEnterpriseRiskList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getEnterpriseRisks(query, mockContext)
        ).rejects.toThrow('tRPC client error');
      });

      it('should handle non-Error objects thrown by client', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryEnterpriseRiskList).mockRejectedValue(
          'string error'
        );

        await expect(
          service.getEnterpriseRisks(query, mockContext)
        ).rejects.toThrow('string error');
      });

      it('should throw error with detailed message on client failure', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const clientError = new Error('Database connection lost');

        vi.mocked(mockClient.queryEnterpriseRiskList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getEnterpriseRisks(query, mockContext)
        ).rejects.toThrow('Database connection lost');
      });

      it('should handle network timeout errors', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const timeoutError = new Error('Network timeout');

        vi.mocked(mockClient.queryEnterpriseRiskList).mockRejectedValue(
          timeoutError
        );

        await expect(
          service.getEnterpriseRisks(query, mockContext)
        ).rejects.toThrow('Network timeout');
      });
    });
  });

  describe('getEnterpriseRiskById', () => {
    const mockTrpcEnterpriseRisk = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Enterprise Risk 1',
      Description: 'Description 1',
      tags: [],
      ModifiedByUser: 'provider|user1',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      CreatedByUser: 'provider|user1',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      SequentialId: 1,
      owners: [],
      contributors: [],
      Tier: 2,
      Treatment: 'mitigate',
      ParentId: null,
    } as unknown as NonNullable<
      Awaited<ReturnType<IClient['getEnterpriseRiskById']>>
    >['enterpriseRisk'];

    describe('happy path', () => {
      it('should fetch and return enterprise risk by id', async () => {
        const enterpriseRiskId = '123e4567-e89b-12d3-a456-426614174000';

        const mockResponse = {
          enterpriseRisk: mockTrpcEnterpriseRisk,
          form_configuration: null,
        };
        vi.mocked(mockClient.getEnterpriseRiskById).mockResolvedValue(
          mockResponse
        );

        const result = await service.getEnterpriseRiskById(
          enterpriseRiskId,
          mockContext
        );

        expect(mockClient.getEnterpriseRiskById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          enterpriseRiskId
        );

        expect(result).toEqual({
          data: mockResponse.enterpriseRisk,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should return enterprise risk with form_configuration when present', async () => {
        const enterpriseRiskId = '123e4567-e89b-12d3-a456-426614174000';

        const mockFormConfig = {
          fields: [
            { name: 'field1', type: 'text', required: true },
            { name: 'field2', type: 'number', required: false },
          ],
        } as never;

        const mockResponse = {
          enterpriseRisk: mockTrpcEnterpriseRisk,
          form_configuration: mockFormConfig,
        };
        vi.mocked(mockClient.getEnterpriseRiskById).mockResolvedValue(
          mockResponse
        );

        const result = await service.getEnterpriseRiskById(
          enterpriseRiskId,
          mockContext
        );

        expect(result).toEqual({
          data: mockResponse.enterpriseRisk,
          form_configuration: mockFormConfig,
        });
      });

      it('should return null when enterprise risk is not found (null response)', async () => {
        const enterpriseRiskId = '999e9999-e89b-12d3-a456-426614174999';

        vi.mocked(mockClient.getEnterpriseRiskById).mockResolvedValue(null);

        const result = await service.getEnterpriseRiskById(
          enterpriseRiskId,
          mockContext
        );

        expect(result).toBeNull();
      });

      it('should handle enterprise risk with all optional fields populated', async () => {
        const enterpriseRiskId = '123e4567-e89b-12d3-a456-426614174000';

        const completeEnterpriseRisk = {
          ...mockTrpcEnterpriseRisk,
          owners: [{ UserId: 'provider|owner1' }],
          contributors: [{ UserId: 'provider|contributor1' }],
          tags: [
            {
              type: {
                Name: 'strategic',
                Description: 'Strategic risk',
              },
            },
          ],
        };

        const mockResponse = {
          enterpriseRisk: completeEnterpriseRisk,
          form_configuration: null,
        };
        vi.mocked(mockClient.getEnterpriseRiskById).mockResolvedValue(
          mockResponse as never
        );

        const result = await service.getEnterpriseRiskById(
          enterpriseRiskId,
          mockContext
        );

        expect(result).toEqual({
          data: completeEnterpriseRisk,
          form_configuration: null,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails with non "not found" error', async () => {
        const enterpriseRiskId = '123e4567-e89b-12d3-a456-426614174000';
        const clientError = new Error('Database connection failed');

        vi.mocked(mockClient.getEnterpriseRiskById).mockRejectedValue(
          clientError
        );

        await expect(
          service.getEnterpriseRiskById(enterpriseRiskId, mockContext)
        ).rejects.toThrow('Database connection failed');
      });

      it('should handle non-Error objects thrown by client', async () => {
        const enterpriseRiskId = '123e4567-e89b-12d3-a456-426614174000';

        vi.mocked(mockClient.getEnterpriseRiskById).mockRejectedValue(
          'string error'
        );

        await expect(
          service.getEnterpriseRiskById(enterpriseRiskId, mockContext)
        ).rejects.toThrow('string error');
      });

      it('should throw error for invalid UUID format', async () => {
        const invalidEnterpriseRiskId = 'not-a-valid-uuid';
        const validationError = new Error('Invalid UUID format');

        vi.mocked(mockClient.getEnterpriseRiskById).mockRejectedValue(
          validationError
        );

        await expect(
          service.getEnterpriseRiskById(invalidEnterpriseRiskId, mockContext)
        ).rejects.toThrow('Invalid UUID format');
      });

      it('should handle authorization errors', async () => {
        const enterpriseRiskId = '123e4567-e89b-12d3-a456-426614174000';
        const authError = new Error('Unauthorized access');

        vi.mocked(mockClient.getEnterpriseRiskById).mockRejectedValue(
          authError
        );

        await expect(
          service.getEnterpriseRiskById(enterpriseRiskId, mockContext)
        ).rejects.toThrow('Unauthorized access');
      });

      it('should handle network timeout errors', async () => {
        const enterpriseRiskId = '123e4567-e89b-12d3-a456-426614174000';
        const timeoutError = new Error('Request timeout');

        vi.mocked(mockClient.getEnterpriseRiskById).mockRejectedValue(
          timeoutError
        );

        await expect(
          service.getEnterpriseRiskById(enterpriseRiskId, mockContext)
        ).rejects.toThrow('Request timeout');
      });
    });
  });

  describe('getEnterpriseRisksChildRisks', () => {
    const mockLinkId = 'link-123e4567-e89b-12d3-a456-426614174000';
    const mockTrpcResponse: EnterpriseRiskChildRiskListQueryResponse = {
      risk: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174100',
          Title: 'Child Risk 1',
          Description: 'Child risk description 1',
          tags: [],
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          SequentialId: 100,
          owners: [],
          contributors: [],
        } as unknown as EnterpriseRiskChildRiskListQueryResponse['risk'][0],
        {
          Id: '123e4567-e89b-12d3-a456-426614174101',
          Title: 'Child Risk 2',
          Description: 'Child risk description 2',
          tags: [],
          ModifiedByUser: 'provider|user2',
          ModifiedAtTimestamp: '2024-01-02T00:00:00Z',
          CreatedByUser: 'provider|user2',
          CreatedAtTimestamp: '2024-01-02T00:00:00Z',
          SequentialId: 101,
          owners: [],
          contributors: [],
        } as unknown as EnterpriseRiskChildRiskListQueryResponse['risk'][0],
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
      it.each([
        {
          description: 'without filters',
          query: { limit: 10, beforeId: null, afterId: null },
          expectedCall: {
            afterSequentialId: null,
            beforeSequentialId: null,
            limit: 10,
            linkId: mockLinkId,
          },
        },
        {
          description: 'with afterId',
          query: { limit: 5, beforeId: null, afterId: 10 },
          expectedCall: {
            afterSequentialId: 10,
            beforeSequentialId: null,
            limit: 5,
            linkId: mockLinkId,
          },
        },
        {
          description: 'with beforeId',
          query: { limit: 5, beforeId: 20, afterId: null },
          expectedCall: {
            afterSequentialId: null,
            beforeSequentialId: 20,
            limit: 5,
            linkId: mockLinkId,
          },
        },
        {
          description: 'with both afterId and beforeId',
          query: { limit: 5, beforeId: 20, afterId: 10 },
          expectedCall: {
            afterSequentialId: 10,
            beforeSequentialId: 20,
            limit: 5,
            linkId: mockLinkId,
          },
        },
        {
          description: 'with large limit',
          query: { limit: 1000, beforeId: null, afterId: null },
          expectedCall: {
            afterSequentialId: null,
            beforeSequentialId: null,
            limit: 1000,
            linkId: mockLinkId,
          },
        },
      ])(
        'should fetch and return enterprise child risks $description',
        async ({ query, expectedCall }) => {
          vi.mocked(mockClient.queryEnterpriseChildRisks).mockResolvedValue(
            mockTrpcResponse
          );

          const result = await service.getEnterpriseRisksChildRisks(
            mockLinkId,
            query,
            mockContext
          );

          expect(mockClient.queryEnterpriseChildRisks).toHaveBeenCalledWith(
            { authorization: 'Bearer test-token' },
            expectedCall
          );

          expect(result).toEqual({
            data: mockTrpcResponse.risk,
            metadata: mockTrpcResponse.pageMetadata,
          });
        }
      );

      it('should use default pagination values when not provided', async () => {
        const query = {} as SeqIdQueryOpts;

        vi.mocked(mockClient.queryEnterpriseChildRisks).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getEnterpriseRisksChildRisks(
          mockLinkId,
          query,
          mockContext
        );

        expect(result).toEqual({
          data: mockTrpcResponse.risk,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty child risks list', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        const emptyResponse: EnterpriseRiskChildRiskListQueryResponse = {
          risk: [],
          pageMetadata: {
            nextId: null,
            prevId: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        };

        vi.mocked(mockClient.queryEnterpriseChildRisks).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getEnterpriseRisksChildRisks(
          mockLinkId,
          query,
          mockContext
        );

        expect(result).toEqual({
          data: [],
          metadata: emptyResponse.pageMetadata,
        });
      });

      it('should handle different linkId values correctly', async () => {
        const differentLinkId = 'link-999e9999-e89b-12d3-a456-426614174999';
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryEnterpriseChildRisks).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getEnterpriseRisksChildRisks(
          differentLinkId,
          query,
          mockContext
        );

        expect(mockClient.queryEnterpriseChildRisks).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          {
            afterSequentialId: null,
            beforeSequentialId: null,
            limit: 10,
            linkId: differentLinkId,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.risk,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle child risks with all optional fields populated', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        const completeResponse: EnterpriseRiskChildRiskListQueryResponse = {
          risk: [
            {
              Id: '123e4567-e89b-12d3-a456-426614174100',
              Title: 'Child Risk 1',
              Description: 'Child risk description 1',
              tags: [
                {
                  type: {
                    Name: 'operational',
                    Description: 'Operational risk',
                  },
                },
              ],
              ModifiedByUser: 'provider|user1',
              ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
              CreatedByUser: 'provider|user1',
              CreatedAtTimestamp: '2024-01-01T00:00:00Z',
              SequentialId: 100,
              owners: [{ UserId: 'provider|owner1' }],
              contributors: [{ UserId: 'provider|contributor1' }],
            } as unknown as EnterpriseRiskChildRiskListQueryResponse['risk'][0],
          ],
          pageMetadata: {
            nextId: 101,
            prevId: 99,
            hasNext: true,
            hasPrev: true,
            count: 1,
          },
        };

        vi.mocked(mockClient.queryEnterpriseChildRisks).mockResolvedValue(
          completeResponse
        );

        const result = await service.getEnterpriseRisksChildRisks(
          mockLinkId,
          query,
          mockContext
        );

        expect(result).toEqual({
          data: completeResponse.risk,
          metadata: completeResponse.pageMetadata,
        });
      });
    });

    describe('unhappy path', () => {
      it.each([
        { error: new Error('tRPC client error'), linkId: mockLinkId },
        { error: 'string error', linkId: mockLinkId },
        { error: new Error('Database connection lost'), linkId: mockLinkId },
        { error: new Error('Network timeout'), linkId: mockLinkId },
        { error: new Error('Unauthorized access'), linkId: mockLinkId },
        {
          error: new Error('Invalid linkId format'),
          linkId: 'invalid-link-id',
        },
        { error: new Error('Malformed response data'), linkId: mockLinkId },
        { error: new Error('LinkId cannot be empty'), linkId: '' },
      ])(
        'should propagate error when client fails: $error',
        async ({ error, linkId }) => {
          const query: SeqIdQueryOpts = {
            limit: 10,
            beforeId: null,
            afterId: null,
          };

          vi.mocked(mockClient.queryEnterpriseChildRisks).mockRejectedValue(
            error
          );

          await expect(
            service.getEnterpriseRisksChildRisks(linkId, query, mockContext)
          ).rejects.toThrow(error);
        }
      );
    });
  });

  describe('service factory', () => {
    it('should create service with correct methods', () => {
      expect(service).toHaveProperty('getEnterpriseRisks');
      expect(service).toHaveProperty('getEnterpriseRiskById');
      expect(service).toHaveProperty('getEnterpriseRisksChildRisks');
      expect(typeof service.getEnterpriseRisks).toBe('function');
      expect(typeof service.getEnterpriseRiskById).toBe('function');
      expect(typeof service.getEnterpriseRisksChildRisks).toBe('function');
    });

    it('should create independent service instances', () => {
      const service1 = enterpriseRisksService(mockClient);
      const service2 = enterpriseRisksService(mockClient);

      expect(service1).not.toBe(service2);
      expect(service1.getEnterpriseRisks).not.toBe(service2.getEnterpriseRisks);
      expect(service1.getEnterpriseRiskById).not.toBe(
        service2.getEnterpriseRiskById
      );
      expect(service1.getEnterpriseRisksChildRisks).not.toBe(
        service2.getEnterpriseRisksChildRisks
      );
    });
  });
});
