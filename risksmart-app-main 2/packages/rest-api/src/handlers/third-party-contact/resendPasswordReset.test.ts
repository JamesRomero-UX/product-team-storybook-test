import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { getEnv } from 'src/environment';
import { getHasuraClient } from 'src/graphqlClient';
import {
  getTenantNameFromClaims,
  getUserIdFromClaims,
} from 'src/requestHelpers';
import { auth0Service } from 'src/services/auth0';
import { getAuth0ManagementClient } from 'src/services/auth0/getAuth0ManagementClient';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { stub } from 'src/testing/stub';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

import { handler } from './resendPasswordReset';

vi.mock('src/logger', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

vi.mock('src/environment', () => ({
  getEnv: vi.fn(),
}));

vi.mock('src/graphqlClient', () => ({
  getHasuraClient: vi.fn(),
}));

vi.mock('src/requestHelpers', () => ({
  getTenantNameFromClaims: vi.fn(),
  getUserIdFromClaims: vi.fn(),
}));

vi.mock('src/services/role-access/roleAccessService', () => ({
  hasPermission: vi.fn(),
}));

vi.mock('src/services/auth0/getAuth0ManagementClient', () => ({
  getAuth0ManagementClient: vi.fn(),
}));

vi.mock('src/services/auth0', () => ({
  auth0Service: {
    triggerPasswordReset: vi.fn(),
  },
}));

describe('resendPasswordReset handler', () => {
  const mockContactId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId = 'user-123';
  const mockAuth0UserId = 'auth0|user_456';
  const mockEmail = 'contact@example.com';
  const mockConnectionName = 'Username-Password-ThirdParty';
  const mockClientId = 'client_123';
  const mockLoginUrl = 'https://app.example.com/login';
  const mockPasswordResetUrl = 'https://auth0.com/change-password-ticket';

  const hasuraClient = mock<ApolloClient<NormalizedCacheObject>>();

  const mockUsersGetAll = vi.fn();
  const mockClientsGet = vi.fn();
  const mockAuth0Client = {
    users: {
      getAll: mockUsersGetAll,
    },
    clients: {
      get: mockClientsGet,
    },
  };

  const createEvent = (
    body: object,
    authorization?: string
  ): APIGatewayProxyEventV2 =>
    stub<APIGatewayProxyEventV2>({
      body: JSON.stringify(body),
      headers: {
        authorization,
      },
    });

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(getTenantNameFromClaims).mockReturnValue('MultiTenant');
    vi.mocked(getUserIdFromClaims).mockReturnValue(mockUserId);
    vi.mocked(getHasuraClient).mockResolvedValue(hasuraClient);
    vi.mocked(hasPermission).mockResolvedValue(true);
    vi.mocked(getAuth0ManagementClient).mockReturnValue(
      mockAuth0Client as never
    );
    vi.mocked(getEnv).mockImplementation((key: string) => {
      if (key === 'AUTH0_THIRD_PARTY_CONNECTION_NAME') {
        return mockConnectionName;
      }

      if (key === 'AUTH0_THIRD_PARTY_CLIENT_ID') {
        return mockClientId;
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

    mockUsersGetAll.mockResolvedValue({
      status: 200,
      data: [{ user_id: mockAuth0UserId, email: mockEmail }],
    });

    mockClientsGet.mockResolvedValue({
      status: 200,
      data: { initiate_login_uri: mockLoginUrl },
    });

    vi.mocked(auth0Service.triggerPasswordReset).mockResolvedValue(
      mockPasswordResetUrl
    );
  });

  describe('authorization validation', () => {
    it('should return 401 when authorization header is missing', async () => {
      const event = createEvent({ ContactId: mockContactId }, undefined);

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(401);
      expect(JSON.parse(result.body as string).message).toBe(
        'Invalid authorization credentials in request'
      );
    });
  });

  describe('permission validation', () => {
    it('should return 403 when user lacks update permission on third party', async () => {
      vi.mocked(hasPermission).mockResolvedValue(false);

      const event = createEvent({ ContactId: mockContactId }, 'Bearer token');

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

      const event = createEvent({ ContactId: mockContactId }, 'Bearer token');

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body as string).message).toBe(
        'Contact not found'
      );
    });

    it('should return 400 when contact is revoked', async () => {
      hasuraClient.query.mockResolvedValue({
        data: {
          third_party_contact_by_pk: {
            Id: mockContactId,
            Email: mockEmail,
            IsRevoked: true,
          },
        },
      } as never);

      const event = createEvent({ ContactId: mockContactId }, 'Bearer token');

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body as string).message).toBe(
        'Cannot resend password reset for revoked contact'
      );
    });
  });

  describe('Auth0 user validation', () => {
    it('should return 404 when Auth0 user does not exist', async () => {
      mockUsersGetAll.mockResolvedValue({
        status: 200,
        data: [],
      });

      const event = createEvent({ ContactId: mockContactId }, 'Bearer token');

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body as string).message).toBe(
        'Auth0 user not found for this contact. The contact may need to be recreated.'
      );
    });

    it('should return 404 when Auth0 response has no data', async () => {
      mockUsersGetAll.mockResolvedValue({
        status: 200,
        data: undefined,
      });

      const event = createEvent({ ContactId: mockContactId }, 'Bearer token');

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body as string).message).toBe(
        'Auth0 user not found for this contact. The contact may need to be recreated.'
      );
    });
  });

  describe('successful password reset', () => {
    it('should trigger password reset and return success response', async () => {
      const event = createEvent({ ContactId: mockContactId }, 'Bearer token');

      const result = await handler(event, stub<Context>({}));

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body as string)).toEqual({
        Id: mockContactId,
        PasswordResetUrl: mockPasswordResetUrl,
        Message: 'Password reset email has been sent',
      });
    });

    it('should call Auth0 with correct connection filter', async () => {
      const event = createEvent({ ContactId: mockContactId }, 'Bearer token');

      await handler(event, stub<Context>({}));

      expect(mockUsersGetAll).toHaveBeenCalledWith({
        q: `email:"${mockEmail}" AND identities.connection:"Username\\-Password\\-ThirdParty"`,
        search_engine: 'v3',
      });
    });

    it('should call triggerPasswordReset with correct parameters', async () => {
      const event = createEvent({ ContactId: mockContactId }, 'Bearer token');

      await handler(event, stub<Context>({}));

      expect(auth0Service.triggerPasswordReset).toHaveBeenCalledWith({
        auth0Client: mockAuth0Client,
        userId: mockAuth0UserId,
        resultUrl: mockLoginUrl,
      });
    });

    it('should use empty string for loginUrl when initiate_login_uri is undefined', async () => {
      mockClientsGet.mockResolvedValue({
        status: 200,
        data: { initiate_login_uri: undefined },
      });

      const event = createEvent({ ContactId: mockContactId }, 'Bearer token');

      await handler(event, stub<Context>({}));

      expect(auth0Service.triggerPasswordReset).toHaveBeenCalledWith({
        auth0Client: mockAuth0Client,
        userId: mockAuth0UserId,
        resultUrl: '',
      });
    });
  });

  describe('password reset failure', () => {
    it('should throw Error when password reset URL generation fails', async () => {
      vi.mocked(auth0Service.triggerPasswordReset).mockResolvedValue(undefined);

      const event = createEvent({ ContactId: mockContactId }, 'Bearer token');

      await expect(handler(event, stub<Context>({}))).rejects.toThrow(
        'Failed to generate password reset URL'
      );
    });

    it('should throw Error when password reset URL is empty string', async () => {
      vi.mocked(auth0Service.triggerPasswordReset).mockResolvedValue('');

      const event = createEvent({ ContactId: mockContactId }, 'Bearer token');

      await expect(handler(event, stub<Context>({}))).rejects.toThrow(
        'Failed to generate password reset URL'
      );
    });
  });
});
