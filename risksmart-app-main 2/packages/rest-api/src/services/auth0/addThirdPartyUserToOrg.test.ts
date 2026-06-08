import type { ManagementClient } from 'auth0';
import type { GetUsers200ResponseOneOfInner } from 'auth0/dist/cjs/management/__generated/models';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  addThirdPartyUserToOrg,
  type AddToOrgRequest,
} from './addThirdPartyUserToOrg';

vi.mock('../../adminGraphqlClient', () => ({
  getHasuraAdminClient: vi.fn(),
}));

vi.mock('../user/userService', () => ({
  insertAuthUser: vi.fn(),
}));

vi.mock('../../logger', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

import { getHasuraAdminClient } from '../../adminGraphqlClient';
import { insertAuthUser } from '../user/userService';

const mockGetHasuraAdminClient = vi.mocked(getHasuraAdminClient);
const mockInsertAuthUser = vi.mocked(insertAuthUser);

describe('addThirdPartyUserToOrg', () => {
  const mockRequest: AddToOrgRequest = {
    orgId: 'org_123',
    tenant: 'test-tenant',
    questionnaireInviteId: 'invite_123',
    connection: 'Username-Password-ThirdParty',
    clientId: 'client_123',
    send_email: true,
    inviter: { name: 'Test Inviter' },
    invitee: { email: 'test@example.com' },
  };

  const mockThirdPartyUser = {
    user_id: 'auth0|tp_123',
    email: 'test@example.com',
    email_verified: true,
    last_login: '2025-06-01T12:00:00.000Z',
  } as GetUsers200ResponseOneOfInner;

  const mockAppUser = {
    user_id: 'auth0|app_456',
    email: 'test@example.com',
    email_verified: true,
  } as GetUsers200ResponseOneOfInner;

  const mockNewUser = {
    user_id: 'auth0|new_789',
    email: 'test@example.com',
    email_verified: true,
  } as GetUsers200ResponseOneOfInner;

  const mockAuth0Client = {
    users: {
      getAll: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      getUserOrganizations: vi.fn(),
    },
    organizations: { addMembers: vi.fn() },
    clients: { get: vi.fn() },
    tickets: { changePassword: vi.fn() },
  } as unknown as ManagementClient;

  const mockHasuraClient = { query: vi.fn(), mutate: vi.fn() };

  /** Sets up getAll to return the given third-party and app user results */
  const mockUserSearch = (
    thirdPartyUsers: GetUsers200ResponseOneOfInner[],
    appUsers: GetUsers200ResponseOneOfInner[] = []
  ) => {
    const mock = vi.mocked(mockAuth0Client.users.getAll);
    mock.mockResolvedValueOnce({
      status: 200,
      data: thirdPartyUsers,
    } as never);
    // Only queued if the first search finds no match
    if (thirdPartyUsers.length === 0) {
      mock.mockResolvedValueOnce({
        status: 200,
        data: appUsers,
      } as never);
    }
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockGetHasuraAdminClient.mockReturnValue(mockHasuraClient as never);
    mockInsertAuthUser.mockResolvedValue('user_id_123');

    vi.mocked(mockAuth0Client.users.get).mockResolvedValue({
      status: 200,
      data: { app_metadata: {} },
    } as never);
    vi.mocked(mockAuth0Client.users.update).mockResolvedValue({
      status: 200,
      data: {},
    } as never);
    vi.mocked(mockAuth0Client.clients.get).mockResolvedValue({
      status: 200,
      data: { initiate_login_uri: 'https://app.example.com/login' },
    } as never);
    vi.mocked(mockAuth0Client.users.getUserOrganizations).mockResolvedValue({
      status: 200,
      data: [],
    } as never);
    vi.mocked(mockAuth0Client.organizations.addMembers).mockResolvedValue({
      status: 204,
    } as never);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('when third-party user already exists', () => {
    beforeEach(() => {
      mockUserSearch([mockThirdPartyUser]);
    });

    it('should reuse existing user without creating new one', async () => {
      const result = await addThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(mockAuth0Client.users.create).not.toHaveBeenCalled();
      expect(result.newUser).toBe(false);
      expect(result.userId).toBe('auth0|tp_123');
    });

    it('should not generate change password ticket', async () => {
      const result = await addThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(mockAuth0Client.tickets.changePassword).not.toHaveBeenCalled();
      expect(result.changePasswordUrl).toBeUndefined();
    });

    it('should set third_party_tenants in app_metadata', async () => {
      vi.mocked(mockAuth0Client.users.get).mockResolvedValue({
        status: 200,
        data: { app_metadata: { existing_key: 'value' } },
      } as never);

      await addThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(mockAuth0Client.users.update).toHaveBeenCalledWith(
        { id: 'auth0|tp_123' },
        {
          app_metadata: {
            existing_key: 'value',
            third_party_tenants: ['test-tenant'],
          },
        }
      );
    });

    it('should accumulate tenants in third_party_tenants array', async () => {
      vi.mocked(mockAuth0Client.users.get).mockResolvedValue({
        status: 200,
        data: {
          app_metadata: {
            third_party_tenants: ['other-tenant'],
          },
        },
      } as never);

      await addThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(mockAuth0Client.users.update).toHaveBeenCalledWith(
        { id: 'auth0|tp_123' },
        {
          app_metadata: {
            third_party_tenants: ['other-tenant', 'test-tenant'],
          },
        }
      );
    });

    it('should deduplicate tenants when same tenant is added again', async () => {
      vi.mocked(mockAuth0Client.users.get).mockResolvedValue({
        status: 200,
        data: {
          app_metadata: {
            third_party_tenants: ['test-tenant'],
          },
        },
      } as never);

      await addThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(mockAuth0Client.users.update).toHaveBeenCalledWith(
        { id: 'auth0|tp_123' },
        {
          app_metadata: {
            third_party_tenants: ['test-tenant'],
          },
        }
      );
    });
  });

  describe('when app user already exists', () => {
    beforeEach(() => {
      mockUserSearch([], [mockAppUser]);
      vi.mocked(mockAuth0Client.users.create).mockResolvedValue({
        status: 201,
        data: mockNewUser,
      } as never);
      vi.mocked(mockAuth0Client.tickets.changePassword).mockResolvedValue({
        status: 200,
        data: { ticket: 'https://auth0.com/change-password-ticket' },
      } as never);
    });

    it('should create a new third-party user', async () => {
      const result = await addThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(mockAuth0Client.users.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          connection: 'Username-Password-ThirdParty',
        })
      );
      expect(result.newUser).toBe(true);
      expect(result.userId).toBe('auth0|new_789');
    });

    it('should generate change password ticket for new third-party user', async () => {
      const result = await addThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(mockAuth0Client.tickets.changePassword).toHaveBeenCalledWith({
        user_id: 'auth0|new_789',
        result_url: 'https://app.example.com/login',
        mark_email_as_verified: true,
      });
      expect(result.changePasswordUrl).toBe(
        'https://auth0.com/change-password-ticket'
      );
    });

    it('should set third_party_orgs on the app user as defense-in-depth', async () => {
      // First get: app user metadata (for third_party_orgs marking)
      // Second get: new TP user metadata (for setUserTenant)
      vi.mocked(mockAuth0Client.users.get)
        .mockResolvedValueOnce({
          status: 200,
          data: { app_metadata: { existing_key: 'value' } },
        } as never)
        .mockResolvedValueOnce({
          status: 200,
          data: { app_metadata: {} },
        } as never);

      await addThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(mockAuth0Client.users.update).toHaveBeenCalledWith(
        { id: 'auth0|app_456' },
        {
          app_metadata: {
            existing_key: 'value',
            third_party_orgs: { org_123: true },
          },
        }
      );
      expect(mockAuth0Client.users.update).toHaveBeenCalledWith(
        { id: 'auth0|new_789' },
        {
          app_metadata: {
            third_party_tenants: ['test-tenant'],
          },
        }
      );
    });
  });

  describe('when user does not exist', () => {
    beforeEach(() => {
      mockUserSearch([], []);
      vi.mocked(mockAuth0Client.users.create).mockResolvedValue({
        status: 201,
        data: mockNewUser,
      } as never);
      vi.mocked(mockAuth0Client.tickets.changePassword).mockResolvedValue({
        status: 200,
        data: { ticket: 'https://auth0.com/change-password-ticket' },
      } as never);
    });

    it('should create new user in Auth0', async () => {
      const result = await addThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(mockAuth0Client.users.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          connection: 'Username-Password-ThirdParty',
          verify_email: false,
          email_verified: true,
        })
      );
      expect(result.newUser).toBe(true);
    });

    it('should generate change password ticket for new user', async () => {
      const result = await addThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(mockAuth0Client.tickets.changePassword).toHaveBeenCalledWith({
        user_id: 'auth0|new_789',
        result_url: 'https://app.example.com/login',
        mark_email_as_verified: true,
      });
      expect(result.changePasswordUrl).toBe(
        'https://auth0.com/change-password-ticket'
      );
    });

    it('should throw error when user creation fails', async () => {
      vi.mocked(mockAuth0Client.users.create).mockResolvedValue({
        status: 500,
        data: {},
      } as never);

      await expect(
        addThirdPartyUserToOrg(mockAuth0Client, mockRequest)
      ).rejects.toThrow('Error creating user in Auth0');
    });

    it('should throw error when created user has no email', async () => {
      vi.mocked(mockAuth0Client.users.create).mockResolvedValue({
        status: 201,
        data: { user_id: 'auth0|new_789' },
      } as never);

      await expect(
        addThirdPartyUserToOrg(mockAuth0Client, mockRequest)
      ).rejects.toThrow('Error creating user in Auth0');
    });
  });

  describe('user insertion into Hasura', () => {
    beforeEach(() => {
      mockUserSearch([mockThirdPartyUser]);
    });

    it('should insert user into Hasura with correct parameters', async () => {
      await addThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(mockInsertAuthUser).toHaveBeenCalledWith(mockHasuraClient, {
        UserId: 'auth0|tp_123',
        Email: 'test@example.com',
        UserName: 'test',
        CreatedByUser: 'SYSTEM',
        OrgKey: 'org_123',
        AuthConnection: 'Username-Password-ThirdParty',
      });
    });

    it('should handle uniqueness violation by looking up existing user', async () => {
      mockInsertAuthUser.mockRejectedValueOnce(
        new Error('Uniqueness violation')
      );
      mockHasuraClient.query.mockResolvedValueOnce({
        data: { user: [{ Id: 'existing_user_id' }] },
      });

      const result = await addThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(result.userId).toBe('existing_user_id');
    });

    it('should rethrow non-uniqueness errors', async () => {
      mockInsertAuthUser.mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      await expect(
        addThirdPartyUserToOrg(mockAuth0Client, mockRequest)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('organization membership', () => {
    beforeEach(() => {
      mockUserSearch([mockThirdPartyUser]);
    });

    it('should add user to org when not already a member', async () => {
      const result = await addThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(mockAuth0Client.organizations.addMembers).toHaveBeenCalledWith(
        { id: 'org_123' },
        { members: ['auth0|tp_123'] }
      );
      expect(result.newMember).toBe(true);
    });

    it('should not add user to org when already a member', async () => {
      vi.mocked(mockAuth0Client.users.getUserOrganizations).mockResolvedValue({
        status: 200,
        data: [{ id: 'org_123', name: 'Test Org' }],
      } as never);

      const result = await addThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(mockAuth0Client.organizations.addMembers).not.toHaveBeenCalled();
      expect(result.newMember).toBe(false);
    });

    it('should throw error when adding user to org fails', async () => {
      vi.mocked(mockAuth0Client.organizations.addMembers).mockResolvedValue({
        status: 500,
      } as never);

      await expect(
        addThirdPartyUserToOrg(mockAuth0Client, mockRequest)
      ).rejects.toThrow('Error adding user to org from Auth0');
    });
  });

  describe('return values', () => {
    it('should return correct structure for new user', async () => {
      mockUserSearch([], []);
      vi.mocked(mockAuth0Client.users.create).mockResolvedValue({
        status: 201,
        data: mockNewUser,
      } as never);
      vi.mocked(mockAuth0Client.tickets.changePassword).mockResolvedValue({
        status: 200,
        data: { ticket: 'https://auth0.com/change-password-ticket' },
      } as never);

      const result = await addThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(result).toEqual({
        userId: 'auth0|new_789',
        changePasswordUrl: 'https://auth0.com/change-password-ticket',
        loginUrl: 'https://app.example.com/login',
        newUser: true,
        newMember: true,
        lastLogin: undefined,
      });
    });

    it('should return correct structure for existing user', async () => {
      mockUserSearch([mockThirdPartyUser]);
      vi.mocked(mockAuth0Client.users.getUserOrganizations).mockResolvedValue({
        status: 200,
        data: [{ id: 'org_123', name: 'Test Org' }],
      } as never);

      const result = await addThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(result).toEqual({
        userId: 'auth0|tp_123',
        changePasswordUrl: undefined,
        loginUrl: 'https://app.example.com/login',
        newUser: false,
        newMember: false,
        lastLogin: '2025-06-01T12:00:00.000Z',
      });
    });
  });
});
