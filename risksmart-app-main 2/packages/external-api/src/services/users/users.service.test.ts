import { UserValidationError } from 'src/errors/user.errors';
import type { MutateServiceContext } from 'src/schemas/common/base.schema';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  IClient,
  UsersListQueryResponse,
} from '../../clients/client.interface';
import type {
  IdDateTimeQueryOpts,
  ServiceCallContext,
} from '../../types/service';
import { usersService } from './users.service';

describe('users.service', () => {
  let mockClient: IClient;
  let mockContext: ServiceCallContext;
  let mockMutateContext: MutateServiceContext;
  let service: ReturnType<typeof usersService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      queryRiskList: vi.fn(),
      getRiskById: vi.fn(),
      getControlById: vi.fn(),
      queryControlList: vi.fn(),
      queryActionList: vi.fn(),
      getActionById: vi.fn(),
      queryIssueList: vi.fn(),
      getIssueById: vi.fn(),
      queryDocumentList: vi.fn(),
      getDocumentById: vi.fn(),
      queryThirdPartyList: vi.fn(),
      getThirdPartyById: vi.fn(),
      getUserById: vi.fn(),
      queryUserList: vi.fn(),
    } as unknown as IClient;

    mockContext = {
      authToken: 'Bearer test-token',
    };

    mockMutateContext = {
      authToken: 'Bearer test-token',
      orgId: 'org-123',
      tenantId: 'tenant-123',
    };

    service = usersService(mockClient);
  });

  describe('getUserById', () => {
    const mockTrpcUser = {
      Id: 'provider|123e4567-e89b-12d3-a456-426614174000',
      Email: 'test.user@example.com',
      Name: 'Test User',
      GivenName: 'Test',
      FamilyName: 'User',
      ModifiedByUser: 'provider|admin1',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      CreatedByUser: 'provider|admin1',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
    } as unknown as NonNullable<
      Awaited<ReturnType<IClient['getUserById']>>
    >['user'];

    describe('happy path', () => {
      it('should fetch and return user by id', async () => {
        const userId = 'provider|123e4567-e89b-12d3-a456-426614174000';

        const mockResponse = {
          user: mockTrpcUser,
          form_configuration: null,
        };
        vi.mocked(mockClient.getUserById).mockResolvedValue(mockResponse);

        const result = await service.getUserById(userId, mockContext);

        expect(mockClient.getUserById).toHaveBeenCalledWith(
          {
            authorization: 'Bearer test-token',
          },
          userId
        );

        expect(result).toEqual({
          data: mockResponse.user,
          form_configuration: mockResponse.form_configuration,
        });
      });

      it('should return user with form_configuration when present', async () => {
        const userId = 'provider|123e4567-e89b-12d3-a456-426614174000';

        const mockFormConfig = {
          fields: [
            { name: 'field1', type: 'text', required: true },
            { name: 'field2', type: 'number', required: false },
          ],
        } as never;

        const mockResponse = {
          user: mockTrpcUser,
          form_configuration: mockFormConfig,
        };
        vi.mocked(mockClient.getUserById).mockResolvedValue(mockResponse);

        const result = await service.getUserById(userId, mockContext);

        expect(result).toEqual({
          data: mockResponse.user,
          form_configuration: mockFormConfig,
        });
      });

      it('should return null when user is not found (null response)', async () => {
        const userId = 'provider|999e9999-e89b-12d3-a456-426614174999';

        vi.mocked(mockClient.getUserById).mockResolvedValue(null);

        const result = await service.getUserById(userId, mockContext);

        expect(result).toBeNull();
      });

      it('should handle user with all optional fields populated', async () => {
        const userId = 'provider|123e4567-e89b-12d3-a456-426614174000';

        const completeUser = {
          ...mockTrpcUser,
          Email: 'complete.user@example.com',
          Name: 'Complete User',
          GivenName: 'Complete',
          FamilyName: 'User',
        };

        const mockResponse = {
          user: completeUser,
          form_configuration: null,
        };
        vi.mocked(mockClient.getUserById).mockResolvedValue(
          mockResponse as never
        );

        const result = await service.getUserById(userId, mockContext);

        expect(result).toEqual({
          data: completeUser,
          form_configuration: null,
        });
      });

      it('should handle response without form_configuration field', async () => {
        const userId = 'provider|123e4567-e89b-12d3-a456-426614174000';

        const mockResponse = {
          user: mockTrpcUser,
        } as never;
        vi.mocked(mockClient.getUserById).mockResolvedValue(mockResponse);

        const result = await service.getUserById(userId, mockContext);

        expect(result).toEqual({
          data: mockTrpcUser,
          form_configuration: null,
        });
      });
    });

    describe('unhappy path', () => {
      it('should throw error when client fails with non "not found" error', async () => {
        const userId = 'provider|123e4567-e89b-12d3-a456-426614174000';
        const clientError = new Error('Database connection failed');

        vi.mocked(mockClient.getUserById).mockRejectedValue(clientError);

        await expect(service.getUserById(userId, mockContext)).rejects.toThrow(
          'Database connection failed'
        );
      });

      it('should handle non-Error objects thrown by client', async () => {
        const userId = 'provider|123e4567-e89b-12d3-a456-426614174000';

        vi.mocked(mockClient.getUserById).mockRejectedValue('string error');

        await expect(service.getUserById(userId, mockContext)).rejects.toThrow(
          'string error'
        );
      });

      it('should throw error for invalid user ID format', async () => {
        const invalidUserId = 'not-a-valid-user-id';
        const validationError = new Error('Invalid user ID format');

        vi.mocked(mockClient.getUserById).mockRejectedValue(validationError);

        await expect(
          service.getUserById(invalidUserId, mockContext)
        ).rejects.toThrow('Invalid user ID format');
      });

      it('should handle authorization errors', async () => {
        const userId = 'provider|123e4567-e89b-12d3-a456-426614174000';
        const authError = new Error('Unauthorized access');

        vi.mocked(mockClient.getUserById).mockRejectedValue(authError);

        await expect(service.getUserById(userId, mockContext)).rejects.toThrow(
          'Unauthorized access'
        );
      });

      it('should handle network timeout errors', async () => {
        const userId = 'provider|123e4567-e89b-12d3-a456-426614174000';
        const timeoutError = new Error('Request timeout');

        vi.mocked(mockClient.getUserById).mockRejectedValue(timeoutError);

        await expect(service.getUserById(userId, mockContext)).rejects.toThrow(
          'Request timeout'
        );
      });
    });
  });

  describe('getUsers', () => {
    const mockUserItem = {
      Id: 'provider|123e4567-e89b-12d3-a456-426614174000',
      Email: 'test.user@example.com',
      Name: 'Test User',
      GivenName: 'Test',
      FamilyName: 'User',
      ModifiedByUser: 'provider|admin1',
      ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
      CreatedByUser: 'provider|admin1',
      CreatedAtTimestamp: '2024-01-01T00:00:00Z',
    } as unknown as UsersListQueryResponse['user'][number];

    const mockPageMetadata = {
      nextId: null,
      prevId: null,
      hasNext: false,
      hasPrev: false,
      count: 1,
    };

    const baseQuery: IdDateTimeQueryOpts = {
      limit: 10,
      afterId: null,
      afterDateTime: null,
      beforeId: null,
      beforeDateTime: null,
    };

    describe('happy path', () => {
      it('should fetch and return a list of users', async () => {
        const mockListResponse = {
          user: [mockUserItem],
          pageMetadata: mockPageMetadata,
        } as unknown as UsersListQueryResponse;

        vi.mocked(mockClient.queryUserList).mockResolvedValue(mockListResponse);

        const result = await service.getUsers(baseQuery, mockContext);

        expect(mockClient.queryUserList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          {
            limit: 10,
            afterId: null,
            afterDateTime: null,
            beforeId: null,
            beforeDateTime: null,
          }
        );
        expect(result).toEqual({
          data: [mockUserItem],
          metadata: mockPageMetadata,
        });
      });

      it('should return an empty list when no users exist', async () => {
        const emptyResponse = {
          user: [],
          pageMetadata: { ...mockPageMetadata, count: 0 },
        } as unknown as UsersListQueryResponse;

        vi.mocked(mockClient.queryUserList).mockResolvedValue(emptyResponse);

        const result = await service.getUsers(baseQuery, mockContext);

        expect(result).toEqual({
          data: [],
          metadata: { ...mockPageMetadata, count: 0 },
        });
      });

      it('should return multiple users in the data array', async () => {
        const secondUser = {
          ...mockUserItem,
          Id: 'provider|second-user-id',
          Email: 'second@example.com',
        } as unknown as UsersListQueryResponse['user'][number];

        const mockListResponse = {
          user: [mockUserItem, secondUser],
          pageMetadata: { ...mockPageMetadata, count: 2 },
        } as unknown as UsersListQueryResponse;

        vi.mocked(mockClient.queryUserList).mockResolvedValue(mockListResponse);

        const result = await service.getUsers(baseQuery, mockContext);

        expect(result.data).toHaveLength(2);
        expect(result.data).toEqual([mockUserItem, secondUser]);
      });

      it('should include id filter when filters.ids has values', async () => {
        const ids = ['provider|abc123', 'provider|def456'];
        const queryWithFilter: IdDateTimeQueryOpts = {
          ...baseQuery,
          filters: { ids },
        };
        const mockListResponse = {
          user: [mockUserItem],
          pageMetadata: mockPageMetadata,
        } as unknown as UsersListQueryResponse;

        vi.mocked(mockClient.queryUserList).mockResolvedValue(mockListResponse);

        await service.getUsers(queryWithFilter, mockContext);

        expect(mockClient.queryUserList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          {
            limit: 10,
            afterId: null,
            afterDateTime: null,
            beforeId: null,
            beforeDateTime: null,
            filter: { Id: ids },
          }
        );
      });

      it.each<[string, IdDateTimeQueryOpts['filters']]>([
        ['filters is undefined', undefined],
        ['filters.ids is undefined', {}],
        ['filters.ids is an empty array', { ids: [] }],
      ])('should omit filter from client call when %s', async (_, filters) => {
        const mockListResponse = {
          user: [mockUserItem],
          pageMetadata: mockPageMetadata,
        } as unknown as UsersListQueryResponse;

        vi.mocked(mockClient.queryUserList).mockResolvedValue(mockListResponse);

        await service.getUsers({ ...baseQuery, filters }, mockContext);

        const callArgs = vi.mocked(mockClient.queryUserList).mock.calls[0]?.[1];
        expect(callArgs).not.toHaveProperty('filter');
      });

      it('should forward all pagination parameters to the client', async () => {
        const paginatedQuery: IdDateTimeQueryOpts = {
          limit: 5,
          afterId: 'uuid-after',
          afterDateTime: '2024-06-01T00:00:00Z',
          beforeId: 'uuid-before',
          beforeDateTime: '2024-07-01T00:00:00Z',
        };
        const mockListResponse = {
          user: [mockUserItem],
          pageMetadata: {
            ...mockPageMetadata,
            hasNext: true,
            nextId: 'uuid-next',
          },
        } as unknown as UsersListQueryResponse;

        vi.mocked(mockClient.queryUserList).mockResolvedValue(mockListResponse);

        const result = await service.getUsers(paginatedQuery, mockContext);

        expect(mockClient.queryUserList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          {
            limit: 5,
            afterId: 'uuid-after',
            afterDateTime: '2024-06-01T00:00:00Z',
            beforeId: 'uuid-before',
            beforeDateTime: '2024-07-01T00:00:00Z',
          }
        );
        expect(result.metadata).toEqual({
          ...mockPageMetadata,
          hasNext: true,
          nextId: 'uuid-next',
        });
      });
    });

    describe('unhappy path', () => {
      it.each([
        ['database connection error', new Error('Database connection failed')],
        ['authorization error', new Error('Unauthorized access')],
        ['network timeout', new Error('Request timeout')],
      ])('should propagate %s from client', async (_, error) => {
        vi.mocked(mockClient.queryUserList).mockRejectedValue(error);

        await expect(service.getUsers(baseQuery, mockContext)).rejects.toThrow(
          error.message
        );
      });

      it('should propagate non-Error objects thrown by client', async () => {
        vi.mocked(mockClient.queryUserList).mockRejectedValue('string error');

        await expect(service.getUsers(baseQuery, mockContext)).rejects.toThrow(
          'string error'
        );
      });
    });
  });

  describe('validateUserIds', () => {
    const ownerId1 = 'provider|111e1111-e89b-12d3-a456-426614174001';
    const ownerId2 = 'provider|222e2222-e89b-12d3-a456-426614174002';

    const buildOwnerUser = (
      id: string
    ): UsersListQueryResponse['user'][number] =>
      ({
        Id: id,
        Email: `user-${id}@example.com`,
        Name: 'Owner User',
        GivenName: 'Owner',
        FamilyName: 'User',
        ModifiedByUser: 'provider|admin1',
        ModifiedAtTimestamp: '2024-01-01T00:00:00Z',
        CreatedByUser: 'provider|admin1',
        CreatedAtTimestamp: '2024-01-01T00:00:00Z',
      }) as unknown as UsersListQueryResponse['user'][number];

    const buildListResponse = (
      users: UsersListQueryResponse['user']
    ): UsersListQueryResponse =>
      ({
        user: users,
        pageMetadata: {
          nextId: null,
          prevId: null,
          hasNext: false,
          hasPrev: false,
          count: users.length,
        },
      }) as unknown as UsersListQueryResponse;

    describe('happy path', () => {
      it('should return the found owner IDs when all owners exist', async () => {
        const ownerIds = [ownerId1, ownerId2];

        vi.mocked(mockClient.queryUserList).mockResolvedValue(
          buildListResponse([
            buildOwnerUser(ownerId1),
            buildOwnerUser(ownerId2),
          ])
        );

        const result = await service.validateUserIds(
          ownerIds,
          mockMutateContext
        );

        expect(result).toEqual([ownerId1, ownerId2]);
      });

      it('should call queryUserList with the owner ids as a filter', async () => {
        const ownerIds = [ownerId1, ownerId2];

        vi.mocked(mockClient.queryUserList).mockResolvedValue(
          buildListResponse([
            buildOwnerUser(ownerId1),
            buildOwnerUser(ownerId2),
          ])
        );

        await service.validateUserIds(ownerIds, mockMutateContext);

        expect(mockClient.queryUserList).toHaveBeenCalledWith(
          { authorization: 'Bearer test-token' },
          {
            limit: ownerIds.length,
            afterId: null,
            afterDateTime: null,
            beforeId: null,
            beforeDateTime: null,
            filter: { Id: ownerIds },
          }
        );
      });

      it('should set limit equal to the number of requested owner ids', async () => {
        const ownerIds = [ownerId1, ownerId2];

        vi.mocked(mockClient.queryUserList).mockResolvedValue(
          buildListResponse([
            buildOwnerUser(ownerId1),
            buildOwnerUser(ownerId2),
          ])
        );

        await service.validateUserIds(ownerIds, mockMutateContext);

        expect(mockClient.queryUserList).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ limit: 2 })
        );
      });

      it('should deduplicate owner IDs before querying', async () => {
        vi.mocked(mockClient.queryUserList).mockResolvedValue(
          buildListResponse([buildOwnerUser(ownerId1)])
        );

        const result = await service.validateUserIds(
          [ownerId1, ownerId1],
          mockMutateContext
        );

        expect(mockClient.queryUserList).toHaveBeenCalledTimes(1);
        expect(mockClient.queryUserList).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ filter: { Id: [ownerId1] } })
        );
        expect(result).toEqual([ownerId1]);
      });

      it('should batch requests when there are more than 100 unique owner IDs', async () => {
        const ids = Array.from(
          { length: 101 },
          (_, i) => `provider|${i.toString().padStart(36, '0')}`
        );
        const users = ids.map(buildOwnerUser);

        vi.mocked(mockClient.queryUserList)
          .mockResolvedValueOnce(buildListResponse(users.slice(0, 100)))
          .mockResolvedValueOnce(buildListResponse(users.slice(100)));

        const result = await service.validateUserIds(ids, mockMutateContext);

        expect(mockClient.queryUserList).toHaveBeenCalledTimes(2);
        expect(result).toHaveLength(101);
      });

      it('should return a single owner ID when only one owner is provided', async () => {
        const ownerIds = [ownerId1];

        vi.mocked(mockClient.queryUserList).mockResolvedValue(
          buildListResponse([buildOwnerUser(ownerId1)])
        );

        const result = await service.validateUserIds(
          ownerIds,
          mockMutateContext
        );

        expect(result).toEqual([ownerId1]);
      });
    });

    describe('unhappy path', () => {
      it('should throw UserValidationError when ownerIds list is empty', async () => {
        await expect(
          service.validateUserIds([], mockMutateContext)
        ).rejects.toThrow(UserValidationError);

        await expect(
          service.validateUserIds([], mockMutateContext)
        ).rejects.toThrow(
          'Provided user ID list empty, at least one required.'
        );
      });

      it('should not call queryUserList when ownerIds is empty', async () => {
        await expect(
          service.validateUserIds([], mockMutateContext)
        ).rejects.toThrow(UserValidationError);

        expect(mockClient.queryUserList).not.toHaveBeenCalled();
      });

      it('should throw UserValidationError when none of the requested owners are found', async () => {
        const ownerIds = [ownerId1, ownerId2];

        vi.mocked(mockClient.queryUserList).mockResolvedValue(
          buildListResponse([])
        );

        await expect(
          service.validateUserIds(ownerIds, mockMutateContext)
        ).rejects.toThrow(UserValidationError);

        await expect(
          service.validateUserIds(ownerIds, mockMutateContext)
        ).rejects.toThrow(`Users with IDs ${ownerIds.join(', ')} not found`);
      });

      it('should throw UserValidationError listing only unmatched IDs when some owners are not found', async () => {
        const ownerIds = [ownerId1, ownerId2];

        vi.mocked(mockClient.queryUserList).mockResolvedValue(
          buildListResponse([buildOwnerUser(ownerId1)])
        );

        await expect(
          service.validateUserIds(ownerIds, mockMutateContext)
        ).rejects.toThrow(UserValidationError);

        await expect(
          service.validateUserIds(ownerIds, mockMutateContext)
        ).rejects.toThrow(`Users with IDs ${ownerId2} not found`);
      });

      it('should not include found owner IDs in the unmatched error message', async () => {
        const ownerIds = [ownerId1, ownerId2];

        vi.mocked(mockClient.queryUserList).mockResolvedValue(
          buildListResponse([buildOwnerUser(ownerId1)])
        );

        let caughtError: Error | undefined;
        try {
          await service.validateUserIds(ownerIds, mockMutateContext);
        } catch (e) {
          caughtError = e as Error;
        }
        expect(caughtError).toBeInstanceOf(UserValidationError);
        expect(caughtError?.message).not.toContain(ownerId1);
      });

      it('should detect missing IDs across multiple batches', async () => {
        const ids = Array.from(
          { length: 101 },
          (_, i) => `provider|${i.toString().padStart(36, '0')}`
        );
        const users = ids.slice(0, 100).map(buildOwnerUser);

        vi.mocked(mockClient.queryUserList)
          .mockResolvedValueOnce(buildListResponse(users))
          .mockResolvedValueOnce(buildListResponse([]));

        let caughtError: Error | undefined;
        try {
          await service.validateUserIds(ids, mockMutateContext);
        } catch (e) {
          caughtError = e as Error;
        }

        expect(caughtError).toBeInstanceOf(UserValidationError);
        expect(caughtError?.message).toContain(ids[100]);
      });

      it('should propagate client errors from the underlying user list query', async () => {
        const ownerIds = [ownerId1];
        const clientError = new Error('Database connection failed');

        vi.mocked(mockClient.queryUserList).mockRejectedValue(clientError);

        await expect(
          service.validateUserIds(ownerIds, mockMutateContext)
        ).rejects.toThrow('Database connection failed');
      });
    });
  });

  describe('service factory', () => {
    it('should create service with correct methods', () => {
      expect(service).toHaveProperty('getUserById');
      expect(service).toHaveProperty('getUsers');
      expect(service).toHaveProperty('validateUserIds');
      expect(typeof service.getUserById).toBe('function');
      expect(typeof service.getUsers).toBe('function');
      expect(typeof service.validateUserIds).toBe('function');
    });

    it('should create independent service instances', () => {
      const service1 = usersService(mockClient);
      const service2 = usersService(mockClient);

      expect(service1).not.toBe(service2);
      expect(service1.getUserById).not.toBe(service2.getUserById);
      expect(service1.getUsers).not.toBe(service2.getUsers);
      expect(service1.validateUserIds).not.toBe(service2.validateUserIds);
    });
  });
});
