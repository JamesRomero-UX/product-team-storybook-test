import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { ParentTypeEnum } from 'generated/graphql';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getComplianceMonitoringAssessment } from 'src/services/compliance-monitoring-assessment/complianceMonitoringAssessmentService';
import { NodeService } from 'src/services/node/node.service';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { insertDocumentSecondLineResult } from 'src/services/second-line-result/secondLineResultService';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { handler } from './insertDocumentSecondLineResult';

vi.mock('crypto');
vi.mock('src/backendGraphqlClient');
vi.mock('src/services/node/node.service');
vi.mock('src/services/role-access/roleAccessService');
vi.mock('src/services/second-line-result/secondLineResultService');
vi.mock(
  'src/services/compliance-monitoring-assessment/complianceMonitoringAssessmentService'
);
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
const insertDocumentAssessmentResultMock = vi.mocked(
  insertDocumentSecondLineResult
);
const mockedNodeService = vi.mocked(NodeService);
const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const getHasuraBackendClientForActionMock = vi.mocked(
  getHasuraBackendClientForAction
);
const getSecondLineReportMock = vi.mocked(getComplianceMonitoringAssessment);

describe('insert document rating second line result - post', () => {
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
            ComplianceMonitoringAssessmentId:
              'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            DocumentIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
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
            DocumentIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
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
        ObjectType: ParentTypeEnum.Document,
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
            DocumentIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
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

  it('returns bad request when inserting document rating fails', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Document,
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
    insertDocumentAssessmentResultMock.mockResolvedValue(undefined);
    randomUUIDMock.mockReturnValue('004a2162-4806-4267-9cf1-d7f5bcc657cb');
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
            DocumentIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
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
    expect(result.body).toEqual('{"error":"failed to create document rating"}');
  });

  it('returns bad request when getting internal audit report returns no data', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Document,
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
    insertDocumentAssessmentResultMock.mockResolvedValue(undefined);
    randomUUIDMock.mockReturnValue('1-1-1-1-1');
    getSecondLineReportMock.mockResolvedValue({
      compliance_monitoring_assessment: [],
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
            DocumentIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
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
      message: 'Compliance Monitoring Assessment not found',
      extensions: [],
    });
  });

  it('returns 200 when items inserted correctly', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Document,
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
    insertDocumentAssessmentResultMock.mockResolvedValue(1);
    randomUUIDMock.mockReturnValue('3cf6e4fe-82df-454b-a7b6-4f11611ba504');
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
            DocumentIds: ['3129d18d-e446-46e6-9709-706b2ebebe45'],
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
    expect(result.body).toEqual(
      '{"Ids":["3cf6e4fe-82df-454b-a7b6-4f11611ba504"]}'
    );
    expect(insertDocumentAssessmentResultMock).toHaveBeenCalledTimes(1);
    expect(insertDocumentAssessmentResultMock).toHaveBeenCalledWith(
      hasuraMock,
      {
        results: [
          {
            Id: '3cf6e4fe-82df-454b-a7b6-4f11611ba504',
            Rating: 3,
            Rationale: 'Test input details',
            TestDate: '2024-06-04',
            CustomAttributeData: undefined,
            parents: {
              data: [
                {
                  ParentId: '3129d18d-e446-46e6-9709-706b2ebebe45',
                  ParentType: ParentTypeEnum.Document,
                  ResultType: ParentTypeEnum.DocumentAssessmentResult,
                },
                {
                  ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
                  ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
                  ResultType: ParentTypeEnum.DocumentAssessmentResult,
                },
              ],
            },
          },
        ],
      }
    );
  });
});
