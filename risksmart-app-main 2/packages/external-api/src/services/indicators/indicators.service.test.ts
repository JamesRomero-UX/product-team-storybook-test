import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  IClient,
  IndicatorListQueryResponse,
  IndicatorResultByIdResponse,
  IndicatorResultListQueryResponse,
} from '../../clients/client.interface';
import type {
  IdDateTimeQueryOpts,
  SeqIdQueryOpts,
  ServiceCallContext,
} from '../../types/service';
import { indicatorsService } from './indicators.service';

describe('indicators.service', () => {
  let mockClient: IClient;
  let mockContext: ServiceCallContext;
  let service: ReturnType<typeof indicatorsService>;

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
      queryIndicatorList: vi.fn(),
      getIndicatorById: vi.fn(),
      queryIndicatorResultList: vi.fn(),
      getIndicatorResultById: vi.fn(),
    } as unknown as IClient;

    mockContext = {
      authToken: 'Bearer test-token',
    };

    service = indicatorsService(mockClient);
  });

  describe('getIndicators', () => {
    const mockTrpcResponse: IndicatorListQueryResponse = {
      indicator: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Title: 'Test Indicator 1',
          Details: 'Details 1',
          tags: [],
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          SequentialId: 1,
          owners: [],
          contributors: [],
          parents: [],
        } as unknown as IndicatorListQueryResponse['indicator'][0],
        {
          Id: '123e4567-e89b-12d3-a456-426614174001',
          Title: 'Test Indicator 2',
          Details: 'Details 2',
          tags: [],
          ModifiedByUser: 'provider|user1',
          ModifiedAtTimestamp: '2024-01-02T00:00:00Z',
          CreatedByUser: 'provider|user1',
          CreatedAtTimestamp: '2024-01-02T00:00:00Z',
          SequentialId: 2,
          owners: [],
          contributors: [],
          parents: [],
        } as unknown as IndicatorListQueryResponse['indicator'][0],
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
      it('should fetch and return indicators without filters', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryIndicatorList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIndicators(query, mockContext);

        expect(mockClient.queryIndicatorList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.indicator,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should use default pagination values when not provided', async () => {
        const query = {} as SeqIdQueryOpts;

        vi.mocked(mockClient.queryIndicatorList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIndicators(query, mockContext);

        expect(result).toEqual({
          data: mockTrpcResponse.indicator,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: null,
          afterId: 10,
        };

        vi.mocked(mockClient.queryIndicatorList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIndicators(query, mockContext);

        expect(mockClient.queryIndicatorList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.indicator,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with beforeId correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: 20,
          afterId: null,
        };

        vi.mocked(mockClient.queryIndicatorList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIndicators(query, mockContext);

        expect(mockClient.queryIndicatorList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.indicator,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty indicator list', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        const emptyResponse: IndicatorListQueryResponse = {
          indicator: [],
          pageMetadata: {
            nextId: null,
            prevId: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        };

        vi.mocked(mockClient.queryIndicatorList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getIndicators(query, mockContext);

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

        vi.mocked(mockClient.queryIndicatorList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIndicators(query, mockContext);

        expect(mockClient.queryIndicatorList).toHaveBeenCalledWith(
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
          data: mockTrpcResponse.indicator,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client.queryIndicatorList fails', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryIndicatorList).mockRejectedValue(clientError);

        await expect(service.getIndicators(query, mockContext)).rejects.toThrow(
          'tRPC client error'
        );
      });

      it('should handle non-Error objects thrown by client', async () => {
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryIndicatorList).mockRejectedValue(
          'string error'
        );

        await expect(service.getIndicators(query, mockContext)).rejects.toThrow(
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

        vi.mocked(mockClient.queryIndicatorList).mockRejectedValue(clientError);

        await expect(service.getIndicators(query, mockContext)).rejects.toThrow(
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

        vi.mocked(mockClient.queryIndicatorList).mockRejectedValue(
          timeoutError
        );

        await expect(service.getIndicators(query, mockContext)).rejects.toThrow(
          'Network timeout'
        );
      });
    });
  });

  describe('getIndicatorById', () => {
    const mockTrpcIndicator = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Title: 'Test Indicator 1',
      Details: 'Details 1',
      tags: [],
      ModifiedByUser: 'provider|user1',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      CreatedByUser: 'provider|user1',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      SequentialId: 1,
      owners: [],
      contributors: [],
    } as unknown as NonNullable<
      Awaited<ReturnType<IClient['getIndicatorById']>>
    >['indicator'];

    describe('happy path', () => {
      it('should fetch and return indicator by id', async () => {
        const indicatorId = '123e4567-e89b-12d3-a456-426614174000';

        const mockResponse = {
          indicator: mockTrpcIndicator,
          form_configuration: null,
        };
        vi.mocked(mockClient.getIndicatorById).mockResolvedValue(mockResponse);

        const result = await service.getIndicatorById(indicatorId, mockContext);

        expect(mockClient.getIndicatorById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          indicatorId
        );

        expect(result).toEqual({
          data: mockResponse.indicator,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should return indicator with form_configuration when present', async () => {
        const indicatorId = '123e4567-e89b-12d3-a456-426614174000';

        const mockFormConfig = {
          fields: [
            { name: 'field1', type: 'text', required: true },
            { name: 'field2', type: 'number', required: false },
          ],
        } as never;

        const mockResponse = {
          indicator: mockTrpcIndicator,
          form_configuration: mockFormConfig,
        };
        vi.mocked(mockClient.getIndicatorById).mockResolvedValue(mockResponse);

        const result = await service.getIndicatorById(indicatorId, mockContext);

        expect(result).toEqual({
          data: mockResponse.indicator,
          form_configuration: mockFormConfig,
        });
      });

      it('should return null when indicator is not found (null response)', async () => {
        const indicatorId = '999e9999-e89b-12d3-a456-426614174999';

        vi.mocked(mockClient.getIndicatorById).mockResolvedValue(null);

        const result = await service.getIndicatorById(indicatorId, mockContext);

        expect(result).toBeNull();
      });

      it('should handle indicator with all optional fields populated', async () => {
        const indicatorId = '123e4567-e89b-12d3-a456-426614174000';

        const completeIndicator = {
          ...mockTrpcIndicator,
          owners: [{ UserId: 'provider|owner1' }],
          contributors: [{ UserId: 'provider|contributor1' }],
          tags: [
            {
              type: {
                Name: 'critical',
                Description: 'Critical indicator',
              },
            },
          ],
        };

        const mockResponse = {
          indicator: completeIndicator,
          form_configuration: null,
        };
        vi.mocked(mockClient.getIndicatorById).mockResolvedValue(
          mockResponse as never
        );

        const result = await service.getIndicatorById(indicatorId, mockContext);

        expect(result).toEqual({
          data: completeIndicator,
          form_configuration: null,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails with non "not found" error', async () => {
        const indicatorId = '123e4567-e89b-12d3-a456-426614174000';
        const clientError = new Error('Database connection failed');

        vi.mocked(mockClient.getIndicatorById).mockRejectedValue(clientError);

        await expect(
          service.getIndicatorById(indicatorId, mockContext)
        ).rejects.toThrow('Database connection failed');
      });

      it('should handle non-Error objects thrown by client', async () => {
        const indicatorId = '123e4567-e89b-12d3-a456-426614174000';

        vi.mocked(mockClient.getIndicatorById).mockRejectedValue(
          'string error'
        );

        await expect(
          service.getIndicatorById(indicatorId, mockContext)
        ).rejects.toThrow('string error');
      });

      it('should throw error for invalid UUID format', async () => {
        const invalidIndicatorId = 'not-a-valid-uuid';
        const validationError = new Error('Invalid UUID format');

        vi.mocked(mockClient.getIndicatorById).mockRejectedValue(
          validationError
        );

        await expect(
          service.getIndicatorById(invalidIndicatorId, mockContext)
        ).rejects.toThrow('Invalid UUID format');
      });

      it('should handle authorization errors', async () => {
        const indicatorId = '123e4567-e89b-12d3-a456-426614174000';
        const authError = new Error('Unauthorized access');

        vi.mocked(mockClient.getIndicatorById).mockRejectedValue(authError);

        await expect(
          service.getIndicatorById(indicatorId, mockContext)
        ).rejects.toThrow('Unauthorized access');
      });

      it('should handle network timeout errors', async () => {
        const indicatorId = '123e4567-e89b-12d3-a456-426614174000';
        const timeoutError = new Error('Request timeout');

        vi.mocked(mockClient.getIndicatorById).mockRejectedValue(timeoutError);

        await expect(
          service.getIndicatorById(indicatorId, mockContext)
        ).rejects.toThrow('Request timeout');
      });
    });
  });

  describe('getIndicatorResults', () => {
    const indicatorId = '223e4567-e89b-12d3-a456-426614174000';

    const baseQuery: IdDateTimeQueryOpts = {
      limit: 10,
      beforeId: null,
      beforeDateTime: null,
      afterId: null,
      afterDateTime: null,
    };

    const mockTrpcResponse: IndicatorResultListQueryResponse = {
      indicatorResult: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Description: 'Test Result 1',
          ResultDate: '2023-01-15T00:00:00.000Z',
          TargetValueTxt: 'On Track',
          TargetValueNum: 95,
          CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
          CreatedByUser: 'provider|user123',
          ModifiedByUser: 'provider|user456',
          parent: {
            Id: indicatorId,
          },
        } as unknown as IndicatorResultListQueryResponse['indicatorResult'][0],
        {
          Id: '123e4567-e89b-12d3-a456-426614174001',
          Description: 'Test Result 2',
          ResultDate: '2023-01-16T00:00:00.000Z',
          TargetValueTxt: 'Below Target',
          TargetValueNum: 75,
          CreatedAtTimestamp: '2023-01-02T00:00:00.000Z',
          ModifiedAtTimestamp: '2023-01-03T00:00:00.000Z',
          CreatedByUser: 'provider|user123',
          ModifiedByUser: 'provider|user456',
          parent: {
            Id: indicatorId,
          },
        } as unknown as IndicatorResultListQueryResponse['indicatorResult'][0],
      ],
      pageMetadata: {
        nextId: null,
        nextDateTime: null,
        prevId: null,
        prevDateTime: null,
        hasNext: false,
        hasPrev: false,
        count: 2,
      },
    };

    describe('happy path', () => {
      it('should fetch and return indicator results without filters', async () => {
        vi.mocked(mockClient.queryIndicatorResultList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIndicatorResults(
          indicatorId,
          baseQuery,
          mockContext
        );

        expect(mockClient.queryIndicatorResultList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: indicatorId,
            limit: 10,
            afterId: null,
            afterDateTime: null,
            beforeId: null,
            beforeDateTime: null,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.indicatorResult,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId and afterDateTime', async () => {
        const query: IdDateTimeQueryOpts = {
          ...baseQuery,
          limit: 5,
          afterId: '123e4567-e89b-12d3-a456-426614174000',
          afterDateTime: '2023-01-15T00:00:00.000Z',
        };

        vi.mocked(mockClient.queryIndicatorResultList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIndicatorResults(
          indicatorId,
          query,
          mockContext
        );

        expect(mockClient.queryIndicatorResultList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: indicatorId,
            limit: 5,
            afterId: '123e4567-e89b-12d3-a456-426614174000',
            afterDateTime: '2023-01-15T00:00:00.000Z',
            beforeId: null,
            beforeDateTime: null,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.indicatorResult,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with beforeId and beforeDateTime', async () => {
        const query: IdDateTimeQueryOpts = {
          ...baseQuery,
          limit: 5,
          beforeId: '123e4567-e89b-12d3-a456-426614174001',
          beforeDateTime: '2023-01-16T00:00:00.000Z',
        };

        vi.mocked(mockClient.queryIndicatorResultList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getIndicatorResults(
          indicatorId,
          query,
          mockContext
        );

        expect(mockClient.queryIndicatorResultList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: indicatorId,
            limit: 5,
            afterId: null,
            afterDateTime: null,
            beforeId: '123e4567-e89b-12d3-a456-426614174001',
            beforeDateTime: '2023-01-16T00:00:00.000Z',
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.indicatorResult,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty indicator result list', async () => {
        const emptyResponse: IndicatorResultListQueryResponse = {
          indicatorResult: [],
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

        vi.mocked(mockClient.queryIndicatorResultList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getIndicatorResults(
          indicatorId,
          baseQuery,
          mockContext
        );

        expect(result).toEqual({
          data: [],
          metadata: emptyResponse.pageMetadata,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client.queryIndicatorResultList fails', async () => {
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryIndicatorResultList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getIndicatorResults(indicatorId, baseQuery, mockContext)
        ).rejects.toThrow('tRPC client error');
      });

      it('should handle non-Error objects thrown by client', async () => {
        vi.mocked(mockClient.queryIndicatorResultList).mockRejectedValue(
          'string error'
        );

        await expect(
          service.getIndicatorResults(indicatorId, baseQuery, mockContext)
        ).rejects.toThrow('string error');
      });

      it('should handle network timeout errors', async () => {
        const timeoutError = new Error('Network timeout');

        vi.mocked(mockClient.queryIndicatorResultList).mockRejectedValue(
          timeoutError
        );

        await expect(
          service.getIndicatorResults(indicatorId, baseQuery, mockContext)
        ).rejects.toThrow('Network timeout');
      });
    });
  });

  describe('getIndicatorResultById', () => {
    const indicatorId = '223e4567-e89b-12d3-a456-426614174000';
    const resultId = '123e4567-e89b-12d3-a456-426614174000';

    const mockTrpcIndicatorResult = {
      Id: resultId,
      Description: 'Test Result',
      ResultDate: '2023-01-15T00:00:00.000Z',
      TargetValueTxt: 'On Track',
      TargetValueNum: 95,
      CreatedAtTimestamp: '2023-01-01T00:00:00.000Z',
      ModifiedAtTimestamp: '2023-01-02T00:00:00.000Z',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user456',
      parent: {
        Id: indicatorId,
      },
    } as unknown as NonNullable<
      Awaited<ReturnType<IClient['getIndicatorResultById']>>
    >['indicatorResult'];

    describe('happy path', () => {
      it('should fetch and return indicator result by id', async () => {
        const mockResponse: IndicatorResultByIdResponse = {
          indicatorResult: mockTrpcIndicatorResult,
          form_configuration: null,
        };

        vi.mocked(mockClient.getIndicatorResultById).mockResolvedValue(
          mockResponse
        );

        const result = await service.getIndicatorResultById(
          { id: indicatorId, resultId },
          mockContext
        );

        expect(mockClient.getIndicatorResultById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          resultId
        );

        expect(result).toEqual({
          data: mockResponse.indicatorResult,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should return indicator result with form_configuration when present', async () => {
        const mockFormConfig = {
          fields: [
            { name: 'field1', type: 'text', required: true },
            { name: 'field2', type: 'number', required: false },
          ],
        } as never;

        const mockResponse: IndicatorResultByIdResponse = {
          indicatorResult: mockTrpcIndicatorResult,
          form_configuration: mockFormConfig,
        };

        vi.mocked(mockClient.getIndicatorResultById).mockResolvedValue(
          mockResponse
        );

        const result = await service.getIndicatorResultById(
          { id: indicatorId, resultId },
          mockContext
        );

        expect(result).toEqual({
          data: mockResponse.indicatorResult,
          form_configuration: mockFormConfig,
        });
      });

      it('should return null when indicator result is not found (null response)', async () => {
        vi.mocked(mockClient.getIndicatorResultById).mockResolvedValue(null);

        const result = await service.getIndicatorResultById(
          { id: indicatorId, resultId: '999e9999-e89b-12d3-a456-426614174999' },
          mockContext
        );

        expect(result).toBeNull();
      });

      it('should return null when id is missing from ids object', async () => {
        const result = await service.getIndicatorResultById(
          { resultId } as Record<string, string>,
          mockContext
        );

        expect(result).toBeNull();
        expect(mockClient.getIndicatorResultById).not.toHaveBeenCalled();
      });

      it('should return null when resultId is missing from ids object', async () => {
        const result = await service.getIndicatorResultById(
          { id: indicatorId } as Record<string, string>,
          mockContext
        );

        expect(result).toBeNull();
        expect(mockClient.getIndicatorResultById).not.toHaveBeenCalled();
      });

      it('should return null when id is empty string', async () => {
        const result = await service.getIndicatorResultById(
          { id: '', resultId },
          mockContext
        );

        expect(result).toBeNull();
        expect(mockClient.getIndicatorResultById).not.toHaveBeenCalled();
      });

      it('should return null when resultId is empty string', async () => {
        const result = await service.getIndicatorResultById(
          { id: indicatorId, resultId: '' },
          mockContext
        );

        expect(result).toBeNull();
        expect(mockClient.getIndicatorResultById).not.toHaveBeenCalled();
      });

      it('should return null when result parent does not match indicator id', async () => {
        const mismatchedResult = {
          ...mockTrpcIndicatorResult,
          parent: {
            Id: 'different-indicator-id',
          },
        } as unknown as NonNullable<
          Awaited<ReturnType<IClient['getIndicatorResultById']>>
        >['indicatorResult'];

        const mockResponse: IndicatorResultByIdResponse = {
          indicatorResult: mismatchedResult,
          form_configuration: null,
        };

        vi.mocked(mockClient.getIndicatorResultById).mockResolvedValue(
          mockResponse
        );

        const result = await service.getIndicatorResultById(
          { id: indicatorId, resultId },
          mockContext
        );

        expect(result).toBeNull();
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails with non "not found" error', async () => {
        const clientError = new Error('Database connection failed');

        vi.mocked(mockClient.getIndicatorResultById).mockRejectedValue(
          clientError
        );

        await expect(
          service.getIndicatorResultById(
            { id: indicatorId, resultId },
            mockContext
          )
        ).rejects.toThrow('Database connection failed');
      });

      it('should handle non-Error objects thrown by client', async () => {
        vi.mocked(mockClient.getIndicatorResultById).mockRejectedValue(
          'string error'
        );

        await expect(
          service.getIndicatorResultById(
            { id: indicatorId, resultId },
            mockContext
          )
        ).rejects.toThrow('string error');
      });

      it('should handle authorization errors', async () => {
        const authError = new Error('Unauthorized access');

        vi.mocked(mockClient.getIndicatorResultById).mockRejectedValue(
          authError
        );

        await expect(
          service.getIndicatorResultById(
            { id: indicatorId, resultId },
            mockContext
          )
        ).rejects.toThrow('Unauthorized access');
      });

      it('should handle network timeout errors', async () => {
        const timeoutError = new Error('Request timeout');

        vi.mocked(mockClient.getIndicatorResultById).mockRejectedValue(
          timeoutError
        );

        await expect(
          service.getIndicatorResultById(
            { id: indicatorId, resultId },
            mockContext
          )
        ).rejects.toThrow('Request timeout');
      });
    });
  });

  describe('service factory', () => {
    it('should create service with correct methods', () => {
      expect(service).toHaveProperty('getIndicators');
      expect(service).toHaveProperty('getIndicatorById');
      expect(service).toHaveProperty('getIndicatorResults');
      expect(service).toHaveProperty('getIndicatorResultById');
      expect(typeof service.getIndicators).toBe('function');
      expect(typeof service.getIndicatorById).toBe('function');
      expect(typeof service.getIndicatorResults).toBe('function');
      expect(typeof service.getIndicatorResultById).toBe('function');
    });

    it('should create independent service instances', () => {
      const service1 = indicatorsService(mockClient);
      const service2 = indicatorsService(mockClient);

      expect(service1).not.toBe(service2);
      expect(service1.getIndicators).not.toBe(service2.getIndicators);
      expect(service1.getIndicatorById).not.toBe(service2.getIndicatorById);
      expect(service1.getIndicatorResults).not.toBe(
        service2.getIndicatorResults
      );
      expect(service1.getIndicatorResultById).not.toBe(
        service2.getIndicatorResultById
      );
    });
  });
});
