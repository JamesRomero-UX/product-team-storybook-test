import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getEnv } from 'src/environment';
import { auth0Service } from 'src/services/auth0';
import { getAuth0ManagementClient } from 'src/services/auth0/getAuth0ManagementClient';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { stub } from 'src/testing/stub';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { handler } from './patch';

vi.mock('src/logger', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    appendKeys: vi.fn(),
  }),
}));

vi.mock('src/environment', () => ({
  getEnv: vi.fn(),
}));

vi.mock('src/backendGraphqlClient', () => ({
  getHasuraBackendClientForAction: vi.fn(),
}));

vi.mock('src/services/role-access/roleAccessService', () => ({
  hasPermission: vi.fn(),
}));

vi.mock('src/services/auth0/getAuth0ManagementClient', () => ({
  getAuth0ManagementClient: vi.fn(),
}));

vi.mock('src/services/auth0', () => ({
  auth0Service: {
    removeUsersFromOrg: vi.fn(),
  },
}));

describe('patch handler (revoke third party contact access)', () => {
  const mockContactId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId = 'user-123';
  const mockOrgKey = 'org_test123';
  const mockAuth0UserId = 'auth0|user_456';
  const mockEmail = 'contact@example.com';
  const mockConnectionName = 'Username-Password-ThirdParty';

  const hasuraClient = mock<ApolloClient<NormalizedCacheObject>>();

  const mockUsersGetAll = vi.fn();
  const mockUsersGet = vi.fn();
  const mockUsersUpdate = vi.fn();
  const mockAuth0Client = {
    users: {
      getAll: mockUsersGetAll,
      get: mockUsersGet,
      update: mockUsersUpdate,
    },
  };

  const createEvent = (input: object): APIGatewayProxyEventV2 =>
    stub<APIGatewayProxyEventV2>({
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: '',
        input,
        session_variables: {
          'x-hasura-tenant-name': 'MultiTenant',
          'x-hasura-user-id': mockUserId,
          'x-hasura-org-id': mockOrgKey,
        },
      }),
    });

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(getHasuraBackendClientForAction).mockReturnValue(hasuraClient);
    vi.mocked(hasPermission).mockResolvedValue(true);
    vi.mocked(getAuth0ManagementClient).mockReturnValue(
      mockAuth0Client as never
    );
    vi.mocked(getEnv).mockImplementation((key: string) => {
      if (key === 'AUTH0_THIRD_PARTY_CONNECTION_NAME') {
        return mockConnectionName;
      }

      return '';
    });

    // Default mock responses
    hasuraClient.query.mockResolvedValue({
      data: {
        third_party_contact_by_pk: {
          Id: mockContactId,
          Email: mockEmail,
          IsRevoked: false,
        },
      },
    } as never);

    hasuraClient.mutate.mockResolvedValue({
      data: {
        update_third_party_contact_by_pk: {
          Id: mockContactId,
          IsRevoked: true,
        },
      },
    } as never);

    mockUsersGetAll.mockResolvedValue({
      status: 200,
      data: [{ user_id: mockAuth0UserId, email: mockEmail }],
    });

    mockUsersGet.mockResolvedValue({
      status: 200,
      data: { app_metadata: {} },
    });

    mockUsersUpdate.mockResolvedValue({
      status: 200,
      data: {},
    });
  });

  describe('input validation', () => {
    it('should return 400 when ContactIds is missing', async () => {
      const event = createEvent({});

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(400);
    });

    it('should return 400 when ContactIds is empty', async () => {
      const event = createEvent({ ContactIds: [] });

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(400);
    });

    it('should return 400 when ContactIds contains invalid UUID', async () => {
      const event = createEvent({ ContactIds: ['not-a-uuid'] });

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(400);
    });
  });

  describe('permission validation', () => {
    it('should return 403 when user lacks update permission on third party', async () => {
      vi.mocked(hasPermission).mockResolvedValue(false);

      const event = createEvent({ ContactIds: [mockContactId] });

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(403);
      expect(JSON.parse(result.body as string).message).toBe('Access denied');
      expect(hasPermission).toHaveBeenCalledWith(hasuraClient, {
        userId: mockUserId,
        objectType: ParentTypeEnum.ThirdParty,
        accessType: AccessTypeEnum.Update,
      });
    });
  });

  describe('contact validation', () => {
    it('should return 404 when contact does not exist', async () => {
      hasuraClient.query.mockResolvedValue({
        data: {
          third_party_contact_by_pk: null,
        },
      } as never);

      const event = createEvent({ ContactIds: [mockContactId] });

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body as string).message).toBe(
        `Contact not found: ${mockContactId}`
      );
    });

    it('should return 200 with already revoked message when contact is already revoked', async () => {
      hasuraClient.query.mockResolvedValue({
        data: {
          third_party_contact_by_pk: {
            Id: mockContactId,
            Email: mockEmail,
            IsRevoked: true,
          },
        },
      } as never);

      const event = createEvent({ ContactIds: [mockContactId] });

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body as string)).toEqual({
        results: [
          {
            Id: mockContactId,
            IsRevoked: true,
            Message: 'Contact access was already revoked',
          },
        ],
      });
      // Should not call Auth0 or update mutation
      expect(mockUsersGetAll).not.toHaveBeenCalled();
      expect(hasuraClient.mutate).not.toHaveBeenCalled();
    });
  });

  describe('successful revocation', () => {
    it('should revoke access and return success response', async () => {
      const event = createEvent({ ContactIds: [mockContactId] });

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body as string)).toEqual({
        results: [
          {
            Id: mockContactId,
            IsRevoked: true,
            Message: 'Contact access has been revoked',
          },
        ],
      });
    });

    it('should call Auth0 to find user with correct connection filter', async () => {
      const event = createEvent({ ContactIds: [mockContactId] });

      await handler(event, stub<Context>({}));

      expect(mockUsersGetAll).toHaveBeenCalledWith({
        q: `email:"${mockEmail}" AND identities.connection:"Username\\-Password\\-ThirdParty"`,
        search_engine: 'v3',
      });
    });

    it('should remove users from Auth0 organization in a single call', async () => {
      const event = createEvent({ ContactIds: [mockContactId] });

      await handler(event, stub<Context>({}));

      expect(auth0Service.removeUsersFromOrg).toHaveBeenCalledWith({
        auth0Client: mockAuth0Client,
        userIds: [mockAuth0UserId],
        orgId: mockOrgKey,
      });
    });

    it('should update contact to set IsRevoked to true', async () => {
      const event = createEvent({ ContactIds: [mockContactId] });

      await handler(event, stub<Context>({}));

      expect(hasuraClient.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: { Id: mockContactId, IsRevoked: true },
        })
      );
    });

    it('should find app user via fallback search when third-party search returns no results', async () => {
      const mockAppUserId = 'auth0|app_user_999';

      // Phase 1: third-party connection search returns no results
      mockUsersGetAll
        .mockResolvedValueOnce({ status: 200, data: [] })
        // Phase 2: fallback NOT-connection search finds the app user
        .mockResolvedValueOnce({
          status: 200,
          data: [{ user_id: mockAppUserId, email: mockEmail }],
        });

      const event = createEvent({ ContactIds: [mockContactId] });

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(200);

      // Fallback search should use NOT connection filter
      expect(mockUsersGetAll).toHaveBeenCalledWith({
        q: `email:"${mockEmail}" AND NOT identities.connection:"Username\\-Password\\-ThirdParty"`,
        search_engine: 'v3',
      });

      // App user should be included in org removal
      expect(auth0Service.removeUsersFromOrg).toHaveBeenCalledWith({
        auth0Client: mockAuth0Client,
        userIds: [mockAppUserId],
        orgId: mockOrgKey,
      });
    });

    it('should skip Auth0 removal when no user found in Auth0', async () => {
      mockUsersGetAll.mockResolvedValue({
        status: 200,
        data: [],
      });

      const event = createEvent({ ContactIds: [mockContactId] });

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(200);
      expect(auth0Service.removeUsersFromOrg).not.toHaveBeenCalled();
      // Should still update the contact
      expect(hasuraClient.mutate).toHaveBeenCalled();
    });

    it('should skip Auth0 removal when multiple users found in Auth0 for same email', async () => {
      mockUsersGetAll.mockResolvedValue({
        status: 200,
        data: [
          { user_id: 'auth0|user_1', email: mockEmail },
          { user_id: 'auth0|user_2', email: mockEmail },
        ],
      });

      const event = createEvent({ ContactIds: [mockContactId] });

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(200);
      expect(auth0Service.removeUsersFromOrg).not.toHaveBeenCalled();
      expect(hasuraClient.mutate).toHaveBeenCalled();
    });

    it('should revoke multiple contacts in a single batch', async () => {
      const mockContactId2 = '223e4567-e89b-12d3-a456-426614174001';
      const mockAuth0UserId2 = 'auth0|user_789';
      const mockEmail2 = 'contact2@example.com';

      hasuraClient.query
        .mockResolvedValueOnce({
          data: {
            third_party_contact_by_pk: {
              Id: mockContactId,
              Email: mockEmail,
              IsRevoked: false,
            },
          },
        } as never)
        .mockResolvedValueOnce({
          data: {
            third_party_contact_by_pk: {
              Id: mockContactId2,
              Email: mockEmail2,
              IsRevoked: false,
            },
          },
        } as never);

      mockUsersGetAll
        .mockResolvedValueOnce({
          status: 200,
          data: [{ user_id: mockAuth0UserId, email: mockEmail }],
        })
        .mockResolvedValueOnce({
          status: 200,
          data: [{ user_id: mockAuth0UserId2, email: mockEmail2 }],
        });

      const event = createEvent({
        ContactIds: [mockContactId, mockContactId2],
      });

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body as string)).toEqual({
        results: [
          {
            Id: mockContactId,
            IsRevoked: true,
            Message: 'Contact access has been revoked',
          },
          {
            Id: mockContactId2,
            IsRevoked: true,
            Message: 'Contact access has been revoked',
          },
        ],
      });

      // Should call Auth0 removeUsersFromOrg with both user IDs
      expect(auth0Service.removeUsersFromOrg).toHaveBeenCalledTimes(1);
      expect(auth0Service.removeUsersFromOrg).toHaveBeenCalledWith({
        auth0Client: mockAuth0Client,
        userIds: [mockAuth0UserId, mockAuth0UserId2],
        orgId: mockOrgKey,
      });
    });

    it('should clean up third_party_orgs metadata on app user during revocation', async () => {
      const mockAppUserId = 'auth0|app_user_999';

      // Phase 1: third-party connection search returns no results
      mockUsersGetAll
        .mockResolvedValueOnce({ status: 200, data: [] })
        // Phase 2: fallback finds app user
        .mockResolvedValueOnce({
          status: 200,
          data: [{ user_id: mockAppUserId, email: mockEmail }],
        });

      // Phase 4: app user has third_party_orgs and other metadata
      mockUsersGet.mockResolvedValue({
        status: 200,
        data: {
          app_metadata: {
            tenant: 'some-tenant',
            third_party_orgs: {
              [mockOrgKey]: true,
              other_org: true,
            },
          },
        },
      });

      const event = createEvent({ ContactIds: [mockContactId] });

      await handler(event, stub<Context>({}));

      // Should preserve existing metadata and only remove this org from third_party_orgs
      expect(mockUsersUpdate).toHaveBeenCalledWith(
        { id: mockAppUserId },
        {
          app_metadata: {
            tenant: 'some-tenant',
            third_party_orgs: { other_org: true },
          },
        }
      );
    });
  });

  describe('Auth0 error handling', () => {
    it('should return 500 when Auth0 user lookup fails', async () => {
      mockUsersGetAll.mockRejectedValue(new Error('Auth0 API error'));

      const event = createEvent({ ContactIds: [mockContactId] });

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body as string).message).toBe(
        `Failed to find Auth0 user for contact: ${mockContactId}`
      );
    });

    it('should return 500 when Auth0 remove from org fails', async () => {
      vi.mocked(auth0Service.removeUsersFromOrg).mockRejectedValue(
        new Error('Auth0 org error')
      );

      const event = createEvent({ ContactIds: [mockContactId] });

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body as string).message).toBe(
        'Failed to revoke contact access in Auth0'
      );
    });
  });

  describe('database update failure', () => {
    it('should throw error when contact update fails', async () => {
      hasuraClient.mutate.mockResolvedValue({
        data: {
          update_third_party_contact_by_pk: null,
        },
      } as never);

      const event = createEvent({ ContactIds: [mockContactId] });

      await expect(handler(event, stub<Context>({}))).rejects.toThrow(
        `Failed to update contact: ${mockContactId}`
      );
    });
  });
});
