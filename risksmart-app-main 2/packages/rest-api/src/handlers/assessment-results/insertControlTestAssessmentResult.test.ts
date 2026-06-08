import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { ParentTypeEnum } from 'generated/graphql';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { NodeService } from 'src/services/node/node.service';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { insertTestResultWithParents } from 'src/services/test-result/testResultService';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { getAssessment } from '../../services/assessment/assessmentService';
import { handler } from './insertControlTestAssessmentResult';

vi.mock('src/backendGraphqlClient');
vi.mock('src/services/node/node.service');
vi.mock('src/services/role-access/roleAccessService');
vi.mock('src/services/test-result/testResultService');
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

const mockedNodeService = vi.mocked(NodeService);
const hasPermissionMock = vi.mocked(hasPermission);
const insertTestResultWithParentsMock = vi.mocked(insertTestResultWithParents);
const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const getHasuraBackendClientForActionMock = vi.mocked(
  getHasuraBackendClientForAction
);
const getAssessmentMock = vi.mocked(getAssessment);

describe('insert control test assessment result - post', () => {
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

  it('returns forbidden when node does not exist', async () => {
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
            ControlIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
            Title: 'new test result',
            TestType: '1stline',
            Description: 'a new description',
            DesignEffectiveness: 1,
            PerformanceEffectiveness: 2,
            OverallEffectiveness: 3,
            Submitter: 'auth0|644151efc3a961d2784456d9',
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
            ControlIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
            Title: 'new test result',
            TestType: '1stline',
            Description: 'a new description',
            DesignEffectiveness: 1,
            PerformanceEffectiveness: 2,
            OverallEffectiveness: 3,
            Submitter: 'auth0|644151efc3a961d2784456d9',
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
        ObjectType: ParentTypeEnum.Control,
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
            ControlIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
            Title: 'new test result',
            TestType: '1stline',
            Description: 'a new description',
            DesignEffectiveness: 1,
            PerformanceEffectiveness: 2,
            OverallEffectiveness: 3,
            Submitter: 'auth0|644151efc3a961d2784456d9',
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

  it('returns bad request when inserting test result fails', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Control,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [],
      },
    ]);
    hasPermissionMock.mockResolvedValue(true);
    insertTestResultWithParentsMock.mockResolvedValue(undefined);
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
            ControlIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
            Title: 'new test result',
            TestType: '1stline',
            Description: 'a new description',
            DesignEffectiveness: 1,
            PerformanceEffectiveness: 2,
            OverallEffectiveness: 3,
            Submitter: 'auth0|644151efc3a961d2784456d9',
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
    expect(result.body).toEqual('{"error":"failed to create test results"}');
  });

  it('returns 200 without inserting links when no links requested', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Control,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [],
      },
    ]);
    hasPermissionMock.mockResolvedValue(true);
    insertTestResultWithParentsMock.mockResolvedValue(['new-test-result-id']);
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
            ControlIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
            Title: 'new test result',
            TestType: '1stline',
            Description: 'a new description',
            DesignEffectiveness: 1,
            PerformanceEffectiveness: 2,
            OverallEffectiveness: 3,
            Submitter: 'auth0|644151efc3a961d2784456d9',
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
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual('{"Ids":["new-test-result-id"]}');
    expect(insertTestResultWithParentsMock).toHaveBeenCalledTimes(1);
    expect(insertTestResultWithParentsMock).toHaveBeenCalledWith(hasuraMock, {
      results: [
        {
          ParentControlId: '3129d18d-e446-46e6-9709-706b2ebebe45',
          Title: 'new test result',
          TestType: '1stline',
          Description: 'a new description',
          DesignEffectiveness: 1,
          PerformanceEffectiveness: 2,
          RatingType: 'assessment',
          OverallEffectiveness: 3,
          Submitter: 'auth0|644151efc3a961d2784456d9',
          TestDate: '2024-06-04',
          assessmentParents: {
            data: [
              {
                ParentId: '3129d18d-e446-46e6-9709-706b2ebebe45',
                ParentType: ParentTypeEnum.Control,
                ResultType: ParentTypeEnum.TestResult,
              },
              {
                ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
                ParentType: ParentTypeEnum.Assessment,
                ResultType: ParentTypeEnum.TestResult,
              },
            ],
          },
        },
      ],
    });
  });
});
