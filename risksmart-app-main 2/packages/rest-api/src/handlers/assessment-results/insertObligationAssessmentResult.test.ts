import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { ParentTypeEnum } from 'generated/graphql';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getAssessment } from 'src/services/assessment/assessmentService';
import { insertObligationAssessmentResult } from 'src/services/assessment-result/assessmentResultService';
import { NodeService } from 'src/services/node/node.service';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { handler } from './insertObligationAssessmentResult';

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

const mockNodeService = {
  findObjectOwners: vi.fn(),
  findById: vi.fn(),
  findManyByIds: vi.fn(),
};

const randomUUIDMock = vi.mocked(randomUUID);
const hasPermissionMock = vi.mocked(hasPermission);
const insertObligationAssessmentResultMock = vi.mocked(
  insertObligationAssessmentResult
);
const mockedNodeService = vi.mocked(NodeService);
const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const getHasuraBackendClientForActionMock = vi.mocked(
  getHasuraBackendClientForAction
);
const getAssessmentMock = vi.mocked(getAssessment);

describe('insert obligation rating assessment result - post', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getHasuraBackendClientForActionMock.mockReturnValue(hasuraMock);
    mockedNodeService.mockReturnValue(mockNodeService);
  });

  it('should validate the post body', async () => {
    const result = await handler(
      stub<APIGatewayProxyEventV2>({}),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
  });

  it('returns bad requewst when node does not exist', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([]);

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            AssessmentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            ObligationIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
            Rating: 3,
            TestDate: '2024-06-04',
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
    expect(JSON.parse(result.body!)).toEqual({
      message: 'Object ID(s) not found',
      extensions: [],
    });
  });

  it('returns forbidden when node not correct parent type', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Action,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [],
      },
    ]);

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            AssessmentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            ObligationIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
            Rating: 3,
            TestDate: '2024-06-04',
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(403);
    expect(JSON.parse(result.body!)).toEqual({
      message: 'Invalid parent type',
      extensions: [],
    });
  });

  it('returns forbidden when user does not have permissions', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Obligation,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [],
      },
    ]);
    hasPermissionMock.mockResolvedValue(false);

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            AssessmentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            ObligationIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
            Rating: 3,
            TestDate: '2024-06-04',
          },
          session_variables: {
            'x-hasura-user-id': '1',
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(403);
    expect(JSON.parse(result.body!)).toEqual({
      message: 'Access denied',
      extensions: [],
    });
  });

  it('returns bad request when inserting obligation rating fails', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Obligation,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [],
      },
    ]);
    hasPermissionMock.mockResolvedValue(true);
    insertObligationAssessmentResultMock.mockResolvedValue(undefined);
    randomUUIDMock.mockReturnValue('004a2162-4806-4267-9cf1-d7f5bcc657cb');
    getAssessmentMock.mockResolvedValue({
      assessment: [
        {
          Id: '',
        },
      ],
    });
    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            AssessmentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            ObligationIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
            Rating: 3,
            TestDate: '2024-06-04',
          },
          session_variables: {
            'x-hasura-user-id': '1',
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
    expect(JSON.parse(result.body!)).toEqual({
      error: 'failed to create obligation rating',
    });
  });

  it('returns bad request when getting assessment returns no data', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Obligation,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [],
      },
    ]);
    hasPermissionMock.mockResolvedValue(true);
    insertObligationAssessmentResultMock.mockResolvedValue(undefined);
    randomUUIDMock.mockReturnValue('1-1-1-1-1');
    getAssessmentMock.mockResolvedValue({
      assessment: [],
    });
    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            AssessmentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            ObligationIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
            Rating: 3,
            TestDate: '2024-06-04',
          },
          session_variables: {
            'x-hasura-user-id': '1',
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(403);
    expect(JSON.parse(result.body!)).toEqual({
      message: 'Assessment not found',
      extensions: [],
    });
  });

  it('returns 200 when items inserted corrrectly', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Obligation,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [],
      },
    ]);
    hasPermissionMock.mockResolvedValue(true);
    insertObligationAssessmentResultMock.mockResolvedValue(1);
    randomUUIDMock.mockReturnValue('3cf6e4fe-82df-454b-a7b6-4f11611ba504');
    getAssessmentMock.mockResolvedValue({
      assessment: [
        {
          Id: '',
        },
      ],
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            AssessmentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            ObligationIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
            Rating: 3,
            TestDate: '2024-06-04',
            Rationale: 'Test input details',
          },
          session_variables: {
            'x-hasura-user-id': '1',
            'x-hasura-tenant-name': 'MultiTenant',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body!)).toEqual({
      Ids: ['3cf6e4fe-82df-454b-a7b6-4f11611ba504'],
    });
    expect(insertObligationAssessmentResultMock).toHaveBeenCalledTimes(1);
    expect(insertObligationAssessmentResultMock).toHaveBeenCalledWith(
      hasuraMock,
      {
        results: [
          {
            Id: '3cf6e4fe-82df-454b-a7b6-4f11611ba504',
            Rating: 3,
            Rationale: 'Test input details',
            TestDate: '2024-06-04',
            CustomAttributeData: undefined,
            RatingType: 'assessment',
            parents: {
              data: [
                {
                  ParentId: '3129d18d-e446-46e6-9709-706b2ebebe45',
                  ParentType: ParentTypeEnum.Obligation,
                  ResultType: ParentTypeEnum.ObligationAssessmentResult,
                },
                {
                  ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
                  ParentType: ParentTypeEnum.Assessment,
                  ResultType: ParentTypeEnum.ObligationAssessmentResult,
                },
              ],
            },
          },
        ],
      }
    );
  });
});
