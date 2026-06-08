import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { ParentTypeEnum } from 'generated/graphql';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { insertImpactRatings } from 'src/services/impact-rating/impactRatingService';
import { getInternalAuditReport } from 'src/services/internal-audit-report/internalAuditReportService';
import { NodeService } from 'src/services/node/node.service';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { handler } from './insertImpactInternalAuditRatingResult';

const mockNodeService = {
  findObjectOwners: vi.fn(),
  findById: vi.fn(),
  findManyByIds: vi.fn(),
};

vi.mock('src/backendGraphqlClient');
vi.mock('src/services/node/node.service');
vi.mock('src/services/role-access/roleAccessService');
vi.mock('src/services/impact-rating/impactRatingService');
vi.mock('src/services/internal-audit-report/internalAuditReportService');

const mockedNodeService = vi.mocked(NodeService);
const hasPermissionMock = vi.mocked(hasPermission);
const insertImpactRatingsMock = vi.mocked(insertImpactRatings);
const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const getHasuraBackendClientForActionMock = vi.mocked(
  getHasuraBackendClientForAction
);
const getInternalAuditReportMock = vi.mocked(getInternalAuditReport);

describe('insert impact rating internal audit result - post', () => {
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
    mockNodeService.findManyByIds.mockResolvedValue(undefined);

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            InternalAuditReportId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            Ratings: [
              {
                ImpactId: '3129d18d-e446-46e6-9709-706b2ebebe45',
                Rating: 3,
              },
            ],
            RatedItemId: '2e056afd-6316-4642-b763-95517e0a7b1f',
            CompletedBy: 'auth0|644151efc3a961d2784456d9',
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
      message: 'Access to parent denied',
      extensions: [],
    });
  });

  it('returns forbidden when node not correct parent type', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Action,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9c',
        ancestorContributors: [],
      },
      {
        ObjectType: ParentTypeEnum.Impact,
        Id: '3129d18d-e446-46e6-9709-706b2ebebe45',
        ancestorContributors: [],
      },
      {
        ObjectType: ParentTypeEnum.InternalAuditReport,
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
            InternalAuditReportId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            RatedItemId: '2e056afd-6316-4642-b763-95517e0a7b1f',
            CompletedBy: 'auth0|644151efc3a961d2784456d9',
            TestDate: '2024-06-04',
            Ratings: [
              {
                ImpactId: '3129d18d-e446-46e6-9709-706b2ebebe45',
                Rating: 3,
              },
            ],
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
        ObjectType: ParentTypeEnum.InternalAuditReport,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9c',
        ancestorContributors: [],
      },
      {
        ObjectType: ParentTypeEnum.Impact,
        Id: '3129d18d-e446-46e6-9709-706b2ebebe45',
        ancestorContributors: [],
      },
      {
        ObjectType: ParentTypeEnum.Risk,
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
            InternalAuditReportId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
            RatedItemId: '2e056afd-6316-4642-b763-95517e0a7b1f',
            CompletedBy: 'auth0|644151efc3a961d2784456d9',
            TestDate: '2024-06-04',
            Ratings: [
              {
                ImpactId: '3129d18d-e446-46e6-9709-706b2ebebe45',
                Rating: 3,
              },
            ],
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

  it('returns bad request when inserting impact rating fails', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Risk,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [],
      },
      {
        ObjectType: ParentTypeEnum.Impact,
        Id: '3129d18d-e446-46e6-9709-706b2ebebe45',
        ancestorContributors: [],
      },
      {
        ObjectType: ParentTypeEnum.InternalAuditReport,
        Id: '2e056afd-6316-4642-b763-95517e0a7b1f',
        ancestorContributors: [],
      },
    ]);
    hasPermissionMock.mockResolvedValue(true);
    insertImpactRatingsMock.mockResolvedValue(undefined);
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
            RatedItemId: '2e056afd-6316-4642-b763-95517e0a7b1f',
            Ratings: [
              {
                ImpactId: '3129d18d-e446-46e6-9709-706b2ebebe45',
                Rating: 3,
              },
            ],
            CompletedBy: 'auth0|644151efc3a961d2784456d9',
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
    expect(result.body).toEqual('{"error":"failed to create impact rating"}');
  });

  it('returns bad request when getting assessment returns no data', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Risk,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [],
      },
      {
        ObjectType: ParentTypeEnum.Impact,
        Id: '3129d18d-e446-46e6-9709-706b2ebebe45',
        ancestorContributors: [],
      },
      {
        ObjectType: ParentTypeEnum.InternalAuditReport,
        Id: '2e056afd-6316-4642-b763-95517e0a7b1f',
        ancestorContributors: [],
      },
    ]);
    hasPermissionMock.mockResolvedValue(true);
    insertImpactRatingsMock.mockResolvedValue(undefined);
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
            RatedItemId: '2e056afd-6316-4642-b763-95517e0a7b1f',
            Ratings: [
              {
                ImpactId: '3129d18d-e446-46e6-9709-706b2ebebe45',
                Rating: 3,
              },
            ],
            CompletedBy: 'auth0|644151efc3a961d2784456d9',
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
      message: 'Internal Audit Report not found',
      extensions: [],
    });
  });

  it('returns 200 when items inserted correctly', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Risk,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [],
      },
      {
        ObjectType: ParentTypeEnum.Impact,
        Id: '3129d18d-e446-46e6-9709-706b2ebebe45',
        ancestorContributors: [],
      },
      {
        ObjectType: ParentTypeEnum.InternalAuditReport,
        Id: '2e056afd-6316-4642-b763-95517e0a7b1f',
        ancestorContributors: [],
      },
    ]);
    hasPermissionMock.mockResolvedValue(true);
    insertImpactRatingsMock.mockResolvedValue([{ Id: 'new-test-result-id' }]);
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
            RatedItemId: '2e056afd-6316-4642-b763-95517e0a7b1f',
            Ratings: [
              {
                ImpactId: '3129d18d-e446-46e6-9709-706b2ebebe45',
                Rating: 3,
              },
            ],
            CompletedBy: 'auth0|644151efc3a961d2784456d9',
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
    expect(insertImpactRatingsMock).toHaveBeenCalledTimes(1);
    expect(insertImpactRatingsMock).toHaveBeenCalledWith(hasuraMock, {
      inputs: [
        {
          ImpactId: '3129d18d-e446-46e6-9709-706b2ebebe45',
          RatedItemId: '2e056afd-6316-4642-b763-95517e0a7b1f',
          Rating: 3,
          CompletedBy: 'auth0|644151efc3a961d2784456d9',
          TestDate: '2024-06-04',
          assessmentParents: {
            data: [
              {
                ParentId: '3129d18d-e446-46e6-9709-706b2ebebe45',
                ParentType: ParentTypeEnum.Impact,
                ResultType: ParentTypeEnum.ImpactRating,
              },
              {
                ParentId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
                ParentType: ParentTypeEnum.InternalAuditReport,
                ResultType: ParentTypeEnum.ImpactRating,
              },
            ],
          },
        },
      ],
    });
  });
});
