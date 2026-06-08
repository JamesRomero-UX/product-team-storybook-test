import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { ParentTypeEnum } from 'generated/graphql';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getComplianceMonitoringAssessment } from 'src/services/compliance-monitoring-assessment/complianceMonitoringAssessmentService';
import { NodeService } from 'src/services/node/node.service';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { insertSecondLineTestResultWithParents } from 'src/services/second-line-test-result/secondLineTestResultService';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { handler } from './insertControlTestSecondLineResult';

vi.mock('src/backendGraphqlClient');
vi.mock('src/services/node/node.service');
vi.mock('src/services/role-access/roleAccessService');
vi.mock('src/services/second-line-test-result/secondLineTestResultService');
vi.mock(
  'src/services/compliance-monitoring-assessment/complianceMonitoringAssessmentService'
);
vi.mock('src/services/schedule-state/controlScheduleStateService');

const mockNodeService = {
  findObjectOwners: vi.fn(),
  findById: vi.fn(),
  findManyByIds: vi.fn(),
};

const mockedNodeService = vi.mocked(NodeService);
const hasPermissionMock = vi.mocked(hasPermission);
const insertTestResultWithParentsMock = vi.mocked(
  insertSecondLineTestResultWithParents
);
const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const getHasuraBackendClientForActionMock = vi.mocked(
  getHasuraBackendClientForAction
);
const getSecondLineReportMock = vi.mocked(getComplianceMonitoringAssessment);

describe('insert control test second line result - post', () => {
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
            ComplianceMonitoringAssessmentId:
              'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
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
      {
        ObjectType: ParentTypeEnum.Control,
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
            ComplianceMonitoringAssessmentId:
              'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
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
      {
        ObjectType: ParentTypeEnum.ComplianceMonitoringAssessment,
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
            ComplianceMonitoringAssessmentId:
              'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
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
      {
        ObjectType: ParentTypeEnum.ComplianceMonitoringAssessment,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [],
      },
    ]);
    hasPermissionMock.mockResolvedValue(true);
    insertTestResultWithParentsMock.mockResolvedValue(undefined);
    getSecondLineReportMock.mockResolvedValue({
      compliance_monitoring_assessment: [
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
            ComplianceMonitoringAssessmentId:
              'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
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
        Id: '3129d18d-e446-46e6-9709-706b2ebebe45',
        ancestorContributors: [],
      },
      {
        ObjectType: ParentTypeEnum.ComplianceMonitoringAssessment,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [],
      },
    ]);
    hasPermissionMock.mockResolvedValue(true);
    insertTestResultWithParentsMock.mockResolvedValue(['new-test-result-id']);
    getSecondLineReportMock.mockResolvedValue({
      compliance_monitoring_assessment: [
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
            ComplianceMonitoringAssessmentId:
              'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
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
          OverallEffectiveness: 3,
          Submitter: 'auth0|644151efc3a961d2784456d9',
          TestDate: '2024-06-04',
          parents: {
            data: [
              {
                ParentId: '3129d18d-e446-46e6-9709-706b2ebebe45',
                ParentType: ParentTypeEnum.Control,
                ResultType: ParentTypeEnum.TestResult,
              },
              {
                ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
                ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
                ResultType: ParentTypeEnum.TestResult,
              },
            ],
          },
        },
      ],
    });
  });
});
