import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import {
  GetThirdPartyContactPasswordSetByUserIdDocument,
  InsertThirdPartyContactDocument,
} from 'generated/graphql';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getEnv } from 'src/environment';
import { auth0Service } from 'src/services/auth0';
import { getAuth0ManagementClient } from 'src/services/auth0/getAuth0ManagementClient';
import { getOrgDetails } from 'src/services/orgUtilities';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { stub } from 'src/testing/stub';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { handler } from './post';

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

vi.mock('src/adminGraphqlClient', () => ({
  getHasuraAdminClient: vi.fn(),
}));

vi.mock('src/services/role-access/roleAccessService', () => ({
  hasPermission: vi.fn(),
}));

vi.mock('src/services/auth0/getAuth0ManagementClient', () => ({
  getAuth0ManagementClient: vi.fn(),
}));

vi.mock('src/services/auth0', () => ({
  auth0Service: {
    addThirdPartyUserToOrg: vi.fn(),
  },
}));

vi.mock('src/services/orgUtilities', () => ({
  getOrgDetails: vi.fn(),
}));

vi.mock('../notifications/thirdPartySetPasswordNotifier', () => ({
  handler: vi.fn(),
}));

describe('post handler (create third party contact)', () => {
  const mockThirdPartyId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId = 'user-123';
  const mockOrgKey = 'org_test123';
  const mockTenant = 'MultiTenant';
  const mockEmail = 'contact@example.com';
  const mockContactId = '223e4567-e89b-12d3-a456-426614174001';
  const mockAuth0UserId = 'auth0|existing_user';
  const mockConnectionName = 'Username-Password-ThirdParty';
  const mockClientId = 'client-id-123';

  const hasuraClient = mock<ApolloClient<NormalizedCacheObject>>();
  const adminClient = mock<ApolloClient<NormalizedCacheObject>>();

  const createEvent = (input: object): APIGatewayProxyEventV2 =>
    stub<APIGatewayProxyEventV2>({
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: '',
        input,
        session_variables: {
          'x-hasura-tenant-name': mockTenant,
          'x-hasura-user-id': mockUserId,
          'x-hasura-org-id': mockOrgKey,
        },
      }),
    });

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(getHasuraBackendClientForAction).mockReturnValue(hasuraClient);
    vi.mocked(getHasuraAdminClient).mockReturnValue(adminClient);
    vi.mocked(hasPermission).mockResolvedValue(true);
    vi.mocked(getAuth0ManagementClient).mockReturnValue({} as never);
    vi.mocked(getEnv).mockImplementation((key: string) => {
      if (key === 'AUTH0_THIRD_PARTY_CONNECTION_NAME') {
        return mockConnectionName;
      }
      if (key === 'AUTH0_THIRD_PARTY_CLIENT_ID') {
        return mockClientId;
      }

      return '';
    });
    vi.mocked(getOrgDetails).mockResolvedValue({
      OrgName: 'Test Org',
    } as never);
  });

  const setupAuth0ExistingUser = (
    passwordTimestamp: string | null,
    lastLogin?: string
  ) => {
    vi.mocked(auth0Service.addThirdPartyUserToOrg).mockResolvedValue({
      userId: mockAuth0UserId,
      changePasswordUrl: '',
      loginUrl: 'https://app.example.com/login',
      newUser: false,
      newMember: false,
      lastLogin,
    } as never);

    adminClient.query.mockResolvedValue({
      data: {
        third_party_contact: passwordTimestamp
          ? [{ PasswordSetAtTimestamp: passwordTimestamp }]
          : [],
      },
    } as never);

    hasuraClient.mutate.mockResolvedValue({
      data: {
        insert_third_party_contact_one: {
          Id: mockContactId,
          ThirdPartyId: mockThirdPartyId,
          Email: mockEmail,
          Name: null,
          JobTitle: null,
          IsRevoked: false,
          UserId: mockAuth0UserId,
          CreatedAtTimestamp: new Date().toISOString(),
        },
      },
    } as never);
  };

  describe('existing user with PasswordSetAtTimestamp', () => {
    const existingTimestamp = '2025-01-15T10:30:00.000Z';

    beforeEach(() => {
      setupAuth0ExistingUser(existingTimestamp);
    });

    it('should query admin client for existing PasswordSetAtTimestamp', async () => {
      const event = createEvent({
        ThirdPartyId: mockThirdPartyId,
        Email: mockEmail,
      });

      await handler(event, stub<Context>({}));

      expect(getHasuraAdminClient).toHaveBeenCalledWith(mockTenant);
      expect(adminClient.query).toHaveBeenCalledWith({
        query: GetThirdPartyContactPasswordSetByUserIdDocument,
        variables: { UserId: mockAuth0UserId },
      });
    });

    it('should pass existing PasswordSetAtTimestamp to insert mutation', async () => {
      const event = createEvent({
        ThirdPartyId: mockThirdPartyId,
        Email: mockEmail,
      });

      await handler(event, stub<Context>({}));

      expect(hasuraClient.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          mutation: InsertThirdPartyContactDocument,
          variables: expect.objectContaining({
            PasswordSetAtTimestamp: existingTimestamp,
          }),
        })
      );
    });
  });

  describe('existing user without PasswordSetAtTimestamp', () => {
    beforeEach(() => {
      setupAuth0ExistingUser(null);
    });

    it('should pass null PasswordSetAtTimestamp when no existing record has one', async () => {
      const event = createEvent({
        ThirdPartyId: mockThirdPartyId,
        Email: mockEmail,
      });

      await handler(event, stub<Context>({}));

      expect(adminClient.query).toHaveBeenCalledWith({
        query: GetThirdPartyContactPasswordSetByUserIdDocument,
        variables: { UserId: mockAuth0UserId },
      });
      expect(hasuraClient.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            PasswordSetAtTimestamp: null,
          }),
        })
      );
    });
  });

  describe('existing user - cross-tenant with lastLogin fallback (scenario 3)', () => {
    const mockLastLogin = '2025-03-01T08:00:00.000Z';

    beforeEach(() => {
      setupAuth0ExistingUser(null, mockLastLogin);
    });

    it('should use lastLogin as PasswordSetAtTimestamp when cross-tenant lookup returns null', async () => {
      const event = createEvent({
        ThirdPartyId: mockThirdPartyId,
        Email: mockEmail,
      });

      await handler(event, stub<Context>({}));

      expect(hasuraClient.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          mutation: InsertThirdPartyContactDocument,
          variables: expect.objectContaining({
            PasswordSetAtTimestamp: mockLastLogin,
          }),
        })
      );
    });
  });

  describe('existing user without PasswordSetAtTimestamp or lastLogin', () => {
    beforeEach(() => {
      setupAuth0ExistingUser(null, undefined);
    });

    it('should pass null PasswordSetAtTimestamp when neither source has a value', async () => {
      const event = createEvent({
        ThirdPartyId: mockThirdPartyId,
        Email: mockEmail,
      });

      await handler(event, stub<Context>({}));

      expect(hasuraClient.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            PasswordSetAtTimestamp: null,
          }),
        })
      );
    });
  });

  describe('new user', () => {
    beforeEach(() => {
      vi.mocked(auth0Service.addThirdPartyUserToOrg).mockResolvedValue({
        userId: mockAuth0UserId,
        changePasswordUrl: 'https://auth0.example.com/reset',
        loginUrl: 'https://app.example.com/login',
        newUser: true,
        newMember: true,
        lastLogin: undefined,
      } as never);

      hasuraClient.mutate.mockResolvedValue({
        data: {
          insert_third_party_contact_one: {
            Id: mockContactId,
            ThirdPartyId: mockThirdPartyId,
            Email: mockEmail,
            Name: null,
            JobTitle: null,
            IsRevoked: false,
            UserId: mockAuth0UserId,
            CreatedAtTimestamp: new Date().toISOString(),
          },
        },
      } as never);
    });

    it('should not query for existing PasswordSetAtTimestamp', async () => {
      const event = createEvent({
        ThirdPartyId: mockThirdPartyId,
        Email: mockEmail,
      });

      await handler(event, stub<Context>({}));

      expect(getHasuraAdminClient).not.toHaveBeenCalled();
      expect(hasuraClient.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            PasswordSetAtTimestamp: null,
          }),
        })
      );
    });
  });
});
