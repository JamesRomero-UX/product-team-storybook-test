import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  IClient,
  UserGroupByIdResponse,
  UserGroupListQueryResponse,
} from '../../clients/client.interface';
import type {
  IdDateTimeQueryOpts,
  ServiceCallContext,
} from '../../types/service';
import { userGroupsService } from './user-groups.service';

describe('user-groups.service', () => {
  let mockClient: IClient;
  let mockContext: ServiceCallContext;
  let service: ReturnType<typeof userGroupsService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      queryUserGroupList: vi.fn(),
      getUserGroupById: vi.fn(),
    } as unknown as IClient;

    mockContext = {
      authToken: 'Bearer test-token',
    };

    service = userGroupsService(mockClient);
  });

  describe('getUserGroups', () => {
    const mockTrpcResponse: UserGroupListQueryResponse = {
      userGroup: [
        {
          Id: '123e4567-e89b-12d3-a456-426614174000',
          Name: 'Test User Group 1',
          Description: 'Description 1',
          OwnerContributor: false,
          CreatedAtTimestamp: '2024-01-01T00:00:00Z',
          ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
        } as unknown as UserGroupListQueryResponse['userGroup'][0],
        {
          Id: '123e4567-e89b-12d3-a456-426614174001',
          Name: 'Test User Group 2',
          Description: null,
          OwnerContributor: true,
          CreatedAtTimestamp: '2024-01-02T00:00:00Z',
          ModifiedAtTimestamp: '2024-01-02T00:00:00Z',
        } as unknown as UserGroupListQueryResponse['userGroup'][0],
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
      it('should fetch and return user groups without filters', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        vi.mocked(mockClient.queryUserGroupList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getUserGroups(query, mockContext);

        expect(mockClient.queryUserGroupList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          {
            limit: 10,
            afterDateTime: null,
            afterId: null,
            beforeDateTime: null,
            beforeId: null,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.userGroup,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle pagination with afterId and afterDateTime', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 5,
          beforeId: null,
          beforeDateTime: null,
          afterId: '123e4567-e89b-12d3-a456-426614174000',
          afterDateTime: '2024-01-01T00:00:00Z',
        };

        vi.mocked(mockClient.queryUserGroupList).mockResolvedValue(
          mockTrpcResponse
        );

        const result = await service.getUserGroups(query, mockContext);

        expect(mockClient.queryUserGroupList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          {
            limit: 5,
            afterDateTime: '2024-01-01T00:00:00Z',
            afterId: '123e4567-e89b-12d3-a456-426614174000',
            beforeDateTime: null,
            beforeId: null,
          }
        );

        expect(result).toEqual({
          data: mockTrpcResponse.userGroup,
          metadata: mockTrpcResponse.pageMetadata,
        });
      });

      it('should handle empty user group list', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };

        const emptyResponse: UserGroupListQueryResponse = {
          userGroup: [],
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

        vi.mocked(mockClient.queryUserGroupList).mockResolvedValue(
          emptyResponse
        );

        const result = await service.getUserGroups(query, mockContext);

        expect(result).toEqual({
          data: [],
          metadata: emptyResponse.pageMetadata,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client.queryUserGroupList fails', async () => {
        const query: IdDateTimeQueryOpts = {
          limit: 10,
          beforeId: null,
          beforeDateTime: null,
          afterId: null,
          afterDateTime: null,
        };
        const clientError = new Error('tRPC client error');

        vi.mocked(mockClient.queryUserGroupList).mockRejectedValue(clientError);

        await expect(service.getUserGroups(query, mockContext)).rejects.toThrow(
          'tRPC client error'
        );
      });
    });
  });

  describe('getUserGroupById', () => {
    const mockUserGroup = {
      Id: '123e4567-e89b-12d3-a456-426614174000',
      Name: 'Test User Group',
      Description: 'Test description',
      OwnerContributor: false,
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      approvers: [],
    } as unknown as NonNullable<UserGroupByIdResponse>['userGroup'];

    describe('happy path', () => {
      it('should fetch and return user group by id', async () => {
        const id = '123e4567-e89b-12d3-a456-426614174000';

        const mockResponse = {
          userGroup: mockUserGroup,
          form_configuration: null,
        };

        vi.mocked(mockClient.getUserGroupById).mockResolvedValue(mockResponse);

        const result = await service.getUserGroupById(id, mockContext);

        expect(mockClient.getUserGroupById).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          id
        );

        expect(result).toEqual({
          data: mockResponse.userGroup,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should return null when user group is not found', async () => {
        const id = '999e9999-e89b-12d3-a456-426614174999';

        vi.mocked(mockClient.getUserGroupById).mockResolvedValue(null);

        const result = await service.getUserGroupById(id, mockContext);

        expect(result).toBeNull();
      });

      it('should return user group with approvers', async () => {
        const id = '123e4567-e89b-12d3-a456-426614174000';

        const mockResponse = {
          userGroup: {
            ...mockUserGroup,
            approvers: [{ Id: '4fa85f64-5717-4562-b3fc-2c963f66afa7' }],
          },
          form_configuration: null,
        };

        vi.mocked(mockClient.getUserGroupById).mockResolvedValue(
          mockResponse as never
        );

        const result = await service.getUserGroupById(id, mockContext);

        expect(result).toEqual({
          data: mockResponse.userGroup,
          form_configuration: null,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails', async () => {
        const id = '123e4567-e89b-12d3-a456-426614174000';
        const clientError = new Error('Database connection failed');

        vi.mocked(mockClient.getUserGroupById).mockRejectedValue(clientError);

        await expect(service.getUserGroupById(id, mockContext)).rejects.toThrow(
          'Database connection failed'
        );
      });
    });
  });
});
