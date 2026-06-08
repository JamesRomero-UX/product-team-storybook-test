import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { ParentTypeEnum } from 'generated/graphql';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getInternalAuditReport } from 'src/services/internal-audit-report/internalAuditReportService';
import { insertObligationInternalAuditResult } from 'src/services/internal-audit-result/internalAuditResultService';
import { NodeService } from 'src/services/node/node.service';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { handler } from './insertObligationInternalAuditResult';

vi.mock('crypto');
vi.mock('src/backendGraphqlClient');
vi.mock('src/services/node/node.service');
vi.mock('src/services/role-access/roleAccessService');
vi.mock('src/services/internal-audit-result/internalAuditResultService');
vi.mock('src/services/internal-audit-report/internalAuditReportService');

const mockNodeService = {
  findObjectOwners: vi.fn(),
  findById: vi.fn(),
  findManyByIds: vi.fn(),
};

const randomUUIDMock = vi.mocked(randomUUID);
const hasPermissionMock = vi.mocked(hasPermission);
const insertObligationInternalAuditResultMock = vi.mocked(
  insertObligationInternalAuditResult
);
const mockedNodeService = vi.mocked(NodeService);
const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const getHasuraBackendClientForActionMock = vi.mocked(
  getHasuraBackendClientForAction
);
const getInternalAuditReportMock = vi.mocked(getInternalAuditReport);

describe('insert obligation rating internal audit result - post', () => {
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

  it('returns bad request when node does not exist', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([]);

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            InternalAuditReportId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
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
      {
        ObjectType: ParentTypeEnum.InternalAuditReport,
        Id: '3129d18d-e446-46e6-9709-706b2ebebe45',
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
            InternalAuditReportId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
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
      {
        ObjectType: ParentTypeEnum.InternalAuditReport,
        Id: '3129d18d-e446-46e6-9709-706b2ebebe45',
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
            InternalAuditReportId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
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
      {
        ObjectType: ParentTypeEnum.InternalAuditReport,
        Id: '3129d18d-e446-46e6-9709-706b2ebebe45',
        ancestorContributors: [],
      },
    ]);
    hasPermissionMock.mockResolvedValue(true);
    insertObligationInternalAuditResultMock.mockResolvedValue(undefined);
    randomUUIDMock.mockReturnValue('004a2162-4806-4267-9cf1-d7f5bcc657cb');
    getInternalAuditReportMock.mockResolvedValue({
      internal_audit_report: [
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
            InternalAuditReportId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
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
      {
        ObjectType: ParentTypeEnum.InternalAuditReport,
        Id: '3129d18d-e446-46e6-9709-706b2ebebe45',
        ancestorContributors: [],
      },
    ]);
    hasPermissionMock.mockResolvedValue(true);
    insertObligationInternalAuditResultMock.mockResolvedValue(undefined);
    randomUUIDMock.mockReturnValue('1-1-1-1-1');
    getInternalAuditReportMock.mockResolvedValue({
      internal_audit_report: [],
    });
    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            InternalAuditReportId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
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
      message: 'Internal Audit Report not found',
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
      {
        ObjectType: ParentTypeEnum.InternalAuditReport,
        Id: '3129d18d-e446-46e6-9709-706b2ebebe45',
        ancestorContributors: [],
      },
    ]);
    hasPermissionMock.mockResolvedValue(true);
    insertObligationInternalAuditResultMock.mockResolvedValue(1);
    randomUUIDMock.mockReturnValue('3cf6e4fe-82df-454b-a7b6-4f11611ba504');
    getInternalAuditReportMock.mockResolvedValue({
      internal_audit_report: [
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
            InternalAuditReportId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
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
    expect(insertObligationInternalAuditResultMock).toHaveBeenCalledTimes(1);
    expect(insertObligationInternalAuditResultMock).toHaveBeenCalledWith(
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
                  ParentType: ParentTypeEnum.Obligation,
                  ResultType: ParentTypeEnum.ObligationAssessmentResult,
                },
                {
                  ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
                  ParentType: ParentTypeEnum.InternalAuditReport,
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
