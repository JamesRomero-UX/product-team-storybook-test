import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { ApprovalStatusEnum, ParentTypeEnum } from 'generated/graphql';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { updateApproverResponse } from 'src/services/approver-response/approverResponseService';
import { ChangeRequestService } from 'src/services/change-request/change-request.service';
import { NodeService } from 'src/services/node/node.service';
import { stub } from 'src/testing/stub';
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { hasPermission } from '../../services/role-access/roleAccessService';
import { handler } from './put';

vi.mock('src/backendGraphqlClient');
vi.mock('src/services/approver-response/approverResponseService');
vi.mock('src/services/node/node.service');
vi.mock('src/services/change-request/change-request.service');
vi.mock('src/services/node/nodeService');
vi.mock('src/services/role-access/roleAccessService');

const mockNodeService = {
  findObjectOwners: vi.fn(),
  findById: vi.fn(),
  findManyByIds: vi.fn(),
};
const hasuraMock = mock<ApolloClient<NormalizedCacheObject>>();
const getHasuraBackendClientForActionMock = vi.mocked(
  getHasuraBackendClientForAction
);
const findByIdMock = vi.fn();
const hasPermissionMock = vi.mocked(hasPermission);
const mockedNodeService = vi.mocked(NodeService);
const mockedChangeRequestService = vi.mocked(ChangeRequestService);
const updateApproverResponseMock = vi.mocked(updateApproverResponse);

describe('approver response put', () => {
  const mockDate = new Date(Date.UTC(2024, 4, 4, 13, 14, 16));
  beforeEach(() => {
    vi.resetAllMocks();
    getHasuraBackendClientForActionMock.mockReturnValue(hasuraMock);
    mockedNodeService.mockReturnValue(mockNodeService);
    mockedChangeRequestService.mockReturnValue({
      findById: findByIdMock,
      findActiveChangeRequest: vi.fn(),
      delete: vi.fn(),
      amendChanges: vi.fn(),
      create: vi.fn(),
      getActiveLevelId: vi.fn(),
      getWorkflow: vi.fn(),
      updateStatus: vi.fn(),
      merge: vi.fn(),
      findContributors: vi.fn(),
    });
    mockedNodeService.mockReturnValue(mockNodeService);
    vi.useFakeTimers({
      toFake: ['Date'],
    }).setSystemTime(mockDate);
  });
  afterEach(() => {
    //restore timers
    vi.useRealTimers();
  });

  it('should validate the post body', async () => {
    const result = await handler(
      stub<APIGatewayProxyEventV2>({}),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
  });

  it('returns bad request when change request does not exist', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([]);
    findByIdMock.mockResolvedValue(undefined);

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            input: {
              ChangeRequestId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
              Comment: 'Some comment',
              Response: true,
              OverrideLevel: false,
              LevelId: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
            'x-hasura-user-id': 'testUserId1',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(
      '{"message":"Change request not found","extensions":[]}'
    );
  });
  it.each([
    ApprovalStatusEnum.Approved,
    ApprovalStatusEnum.Deleted,
    ApprovalStatusEnum.Failed,
    ApprovalStatusEnum.Rejected,
  ])(
    'returns bad request when change request is not pending (%s)',
    async (status) => {
      mockNodeService.findManyByIds.mockResolvedValue([]);
      findByIdMock.mockResolvedValue({
        ChangeRequestStatus: status,
      });

      const result = await handler(
        stub<APIGatewayProxyEventV2>({
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: '',
            input: {
              input: {
                ChangeRequestId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
                Comment: 'Some comment',
                Response: true,
                OverrideLevel: false,
                LevelId: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
              },
            },
            session_variables: {
              'x-hasura-tenant-name': 'MultiTenant',
              'x-hasura-user-id': 'testUserId1',
            },
          }),
        }),
        stub<Context>({})
      );
      expect(result.statusCode).toEqual(400);
      expect(result.body).toEqual(
        '{"message":"Only pending change requests can be responded too","extensions":[]}'
      );
    }
  );
  it('returns bad request when parent node does not exist', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([]);
    findByIdMock.mockResolvedValue({
      ChangeRequestStatus: ApprovalStatusEnum.Pending,
    });

    const result = await handler(
      stub<APIGatewayProxyEventV2>({
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: '',
          input: {
            input: {
              ChangeRequestId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
              Comment: 'Some comment',
              Response: true,
              OverrideLevel: false,
              LevelId: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
            'x-hasura-user-id': 'testUserId1',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(
      '{"message":"Object ID(s) not found","extensions":[]}'
    );
  });
  it('updates 0 approval response where the user isnt a owner, approver or member of an approver group', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Action,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [
          {
            UserId: 'testUserId2',
          },
        ],
      },
    ]);
    findByIdMock.mockResolvedValue({
      Id: 'responseId1',
      ChangeRequestStatus: ApprovalStatusEnum.Pending,
      responses: [
        {
          Approved: undefined,
          approver: {
            user: 'user-1',
          },
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
            input: {
              ChangeRequestId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
              Comment: 'Some comment',
              Response: true,
              OverrideLevel: false,
              LevelId: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
            'x-hasura-user-id': 'testUserId1',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      '{"Id":"abb0073f-d940-4056-aa45-d4d0bb1f0c9d"}'
    );
    expect(updateApproverResponseMock).not.toHaveBeenCalled();
  });
  it('updates 1 approval response where the user is an owner and a owner approver step exists', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Action,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [
          {
            UserId: 'testUserId1',
          },
        ],
      },
    ]);
    findByIdMock.mockResolvedValue({
      Id: 'responseId1',
      ChangeRequestStatus: ApprovalStatusEnum.Pending,
      responses: [
        {
          Approved: undefined,
          approver: {
            Id: 'approver_1',
            OwnerApprover: true,
            level: {
              Id: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
          },
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
            input: {
              ChangeRequestId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
              Comment: 'Some comment',
              Response: true,
              OverrideLevel: false,
              LevelId: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
            'x-hasura-user-id': 'testUserId1',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      '{"Id":"abb0073f-d940-4056-aa45-d4d0bb1f0c9d"}'
    );
    expect(updateApproverResponseMock).toHaveBeenCalledTimes(1);
    expect(updateApproverResponseMock).toHaveBeenCalledWith(hasuraMock, {
      approvedAtTimestamp: '2024-05-04T13:14:16.000Z',
      approvedByUser: 'testUserId1',
      approverIds: ['approver_1'],
      changeRequestId: 'responseId1',
      comment: 'Some comment',
      response: true,
    });
  });
  it('updates 1 approval response where the user is an approver', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Action,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [
          {
            UserId: 'testUserId2',
          },
        ],
      },
    ]);
    findByIdMock.mockResolvedValue({
      Id: 'responseId1',
      ChangeRequestStatus: ApprovalStatusEnum.Pending,
      responses: [
        {
          Approved: undefined,
          approver: {
            Id: 'approver_1',
            user: {
              Id: 'testUserId1',
            },
            level: {
              Id: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
          },
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
            input: {
              ChangeRequestId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
              Comment: 'Some comment',
              Response: true,
              OverrideLevel: false,
              LevelId: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
            'x-hasura-user-id': 'testUserId1',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      '{"Id":"abb0073f-d940-4056-aa45-d4d0bb1f0c9d"}'
    );
    expect(updateApproverResponseMock).toHaveBeenCalledTimes(1);
    expect(updateApproverResponseMock).toHaveBeenCalledWith(hasuraMock, {
      approvedAtTimestamp: '2024-05-04T13:14:16.000Z',
      approvedByUser: 'testUserId1',
      approverIds: ['approver_1'],
      changeRequestId: 'responseId1',
      comment: 'Some comment',
      response: true,
    });
  });
  it('updates 1 approval response where the user is an approver in an approver group', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Action,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [
          {
            UserId: 'testUserId2',
          },
        ],
      },
    ]);
    findByIdMock.mockResolvedValue({
      Id: 'responseId1',
      ChangeRequestStatus: ApprovalStatusEnum.Pending,
      responses: [
        {
          Approved: undefined,
          approver: {
            Id: 'approver_1',
            level: {
              Id: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
            group: {
              users: [
                {
                  authUsers: {
                    Id: 'testUserId2',
                  },
                },
                {
                  authUsers: {
                    Id: 'testUserId1',
                  },
                },
                {
                  authUsers: {
                    Id: 'testUserId3',
                  },
                },
              ],
            },
          },
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
            input: {
              ChangeRequestId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
              Comment: 'Some comment',
              Response: true,
              OverrideLevel: false,
              LevelId: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
            'x-hasura-user-id': 'testUserId1',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      '{"Id":"abb0073f-d940-4056-aa45-d4d0bb1f0c9d"}'
    );
    expect(updateApproverResponseMock).toHaveBeenCalledTimes(1);
    expect(updateApproverResponseMock).toHaveBeenCalledWith(hasuraMock, {
      approvedAtTimestamp: '2024-05-04T13:14:16.000Z',
      approvedByUser: 'testUserId1',
      approverIds: ['approver_1'],
      changeRequestId: 'responseId1',
      comment: 'Some comment',
      response: true,
    });
  });
  it('updates 1 approval response where the user is an owner, approver and approver group, as per level', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Action,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [
          {
            UserId: 'testUserId1',
          },
        ],
      },
    ]);
    findByIdMock.mockResolvedValue({
      Id: 'responseId1',
      ChangeRequestStatus: ApprovalStatusEnum.Pending,
      responses: [
        {
          Approved: undefined,
          approver: {
            Id: 'approver_1',
            level: {
              Id: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
            group: {
              users: [
                {
                  authUsers: {
                    Id: 'testUserId2',
                  },
                },
                {
                  authUsers: {
                    Id: 'testUserId1',
                  },
                },
                {
                  authUsers: {
                    Id: 'testUserId3',
                  },
                },
              ],
            },
          },
        },
        {
          Approved: undefined,
          approver: {
            Id: 'approver_2',
            level: {
              Id: '41816ded-af2b-461b-8b8d-d17d46e7b472',
            },
            user: {
              Id: 'testUserId1',
            },
          },
        },
        {
          Approved: undefined,
          approver: {
            Id: 'approver_3',
            level: {
              Id: '07a147b6-5a61-45c9-8f5a-c59823642865',
            },
            OwnerApprover: true,
          },
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
            input: {
              ChangeRequestId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
              Comment: 'Some comment',
              Response: true,
              OverrideLevel: false,
              LevelId: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
            'x-hasura-user-id': 'testUserId1',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      '{"Id":"abb0073f-d940-4056-aa45-d4d0bb1f0c9d"}'
    );
    expect(updateApproverResponseMock).toHaveBeenCalledTimes(1);
    expect(updateApproverResponseMock).toHaveBeenCalledWith(hasuraMock, {
      approvedAtTimestamp: '2024-05-04T13:14:16.000Z',
      approvedByUser: 'testUserId1',
      approverIds: ['approver_1'],
      changeRequestId: 'responseId1',
      comment: 'Some comment',
      response: true,
    });
  });
  it('updates 1 approval response where the user is an owner, approver and approver group with already approved step', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Action,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [
          {
            UserId: 'testUserId1',
          },
        ],
      },
    ]);
    findByIdMock.mockResolvedValue({
      Id: 'responseId1',
      ChangeRequestStatus: ApprovalStatusEnum.Pending,
      responses: [
        {
          Approved: true,
          approver: {
            Id: 'approver_1',
            group: {
              users: [
                {
                  authUsers: {
                    Id: 'testUserId2',
                  },
                },
                {
                  authUsers: {
                    Id: 'testUserId1',
                  },
                },
                {
                  authUsers: {
                    Id: 'testUserId3',
                  },
                },
              ],
            },
            level: {
              Id: '41816ded-af2b-461b-8b8d-d17d46e7b472',
            },
          },
        },
        {
          Approved: undefined,
          approver: {
            Id: 'approver_2',
            user: {
              Id: 'testUserId1',
            },
            level: {
              Id: '07a147b6-5a61-45c9-8f5a-c59823642865',
            },
          },
        },
        {
          Approved: undefined,
          approver: {
            Id: 'approver_3',
            OwnerApprover: true,
            level: {
              Id: '3b9e5e0e-7ff3-40b5-8207-71b6647aa0f8',
            },
          },
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
            input: {
              ChangeRequestId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
              Comment: 'Some comment',
              Response: true,
              OverrideLevel: false,
              LevelId: '3b9e5e0e-7ff3-40b5-8207-71b6647aa0f8',
            },
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
            'x-hasura-user-id': 'testUserId1',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      '{"Id":"abb0073f-d940-4056-aa45-d4d0bb1f0c9d"}'
    );
    expect(updateApproverResponseMock).toHaveBeenCalledTimes(1);
    expect(updateApproverResponseMock).toHaveBeenCalledWith(hasuraMock, {
      approvedAtTimestamp: '2024-05-04T13:14:16.000Z',
      approvedByUser: 'testUserId1',
      approverIds: ['approver_3'],
      changeRequestId: 'responseId1',
      comment: 'Some comment',
      response: true,
    });
  });
  it('updates 0 approval response where the user is an owner, approver and approver group with already approved step on the selected level', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Action,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [
          {
            UserId: 'testUserId1',
          },
        ],
      },
    ]);
    findByIdMock.mockResolvedValue({
      Id: 'responseId1',
      ChangeRequestStatus: ApprovalStatusEnum.Pending,
      responses: [
        {
          Approved: true,
          approver: {
            Id: 'approver_1',
            group: {
              users: [
                {
                  authUsers: {
                    Id: 'testUserId2',
                  },
                },
                {
                  authUsers: {
                    Id: 'testUserId1',
                  },
                },
                {
                  authUsers: {
                    Id: 'testUserId3',
                  },
                },
              ],
            },
            level: {
              Id: '41816ded-af2b-461b-8b8d-d17d46e7b472',
            },
          },
        },
        {
          Approved: undefined,
          approver: {
            Id: 'approver_2',
            user: {
              Id: 'testUserId1',
            },
            level: {
              Id: '07a147b6-5a61-45c9-8f5a-c59823642865',
            },
          },
        },
        {
          Approved: true,
          approver: {
            Id: 'approver_3',
            OwnerApprover: true,
            level: {
              Id: '3b9e5e0e-7ff3-40b5-8207-71b6647aa0f8',
            },
          },
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
            input: {
              ChangeRequestId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
              Comment: 'Some comment',
              Response: true,
              OverrideLevel: false,
              LevelId: '3b9e5e0e-7ff3-40b5-8207-71b6647aa0f8',
            },
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
            'x-hasura-user-id': 'testUserId1',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      '{"Id":"abb0073f-d940-4056-aa45-d4d0bb1f0c9d"}'
    );
    expect(updateApproverResponseMock).toHaveBeenCalledTimes(0);
  });
  it('returns forbidden when user doesnt have permission to override', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Action,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [
          {
            UserId: 'testUserId2',
          },
        ],
      },
    ]);
    findByIdMock.mockResolvedValue({
      Id: 'responseId1',
      ChangeRequestStatus: ApprovalStatusEnum.Pending,
      responses: [
        {
          Approved: undefined,
          approver: {
            user: 'user-1',
          },
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
            input: {
              ChangeRequestId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
              Comment: 'Some comment',
              Response: true,
              OverrideLevel: true,
              LevelId: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
            'x-hasura-user-id': 'testUserId1',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(403);
    expect(result.body).toEqual('{"message":"Access denied","extensions":[]}');
    expect(updateApproverResponseMock).not.toHaveBeenCalled();
  });
  it('overrides all steps in a level', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Action,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [
          {
            UserId: 'testUserId2',
          },
        ],
      },
    ]);
    hasPermissionMock.mockResolvedValue(true);
    findByIdMock.mockResolvedValue({
      Id: 'responseId1',
      ChangeRequestStatus: ApprovalStatusEnum.Pending,
      responses: [
        {
          Approved: undefined,
          approver: {
            Id: 'approver_1',
            level: {
              Id: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
            group: {
              users: [
                {
                  authUsers: {
                    Id: 'testUserId3',
                  },
                },
                {
                  authUsers: {
                    Id: 'testUserId4',
                  },
                },
                {
                  authUsers: {
                    Id: 'testUserId3',
                  },
                },
              ],
            },
          },
        },
        {
          Approved: undefined,
          approver: {
            Id: 'approver_2',
            user: {
              Id: 'testUserId2',
            },
            level: {
              Id: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
          },
        },
        {
          Approved: undefined,
          approver: {
            Id: 'approver_3',
            OwnerApprover: true,
            level: {
              Id: 'level_2',
            },
          },
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
            input: {
              ChangeRequestId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
              Comment: 'Some comment',
              Response: true,
              OverrideLevel: true,
              LevelId: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
            'x-hasura-user-id': 'testUserId1',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      '{"Id":"abb0073f-d940-4056-aa45-d4d0bb1f0c9d"}'
    );
    expect(updateApproverResponseMock).toHaveBeenCalledTimes(1);
    expect(updateApproverResponseMock).toHaveBeenCalledWith(hasuraMock, {
      approvedAtTimestamp: '2024-05-04T13:14:16.000Z',
      approvedByUser: 'testUserId1',
      approverIds: ['approver_1', 'approver_2'],
      changeRequestId: 'responseId1',
      comment: 'Some comment',
      response: true,
    });
  });
  it('overrides all steps in a level skipping already approved approvals', async () => {
    mockNodeService.findManyByIds.mockResolvedValue([
      {
        ObjectType: ParentTypeEnum.Action,
        Id: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
        ancestorContributors: [
          {
            UserId: 'testUserId2',
          },
        ],
      },
    ]);
    hasPermissionMock.mockResolvedValue(true);
    findByIdMock.mockResolvedValue({
      Id: 'responseId1',
      ChangeRequestStatus: ApprovalStatusEnum.Pending,
      responses: [
        {
          Approved: undefined,
          approver: {
            Id: 'approver_1',
            level: {
              Id: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
            group: {
              users: [
                {
                  authUsers: {
                    Id: 'testUserId3',
                  },
                },
                {
                  authUsers: {
                    Id: 'testUserId4',
                  },
                },
                {
                  authUsers: {
                    Id: 'testUserId3',
                  },
                },
              ],
            },
          },
        },
        {
          Approved: true,
          approver: {
            Id: 'approver_2',
            user: {
              Id: 'testUserId2',
            },
            level: {
              Id: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
          },
        },
        {
          Approved: undefined,
          approver: {
            Id: 'approver_3',
            OwnerApprover: true,
            level: {
              Id: 'level_2',
            },
          },
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
            input: {
              ChangeRequestId: 'abb0073f-d940-4056-aa45-d4d0bb1f0c9d',
              Comment: 'Some comment',
              Response: true,
              OverrideLevel: true,
              LevelId: 'fb13721d-85a0-4d72-a7cb-9948c800dbf2',
            },
          },
          session_variables: {
            'x-hasura-tenant-name': 'MultiTenant',
            'x-hasura-user-id': 'testUserId1',
          },
        }),
      }),
      stub<Context>({})
    );
    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(
      '{"Id":"abb0073f-d940-4056-aa45-d4d0bb1f0c9d"}'
    );
    expect(updateApproverResponseMock).toHaveBeenCalledTimes(1);
    expect(updateApproverResponseMock).toHaveBeenCalledWith(hasuraMock, {
      approvedAtTimestamp: '2024-05-04T13:14:16.000Z',
      approvedByUser: 'testUserId1',
      approverIds: ['approver_1'],
      changeRequestId: 'responseId1',
      comment: 'Some comment',
      response: true,
    });
  });
});
