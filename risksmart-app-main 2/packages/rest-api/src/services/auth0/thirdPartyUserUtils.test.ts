import type { ManagementClient } from 'auth0';
import type { GetUsers200ResponseOneOfInner } from 'auth0/dist/cjs/management/__generated/models';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  escapeLucene,
  generatePasswordResetUrl,
  isOrgMember,
  resolveThirdPartyUser,
  setUserTenant,
  statusIsSuccess,
  type ThirdPartyOrgRequest,
  upsertHasuraUser,
} from './thirdPartyUserUtils';

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

describe('statusIsSuccess', () => {
  it.each([200, 201, 202, 204])('should return true for status %d', (code) => {
    expect(statusIsSuccess(code)).toBe(true);
  });

  it.each([0, 199, 203, 205, 301, 400, 401, 403, 404, 500])(
    'should return false for status %d',
    (code) => {
      expect(statusIsSuccess(code)).toBe(false);
    }
  );
});

describe('escapeLucene', () => {
  it('should return plain strings unchanged', () => {
    expect(escapeLucene('hello')).toBe('hello');
    expect(escapeLucene('simple@email.com')).toBe('simple@email.com');
  });

  it('should escape + character', () => {
    expect(escapeLucene('jane+billing@example.com')).toBe(
      'jane\\+billing@example.com'
    );
  });

  it('should escape - character', () => {
    expect(escapeLucene('Username-Password-ThirdParty')).toBe(
      'Username\\-Password\\-ThirdParty'
    );
  });

  it('should escape double quotes', () => {
    expect(escapeLucene('has"quote')).toBe('has\\"quote');
  });

  it('should escape backslashes', () => {
    expect(escapeLucene('back\\slash')).toBe('back\\\\slash');
  });

  it('should escape multiple special characters', () => {
    expect(escapeLucene('a+b-c*d?e')).toBe('a\\+b\\-c\\*d\\?e');
  });

  it('should escape all Lucene special characters', () => {
    const specials = '+-&|!(){}[]^"~*?:\\/';
    const escaped = escapeLucene(specials);
    // Every character should be preceded by a backslash
    for (const char of specials) {
      expect(escaped).toContain(`\\${char}`);
    }
  });

  it('should handle empty string', () => {
    expect(escapeLucene('')).toBe('');
  });

  it('should escape forward slash', () => {
    expect(escapeLucene('a/b')).toBe('a\\/b');
  });

  it('should escape colon', () => {
    expect(escapeLucene('field:value')).toBe('field\\:value');
  });
});

describe('resolveThirdPartyUser', () => {
  const mockRequest: ThirdPartyOrgRequest = {
    orgId: 'org_123',
    tenant: 'test-tenant',
    questionnaireInviteId: 'invite_123',
    connection: 'Username-Password-ThirdParty',
    clientId: 'client_123',
    send_email: false,
    inviter: { name: 'Test' },
    invitee: { email: 'test@example.com' },
  };

  const mockThirdPartyUser = {
    user_id: 'auth0|tp_123',
    email: 'test@example.com',
    email_verified: true,
  } as GetUsers200ResponseOneOfInner;

  const mockAppUser = {
    user_id: 'auth0|app_456',
    email: 'test@example.com',
    email_verified: true,
  } as GetUsers200ResponseOneOfInner;

  const mockAuth0Client = {
    users: {
      getAll: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  } as unknown as ManagementClient;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return existing third-party user when found', async () => {
    vi.mocked(mockAuth0Client.users.getAll).mockResolvedValueOnce({
      status: 200,
      data: [mockThirdPartyUser],
    } as never);

    const result = await resolveThirdPartyUser(mockAuth0Client, mockRequest);

    expect(result.user).toBe(mockThirdPartyUser);
    expect(result.newUser).toBe(false);
    expect(result.hasExistingAppUser).toBe(false);
    expect(mockAuth0Client.users.create).not.toHaveBeenCalled();
  });

  it('should create new user when no third-party or app user exists', async () => {
    vi.mocked(mockAuth0Client.users.getAll)
      .mockResolvedValueOnce({ status: 200, data: [] } as never)
      .mockResolvedValueOnce({ status: 200, data: [] } as never);

    const newUser = {
      user_id: 'auth0|new_789',
      email: 'test@example.com',
    } as GetUsers200ResponseOneOfInner;

    vi.mocked(mockAuth0Client.users.create).mockResolvedValue({
      status: 201,
      data: newUser,
    } as never);

    const result = await resolveThirdPartyUser(mockAuth0Client, mockRequest);

    expect(result.newUser).toBe(true);
    expect(result.hasExistingAppUser).toBe(false);
    expect(result.user).toBe(newUser);
    expect(mockAuth0Client.users.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        connection: 'Username-Password-ThirdParty',
        verify_email: false,
        email_verified: true,
      })
    );
  });

  it('should mark app user with third_party_orgs and still create a new TP user', async () => {
    vi.mocked(mockAuth0Client.users.getAll)
      .mockResolvedValueOnce({ status: 200, data: [] } as never)
      .mockResolvedValueOnce({
        status: 200,
        data: [mockAppUser],
      } as never);

    vi.mocked(mockAuth0Client.users.get).mockResolvedValue({
      status: 200,
      data: { app_metadata: { some_key: 'value' } },
    } as never);

    vi.mocked(mockAuth0Client.users.update).mockResolvedValue({
      status: 200,
      data: {},
    } as never);

    const newUser = {
      user_id: 'auth0|new_789',
      email: 'test@example.com',
    } as GetUsers200ResponseOneOfInner;

    vi.mocked(mockAuth0Client.users.create).mockResolvedValue({
      status: 201,
      data: newUser,
    } as never);

    const result = await resolveThirdPartyUser(mockAuth0Client, mockRequest);

    expect(result.newUser).toBe(true);
    expect(result.hasExistingAppUser).toBe(true);

    // Should mark the app user
    expect(mockAuth0Client.users.update).toHaveBeenCalledWith(
      { id: 'auth0|app_456' },
      {
        app_metadata: {
          some_key: 'value',
          third_party_orgs: { org_123: true },
        },
      }
    );
  });

  it('should accumulate third_party_orgs on app user', async () => {
    vi.mocked(mockAuth0Client.users.getAll)
      .mockResolvedValueOnce({ status: 200, data: [] } as never)
      .mockResolvedValueOnce({
        status: 200,
        data: [mockAppUser],
      } as never);

    vi.mocked(mockAuth0Client.users.get).mockResolvedValue({
      status: 200,
      data: {
        app_metadata: { third_party_orgs: { org_other: true } },
      },
    } as never);

    vi.mocked(mockAuth0Client.users.update).mockResolvedValue({
      status: 200,
      data: {},
    } as never);

    const newUser = {
      user_id: 'auth0|new_789',
      email: 'test@example.com',
    } as GetUsers200ResponseOneOfInner;

    vi.mocked(mockAuth0Client.users.create).mockResolvedValue({
      status: 201,
      data: newUser,
    } as never);

    await resolveThirdPartyUser(mockAuth0Client, mockRequest);

    expect(mockAuth0Client.users.update).toHaveBeenCalledWith(
      { id: 'auth0|app_456' },
      {
        app_metadata: {
          third_party_orgs: { org_other: true, org_123: true },
        },
      }
    );
  });

  it('should throw when Auth0 user creation fails', async () => {
    vi.mocked(mockAuth0Client.users.getAll)
      .mockResolvedValueOnce({ status: 200, data: [] } as never)
      .mockResolvedValueOnce({ status: 200, data: [] } as never);

    vi.mocked(mockAuth0Client.users.create).mockResolvedValue({
      status: 500,
      data: {},
    } as never);

    await expect(
      resolveThirdPartyUser(mockAuth0Client, mockRequest)
    ).rejects.toThrow('Error creating user in Auth0');
  });

  it('should throw when created user has no email', async () => {
    vi.mocked(mockAuth0Client.users.getAll)
      .mockResolvedValueOnce({ status: 200, data: [] } as never)
      .mockResolvedValueOnce({ status: 200, data: [] } as never);

    vi.mocked(mockAuth0Client.users.create).mockResolvedValue({
      status: 201,
      data: { user_id: 'auth0|new_789' },
    } as never);

    await expect(
      resolveThirdPartyUser(mockAuth0Client, mockRequest)
    ).rejects.toThrow('Error creating user in Auth0');
  });
});

describe('upsertHasuraUser', () => {
  const mockRequest: ThirdPartyOrgRequest = {
    orgId: 'org_123',
    tenant: 'test-tenant',
    questionnaireInviteId: 'invite_123',
    connection: 'Username-Password-ThirdParty',
    clientId: 'client_123',
    send_email: false,
    inviter: { name: 'Test' },
    invitee: { email: 'test@example.com' },
  };

  const mockUser = {
    user_id: 'auth0|user_123',
    email: 'test@example.com',
  } as GetUsers200ResponseOneOfInner;

  const mockHasuraClient = { query: vi.fn(), mutate: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    mockGetHasuraAdminClient.mockReturnValue(mockHasuraClient as never);
    mockInsertAuthUser.mockResolvedValue('user_id_123');
  });

  it('should insert user and return Auth0 user_id on success', async () => {
    const result = await upsertHasuraUser(mockRequest, mockUser);

    expect(result).toBe('auth0|user_123');
    expect(mockInsertAuthUser).toHaveBeenCalledWith(mockHasuraClient, {
      UserId: 'auth0|user_123',
      Email: 'test@example.com',
      UserName: 'test',
      CreatedByUser: 'SYSTEM',
      OrgKey: 'org_123',
      AuthConnection: 'Username-Password-ThirdParty',
    });
  });

  it('should look up existing user on uniqueness violation', async () => {
    mockInsertAuthUser.mockRejectedValueOnce(
      new Error('Uniqueness violation: duplicate key')
    );
    mockHasuraClient.query.mockResolvedValueOnce({
      data: { user: [{ Id: 'existing_hasura_id' }] },
    });

    const result = await upsertHasuraUser(mockRequest, mockUser);

    expect(result).toBe('existing_hasura_id');
  });

  it('should fall back to Auth0 user_id when query returns no results after uniqueness violation', async () => {
    mockInsertAuthUser.mockRejectedValueOnce(
      new Error('Uniqueness violation: duplicate key')
    );
    mockHasuraClient.query.mockResolvedValueOnce({
      data: { user: [] },
    });

    const result = await upsertHasuraUser(mockRequest, mockUser);

    expect(result).toBe('auth0|user_123');
  });

  it('should rethrow non-uniqueness errors', async () => {
    mockInsertAuthUser.mockRejectedValueOnce(
      new Error('Database connection failed')
    );

    await expect(upsertHasuraUser(mockRequest, mockUser)).rejects.toThrow(
      'Database connection failed'
    );
  });

  it('should treat non-Error exceptions as uniqueness violations and look up existing user', async () => {
    mockInsertAuthUser.mockRejectedValueOnce('string error');
    mockHasuraClient.query.mockResolvedValueOnce({
      data: { user: [{ Id: 'existing_hasura_id' }] },
    });

    const result = await upsertHasuraUser(mockRequest, mockUser);

    expect(result).toBe('existing_hasura_id');
  });
});

describe('isOrgMember', () => {
  const mockAuth0Client = {
    users: {
      getUserOrganizations: vi.fn(),
    },
  } as unknown as ManagementClient;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return true when user belongs to the org', async () => {
    vi.mocked(mockAuth0Client.users.getUserOrganizations).mockResolvedValue({
      status: 200,
      data: [
        { id: 'org_other', name: 'Other' },
        { id: 'org_123', name: 'Target' },
      ],
    } as never);

    const result = await isOrgMember(mockAuth0Client, 'user_123', 'org_123');

    expect(result).toBe(true);
  });

  it('should return false when user does not belong to the org', async () => {
    vi.mocked(mockAuth0Client.users.getUserOrganizations).mockResolvedValue({
      status: 200,
      data: [{ id: 'org_other', name: 'Other' }],
    } as never);

    const result = await isOrgMember(mockAuth0Client, 'user_123', 'org_123');

    expect(result).toBe(false);
  });

  it('should return false when user has no orgs', async () => {
    vi.mocked(mockAuth0Client.users.getUserOrganizations).mockResolvedValue({
      status: 200,
      data: [],
    } as never);

    const result = await isOrgMember(mockAuth0Client, 'user_123', 'org_123');

    expect(result).toBe(false);
  });
});

describe('generatePasswordResetUrl', () => {
  const mockAuth0Client = {
    tickets: {
      changePassword: vi.fn(),
    },
  } as unknown as ManagementClient;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return ticket URL on success', async () => {
    vi.mocked(mockAuth0Client.tickets.changePassword).mockResolvedValue({
      status: 200,
      data: { ticket: 'https://auth0.com/ticket/abc123' },
    } as never);

    const result = await generatePasswordResetUrl(
      mockAuth0Client,
      'user_123',
      'https://app.example.com/login'
    );

    expect(result).toBe('https://auth0.com/ticket/abc123');
    expect(mockAuth0Client.tickets.changePassword).toHaveBeenCalledWith({
      user_id: 'user_123',
      result_url: 'https://app.example.com/login',
      mark_email_as_verified: true,
    });
  });

  it('should return undefined on non-success status', async () => {
    vi.mocked(mockAuth0Client.tickets.changePassword).mockResolvedValue({
      status: 500,
      data: {},
    } as never);

    const result = await generatePasswordResetUrl(
      mockAuth0Client,
      'user_123',
      'https://app.example.com/login'
    );

    expect(result).toBeUndefined();
  });
});

describe('setUserTenant', () => {
  const mockAuth0Client = {
    users: {
      get: vi.fn(),
      update: vi.fn(),
    },
  } as unknown as ManagementClient;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(mockAuth0Client.users.update).mockResolvedValue({
      status: 200,
      data: {},
    } as never);
  });

  it('should add tenant to empty metadata', async () => {
    vi.mocked(mockAuth0Client.users.get).mockResolvedValue({
      status: 200,
      data: { app_metadata: {} },
    } as never);

    await setUserTenant(mockAuth0Client, 'user_123', 'new-tenant');

    expect(mockAuth0Client.users.update).toHaveBeenCalledWith(
      { id: 'user_123' },
      {
        app_metadata: {
          third_party_tenants: ['new-tenant'],
        },
      }
    );
  });

  it('should append tenant to existing tenants', async () => {
    vi.mocked(mockAuth0Client.users.get).mockResolvedValue({
      status: 200,
      data: {
        app_metadata: {
          third_party_tenants: ['existing-tenant'],
          other_key: 'preserved',
        },
      },
    } as never);

    await setUserTenant(mockAuth0Client, 'user_123', 'new-tenant');

    expect(mockAuth0Client.users.update).toHaveBeenCalledWith(
      { id: 'user_123' },
      {
        app_metadata: {
          third_party_tenants: ['existing-tenant', 'new-tenant'],
          other_key: 'preserved',
        },
      }
    );
  });

  it('should deduplicate when adding same tenant again', async () => {
    vi.mocked(mockAuth0Client.users.get).mockResolvedValue({
      status: 200,
      data: {
        app_metadata: {
          third_party_tenants: ['my-tenant'],
        },
      },
    } as never);

    await setUserTenant(mockAuth0Client, 'user_123', 'my-tenant');

    expect(mockAuth0Client.users.update).toHaveBeenCalledWith(
      { id: 'user_123' },
      {
        app_metadata: {
          third_party_tenants: ['my-tenant'],
        },
      }
    );
  });

  it('should handle undefined app_metadata', async () => {
    vi.mocked(mockAuth0Client.users.get).mockResolvedValue({
      status: 200,
      data: { app_metadata: undefined },
    } as never);

    await setUserTenant(mockAuth0Client, 'user_123', 'new-tenant');

    expect(mockAuth0Client.users.update).toHaveBeenCalledWith(
      { id: 'user_123' },
      {
        app_metadata: {
          third_party_tenants: ['new-tenant'],
        },
      }
    );
  });
});
