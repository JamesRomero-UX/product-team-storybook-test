import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { randomUUID } from 'crypto';
import {
  ParentTypeEnum,
  RiskAssessmentResultControlTypeEnum,
} from 'generated/graphql';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { RiskAssessmentResultConfigRepository } from 'src/repositories/risk-assessment-result-config/riskAssessmentResultConfig.repository';
import { getAssessment } from 'src/services/assessment/assessmentService';
import { insertRiskAssessmentResults } from 'src/services/assessment-result/assessmentResultService';
import { NodeService } from 'src/services/node/node.service';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { handler } from './insertRiskAssessmentResult';
import type { InsertRiskAssessmentResultInput } from './schema';

vi.mock('src/adminGraphqlClient');
vi.mock('crypto');
vi.mock('src/backendGraphqlClient');
vi.mock('src/services/node/node.service');
vi.mock('src/services/role-access/roleAccessService');
vi.mock('src/services/assessment-result/assessmentResultService');
vi.mock('src/services/assessment/assessmentService');
vi.mock('src/adapters/create-schedule-refresh', () => ({
  createScheduleRefresh: vi.fn(() => ({
    ctx: { tenant: 'test-tenant', orgKey: 'test-org', userId: 'test-user' },
    refreshRiskRatingScheduleState: vi.fn(),
    refreshRiskImpactScheduleState: vi.fn(),
    refreshRiskScheduleState: vi.fn(),
    refreshControlScheduleState: vi.fn(),
    refreshDocumentScheduleState: vi.fn(),
    refreshObligationScheduleState: vi.fn(),
    refreshIndicatorScheduleState: vi.fn(),
  })),
}));
vi.mock(
  'src/repositories/risk-assessment-result-config/riskAssessmentResultConfig.repository'
);
vi.mock('src/repositories/getBackendRestApiClient');

const mockNodeService = {
  findObjectOwners: vi.fn(),
  findById: vi.fn(),
  findManyByIds: vi.fn(),
};

const randomUUIDMock = vi.mocked(randomUUID);
const hasPermissionMock = vi.mocked(hasPermission);
const insertRiskAssessmentResultMock = vi.mocked(insertRiskAssessmentResults);
const mockedNodeService = vi.mocked(NodeService);
const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const getHasuraBackendClientForActionMock = vi.mocked(
  getHasuraBackendClientForAction
);
const getAssessmentMock = vi.mocked(getAssessment);
const riskAssessmentResultConfigRepositoryMock = vi.mocked(
  RiskAssessmentResultConfigRepository
);
const getBackendRestApiClientMock = vi.mocked(getBackendRestApiClient);

const buildEvent = (input?: Partial<InsertRiskAssessmentResultInput>) => {
  return stub<APIGatewayProxyEventV2>({
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: '',
      input: {
        AssessmentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        RiskIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
        Rating: 3,
        Impact: 2,
        Likelihood: 1,
        ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
        Rationale: 'some rationale',
        TestDate: '2024-06-04',
        ...input,
      },
      session_variables: {
        'x-hasura-user-id': '1',
        'x-hasura-tenant-name': 'MultiTenant',
      },
    }),
  });
};

describe('insert risk rating assessment result - post', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getHasuraBackendClientForActionMock.mockReturnValue(hasuraMock);
    mockedNodeService.mockReturnValue(mockNodeService);
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Risk,
        Id: '3129d18d-e446-46e6-9709-706b2ebebe45',
        ancestorContributors: [],
      },
    ]);
    hasPermissionMock.mockResolvedValue(true);
    insertRiskAssessmentResultMock.mockResolvedValue(1);
    randomUUIDMock.mockReturnValue('3cf6e4fe-82df-454b-a7b6-4f11611ba504');
    getAssessmentMock.mockResolvedValue({
      assessment: [{ Id: '' }],
    });
    getBackendRestApiClientMock.mockReturnValue({
      getLatestRiskAssessmentResultConfig: vi.fn().mockResolvedValue({
        risk_assessment_result_config: [
          { Id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' },
        ],
      }),
    } as never);
  });

  describe('request validation', () => {
    it('should validate the post body', async () => {
      const result = await handler(
        stub<APIGatewayProxyEventV2>({}),
        stub<Context>({})
      );
      expect(result.statusCode).toEqual(400);
    });

    it('should return bad request when node does not exist', async () => {
      mockNodeService.findManyByIds.mockResolvedValue([]);

      const result = await handler(buildEvent(), stub<Context>({}));

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body!)).toEqual({
        message: 'Object ID(s) not found',
        extensions: [],
      });
    });

    it('should return forbidden when node not correct parent type', async () => {
      mockNodeService.findManyByIds.mockResolvedValue([
        {
          ObjectType: ParentTypeEnum.Action,
          Id: '3129d18d-e446-46e6-9709-706b2ebebe45',
          ancestorContributors: [],
        },
      ]);

      const result = await handler(buildEvent(), stub<Context>({}));

      expect(result.statusCode).toEqual(403);
      expect(JSON.parse(result.body!)).toEqual({
        message: 'Invalid parent type',
        extensions: [],
      });
    });

    it('should return forbidden when user does not have permissions', async () => {
      hasPermissionMock.mockResolvedValue(false);

      const result = await handler(buildEvent(), stub<Context>({}));

      expect(result.statusCode).toEqual(403);
      expect(JSON.parse(result.body!)).toEqual({
        message: 'Access denied',
        extensions: [],
      });
    });

    it('should return bad request when inserting risk rating fails', async () => {
      insertRiskAssessmentResultMock.mockResolvedValue(undefined);

      const result = await handler(buildEvent(), stub<Context>({}));

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body!)).toEqual({
        error: 'Failed to create risk rating',
      });
    });

    it('should return bad request when getting assessment returns no data', async () => {
      getAssessmentMock.mockResolvedValue({
        assessment: [],
      });

      const result = await handler(buildEvent(), stub<Context>({}));

      expect(result.statusCode).toEqual(403);
      expect(JSON.parse(result.body!)).toEqual({
        message: 'Assessment not found',
        extensions: [],
      });
    });
  });

  describe('single impact', () => {
    it('should insert risk assessment result', async () => {
      const result = await handler(buildEvent(), stub<Context>({}));

      expect(result.statusCode).toEqual(200);
      expect(JSON.parse(result.body!)).toEqual({
        Ids: ['3cf6e4fe-82df-454b-a7b6-4f11611ba504'],
      });
      expect(insertRiskAssessmentResultMock).toHaveBeenCalledTimes(1);
      expect(insertRiskAssessmentResultMock).toHaveBeenCalledWith(hasuraMock, {
        results: [
          {
            Id: '3cf6e4fe-82df-454b-a7b6-4f11611ba504',
            Rating: 3,
            Impact: 2,
            Likelihood: 1,
            ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
            Rationale: 'some rationale',
            TestDate: '2024-06-04',
            RatingType: 'assessment',
            ConfigId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
            CustomAttributeData: undefined,
            parents: {
              data: [
                {
                  ParentId: '3129d18d-e446-46e6-9709-706b2ebebe45',
                  ParentType: ParentTypeEnum.Risk,
                  ResultType: ParentTypeEnum.RiskAssessmentResult,
                },
                {
                  ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
                  ParentType: ParentTypeEnum.Assessment,
                  ResultType: ParentTypeEnum.RiskAssessmentResult,
                },
              ],
            },
          },
        ],
      });
    });
  });

  describe('multiple impacts', () => {
    it.each([
      {
        scenario: 'exact',
        impacts: [
          { Label: 'Financial', Value: 2 },
          { Label: 'Reputational', Value: 4 },
          { Label: 'Operational', Value: 6 },
        ] as const,
        categories: [
          { name: 'Financial', color: 'blue' },
          { name: 'Reputational', color: 'green' },
          { name: 'Operational', color: 'purple' },
        ],
        expectedImpact: 4,
      },
      {
        scenario: 'rounds down',
        impacts: [
          { Label: 'Financial', Value: 1 },
          { Label: 'Reputational', Value: 3 },
          { Label: 'Operational', Value: 3 },
        ] as const,
        categories: [
          { name: 'Financial', color: 'blue' },
          { name: 'Reputational', color: 'green' },
          { name: 'Operational', color: 'purple' },
        ],
        expectedImpact: 2,
      },
      {
        scenario: 'rounds up',
        impacts: [
          { Label: 'Financial', Value: 1 },
          { Label: 'Reputational', Value: 4 },
        ] as const,
        categories: [
          { name: 'Financial', color: 'blue' },
          { name: 'Reputational', color: 'green' },
        ],
        expectedImpact: 3,
      },
    ])(
      'should calculate average impact ($scenario)',
      async ({ impacts, categories, expectedImpact }) => {
        riskAssessmentResultConfigRepositoryMock.mockReturnValue({
          getLatest: vi.fn().mockResolvedValue({
            impact: { aggregation: 'average', categories },
          }),
        });

        const result = await handler(
          buildEvent({
            AssessmentId: undefined,
            Impact: undefined,
            Impacts: [...impacts],
          }),
          stub<Context>({})
        );

        expect(result.statusCode).toEqual(200);
        expect(insertRiskAssessmentResultMock).toHaveBeenCalledWith(
          hasuraMock,
          {
            results: [
              expect.objectContaining({
                Impact: expectedImpact,
              }),
            ],
          }
        );
      }
    );

    it('should calculate maximum impact', async () => {
      riskAssessmentResultConfigRepositoryMock.mockReturnValue({
        getLatest: vi.fn().mockResolvedValue({
          impact: {
            aggregation: 'maximum',
            categories: [
              { name: 'Financial', color: 'blue' },
              { name: 'Reputational', color: 'green' },
              { name: 'Operational', color: 'purple' },
            ],
          },
        }),
      });

      const result = await handler(
        buildEvent({
          AssessmentId: undefined,
          Impact: undefined,
          Impacts: [
            { Label: 'Financial', Value: 2 },
            { Label: 'Reputational', Value: 4 },
            { Label: 'Operational', Value: 6 },
          ],
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
      expect(insertRiskAssessmentResultMock).toHaveBeenCalledWith(hasuraMock, {
        results: [
          expect.objectContaining({
            Impact: 6,
          }),
        ],
      });
    });

    it('should insert risk assessment result with impacts', async () => {
      riskAssessmentResultConfigRepositoryMock.mockReturnValue({
        getLatest: vi.fn().mockResolvedValue({
          impact: {
            aggregation: 'average',
            categories: [
              { name: 'Financial', color: 'blue' },
              { name: 'Reputational', color: 'green' },
            ],
          },
        }),
      });

      const result = await handler(
        buildEvent({
          AssessmentId: undefined,
          Impact: undefined,
          Impacts: [
            { Label: 'Financial', Value: 2 },
            { Label: 'Reputational', Value: 4 },
          ],
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(200);
      expect(insertRiskAssessmentResultMock).toHaveBeenCalledWith(hasuraMock, {
        results: [
          {
            Id: '3cf6e4fe-82df-454b-a7b6-4f11611ba504',
            Rating: 3,
            Impact: 3,
            Likelihood: 1,
            ControlType: RiskAssessmentResultControlTypeEnum.Controlled,
            Rationale: 'some rationale',
            TestDate: '2024-06-04',
            RatingType: 'rating',
            ConfigId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
            CustomAttributeData: undefined,
            parents: {
              data: [
                {
                  ParentId: '3129d18d-e446-46e6-9709-706b2ebebe45',
                  ParentType: ParentTypeEnum.Risk,
                  ResultType: ParentTypeEnum.RiskAssessmentResult,
                },
              ],
            },
            impacts: {
              data: [
                { Label: 'Financial', Value: 2 },
                { Label: 'Reputational', Value: 4 },
              ],
            },
          },
        ],
      });
    });

    it('should return internal server error when no configuration is found', async () => {
      riskAssessmentResultConfigRepositoryMock.mockReturnValue({
        getLatest: vi.fn().mockResolvedValue(undefined),
      });

      const result = await handler(
        buildEvent({
          AssessmentId: undefined,
          Impact: undefined,
          Impacts: [
            { Label: 'Financial', Value: 2 },
            { Label: 'Reputational', Value: 4 },
          ],
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(500);
      expect(JSON.parse(result.body!)).toEqual({
        message: 'Failed to retrieve risk assessment result configuration',
        extensions: [],
      });
    });

    it('should return internal server error when unrecognised impact aggregation method configured', async () => {
      riskAssessmentResultConfigRepositoryMock.mockReturnValue({
        getLatest: vi.fn().mockResolvedValue({
          impact: {
            aggregation: 'unknown',
            categories: [
              { name: 'Financial', color: 'blue' },
              { name: 'Reputational', color: 'green' },
            ],
          },
        }),
      });

      const result = await handler(
        buildEvent({
          AssessmentId: undefined,
          Impact: undefined,
          Impacts: [
            { Label: 'Financial', Value: 2 },
            { Label: 'Reputational', Value: 4 },
          ],
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(500);
      expect(JSON.parse(result.body!)).toEqual({
        message: 'Unrecognised impact aggregation method configured',
        extensions: [],
      });
    });

    it('should return bad request when impact count does not match category count', async () => {
      riskAssessmentResultConfigRepositoryMock.mockReturnValue({
        getLatest: vi.fn().mockResolvedValue({
          impact: {
            aggregation: 'average',
            categories: [
              { name: 'Financial', color: 'blue' },
              { name: 'Reputational', color: 'green' },
              { name: 'Operational', color: 'purple' },
            ],
          },
        }),
      });

      const result = await handler(
        buildEvent({
          AssessmentId: undefined,
          Impact: undefined,
          Impacts: [
            { Label: 'Financial', Value: 2 },
            { Label: 'Reputational', Value: 4 },
          ],
        }),
        stub<Context>({})
      );

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body!)).toEqual({
        message:
          'Expected 3 impacts to match configured categories, received 2',
        extensions: [],
      });
    });
  });
});
