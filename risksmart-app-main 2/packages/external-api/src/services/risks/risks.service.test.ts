import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  AcceptanceByIdResponse,
  AppetiteByIdResponse,
  ApprovalByIdResponse,
  IClient,
  ListAcceptancesResponse,
  RiskByIdResponse,
  RiskListActionsResponse,
  RiskListAppetiteResponse,
  RiskListApprovalResponse,
  RiskListControlsResponse,
  RiskListIndicatorsResponse,
  RiskListQueryResponse,
  RiskListRatingResponse,
  RiskRatingByIdResponse,
} from '../../clients/client.interface';
import type {
  IdDateTimeQueryOpts,
  SeqIdQueryOpts,
  ServiceCallContext,
} from '../../types/service';
import { risksService } from './risks.service';

// Mock only the transformers to isolate the service logic
vi.mock('../transformers/risk.transformer', () => ({
  transformRiskListQueryResponse: vi.fn(),
  transformRiskByIdResponse: vi.fn(),
}));

describe('risks.service', () => {
  let mockClient: IClient;
  let mockContext: ServiceCallContext;
  let service: ReturnType<typeof risksService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      queryRiskList: vi.fn(),
      getRiskById: vi.fn(),
      queryRiskControlsList: vi.fn(),
      queryRiskActionsList: vi.fn(),
      queryRiskIndicatorsList: vi.fn(),
      queryRiskAppetiteList: vi.fn(),
      getAppetiteById: vi.fn(),
      getControlById: vi.fn(),
      queryControlList: vi.fn(),
      queryActionList: vi.fn(),
      getActionById: vi.fn(),
      queryRiskRatings: vi.fn(),
      getRiskRatingById: vi.fn(),
      queryRiskAcceptancesList: vi.fn(),
      getAcceptanceById: vi.fn(),
      queryRiskApprovalsList: vi.fn(),
      getApprovalById: vi.fn(),
    } as unknown as IClient;

    mockContext = {
      authToken: 'Bearer test-token',
    };

    service = risksService(mockClient);
  });

  describe('getRisks', () => {
    const mockTrpcResponse: RiskListQueryResponse = {
      risk: [
        {
          Id: '1',
          Title: 'Test Risk 1',
          Description: 'Description 1',
          tags: [],
          ModifiedByUser: 'user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          Tier: 0,
          SequentialId: null,
          assessmentResults: [],
          actions: [],
          impactRatings: [],
          controls: [],
          indicators: [],
          owners: [],
          contributors: [],
          contributorGroups: [],
          ownerGroups: [],
          departments: [],
          Status: null,
          CustomAttributeData: null,
          ParentRiskId: null,
          Treatment: null,
          createdByUser: null,
          modifiedByUser: null,
          parent: null,
          parentNode: null,
          enterpriseRiskInstance: null,
          riskScore: null,
        },
        {
          Id: '2',
          Title: 'Test Risk 2',
          Description: 'Description 2',
          tags: [],
          ModifiedByUser: 'user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          Tier: 0,
          SequentialId: null,
          assessmentResults: [],
          actions: [],
          impactRatings: [],
          controls: [],
          indicators: [],
          owners: [],
          contributors: [],
          contributorGroups: [],
          ownerGroups: [],
          departments: [],
          Status: null,
          CustomAttributeData: null,
          ParentRiskId: null,
          Treatment: null,
          createdByUser: null,
          modifiedByUser: null,
          parent: null,
          parentNode: null,
          enterpriseRiskInstance: null,
          riskScore: null,
        },
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
      it('should fetch and transform risks without filters', async () => {
        const query: SeqIdQueryOpts = {
          limit: 1,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryRiskList).mockResolvedValue(mockTrpcResponse);

        const result = await service.getRisks(query, mockContext);

        expect(mockClient.queryRiskList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            afterSequentialId: null,
            beforeSequentialId: null,
            limit: 1,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.risk,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should use default pagination values when not provided', async () => {
        const query = {} as SeqIdQueryOpts;

        vi.mocked(mockClient.queryRiskList).mockResolvedValue(mockTrpcResponse);

        const result = await service.getRisks(query, mockContext);

        expect(result).toEqual({
          data: mockTrpcResponse.risk,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination correctly', async () => {
        const query: SeqIdQueryOpts = {
          limit: 1,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryRiskList).mockResolvedValue(mockTrpcResponse);

        const result = await service.getRisks(query, mockContext);

        expect(result).toEqual({
          data: mockTrpcResponse.risk,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });
    });

    describe('error handling', () => {
      it('should throw error when client.queryRiskList fails', async () => {
        const query: SeqIdQueryOpts = {
          limit: 1,
          beforeId: null,
          afterId: null,
        };
        const errorMsg = 'tRPC client error';
        const clientError = new Error(errorMsg);

        vi.mocked(mockClient.queryRiskList).mockRejectedValue(clientError);

        await expect(service.getRisks(query, mockContext)).rejects.toThrow(
          errorMsg
        );
      });

      it('should handle non-Error objects thrown by client', async () => {
        const query: SeqIdQueryOpts = {
          limit: 1,
          beforeId: null,
          afterId: null,
        };
        const errorMsg = 'some error msg';
        vi.mocked(mockClient.queryRiskList).mockRejectedValue(errorMsg);

        await expect(service.getRisks(query, mockContext)).rejects.toThrow(
          errorMsg
        );
      });
    });
  });

  describe('getRiskById', () => {
    const mockTrpcRisk = {
      Id: '1p',
      Title: 'Test Risk 1',
      Description: 'Description 1',
      tags: [],
      ModifiedByUser: 'user1',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      CreatedByUser: 'user1',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      Tier: 0,
      SequentialId: null,
      assessmentResults: [],
      actions: [],
      appetites: [],
      impactRatings: [],
      controls: [],
      indicators: [],
      ancestorContributors: [],
      owners: [],
      contributors: [],
      contributorGroups: [],
      ownerGroups: [],
      departments: [],
      Status: null,
      CustomAttributeData: null,
      ParentRiskId: null,
      Treatment: null,
      schedule: null,
      createdByUser: null,
      modifiedByUser: null,
      parent: null,
      parentNode: null,
      scheduleState: null,
      enterpriseRiskInstance: null,
      riskScore: null,
    };

    describe('happy path', () => {
      it('should fetch and transform risk by id', async () => {
        const riskId = '123';

        const mockResponse = {
          risk: mockTrpcRisk,
          form_configuration: null,
        } as RiskByIdResponse;
        vi.mocked(mockClient.getRiskById).mockResolvedValue(mockResponse);

        const result = await service.getRiskById(riskId, mockContext);

        expect(mockClient.getRiskById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          riskId
        );

        expect(result).toEqual({
          data: mockResponse!.risk,
          form_configuration: mockResponse!.form_configuration,
        });
      });

      it('should return null when risk is not found (empty array)', async () => {
        const riskId = '999';

        vi.mocked(mockClient.getRiskById).mockResolvedValue(null);

        const result = await service.getRiskById(riskId, mockContext);

        expect(result).toBeNull();
      });
    });

    describe('error handling', () => {
      it('should throw error when client fails with error', async () => {
        const riskId = '123';
        const clientError = new Error('Database connection failed');

        vi.mocked(mockClient.getRiskById).mockRejectedValue(clientError);

        await expect(service.getRiskById(riskId, mockContext)).rejects.toThrow(
          clientError
        );
      });
    });
  });

  // Helper type for parameterized linked resource tests
  interface LinkedResourceTestConfig<TResponse, TData> {
    methodName: 'getRiskControls' | 'getRiskActions' | 'getRiskIndicators';
    clientMethod: keyof Pick<
      IClient,
      | 'queryRiskControlsList'
      | 'queryRiskActionsList'
      | 'queryRiskIndicatorsList'
    >;
    responseDataKey: 'control' | 'action' | 'indicator';
    mockData: TData[];
    mockResponse: TResponse;
  }

  const linkedResourceTestConfigs: LinkedResourceTestConfig<
    unknown,
    unknown
  >[] = [
    {
      methodName: 'getRiskControls',
      clientMethod: 'queryRiskControlsList',
      responseDataKey: 'control',
      mockData: [
        {
          Id: 'control-1',
          Title: 'Test Control 1',
          Description: 'Description 1',
          ModifiedByUser: 'user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          CustomAttributeData: null,
          SequentialId: null,
          Type: 'manual',
          tags: [],
          owners: [],
          contributors: [],
          contributorGroups: [],
          ownerGroups: [],
          parents: [],
          departments: [],
        },
        {
          Id: 'control-2',
          Title: 'Test Control 2',
          Description: 'Description 2',
          ModifiedByUser: 'user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          CustomAttributeData: null,
          SequentialId: null,
          Type: 'manual',
          tags: [],
          owners: [],
          contributors: [],
          contributorGroups: [],
          ownerGroups: [],
          parents: [],
          departments: [],
        },
      ],
      mockResponse: {
        control: [],
        pageMetadata: {
          nextId: null,
          prevId: null,
          hasNext: false,
          hasPrev: false,
          count: 2,
        },
      } as RiskListControlsResponse,
    },
    {
      methodName: 'getRiskActions',
      clientMethod: 'queryRiskActionsList',
      responseDataKey: 'action',
      mockData: [
        {
          Id: 'action-1',
          Title: 'Test Action 1',
          Description: 'Description 1',
          ModifiedByUser: 'user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          CustomAttributeData: null,
          SequentialId: null,
          tags: [],
          owners: [],
          contributors: [],
          contributorGroups: [],
          ownerGroups: [],
          departments: [],
        },
        {
          Id: 'action-2',
          Title: 'Test Action 2',
          Description: 'Description 2',
          ModifiedByUser: 'user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          CustomAttributeData: null,
          SequentialId: null,
          tags: [],
          owners: [],
          contributors: [],
          contributorGroups: [],
          ownerGroups: [],
          departments: [],
        },
      ],
      mockResponse: {
        action: [],
        pageMetadata: {
          nextId: null,
          prevId: null,
          hasNext: false,
          hasPrev: false,
          count: 2,
        },
      } as unknown as RiskListActionsResponse,
    },
    {
      methodName: 'getRiskIndicators',
      clientMethod: 'queryRiskIndicatorsList',
      responseDataKey: 'indicator',
      mockData: [
        {
          Id: 'indicator-1',
          Title: 'Test Indicator 1',
          Description: 'Description 1',
          ModifiedByUser: 'user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          SequentialId: 1,
          Type: 'Manual',
          tags: [],
          owners: [],
          contributors: [],
          contributorGroups: [],
          ownerGroups: [],
          departments: [],
          parents: [],
        } as unknown as RiskListIndicatorsResponse['indicator'][0],
        {
          Id: 'indicator-2',
          Title: 'Test Indicator 2',
          Description: 'Description 2',
          ModifiedByUser: 'user1',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'user1',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          SequentialId: 2,
          Type: 'Automated',
          tags: [],
          owners: [],
          contributors: [],
          contributorGroups: [],
          ownerGroups: [],
          departments: [],
          parents: [],
        } as unknown as RiskListIndicatorsResponse['indicator'][0],
      ],
      mockResponse: {
        indicator: [],
        pageMetadata: {
          nextId: null,
          prevId: null,
          hasNext: false,
          hasPrev: false,
          count: 2,
        },
      } as unknown as RiskListIndicatorsResponse,
    },
  ];

  describe.each(linkedResourceTestConfigs)(
    '$methodName',
    ({ methodName, clientMethod, responseDataKey, mockData, mockResponse }) => {
      // Update mockResponse to include the actual data
      const mockTrpcResponse = {
        ...(mockResponse as Record<string, unknown>),
        [responseDataKey]: mockData,
      };

      describe('happy path', () => {
        it('should fetch linked resource with linkId', async () => {
          const linkId = 'risk-123';
          const query: SeqIdQueryOpts = {
            limit: 10,
            beforeId: null,
            afterId: null,
          };

          vi.mocked(mockClient[clientMethod]).mockResolvedValue(
            mockTrpcResponse as unknown as RiskListControlsResponse &
              RiskListActionsResponse &
              RiskListIndicatorsResponse
          );

          const result = await service[methodName](linkId, query, mockContext);

          expect(mockClient[clientMethod]).toHaveBeenCalledWith(
            {
              authorization: 'Bearer test-token',
            },
            {
              linkId: 'risk-123',
              afterSequentialId: null,
              beforeSequentialId: null,
              limit: 10,
            }
          );

          expect(result).toEqual({
            data: mockTrpcResponse[responseDataKey],
            metadata: mockTrpcResponse.pageMetadata,
          });
        });

        it('should handle pagination with afterId', async () => {
          const linkId = 'risk-456';
          const query: SeqIdQueryOpts = {
            limit: 25,
            beforeId: null,
            afterId: 100,
          };

          vi.mocked(mockClient[clientMethod]).mockResolvedValue(
            mockTrpcResponse as unknown as RiskListControlsResponse &
              RiskListActionsResponse &
              RiskListIndicatorsResponse
          );

          const result = await service[methodName](linkId, query, mockContext);

          expect(mockClient[clientMethod]).toHaveBeenCalledWith(
            {
              authorization: 'Bearer test-token',
            },
            {
              linkId: 'risk-456',
              afterSequentialId: 100,
              beforeSequentialId: null,
              limit: 25,
            }
          );

          expect(result).toEqual({
            data: mockTrpcResponse[responseDataKey],
            metadata: mockTrpcResponse.pageMetadata,
          });
        });

        it('should handle pagination with beforeId', async () => {
          const linkId = 'risk-789';
          const query: SeqIdQueryOpts = {
            limit: 15,
            beforeId: 200,
            afterId: null,
          };

          vi.mocked(mockClient[clientMethod]).mockResolvedValue(
            mockTrpcResponse as unknown as RiskListControlsResponse &
              RiskListActionsResponse &
              RiskListIndicatorsResponse
          );

          const result = await service[methodName](linkId, query, mockContext);

          expect(mockClient[clientMethod]).toHaveBeenCalledWith(
            {
              authorization: 'Bearer test-token',
            },
            {
              linkId: 'risk-789',
              afterSequentialId: null,
              beforeSequentialId: 200,
              limit: 15,
            }
          );

          expect(result).toEqual({
            data: mockTrpcResponse[responseDataKey],
            metadata: mockTrpcResponse.pageMetadata,
          });
        });

        it('should handle empty results', async () => {
          const linkId = 'risk-empty';
          const query: SeqIdQueryOpts = {
            limit: 10,
            beforeId: null,
            afterId: null,
          };

          const emptyResponse = {
            ...(mockResponse as Record<string, unknown>),
            [responseDataKey]: [],
            pageMetadata: {
              nextId: null,
              prevId: null,
              hasNext: false,
              hasPrev: false,
              count: 0,
            },
          };

          vi.mocked(mockClient[clientMethod]).mockResolvedValue(
            emptyResponse as unknown as RiskListControlsResponse &
              RiskListActionsResponse &
              RiskListIndicatorsResponse
          );

          const result = await service[methodName](linkId, query, mockContext);

          expect(result).toEqual({
            data: [],
            metadata: emptyResponse.pageMetadata,
          });
        });

        it('should handle undefined query options', async () => {
          const linkId = 'risk-undefined';
          const query = {} as SeqIdQueryOpts;

          vi.mocked(mockClient[clientMethod]).mockResolvedValue(
            mockTrpcResponse as unknown as RiskListControlsResponse &
              RiskListActionsResponse &
              RiskListIndicatorsResponse
          );

          const result = await service[methodName](linkId, query, mockContext);

          expect(mockClient[clientMethod]).toHaveBeenCalledWith(
            {
              authorization: 'Bearer test-token',
            },
            {
              linkId: 'risk-undefined',
              afterSequentialId: undefined,
              beforeSequentialId: undefined,
              limit: undefined,
            }
          );

          expect(result).toEqual({
            data: mockTrpcResponse[responseDataKey],
            metadata: mockTrpcResponse.pageMetadata,
          });
        });

        it('should handle null limit value', async () => {
          const linkId = 'risk-null-limit';
          const query: SeqIdQueryOpts = {
            limit: null,
            beforeId: null,
            afterId: null,
          };

          vi.mocked(mockClient[clientMethod]).mockResolvedValue(
            mockTrpcResponse as unknown as RiskListControlsResponse &
              RiskListActionsResponse &
              RiskListIndicatorsResponse
          );

          const result = await service[methodName](linkId, query, mockContext);

          expect(mockClient[clientMethod]).toHaveBeenCalledWith(
            {
              authorization: 'Bearer test-token',
            },
            {
              linkId: 'risk-null-limit',
              afterSequentialId: null,
              beforeSequentialId: null,
              limit: null,
            }
          );

          expect(result).toEqual({
            data: mockTrpcResponse[responseDataKey],
            metadata: mockTrpcResponse.pageMetadata,
          });
        });

        it('should handle pagination with hasNext true', async () => {
          const linkId = 'risk-has-next';
          const query: SeqIdQueryOpts = {
            limit: 10,
            beforeId: null,
            afterId: null,
          };

          const responseWithNext = {
            ...(mockResponse as Record<string, unknown>),
            [responseDataKey]: mockData,
            pageMetadata: {
              nextId: '3',
              prevId: null,
              hasNext: true,
              hasPrev: false,
              count: 2,
            },
          };

          vi.mocked(mockClient[clientMethod]).mockResolvedValue(
            responseWithNext as unknown as RiskListControlsResponse &
              RiskListActionsResponse &
              RiskListIndicatorsResponse
          );

          const result = await service[methodName](linkId, query, mockContext);

          expect(result.metadata.hasNext).toBe(true);
          expect(result.metadata.nextId).toBe('3');
        });

        it('should handle pagination with hasPrev true', async () => {
          const linkId = 'risk-has-prev';
          const query: SeqIdQueryOpts = {
            limit: 10,
            beforeId: 100,
            afterId: null,
          };

          const responseWithPrev = {
            ...(mockResponse as Record<string, unknown>),
            [responseDataKey]: mockData,
            pageMetadata: {
              nextId: null,
              prevId: '50',
              hasNext: false,
              hasPrev: true,
              count: 2,
            },
          };

          vi.mocked(mockClient[clientMethod]).mockResolvedValue(
            responseWithPrev as unknown as RiskListControlsResponse &
              RiskListActionsResponse &
              RiskListIndicatorsResponse
          );

          const result = await service[methodName](linkId, query, mockContext);

          expect(result.metadata.hasPrev).toBe(true);
          expect(result.metadata.prevId).toBe('50');
        });
      });

      describe('error handling', () => {
        it('should throw error when client method fails', async () => {
          const linkId = 'risk-error';
          const query: SeqIdQueryOpts = {
            limit: 10,
            beforeId: null,
            afterId: null,
          };
          const errorMsg = 'tRPC client error';
          const clientError = new Error(errorMsg);

          vi.mocked(mockClient[clientMethod]).mockRejectedValue(clientError);

          await expect(
            service[methodName](linkId, query, mockContext)
          ).rejects.toThrow(errorMsg);
        });

        it('should handle non-Error objects thrown by client', async () => {
          const linkId = 'risk-non-error';
          const query: SeqIdQueryOpts = {
            limit: 10,
            beforeId: null,
            afterId: null,
          };
          const errorMsg = 'some error msg';

          vi.mocked(mockClient[clientMethod]).mockRejectedValue(errorMsg);

          await expect(
            service[methodName](linkId, query, mockContext)
          ).rejects.toThrow(errorMsg);
        });

        it('should handle network timeout errors', async () => {
          const linkId = 'risk-timeout';
          const query: SeqIdQueryOpts = {
            limit: 10,
            beforeId: null,
            afterId: null,
          };
          const timeoutError = new Error('Network timeout');

          vi.mocked(mockClient[clientMethod]).mockRejectedValue(timeoutError);

          await expect(
            service[methodName](linkId, query, mockContext)
          ).rejects.toThrow('Network timeout');
        });
      });

      describe('edge cases', () => {
        it('should handle empty linkId string', async () => {
          const linkId = '';
          const query: SeqIdQueryOpts = {
            limit: 10,
            beforeId: null,
            afterId: null,
          };

          vi.mocked(mockClient[clientMethod]).mockResolvedValue(
            mockTrpcResponse as unknown as RiskListControlsResponse &
              RiskListActionsResponse &
              RiskListIndicatorsResponse
          );

          const result = await service[methodName](linkId, query, mockContext);

          expect(mockClient[clientMethod]).toHaveBeenCalledWith(
            {
              authorization: 'Bearer test-token',
            },
            {
              linkId: '',
              afterSequentialId: null,
              beforeSequentialId: null,
              limit: 10,
            }
          );

          expect(result).toEqual({
            data: mockTrpcResponse[responseDataKey],
            metadata: mockTrpcResponse.pageMetadata,
          });
        });

        it('should handle very large limit values', async () => {
          const linkId = 'risk-large-limit';
          const query: SeqIdQueryOpts = {
            limit: 10000,
            beforeId: null,
            afterId: null,
          };

          vi.mocked(mockClient[clientMethod]).mockResolvedValue(
            mockTrpcResponse as unknown as RiskListControlsResponse &
              RiskListActionsResponse &
              RiskListIndicatorsResponse
          );

          const result = await service[methodName](linkId, query, mockContext);

          expect(mockClient[clientMethod]).toHaveBeenCalledWith(
            {
              authorization: 'Bearer test-token',
            },
            {
              linkId: 'risk-large-limit',
              afterSequentialId: null,
              beforeSequentialId: null,
              limit: 10000,
            }
          );

          expect(result).toBeDefined();
        });

        it('should handle both beforeId and afterId provided (edge case)', async () => {
          const linkId = 'risk-both-cursors';
          const query: SeqIdQueryOpts = {
            limit: 10,
            beforeId: 200,
            afterId: 100,
          };

          vi.mocked(mockClient[clientMethod]).mockResolvedValue(
            mockTrpcResponse as unknown as RiskListControlsResponse &
              RiskListActionsResponse &
              RiskListIndicatorsResponse
          );

          const result = await service[methodName](linkId, query, mockContext);

          expect(mockClient[clientMethod]).toHaveBeenCalledWith(
            {
              authorization: 'Bearer test-token',
            },
            {
              linkId: 'risk-both-cursors',
              afterSequentialId: 100,
              beforeSequentialId: 200,
              limit: 10,
            }
          );

          expect(result).toBeDefined();
        });
      });
    }
  );

  describe('getRiskAppetites', () => {
    const mockAppetitesResponse = {
      appetite: [
        {
          Id: 'appetite-1',
          SequentialId: 1,
          Statement: 'Test appetite statement 1',
          EffectiveDate: '2023-06-01T00:00:00.000Z',
          LowerAppetite: 10,
          UpperAppetite: 90,
          AppetiteType: 'risk',
          ImpactAppetite: null,
          LikelihoodAppetite: null,
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'user1',
          ModifiedByUser: 'user1',
          parents: [],
        },
        {
          Id: 'appetite-2',
          SequentialId: 2,
          Statement: 'Test appetite statement 2',
          EffectiveDate: null,
          LowerAppetite: 20,
          UpperAppetite: 80,
          AppetiteType: 'risk',
          ImpactAppetite: 50,
          LikelihoodAppetite: 30,
          CreatedAtTimestamp: '2024-01-02T00:00:00Z',
          ModifiedAtTimestamp: '2024-01-02T00:00:00Z',
          CreatedByUser: 'user2',
          ModifiedByUser: 'user2',
          parents: [],
        },
      ],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 2,
      },
    } as unknown as RiskListAppetiteResponse;

    describe('happy path', () => {
      it('should fetch and transform appetites for a given risk', async () => {
        const linkId = 'risk-123';
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryRiskAppetiteList).mockResolvedValue(
          mockAppetitesResponse
        );

        const result = await service.getRiskAppetites(
          linkId,
          query,
          mockContext
        );

        expect(mockClient.queryRiskAppetiteList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-123',
            afterSequentialId: null,
            beforeSequentialId: null,
            limit: 10,
          }
        );

        expect(result).toEqual({
          data: mockAppetitesResponse.appetite,
          metadata: mockAppetitesResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId', async () => {
        const linkId = 'risk-456';
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: null,
          afterId: 100,
        };

        vi.mocked(mockClient.queryRiskAppetiteList).mockResolvedValue(
          mockAppetitesResponse
        );

        const result = await service.getRiskAppetites(
          linkId,
          query,
          mockContext
        );

        expect(mockClient.queryRiskAppetiteList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-456',
            afterSequentialId: 100,
            beforeSequentialId: null,
            limit: 5,
          }
        );

        expect(result.data).toEqual(mockAppetitesResponse.appetite);
      });

      it('should handle pagination with beforeId', async () => {
        const linkId = 'risk-789';
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: 200,
          afterId: null,
        };

        vi.mocked(mockClient.queryRiskAppetiteList).mockResolvedValue(
          mockAppetitesResponse
        );

        const result = await service.getRiskAppetites(
          linkId,
          query,
          mockContext
        );

        expect(mockClient.queryRiskAppetiteList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-789',
            afterSequentialId: null,
            beforeSequentialId: 200,
            limit: 5,
          }
        );

        expect(result.data).toEqual(mockAppetitesResponse.appetite);
      });

      it('should handle empty appetites list', async () => {
        const linkId = 'risk-no-appetites';
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        const emptyResponse: RiskListAppetiteResponse = {
          appetite: [],
          pageMetadata: {
            nextId: null,
            prevId: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        };

        vi.mocked(mockClient.queryRiskAppetiteList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getRiskAppetites(
          linkId,
          query,
          mockContext
        );

        expect(result.data).toEqual([]);
        expect(result.metadata.count).toBe(0);
      });
    });

    describe('error handling', () => {
      it('should throw error when client fails', async () => {
        const linkId = 'risk-error';
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const errorMsg = 'Database connection failed';
        const clientError = new Error(errorMsg);

        vi.mocked(mockClient.queryRiskAppetiteList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getRiskAppetites(linkId, query, mockContext)
        ).rejects.toThrow(errorMsg);
      });

      it('should handle non-Error objects thrown by client', async () => {
        const linkId = 'risk-string-error';
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };
        const errorMsg = 'String error message';

        vi.mocked(mockClient.queryRiskAppetiteList).mockRejectedValue(errorMsg);

        await expect(
          service.getRiskAppetites(linkId, query, mockContext)
        ).rejects.toThrow(errorMsg);
      });
    });
  });

  describe('getRiskAppetiteById', () => {
    const mockAppetite = {
      Id: 'appetite-123',
      SequentialId: 1,
      Statement: 'Test appetite statement',
      EffectiveDate: '2023-06-01T00:00:00.000Z',
      LowerAppetite: 10,
      UpperAppetite: 90,
      AppetiteType: 'risk',
      ImpactAppetite: 50,
      LikelihoodAppetite: 30,
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      CreatedByUser: 'user1',
      ModifiedByUser: 'user1',
      ancestorContributors: [],
      parents: [
        {
          Id: 'parent-1',
          risk: {
            Id: 'risk-123',
          },
        },
      ],
    };

    describe('happy path', () => {
      it('should fetch appetite by ID when it belongs to the risk', async () => {
        const ids = { id: 'risk-123', appetiteId: 'appetite-123' };

        const mockResponse: AppetiteByIdResponse = {
          appetite: mockAppetite as never,
          form_configuration: null,
        };

        vi.mocked(mockClient.getAppetiteById).mockResolvedValue(mockResponse);

        const result = await service.getRiskAppetiteById(ids, mockContext);

        expect(mockClient.getAppetiteById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          'appetite-123'
        );

        expect(result).toEqual({
          data: mockResponse.appetite,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should include form_configuration when present', async () => {
        const ids = { id: 'risk-123', appetiteId: 'appetite-123' };

        const mockFormConfig = {
          Id: 'form-1',
          ConfigName: 'Test Config',
        };

        const mockResponse: AppetiteByIdResponse = {
          appetite: mockAppetite as never,
          form_configuration: mockFormConfig as never,
        };

        vi.mocked(mockClient.getAppetiteById).mockResolvedValue(mockResponse);

        const result = await service.getRiskAppetiteById(ids, mockContext);

        expect(result?.form_configuration).toEqual(mockFormConfig);
      });

      it('should return null when appetite is not found', async () => {
        const ids = { id: 'risk-999', appetiteId: 'appetite-999' };

        vi.mocked(mockClient.getAppetiteById).mockResolvedValue(null);

        const result = await service.getRiskAppetiteById(ids, mockContext);

        expect(result).toBeNull();
      });

      it('should return null when appetite does not belong to the risk', async () => {
        const ids = { id: 'risk-999', appetiteId: 'appetite-123' };

        const mockResponse: AppetiteByIdResponse = {
          appetite: mockAppetite as never,
          form_configuration: null,
        };

        vi.mocked(mockClient.getAppetiteById).mockResolvedValue(mockResponse);

        const result = await service.getRiskAppetiteById(ids, mockContext);

        expect(result).toBeNull();
      });

      it('should handle appetite with multiple parent risks', async () => {
        const ids = { id: 'risk-456', appetiteId: 'appetite-multi' };

        const multiParentAppetite = {
          ...mockAppetite,
          Id: 'appetite-multi',
          parents: [
            {
              Id: 'parent-1',
              risk: {
                Id: 'risk-123',
              },
            },
            {
              Id: 'parent-2',
              risk: {
                Id: 'risk-456',
              },
            },
          ],
        };

        const mockResponse: AppetiteByIdResponse = {
          appetite: multiParentAppetite as never,
          form_configuration: null,
        };

        vi.mocked(mockClient.getAppetiteById).mockResolvedValue(mockResponse);

        const result = await service.getRiskAppetiteById(ids, mockContext);

        expect(result).toEqual({
          data: mockResponse.appetite,
          form_configuration: mockResponse.form_configuration,
        });
      });
    });

    describe('error handling', () => {
      it('should throw error when client fails', async () => {
        const ids = { id: 'risk-error', appetiteId: 'appetite-error' };
        const errorMsg = 'Database connection failed';
        const clientError = new Error(errorMsg);

        vi.mocked(mockClient.getAppetiteById).mockRejectedValue(clientError);

        await expect(
          service.getRiskAppetiteById(ids, mockContext)
        ).rejects.toThrow(errorMsg);
      });

      it('should handle non-Error objects thrown by client', async () => {
        const ids = { id: 'risk-string-error', appetiteId: 'appetite-error' };
        const errorMsg = 'String error message';

        vi.mocked(mockClient.getAppetiteById).mockRejectedValue(errorMsg);

        await expect(
          service.getRiskAppetiteById(ids, mockContext)
        ).rejects.toThrow(errorMsg);
      });
    });
  });

  describe('getRiskRatings', () => {
    const mockRating1 = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      CreatedAtTimestamp: '2023-01-01T00:00:00.000+00:00',
      ModifiedAtTimestamp: '2023-01-02T00:00:00.000+00:00',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user456',
      ControlType: 'Controlled',
      Likelihood: 3,
      Impact: 4,
      Rating: 12,
      RatingType: 'inherent',
      TestDate: '2023-01-15T00:00:00.000+00:00',
      Rationale: 'Initial risk assessment',
      CustomAttributeData: null,
      parents: [
        {
          ParentId: '789e4567-e89b-12d3-a456-426614174001',
          ParentType: 'risk' as const,
          risk: {
            Id: 'risk-123',
          },
        },
      ],
    } as NonNullable<RiskRatingByIdResponse>['riskAssessmentResult'];

    const mockRating2 = {
      Id: '456e7890-e89b-12d3-a456-426614174001',
      CreatedAtTimestamp: '2023-02-01T00:00:00.000+00:00',
      ModifiedAtTimestamp: '2023-02-02T00:00:00.000+00:00',
      CreatedByUser: 'provider|user789',
      ModifiedByUser: 'provider|user999',
      ControlType: 'Uncontrolled',
      Likelihood: 2,
      Impact: 3,
      Rating: 6,
      RatingType: 'residual',
      TestDate: null,
      Rationale: null,
      CustomAttributeData: null,
      parents: [],
    } as unknown as NonNullable<RiskRatingByIdResponse>['riskAssessmentResult'];

    const mockRatingsResponse: RiskListRatingResponse = {
      riskAssessmentResult: [mockRating1, mockRating2],
      pageMetadata: {
        nextId: null,
        prevId: null,
        nextDateTime: null,
        prevDateTime: null,
        hasNext: false,
        hasPrev: false,
        count: 2,
      },
    };

    describe('happy path', () => {
      it('should fetch and return risk ratings for a given risk', async () => {
        const linkId = 'risk-123';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryRiskRatings).mockResolvedValue(
          mockRatingsResponse
        );

        const result = await service.getRiskRatings(linkId, query, mockContext);

        expect(mockClient.queryRiskRatings).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-123',
            afterDateTime: null,
            afterId: null,
            beforeDateTime: null,
            beforeId: null,
            limit: 10,
          }
        );

        expect(result).toEqual({
          data: mockRatingsResponse.riskAssessmentResult,
          metadata: mockRatingsResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterDateTime and afterId', async () => {
        const linkId = 'risk-456';
        const query: IdDateTimeQueryOpts = {
          limit: 5,
          beforeId: null,
          beforeDateTime: null,
          afterId: 'rating-100',
          afterDateTime: '2023-01-01T00:00:00.000Z',
        };

        vi.mocked(mockClient.queryRiskRatings).mockResolvedValue(
          mockRatingsResponse
        );

        const result = await service.getRiskRatings(linkId, query, mockContext);

        expect(mockClient.queryRiskRatings).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-456',
            afterDateTime: '2023-01-01T00:00:00.000Z',
            afterId: 'rating-100',
            beforeDateTime: null,
            beforeId: null,
            limit: 5,
          }
        );

        expect(result.data).toEqual(mockRatingsResponse.riskAssessmentResult);
      });

      it('should handle pagination with beforeDateTime and beforeId', async () => {
        const linkId = 'risk-789';
        const query: IdDateTimeQueryOpts = {
          limit: 5,
          beforeId: 'rating-200',
          beforeDateTime: '2023-06-01T00:00:00.000Z',
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryRiskRatings).mockResolvedValue(
          mockRatingsResponse
        );

        const result = await service.getRiskRatings(linkId, query, mockContext);

        expect(mockClient.queryRiskRatings).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-789',
            afterDateTime: null,
            afterId: null,
            beforeDateTime: '2023-06-01T00:00:00.000Z',
            beforeId: 'rating-200',
            limit: 5,
          }
        );

        expect(result.data).toEqual(mockRatingsResponse.riskAssessmentResult);
      });

      it('should handle empty ratings list', async () => {
        const linkId = 'risk-no-ratings';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        const emptyResponse: RiskListRatingResponse = {
          riskAssessmentResult: [],
          pageMetadata: {
            nextId: null,
            prevId: null,
            nextDateTime: null,
            prevDateTime: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        };

        vi.mocked(mockClient.queryRiskRatings).mockResolvedValue(emptyResponse);

        const result = await service.getRiskRatings(linkId, query, mockContext);

        expect(result.data).toEqual([]);
        expect(result.metadata.count).toBe(0);
      });

      it('should handle pagination with hasNext true', async () => {
        const linkId = 'risk-has-next';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        const responseWithNext: RiskListRatingResponse = {
          riskAssessmentResult: [mockRating1],
          pageMetadata: {
            nextId: 'next-rating-id',
            prevId: null,
            nextDateTime: null,
            prevDateTime: null,
            hasNext: true,
            hasPrev: false,
            count: 1,
          },
        };

        vi.mocked(mockClient.queryRiskRatings).mockResolvedValue(
          responseWithNext
        );

        const result = await service.getRiskRatings(linkId, query, mockContext);

        expect(result.metadata.hasNext).toBe(true);
        expect(result.metadata.nextId).toBe('next-rating-id');
      });

      it('should handle pagination with hasPrev true', async () => {
        const linkId = 'risk-has-prev';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: 'rating-100',
          beforeDateTime: '2023-06-01T00:00:00.000Z',
          afterId: null,
          afterDateTime: null,
        };

        const responseWithPrev: RiskListRatingResponse = {
          riskAssessmentResult: [mockRating1],
          pageMetadata: {
            nextId: null,
            prevId: 'prev-rating-id',
            nextDateTime: null,
            prevDateTime: '2025-11-10T00:00:00.000Z',
            hasNext: false,
            hasPrev: true,
            count: 1,
          },
        };

        vi.mocked(mockClient.queryRiskRatings).mockResolvedValue(
          responseWithPrev
        );

        const result = await service.getRiskRatings(linkId, query, mockContext);

        expect(result.metadata.hasPrev).toBe(true);
        expect(result.metadata.prevId).toBe('prev-rating-id');
      });
    });

    describe('error handling', () => {
      it('should throw error when client fails', async () => {
        const linkId = 'risk-error';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };
        const errorMsg = 'Database connection failed';
        const clientError = new Error(errorMsg);

        vi.mocked(mockClient.queryRiskRatings).mockRejectedValue(clientError);

        await expect(
          service.getRiskRatings(linkId, query, mockContext)
        ).rejects.toThrow(errorMsg);
      });

      it('should handle non-Error objects thrown by client', async () => {
        const linkId = 'risk-string-error';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };
        const errorMsg = 'String error message';

        vi.mocked(mockClient.queryRiskRatings).mockRejectedValue(errorMsg);

        await expect(
          service.getRiskRatings(linkId, query, mockContext)
        ).rejects.toThrow(errorMsg);
      });

      it('should handle network timeout errors', async () => {
        const linkId = 'risk-timeout';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };
        const timeoutError = new Error('Network timeout');

        vi.mocked(mockClient.queryRiskRatings).mockRejectedValue(timeoutError);

        await expect(
          service.getRiskRatings(linkId, query, mockContext)
        ).rejects.toThrow('Network timeout');
      });
    });

    describe('edge cases', () => {
      it('should handle empty linkId string', async () => {
        const linkId = '';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryRiskRatings).mockResolvedValue(
          mockRatingsResponse
        );

        const result = await service.getRiskRatings(linkId, query, mockContext);

        expect(mockClient.queryRiskRatings).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: '',
            afterDateTime: null,
            afterId: null,
            beforeDateTime: null,
            beforeId: null,
            limit: 10,
          }
        );

        expect(result).toEqual({
          data: mockRatingsResponse.riskAssessmentResult,
          metadata: mockRatingsResponse.pageMetadata,
        });
      });

      it('should handle very large limit values', async () => {
        const linkId = 'risk-large-limit';
        const query: IdDateTimeQueryOpts = {
          limit: 10000,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryRiskRatings).mockResolvedValue(
          mockRatingsResponse
        );

        const result = await service.getRiskRatings(linkId, query, mockContext);

        expect(mockClient.queryRiskRatings).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-large-limit',
            afterDateTime: null,
            afterId: null,
            beforeDateTime: null,
            beforeId: null,
            limit: 10000,
          }
        );

        expect(result).toBeDefined();
      });

      it('should handle both before and after cursors provided (edge case)', async () => {
        const linkId = 'risk-both-cursors';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: 'rating-200',
          beforeDateTime: '2023-06-01T00:00:00.000Z',
          afterId: 'rating-100',
          afterDateTime: '2023-01-01T00:00:00.000Z',
        };

        vi.mocked(mockClient.queryRiskRatings).mockResolvedValue(
          mockRatingsResponse
        );

        const result = await service.getRiskRatings(linkId, query, mockContext);

        expect(mockClient.queryRiskRatings).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-both-cursors',
            afterDateTime: '2023-01-01T00:00:00.000Z',
            afterId: 'rating-100',
            beforeDateTime: '2023-06-01T00:00:00.000Z',
            beforeId: 'rating-200',
            limit: 10,
          }
        );

        expect(result).toBeDefined();
      });

      it('should handle undefined query options', async () => {
        const linkId = 'risk-undefined';
        const query = {} as IdDateTimeQueryOpts;

        vi.mocked(mockClient.queryRiskRatings).mockResolvedValue(
          mockRatingsResponse
        );

        const result = await service.getRiskRatings(linkId, query, mockContext);

        expect(mockClient.queryRiskRatings).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-undefined',
            afterDateTime: undefined,
            afterId: undefined,
            beforeDateTime: undefined,
            beforeId: undefined,
            limit: undefined,
          }
        );

        expect(result).toEqual({
          data: mockRatingsResponse.riskAssessmentResult,
          metadata: mockRatingsResponse.pageMetadata,
        });
      });

      it('should handle null limit value', async () => {
        const linkId = 'risk-null-limit';
        const query: IdDateTimeQueryOpts = {
          limit: null,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryRiskRatings).mockResolvedValue(
          mockRatingsResponse
        );

        const result = await service.getRiskRatings(linkId, query, mockContext);

        expect(mockClient.queryRiskRatings).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-null-limit',
            afterDateTime: null,
            afterId: null,
            beforeDateTime: null,
            beforeId: null,
            limit: null,
          }
        );

        expect(result).toEqual({
          data: mockRatingsResponse.riskAssessmentResult,
          metadata: mockRatingsResponse.pageMetadata,
        });
      });
    });
  });

  describe('getRiskRatingById', () => {
    const mockRating = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      CreatedAtTimestamp: '2023-01-01T00:00:00.000+00:00',
      ModifiedAtTimestamp: '2023-01-02T00:00:00.000+00:00',
      CreatedByUser: 'provider|user123',
      ModifiedByUser: 'provider|user456',
      ControlType: 'Controlled',
      Likelihood: 3,
      Impact: 4,
      Rating: 12,
      RatingType: 'inherent',
      TestDate: '2023-01-15T00:00:00.000+00:00',
      Rationale: 'Initial risk assessment',
      CustomAttributeData: null,
      parents: [
        {
          Id: 'parent-1',
          risk: {
            Id: 'risk-123',
          },
        },
      ],
    } as NonNullable<RiskRatingByIdResponse>['riskAssessmentResult'];

    describe('happy path', () => {
      it('should fetch rating by ID when it belongs to the risk', async () => {
        const ids = { id: 'risk-123', ratingId: 'rating-123' };

        const mockResponse: RiskRatingByIdResponse = {
          riskAssessmentResult: mockRating,
          form_configuration: null,
        };

        vi.mocked(mockClient.getRiskRatingById).mockResolvedValue(mockResponse);

        const result = await service.getRiskRatingById(ids, mockContext);

        expect(mockClient.getRiskRatingById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          'rating-123'
        );

        expect(result).toEqual({
          data: mockResponse.riskAssessmentResult,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should include form_configuration when present', async () => {
        const ids = { id: 'risk-123', ratingId: 'rating-123' };

        const mockFormConfig = {
          Id: 'form-1',
          ConfigName: 'Test Config',
        };

        const mockResponse: RiskRatingByIdResponse = {
          riskAssessmentResult: mockRating,
          form_configuration: mockFormConfig as never,
        };

        vi.mocked(mockClient.getRiskRatingById).mockResolvedValue(mockResponse);

        const result = await service.getRiskRatingById(ids, mockContext);

        expect(result?.form_configuration).toEqual(mockFormConfig);
      });

      it('should return null when rating is not found', async () => {
        const ids = { id: 'risk-999', ratingId: 'rating-999' };

        vi.mocked(mockClient.getRiskRatingById).mockResolvedValue(null);

        const result = await service.getRiskRatingById(ids, mockContext);

        expect(result).toBeNull();
      });

      it('should return null when rating does not belong to the risk', async () => {
        const ids = { id: 'risk-999', ratingId: 'rating-123' };

        const mockResponse: RiskRatingByIdResponse = {
          riskAssessmentResult: mockRating,
          form_configuration: null,
        };

        vi.mocked(mockClient.getRiskRatingById).mockResolvedValue(mockResponse);

        const result = await service.getRiskRatingById(ids, mockContext);

        expect(result).toBeNull();
      });

      it('should handle rating with multiple parent risks', async () => {
        const ids = { id: 'risk-456', ratingId: 'rating-multi' };

        const multiParentRating = {
          ...mockRating,
          Id: 'rating-multi',
          parents: [
            {
              Id: 'parent-1',
              risk: {
                Id: 'risk-123',
              },
            },
            {
              Id: 'parent-2',
              risk: {
                Id: 'risk-456',
              },
            },
          ],
        } as NonNullable<RiskRatingByIdResponse>['riskAssessmentResult'];

        const mockResponse: RiskRatingByIdResponse = {
          riskAssessmentResult: multiParentRating,
          form_configuration: null,
        };

        vi.mocked(mockClient.getRiskRatingById).mockResolvedValue(mockResponse);

        const result = await service.getRiskRatingById(ids, mockContext);

        expect(result).toEqual({
          data: mockResponse.riskAssessmentResult,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should handle rating with parent that has null risk', async () => {
        const ids = { id: 'risk-123', ratingId: 'rating-null-parent' };

        const ratingWithNullParentRisk = {
          ...mockRating,
          Id: 'rating-null-parent',
          parents: [
            {
              Id: 'parent-1',
              risk: {
                Id: 'risk-123',
              },
            },
            {
              Id: 'parent-2',
              risk: null,
            },
          ],
        } as NonNullable<RiskRatingByIdResponse>['riskAssessmentResult'];

        const mockResponse: RiskRatingByIdResponse = {
          riskAssessmentResult: ratingWithNullParentRisk,
          form_configuration: null,
        };

        vi.mocked(mockClient.getRiskRatingById).mockResolvedValue(mockResponse);

        const result = await service.getRiskRatingById(ids, mockContext);

        expect(result).toEqual({
          data: mockResponse.riskAssessmentResult,
          form_configuration: mockResponse.form_configuration,
        });
      });
    });

    describe('error handling', () => {
      it('should throw error when client fails', async () => {
        const ids = { id: 'risk-error', ratingId: 'rating-error' };
        const errorMsg = 'Database connection failed';
        const clientError = new Error(errorMsg);

        vi.mocked(mockClient.getRiskRatingById).mockRejectedValue(clientError);

        await expect(
          service.getRiskRatingById(ids, mockContext)
        ).rejects.toThrow(errorMsg);
      });

      it('should handle non-Error objects thrown by client', async () => {
        const ids = { id: 'risk-string-error', ratingId: 'rating-error' };
        const errorMsg = 'String error message';

        vi.mocked(mockClient.getRiskRatingById).mockRejectedValue(errorMsg);

        await expect(
          service.getRiskRatingById(ids, mockContext)
        ).rejects.toThrow(errorMsg);
      });

      it('should handle network timeout errors', async () => {
        const ids = { id: 'risk-timeout', ratingId: 'rating-timeout' };
        const timeoutError = new Error('Network timeout');

        vi.mocked(mockClient.getRiskRatingById).mockRejectedValue(timeoutError);

        await expect(
          service.getRiskRatingById(ids, mockContext)
        ).rejects.toThrow('Network timeout');
      });
    });

    describe('edge cases', () => {
      it('should handle empty id string', async () => {
        const ids = { id: '', ratingId: 'rating-123' };

        const mockResponse: RiskRatingByIdResponse = {
          riskAssessmentResult: mockRating,
          form_configuration: null,
        };

        vi.mocked(mockClient.getRiskRatingById).mockResolvedValue(mockResponse);

        const result = await service.getRiskRatingById(ids, mockContext);

        // Should return null because empty id won't match parent
        expect(result).toBeNull();
      });

      it('should handle empty ratingId string', async () => {
        const ids = { id: 'risk-123', ratingId: '' };

        const mockResponse: RiskRatingByIdResponse = {
          riskAssessmentResult: mockRating,
          form_configuration: null,
        };

        vi.mocked(mockClient.getRiskRatingById).mockResolvedValue(mockResponse);

        const result = await service.getRiskRatingById(ids, mockContext);

        expect(mockClient.getRiskRatingById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          ''
        );

        expect(result).toEqual({
          data: mockResponse.riskAssessmentResult,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should handle rating with empty parents array', async () => {
        const ids = { id: 'risk-123', ratingId: 'rating-no-parents' };

        const ratingWithoutParents = {
          ...mockRating,
          Id: 'rating-no-parents',
          parents: [],
        } as NonNullable<RiskRatingByIdResponse>['riskAssessmentResult'];

        const mockResponse: RiskRatingByIdResponse = {
          riskAssessmentResult: ratingWithoutParents,
          form_configuration: null,
        };

        vi.mocked(mockClient.getRiskRatingById).mockResolvedValue(mockResponse);

        const result = await service.getRiskRatingById(ids, mockContext);

        // Should return null because there are no parents matching the risk id
        expect(result).toBeNull();
      });

      it('should handle missing id key in ids object', async () => {
        const ids = { ratingId: 'rating-123' };

        const mockResponse: RiskRatingByIdResponse = {
          riskAssessmentResult: mockRating,
          form_configuration: null,
        };

        vi.mocked(mockClient.getRiskRatingById).mockResolvedValue(mockResponse);

        const result = await service.getRiskRatingById(ids, mockContext);

        // Should return null because default empty string won't match parent
        expect(result).toBeNull();
      });

      it('should handle missing ratingId key in ids object', async () => {
        const ids = { id: 'risk-123' };

        const mockResponse: RiskRatingByIdResponse = {
          riskAssessmentResult: mockRating,
          form_configuration: null,
        };

        vi.mocked(mockClient.getRiskRatingById).mockResolvedValue(mockResponse);

        const result = await service.getRiskRatingById(ids, mockContext);

        expect(mockClient.getRiskRatingById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          ''
        );

        expect(result).toEqual({
          data: mockResponse.riskAssessmentResult,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should handle rating where all parent risks have null Id', async () => {
        const ids = { id: 'risk-123', ratingId: 'rating-null-ids' };

        const ratingWithNullParentIds = {
          ...mockRating,
          Id: 'rating-null-ids',
          parents: [
            {
              Id: 'parent-1',
              risk: {
                Id: null,
              },
            },
          ],
        } as unknown as NonNullable<RiskRatingByIdResponse>['riskAssessmentResult'];

        const mockResponse: RiskRatingByIdResponse = {
          riskAssessmentResult: ratingWithNullParentIds,
          form_configuration: null,
        };

        vi.mocked(mockClient.getRiskRatingById).mockResolvedValue(mockResponse);

        const result = await service.getRiskRatingById(ids, mockContext);

        // Should return null because null parent Id won't match the risk id
        expect(result).toBeNull();
      });
    });
  });

  describe('getRiskAcceptances', () => {
    const mockAcceptancesResponse = {
      acceptance: [
        {
          Id: 'acceptance-1',
          SequentialId: 1,
          Title: 'Test Acceptance 1',
          Details: 'Acceptance details 1',
          DateAcceptedFrom: '2023-01-01T00:00:00.000Z',
          DateAcceptedTo: '2023-12-31T23:59:59.000Z',
          Status: 'Active',
          ApprovedByUser: 'provider|approver1',
          ApprovedByUserGroup: null,
          RequestedByUser: 'provider|requester1',
          RequestedByUserGroup: null,
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          CreatedByUser: 'user1',
          ModifiedByUser: 'user1',
          parents: [],
        },
        {
          Id: 'acceptance-2',
          SequentialId: 2,
          Title: 'Test Acceptance 2',
          Details: 'Acceptance details 2',
          DateAcceptedFrom: '2023-06-01T00:00:00.000Z',
          DateAcceptedTo: '2024-06-30T23:59:59.000Z',
          Status: 'Pending',
          ApprovedByUser: null,
          ApprovedByUserGroup: 'provider|approverGroup1',
          RequestedByUser: null,
          RequestedByUserGroup: 'provider|requesterGroup1',
          CreatedAtTimestamp: '2024-01-02T00:00:00Z',
          ModifiedAtTimestamp: '2024-01-02T00:00:00Z',
          CreatedByUser: 'user2',
          ModifiedByUser: 'user2',
          parents: [],
        },
      ],
      pageMetadata: {
        nextId: null,
        prevId: null,
        hasNext: false,
        hasPrev: false,
        count: 2,
      },
    } as unknown as ListAcceptancesResponse;

    describe('happy path', () => {
      it('should fetch and transform acceptances for a given risk', async () => {
        const linkId = 'risk-123';
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryRiskAcceptancesList).mockResolvedValue(
          mockAcceptancesResponse
        );

        const result = await service.getRiskAcceptances(
          linkId,
          query,
          mockContext
        );

        expect(mockClient.queryRiskAcceptancesList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-123',
            afterId: null,
            beforeId: null,
            limit: 10,
          }
        );

        expect(result).toEqual({
          data: mockAcceptancesResponse.acceptance,
          metadata: mockAcceptancesResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId', async () => {
        const linkId = 'risk-456';
        const query: SeqIdQueryOpts = {
          limit: 5,
          beforeId: null,
          afterId: 100,
        };

        vi.mocked(mockClient.queryRiskAcceptancesList).mockResolvedValue(
          mockAcceptancesResponse
        );

        const result = await service.getRiskAcceptances(
          linkId,
          query,
          mockContext
        );

        expect(mockClient.queryRiskAcceptancesList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-456',
            afterId: 100,
            beforeId: null,
            limit: 5,
          }
        );

        expect(result).toEqual({
          data: mockAcceptancesResponse.acceptance,
          metadata: mockAcceptancesResponse.pageMetadata,
        });
      });

      it('should handle pagination with beforeId', async () => {
        const linkId = 'risk-789';
        const query: SeqIdQueryOpts = {
          limit: 3,
          beforeId: 50,
          afterId: null,
        };

        vi.mocked(mockClient.queryRiskAcceptancesList).mockResolvedValue(
          mockAcceptancesResponse
        );

        await service.getRiskAcceptances(linkId, query, mockContext);

        expect(mockClient.queryRiskAcceptancesList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-789',
            afterId: null,
            beforeId: 50,
            limit: 3,
          }
        );
      });

      it('should return empty array when no acceptances exist', async () => {
        const emptyResponse = {
          acceptance: [],
          pageMetadata: {
            nextId: null,
            prevId: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        } as unknown as ListAcceptancesResponse;

        vi.mocked(mockClient.queryRiskAcceptancesList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getRiskAcceptances(
          'risk-empty',
          { limit: 10, beforeId: null, afterId: null },
          mockContext
        );

        expect(result.data).toEqual([]);
        expect(result.metadata.count).toBe(0);
      });
    });

    describe('unhappy path', () => {
      it('should handle client errors gracefully', async () => {
        const linkId = 'risk-error';
        const query: SeqIdQueryOpts = {
          limit: 10,
          beforeId: null,
          afterId: null,
        };

        vi.mocked(mockClient.queryRiskAcceptancesList).mockRejectedValue(
          new Error('Database connection error')
        );

        await expect(
          service.getRiskAcceptances(linkId, query, mockContext)
        ).rejects.toThrow('Database connection error');
      });
    });
  });

  describe('getRiskAcceptanceById', () => {
    const mockAcceptance = {
      Id: 'acceptance-123',
      SequentialId: 1,
      Title: 'Test Acceptance',
      Details: 'Test acceptance details',
      DateAcceptedFrom: '2023-01-01T00:00:00.000Z',
      DateAcceptedTo: '2023-12-31T23:59:59.000Z',
      Status: 'Active',
      ApprovedByUser: 'provider|approver123',
      ApprovedByUserGroup: null,
      RequestedByUser: 'provider|requester123',
      RequestedByUserGroup: null,
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      CreatedByUser: 'user1',
      ModifiedByUser: 'user1',
      parents: [
        {
          Id: 'parent-1',
          risk: {
            Id: 'risk-123',
          },
        },
      ],
    };

    describe('happy path', () => {
      it('should fetch acceptance by ID when it belongs to the risk', async () => {
        const ids = { id: 'risk-123', acceptanceId: 'acceptance-123' };

        const mockResponse: AcceptanceByIdResponse = {
          acceptance: mockAcceptance as never,
          form_configuration: null,
        };

        vi.mocked(mockClient.getAcceptanceById).mockResolvedValue(mockResponse);

        const result = await service.getRiskAcceptanceById(ids, mockContext);

        expect(mockClient.getAcceptanceById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          'acceptance-123'
        );

        expect(result).toEqual({
          data: mockResponse.acceptance,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should include form_configuration when present', async () => {
        const ids = { id: 'risk-123', acceptanceId: 'acceptance-123' };

        const mockFormConfig = {
          Id: 'form-1',
          ConfigName: 'Test Config',
        };

        const mockResponse: AcceptanceByIdResponse = {
          acceptance: mockAcceptance as never,
          form_configuration: mockFormConfig as never,
        };

        vi.mocked(mockClient.getAcceptanceById).mockResolvedValue(mockResponse);

        const result = await service.getRiskAcceptanceById(ids, mockContext);

        expect(result?.form_configuration).toEqual(mockFormConfig);
      });

      it('should return null when acceptance is not found', async () => {
        const ids = { id: 'risk-999', acceptanceId: 'acceptance-999' };

        vi.mocked(mockClient.getAcceptanceById).mockResolvedValue(null);

        const result = await service.getRiskAcceptanceById(ids, mockContext);

        expect(result).toBeNull();
      });

      it('should return null when acceptance does not belong to the risk', async () => {
        const ids = { id: 'risk-999', acceptanceId: 'acceptance-123' };

        const mockResponse: AcceptanceByIdResponse = {
          acceptance: mockAcceptance as never,
          form_configuration: null,
        };

        vi.mocked(mockClient.getAcceptanceById).mockResolvedValue(mockResponse);

        const result = await service.getRiskAcceptanceById(ids, mockContext);

        expect(result).toBeNull();
      });

      it('should handle acceptance with multiple parent risks', async () => {
        const ids = { id: 'risk-456', acceptanceId: 'acceptance-multi' };

        const acceptanceWithMultipleParents = {
          ...mockAcceptance,
          Id: 'acceptance-multi',
          parents: [
            {
              Id: 'parent-1',
              risk: { Id: 'risk-123' },
            },
            {
              Id: 'parent-2',
              risk: { Id: 'risk-456' },
            },
          ],
        };

        const mockResponse: AcceptanceByIdResponse = {
          acceptance: acceptanceWithMultipleParents as never,
          form_configuration: null,
        };

        vi.mocked(mockClient.getAcceptanceById).mockResolvedValue(mockResponse);

        const result = await service.getRiskAcceptanceById(ids, mockContext);

        expect(result).toEqual({
          data: mockResponse.acceptance,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should return null when riskId is empty', async () => {
        const ids = { id: '', acceptanceId: 'acceptance-123' };

        const result = await service.getRiskAcceptanceById(ids, mockContext);

        expect(result).toBeNull();
        expect(mockClient.getAcceptanceById).not.toHaveBeenCalled();
      });

      it('should return null when acceptanceId is empty', async () => {
        const ids = { id: 'risk-123', acceptanceId: '' };

        const result = await service.getRiskAcceptanceById(ids, mockContext);

        expect(result).toBeNull();
        expect(mockClient.getAcceptanceById).not.toHaveBeenCalled();
      });
    });

    describe('unhappy path', () => {
      it('should handle acceptance with null parent risk', async () => {
        const ids = { id: 'risk-123', acceptanceId: 'acceptance-null-parent' };

        const acceptanceWithNullParent = {
          ...mockAcceptance,
          Id: 'acceptance-null-parent',
          parents: [
            {
              Id: 'parent-1',
              risk: null,
            },
          ],
        };

        const mockResponse: AcceptanceByIdResponse = {
          acceptance: acceptanceWithNullParent as never,
          form_configuration: null,
        };

        vi.mocked(mockClient.getAcceptanceById).mockResolvedValue(mockResponse);

        const result = await service.getRiskAcceptanceById(ids, mockContext);

        expect(result).toBeNull();
      });

      it('should handle acceptance with empty parents array', async () => {
        const ids = { id: 'risk-123', acceptanceId: 'acceptance-no-parents' };

        const acceptanceWithNoParents = {
          ...mockAcceptance,
          Id: 'acceptance-no-parents',
          parents: [],
        };

        const mockResponse: AcceptanceByIdResponse = {
          acceptance: acceptanceWithNoParents as never,
          form_configuration: null,
        };

        vi.mocked(mockClient.getAcceptanceById).mockResolvedValue(mockResponse);

        const result = await service.getRiskAcceptanceById(ids, mockContext);

        expect(result).toBeNull();
      });

      it('should handle client errors gracefully', async () => {
        const ids = { id: 'risk-error', acceptanceId: 'acceptance-error' };

        vi.mocked(mockClient.getAcceptanceById).mockRejectedValue(
          new Error('Database connection error')
        );

        await expect(
          service.getRiskAcceptanceById(ids, mockContext)
        ).rejects.toThrow('Database connection error');
      });
    });
  });

  describe('getRiskApprovals', () => {
    const mockApproval1 = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      ParentId: 'risk-123',
      Workflow: 'standard-approval',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      CreatedByUser: 'provider|user123',
      createdBy: {
        Id: 'provider|user123',
      },
      ModifiedByUser: 'provider|user123',
      InFlightEditRule: 'None' as const,
      parent: {
        Id: 'risk-123',
        ObjectType: 'risk',
        SequentialId: 1,
      },
    };

    const mockApproval2 = {
      Id: '223e4567-e89b-12d3-a456-426614174001',
      ParentId: 'risk-123',
      Workflow: 'expedited-approval',
      CreatedAtTimestamp: '2024-01-02T00:00:00Z',
      ModifiedAtTimestamp: '2024-01-02T00:00:00Z',
      CreatedByUser: 'provider|user456',
      createdBy: {
        Id: 'provider|user456',
      },
      ModifiedByUser: 'provider|user456',
      InFlightEditRule: 'None' as const,
      parent: {
        Id: 'risk-123',
        ObjectType: 'risk',
        SequentialId: 1,
      },
    };

    const mockApprovalsResponse = {
      approval: [mockApproval1, mockApproval2],
      pageMetadata: {
        nextId: null,
        prevId: null,
        nextDateTime: null,
        prevDateTime: null,
        hasNext: false,
        hasPrev: false,
        count: 2,
      },
    } as unknown as RiskListApprovalResponse;

    describe('happy path', () => {
      it('should fetch and return risk approvals for a given risk', async () => {
        const linkId = 'risk-123';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryRiskApprovalsList).mockResolvedValue(
          mockApprovalsResponse
        );

        const result = await service.getRiskApprovals(
          linkId,
          query,
          mockContext
        );

        expect(mockClient.queryRiskApprovalsList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-123',
            afterDateTime: null,
            afterId: null,
            beforeDateTime: null,
            beforeId: null,
            limit: 10,
          }
        );

        expect(result).toEqual({
          data: mockApprovalsResponse.approval,
          metadata: mockApprovalsResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterDateTime and afterId', async () => {
        const linkId = 'risk-456';
        const query: IdDateTimeQueryOpts = {
          limit: 5,
          beforeId: null,
          beforeDateTime: null,
          afterId: 'approval-100',
          afterDateTime: '2023-01-01T00:00:00.000Z',
        };

        vi.mocked(mockClient.queryRiskApprovalsList).mockResolvedValue(
          mockApprovalsResponse
        );

        const result = await service.getRiskApprovals(
          linkId,
          query,
          mockContext
        );

        expect(mockClient.queryRiskApprovalsList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-456',
            afterDateTime: '2023-01-01T00:00:00.000Z',
            afterId: 'approval-100',
            beforeDateTime: null,
            beforeId: null,
            limit: 5,
          }
        );

        expect(result.data).toEqual(mockApprovalsResponse.approval);
      });

      it('should handle pagination with beforeDateTime and beforeId', async () => {
        const linkId = 'risk-789';
        const query: IdDateTimeQueryOpts = {
          limit: 5,
          beforeId: 'approval-200',
          beforeDateTime: '2023-06-01T00:00:00.000Z',
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryRiskApprovalsList).mockResolvedValue(
          mockApprovalsResponse
        );

        const result = await service.getRiskApprovals(
          linkId,
          query,
          mockContext
        );

        expect(mockClient.queryRiskApprovalsList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-789',
            afterDateTime: null,
            afterId: null,
            beforeDateTime: '2023-06-01T00:00:00.000Z',
            beforeId: 'approval-200',
            limit: 5,
          }
        );

        expect(result.data).toEqual(mockApprovalsResponse.approval);
      });

      it('should handle empty approvals list', async () => {
        const linkId = 'risk-no-approvals';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        const emptyResponse = {
          approval: [],
          pageMetadata: {
            nextId: null,
            prevId: null,
            nextDateTime: null,
            prevDateTime: null,
            hasNext: false,
            hasPrev: false,
            count: 0,
          },
        };

        vi.mocked(mockClient.queryRiskApprovalsList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getRiskApprovals(
          linkId,
          query,
          mockContext
        );

        expect(result.data).toEqual([]);
        expect(result.metadata.count).toBe(0);
      });

      it('should handle pagination with hasNext true', async () => {
        const linkId = 'risk-has-next';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        const responseWithNext = {
          approval: [mockApproval1],
          pageMetadata: {
            nextId: 'next-approval-id',
            prevId: null,
            nextDateTime: '2024-01-02T00:00:00Z',
            prevDateTime: null,
            hasNext: true,
            hasPrev: false,
            count: 1,
          },
        } as unknown as RiskListApprovalResponse;

        vi.mocked(mockClient.queryRiskApprovalsList).mockResolvedValue(
          responseWithNext
        );

        const result = await service.getRiskApprovals(
          linkId,
          query,
          mockContext
        );

        expect(result.metadata.hasNext).toBe(true);
        expect(result.metadata.nextId).toBe('next-approval-id');
      });

      it('should handle pagination with hasPrev true', async () => {
        const linkId = 'risk-has-prev';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: 'approval-100',
          beforeDateTime: '2023-06-01T00:00:00.000Z',
          afterId: null,
          afterDateTime: null,
        };

        const responseWithPrev = {
          approval: [mockApproval1],
          pageMetadata: {
            nextId: null,
            prevId: 'prev-approval-id',
            nextDateTime: null,
            prevDateTime: '2023-05-01T00:00:00.000Z',
            hasNext: false,
            hasPrev: true,
            count: 1,
          },
        } as unknown as RiskListApprovalResponse;

        vi.mocked(mockClient.queryRiskApprovalsList).mockResolvedValue(
          responseWithPrev
        );

        const result = await service.getRiskApprovals(
          linkId,
          query,
          mockContext
        );

        expect(result.metadata.hasPrev).toBe(true);
        expect(result.metadata.prevId).toBe('prev-approval-id');
      });
    });

    describe('error handling', () => {
      it('should throw error when client fails', async () => {
        const linkId = 'risk-error';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };
        const errorMsg = 'Database connection failed';
        const clientError = new Error(errorMsg);

        vi.mocked(mockClient.queryRiskApprovalsList).mockRejectedValue(
          clientError
        );

        await expect(
          service.getRiskApprovals(linkId, query, mockContext)
        ).rejects.toThrow(errorMsg);
      });

      it('should handle non-Error objects thrown by client', async () => {
        const linkId = 'risk-string-error';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };
        const errorMsg = 'String error message';

        vi.mocked(mockClient.queryRiskApprovalsList).mockRejectedValue(
          errorMsg
        );

        await expect(
          service.getRiskApprovals(linkId, query, mockContext)
        ).rejects.toThrow(errorMsg);
      });

      it('should handle network timeout errors', async () => {
        const linkId = 'risk-timeout';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };
        const timeoutError = new Error('Network timeout');

        vi.mocked(mockClient.queryRiskApprovalsList).mockRejectedValue(
          timeoutError
        );

        await expect(
          service.getRiskApprovals(linkId, query, mockContext)
        ).rejects.toThrow('Network timeout');
      });
    });

    describe('edge cases', () => {
      it('should handle empty linkId string', async () => {
        const linkId = '';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryRiskApprovalsList).mockResolvedValue(
          mockApprovalsResponse
        );

        const result = await service.getRiskApprovals(
          linkId,
          query,
          mockContext
        );

        expect(mockClient.queryRiskApprovalsList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: '',
            afterDateTime: null,
            afterId: null,
            beforeDateTime: null,
            beforeId: null,
            limit: 10,
          }
        );

        expect(result).toEqual({
          data: mockApprovalsResponse.approval,
          metadata: mockApprovalsResponse.pageMetadata,
        });
      });

      it('should handle very large limit values', async () => {
        const linkId = 'risk-large-limit';
        const query: IdDateTimeQueryOpts = {
          limit: 10000,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryRiskApprovalsList).mockResolvedValue(
          mockApprovalsResponse
        );

        const result = await service.getRiskApprovals(
          linkId,
          query,
          mockContext
        );

        expect(mockClient.queryRiskApprovalsList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-large-limit',
            afterDateTime: null,
            afterId: null,
            beforeDateTime: null,
            beforeId: null,
            limit: 10000,
          }
        );

        expect(result).toBeDefined();
      });

      it('should handle both before and after cursors provided (edge case)', async () => {
        const linkId = 'risk-both-cursors';
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: 'approval-200',
          beforeDateTime: '2023-06-01T00:00:00.000Z',
          afterId: 'approval-100',
          afterDateTime: '2023-01-01T00:00:00.000Z',
        };

        vi.mocked(mockClient.queryRiskApprovalsList).mockResolvedValue(
          mockApprovalsResponse
        );

        const result = await service.getRiskApprovals(
          linkId,
          query,
          mockContext
        );

        expect(mockClient.queryRiskApprovalsList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-both-cursors',
            afterDateTime: '2023-01-01T00:00:00.000Z',
            afterId: 'approval-100',
            beforeDateTime: '2023-06-01T00:00:00.000Z',
            beforeId: 'approval-200',
            limit: 10,
          }
        );

        expect(result).toBeDefined();
      });

      it('should handle undefined query options', async () => {
        const linkId = 'risk-undefined';
        const query = {} as IdDateTimeQueryOpts;

        vi.mocked(mockClient.queryRiskApprovalsList).mockResolvedValue(
          mockApprovalsResponse
        );

        const result = await service.getRiskApprovals(
          linkId,
          query,
          mockContext
        );

        expect(mockClient.queryRiskApprovalsList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-undefined',
            afterDateTime: undefined,
            afterId: undefined,
            beforeDateTime: undefined,
            beforeId: undefined,
            limit: undefined,
          }
        );

        expect(result).toEqual({
          data: mockApprovalsResponse.approval,
          metadata: mockApprovalsResponse.pageMetadata,
        });
      });

      it('should handle null limit value', async () => {
        const linkId = 'risk-null-limit';
        const query: IdDateTimeQueryOpts = {
          limit: null,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryRiskApprovalsList).mockResolvedValue(
          mockApprovalsResponse
        );

        const result = await service.getRiskApprovals(
          linkId,
          query,
          mockContext
        );

        expect(mockClient.queryRiskApprovalsList).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          {
            linkId: 'risk-null-limit',
            afterDateTime: null,
            afterId: null,
            beforeDateTime: null,
            beforeId: null,
            limit: null,
          }
        );

        expect(result).toEqual({
          data: mockApprovalsResponse.approval,
          metadata: mockApprovalsResponse.pageMetadata,
        });
      });
    });
  });

  describe('getRiskApprovalById', () => {
    const mockApproval = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      ParentId: 'risk-123',
      Workflow: 'standard-approval',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      CreatedByUser: 'provider|user123',
      createdBy: {
        Id: 'provider|user123',
      },
      ModifiedByUser: 'provider|user123',
      InFlightEditRule: 'None' as const,
      parent: {
        Id: 'risk-123',
        ObjectType: 'risk',
        SequentialId: 1,
      },
      levels: [
        {
          Id: '223e4567-e89b-12d3-a456-426614174001',
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
          SequenceOrder: 1,
          ApprovalRuleType: 'any',
          approvers: [],
        },
      ],
    };

    describe('happy path', () => {
      it('should fetch approval by ID when it belongs to the risk', async () => {
        const ids = { id: 'risk-123', approvalId: 'approval-123' };

        const mockResponse = {
          approval: mockApproval,
          form_configuration: null,
        } as unknown as NonNullable<ApprovalByIdResponse>;

        vi.mocked(mockClient.getApprovalById).mockResolvedValue(mockResponse);

        const result = await service.getRiskApprovalById(ids, mockContext);

        expect(mockClient.getApprovalById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          'approval-123'
        );

        expect(result).toEqual({
          data: mockResponse.approval,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should include form_configuration when present', async () => {
        const ids = { id: 'risk-123', approvalId: 'approval-123' };

        const mockFormConfig = {
          Id: 'form-1',
          ConfigName: 'Test Config',
        };

        const mockResponse = {
          approval: mockApproval,
          form_configuration: mockFormConfig,
        } as unknown as NonNullable<ApprovalByIdResponse>;

        vi.mocked(mockClient.getApprovalById).mockResolvedValue(mockResponse);

        const result = await service.getRiskApprovalById(ids, mockContext);

        expect(result?.form_configuration).toEqual(mockFormConfig);
      });

      it('should return null when approval is not found', async () => {
        const ids = { id: 'risk-999', approvalId: 'approval-999' };

        vi.mocked(mockClient.getApprovalById).mockResolvedValue(null);

        const result = await service.getRiskApprovalById(ids, mockContext);

        expect(result).toBeNull();
      });

      it('should return null when approval does not belong to the risk', async () => {
        const ids = { id: 'risk-999', approvalId: 'approval-123' };

        const mockResponse = {
          approval: mockApproval,
          form_configuration: null,
        } as unknown as NonNullable<ApprovalByIdResponse>;

        vi.mocked(mockClient.getApprovalById).mockResolvedValue(mockResponse);

        const result = await service.getRiskApprovalById(ids, mockContext);

        expect(result).toBeNull();
      });

      it('should handle approval where ParentId matches the risk', async () => {
        const ids = { id: 'risk-123', approvalId: 'approval-456' };

        const approvalWithMatchingParent = {
          ...mockApproval,
          Id: 'approval-456',
          ParentId: 'risk-123',
        };

        const mockResponse = {
          approval: approvalWithMatchingParent,
          form_configuration: null,
        } as unknown as NonNullable<ApprovalByIdResponse>;

        vi.mocked(mockClient.getApprovalById).mockResolvedValue(mockResponse);

        const result = await service.getRiskApprovalById(ids, mockContext);

        expect(result).toEqual({
          data: mockResponse.approval,
          form_configuration: mockResponse.form_configuration,
        });
      });
    });

    describe('error handling', () => {
      it('should throw error when client fails', async () => {
        const ids = { id: 'risk-error', approvalId: 'approval-error' };
        const errorMsg = 'Database connection failed';
        const clientError = new Error(errorMsg);

        vi.mocked(mockClient.getApprovalById).mockRejectedValue(clientError);

        await expect(
          service.getRiskApprovalById(ids, mockContext)
        ).rejects.toThrow(errorMsg);
      });

      it('should handle non-Error objects thrown by client', async () => {
        const ids = { id: 'risk-string-error', approvalId: 'approval-error' };
        const errorMsg = 'String error message';

        vi.mocked(mockClient.getApprovalById).mockRejectedValue(errorMsg);

        await expect(
          service.getRiskApprovalById(ids, mockContext)
        ).rejects.toThrow(errorMsg);
      });

      it('should handle network timeout errors', async () => {
        const ids = { id: 'risk-timeout', approvalId: 'approval-timeout' };
        const timeoutError = new Error('Network timeout');

        vi.mocked(mockClient.getApprovalById).mockRejectedValue(timeoutError);

        await expect(
          service.getRiskApprovalById(ids, mockContext)
        ).rejects.toThrow('Network timeout');
      });
    });

    describe('edge cases', () => {
      it('should handle empty id string', async () => {
        const ids = { id: '', approvalId: 'approval-123' };

        const mockResponse = {
          approval: mockApproval,
          form_configuration: null,
        } as unknown as NonNullable<ApprovalByIdResponse>;

        vi.mocked(mockClient.getApprovalById).mockResolvedValue(mockResponse);

        const result = await service.getRiskApprovalById(ids, mockContext);

        // Should return null because empty id won't match ParentId
        expect(result).toBeNull();
      });

      it('should handle empty approvalId string', async () => {
        const ids = { id: 'risk-123', approvalId: '' };

        const result = await service.getRiskApprovalById(ids, mockContext);

        // Should return null due to early return condition for empty approvalId
        expect(result).toBeNull();
        // Client should not be called when approvalId is empty
        expect(mockClient.getApprovalById).not.toHaveBeenCalled();
      });

      it('should handle missing id key in ids object', async () => {
        const ids = { approvalId: 'approval-123' };

        const mockResponse = {
          approval: mockApproval,
          form_configuration: null,
        } as unknown as NonNullable<ApprovalByIdResponse>;

        vi.mocked(mockClient.getApprovalById).mockResolvedValue(mockResponse);

        const result = await service.getRiskApprovalById(ids, mockContext);

        // Should return null because default empty string won't match ParentId
        expect(result).toBeNull();
      });

      it('should handle missing approvalId key in ids object', async () => {
        const ids = { id: 'risk-123' };

        const result = await service.getRiskApprovalById(ids, mockContext);

        // Should return null due to early return condition for missing approvalId
        expect(result).toBeNull();
        // Client should not be called when approvalId is missing
        expect(mockClient.getApprovalById).not.toHaveBeenCalled();
      });
    });
  });

  describe('service factory', () => {
    it('should create service with correct methods', () => {
      expect(service).toHaveProperty('getRisks');
      expect(service).toHaveProperty('getRiskById');
      expect(service).toHaveProperty('getRiskControls');
      expect(service).toHaveProperty('getRiskActions');
      expect(service).toHaveProperty('getRiskIndicators');
      expect(service).toHaveProperty('getRiskAppetites');
      expect(service).toHaveProperty('getRiskRatings');
      expect(service).toHaveProperty('getRiskAppetiteById');
      expect(service).toHaveProperty('getRiskRatingById');
      expect(service).toHaveProperty('getRiskAcceptances');
      expect(service).toHaveProperty('getRiskAcceptanceById');
      expect(service).toHaveProperty('getRiskApprovals');
      expect(service).toHaveProperty('getRiskApprovalById');
      expect(typeof service.getRisks).toBe('function');
      expect(typeof service.getRiskById).toBe('function');
      expect(typeof service.getRiskControls).toBe('function');
      expect(typeof service.getRiskActions).toBe('function');
      expect(typeof service.getRiskIndicators).toBe('function');
      expect(typeof service.getRiskAppetites).toBe('function');
      expect(typeof service.getRiskRatings).toBe('function');
      expect(typeof service.getRiskAppetiteById).toBe('function');
      expect(typeof service.getRiskRatingById).toBe('function');
      expect(typeof service.getRiskAcceptances).toBe('function');
      expect(typeof service.getRiskAcceptanceById).toBe('function');
      expect(typeof service.getRiskApprovals).toBe('function');
      expect(typeof service.getRiskApprovalById).toBe('function');
    });
  });
});
