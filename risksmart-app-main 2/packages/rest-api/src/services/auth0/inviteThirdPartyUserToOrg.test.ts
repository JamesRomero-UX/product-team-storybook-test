import type { ManagementClient } from 'auth0';
import type { GetUsers200ResponseOneOfInner } from 'auth0/dist/cjs/management/__generated/models';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  inviteThirdPartyUserToOrg,
  type InviteToOrgRequest,
} from './inviteThirdPartyUserToOrg';

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

describe('inviteThirdPartyUserToOrg', () => {
  const mockRequest: InviteToOrgRequest = {
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
    logins_count: 3,
  } as GetUsers200ResponseOneOfInner;

  const mockThirdPartyUserNeverLoggedIn = {
    user_id: 'auth0|tp_123',
    email: 'test@example.com',
    email_verified: true,
    logins_count: 0,
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
    organizations: { createInvitation: vi.fn() },
    clients: { get: vi.fn() },
    tickets: { changePassword: vi.fn() },
  } as unknown as ManagementClient;

  const mockHasuraClient = { query: vi.fn(), mutate: vi.fn() };

  const mockUserSearch = (
    thirdPartyUsers: GetUsers200ResponseOneOfInner[],
    appUsers: GetUsers200ResponseOneOfInner[] = []
  ) => {
    const mock = vi.mocked(mockAuth0Client.users.getAll);
    mock.mockResolvedValueOnce({
      status: 200,
      data: thirdPartyUsers,
    } as never);
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
    vi.mocked(mockAuth0Client.organizations.createInvitation).mockResolvedValue(
      {
        status: 201,
        data: { invitation_url: 'https://auth0.com/invite-url' },
      } as never
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('when third-party user already exists', () => {
    beforeEach(() => {
      mockUserSearch([mockThirdPartyUser]);
    });

    it('should reuse existing user without creating new one', async () => {
      const result = await inviteThirdPartyUserToOrg(
        mockAuth0Client,
        mockRequest
      );

      expect(mockAuth0Client.users.create).not.toHaveBeenCalled();
      expect(result.newUser).toBe(false);
      expect(result.userId).toBe('auth0|tp_123');
    });

    it('should not generate change password ticket', async () => {
      const result = await inviteThirdPartyUserToOrg(
        mockAuth0Client,
        mockRequest
      );

      expect(mockAuth0Client.tickets.changePassword).not.toHaveBeenCalled();
      expect(result.changePasswordUrl).toBeUndefined();
    });
  });

  describe('when third-party user exists but has never logged in', () => {
    beforeEach(() => {
      mockUserSearch([mockThirdPartyUserNeverLoggedIn]);
      vi.mocked(mockAuth0Client.tickets.changePassword).mockResolvedValue({
        status: 200,
        data: { ticket: 'https://auth0.com/change-password-ticket' },
      } as never);
    });

    it('should reuse existing user without creating new one', async () => {
      const result = await inviteThirdPartyUserToOrg(
        mockAuth0Client,
        mockRequest
      );

      expect(mockAuth0Client.users.create).not.toHaveBeenCalled();
      expect(result.userId).toBe('auth0|tp_123');
    });

    it('should generate a new password reset ticket', async () => {
      const result = await inviteThirdPartyUserToOrg(
        mockAuth0Client,
        mockRequest
      );

      expect(mockAuth0Client.tickets.changePassword).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'auth0|tp_123',
        })
      );
      expect(result.changePasswordUrl).toBe(
        'https://auth0.com/change-password-ticket'
      );
    });

    it('should suppress Auth0 invitation email', async () => {
      await inviteThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(
        mockAuth0Client.organizations.createInvitation
      ).toHaveBeenCalledWith(
        { id: 'org_123' },
        expect.objectContaining({
          send_invitation_email: false,
        })
      );
    });

    it('should return newUser as true so caller sends password reset notification', async () => {
      const result = await inviteThirdPartyUserToOrg(
        mockAuth0Client,
        mockRequest
      );

      expect(result.newUser).toBe(true);
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
      const result = await inviteThirdPartyUserToOrg(
        mockAuth0Client,
        mockRequest
      );

      expect(mockAuth0Client.users.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          connection: 'Username-Password-ThirdParty',
        })
      );
      expect(result.newUser).toBe(true);
      expect(result.userId).toBe('auth0|new_789');
    });

    it('should send invitation email for existing app user', async () => {
      await inviteThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(
        mockAuth0Client.organizations.createInvitation
      ).toHaveBeenCalledWith(
        { id: 'org_123' },
        expect.objectContaining({
          send_invitation_email: true,
        })
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

    it('should create new user and generate password reset ticket', async () => {
      const result = await inviteThirdPartyUserToOrg(
        mockAuth0Client,
        mockRequest
      );

      expect(result.newUser).toBe(true);
      expect(result.changePasswordUrl).toBe(
        'https://auth0.com/change-password-ticket'
      );
    });

    it('should not send invitation email for brand new user', async () => {
      await inviteThirdPartyUserToOrg(mockAuth0Client, mockRequest);

      expect(
        mockAuth0Client.organizations.createInvitation
      ).toHaveBeenCalledWith(
        { id: 'org_123' },
        expect.objectContaining({
          send_invitation_email: false,
        })
      );
    });

    it('should set third_party_tenants in app_metadata', async () => {
      await inviteThirdPartyUserToOrg(mockAuth0Client, mockRequest);

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

  describe('organization membership', () => {
    beforeEach(() => {
      mockUserSearch([mockThirdPartyUser]);
    });

    it('should create invitation when not already a member', async () => {
      const result = await inviteThirdPartyUserToOrg(
        mockAuth0Client,
        mockRequest
      );

      expect(
        mockAuth0Client.organizations.createInvitation
      ).toHaveBeenCalledWith(
        { id: 'org_123' },
        expect.objectContaining({
          invitee: { email: 'test@example.com' },
          client_id: 'client_123',
        })
      );
      expect(result.newMember).toBe(true);
    });

    it('should use login URL when already a member', async () => {
      vi.mocked(mockAuth0Client.users.getUserOrganizations).mockResolvedValue({
        status: 200,
        data: [{ id: 'org_123', name: 'Test Org' }],
      } as never);

      const result = await inviteThirdPartyUserToOrg(
        mockAuth0Client,
        mockRequest
      );

      expect(
        mockAuth0Client.organizations.createInvitation
      ).not.toHaveBeenCalled();
      expect(result.invitationUrl).toBe('https://app.example.com/login');
      expect(result.newMember).toBe(false);
    });
  });
});
