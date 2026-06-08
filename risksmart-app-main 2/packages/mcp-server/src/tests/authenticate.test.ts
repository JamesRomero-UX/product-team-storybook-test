import type { IncomingMessage } from 'http';
import jsonwebtoken from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock jwks-rsa before importing authenticate
vi.mock('jwks-rsa', () => {
  return {
    default: () => ({
      getSigningKey: () =>
        Promise.resolve({
          getPublicKey: () => 'mock-public-key',
        }),
    }),
  };
});

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    decode: vi.fn(),
    verify: vi.fn(),
  },
}));

// Mock module checker
vi.mock('../auth/module-checker', () => ({
  isMcpEnabledForOrg: vi.fn(),
}));

import { createAuthenticator } from '../auth/authenticate';
import type { CredentialTokenProviderCache } from '../auth/credential-token-provider';
import { isMcpEnabledForOrg } from '../auth/module-checker';

const createMockRequest = (
  headers: Record<string, string> = {}
): IncomingMessage => {
  return { headers } as unknown as IncomingMessage;
};

const HASURA_NS = 'https://hasura.io/jwt/claims';

describe('createAuthenticator — OAuth path (no credential cache)', () => {
  const authenticate = createAuthenticator();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET_CONFIG = JSON.stringify({
      issuers: {
        'https://auth.example.com': {
          type: 'RS256',
          jwk_url: 'https://auth.example.com/.well-known/jwks.json',
        },
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when no authorization header and no credential cache', async () => {
    const req = createMockRequest();
    await expect(authenticate(req)).rejects.toThrow('Missing authentication');
  });

  it('throws when authorization header is not Bearer', async () => {
    const req = createMockRequest({ authorization: 'Basic abc123' });
    await expect(authenticate(req)).rejects.toThrow('Missing authentication');
  });

  it('throws when token cannot be decoded', async () => {
    vi.mocked(jsonwebtoken.decode).mockReturnValue(null);
    const req = createMockRequest({ authorization: 'Bearer bad-token' });
    await expect(authenticate(req)).rejects.toThrow(
      'Invalid or malformed token'
    );
  });

  it('throws when token issuer is unknown', async () => {
    vi.mocked(jsonwebtoken.decode).mockReturnValue({
      header: { alg: 'RS256', kid: 'test-kid' },
      payload: { iss: 'https://unknown-issuer.com' },
      signature: 'sig',
    } as never);

    const req = createMockRequest({
      authorization: 'Bearer valid-format-token',
    });
    await expect(authenticate(req)).rejects.toThrow(
      'Token issued by an unrecognised authority'
    );
  });

  it('throws when algorithm is none', async () => {
    process.env.JWT_SECRET_CONFIG = JSON.stringify({
      issuers: {
        'https://auth.example.com': {
          type: 'none',
          jwk_url: 'https://auth.example.com/.well-known/jwks.json',
        },
      },
    });

    vi.mocked(jsonwebtoken.decode).mockReturnValue({
      header: { alg: 'none', kid: 'test-kid' },
      payload: { iss: 'https://auth.example.com', sub: 'user-1' },
      signature: 'sig',
    } as never);

    const req = createMockRequest({ authorization: 'Bearer some-token' });
    await expect(authenticate(req)).rejects.toThrow(
      'Unsafe JWT algorithm configured'
    );
  });

  it('throws when MCP module is not enabled for org', async () => {
    vi.mocked(isMcpEnabledForOrg).mockResolvedValue(false);

    vi.mocked(jsonwebtoken.decode).mockReturnValue({
      header: { alg: 'RS256', kid: 'test-kid' },
      payload: { iss: 'https://auth.example.com', sub: 'user-1' },
      signature: 'sig',
    } as never);

    vi.mocked(jsonwebtoken.verify).mockReturnValue({
      iss: 'https://auth.example.com',
      sub: 'user-1',
      [HASURA_NS]: {
        'x-hasura-org-id': 'org_123',
        'x-hasura-user-id': 'user-1',
        'x-hasura-tenant-name': 'TestTenant',
      },
    } as never);

    const req = createMockRequest({ authorization: 'Bearer valid-token' });
    await expect(authenticate(req)).rejects.toThrow('MCP is not enabled');
  });

  it('returns OAuthSession when authentication succeeds', async () => {
    vi.mocked(isMcpEnabledForOrg).mockResolvedValue(true);

    vi.mocked(jsonwebtoken.decode).mockReturnValue({
      header: { alg: 'RS256', kid: 'test-kid' },
      payload: { iss: 'https://auth.example.com', sub: 'user-1' },
      signature: 'sig',
    } as never);

    vi.mocked(jsonwebtoken.verify).mockReturnValue({
      iss: 'https://auth.example.com',
      sub: 'user-1',
      [HASURA_NS]: {
        'x-hasura-org-id': 'org_123',
        'x-hasura-user-id': 'user-1',
        'x-hasura-tenant-name': 'TestTenant',
      },
    } as never);

    const req = createMockRequest({ authorization: 'Bearer valid-token' });
    const session = await authenticate(req);

    expect(session).toEqual({
      authType: 'oauth',
      orgId: 'org_123',
      userId: 'user-1',
      tenant: 'testtenant',
      accessToken: 'valid-token',
    });
  });

  it('normalizes tenant name to lowercase', async () => {
    vi.mocked(isMcpEnabledForOrg).mockResolvedValue(true);

    vi.mocked(jsonwebtoken.decode).mockReturnValue({
      header: { alg: 'RS256', kid: 'test-kid' },
      payload: { iss: 'https://auth.example.com', sub: 'user-1' },
      signature: 'sig',
    } as never);

    vi.mocked(jsonwebtoken.verify).mockReturnValue({
      iss: 'https://auth.example.com',
      [HASURA_NS]: {
        'x-hasura-org-id': 'org_456',
        'x-hasura-user-id': 'user-2',
        'x-hasura-tenant-name': 'MultiTenant',
      },
    } as never);

    const req = createMockRequest({ authorization: 'Bearer some-token' });
    const session = await authenticate(req);
    expect(session.tenant).toBe('multitenant');
  });
});

describe('createAuthenticator — credential path (per-request headers)', () => {
  const mockGetToken = vi.fn();

  const createMockCache = (): CredentialTokenProviderCache => {
    return {
      getProvider: vi.fn().mockReturnValue({ getToken: mockGetToken }),
      get size() {
        return 0;
      },
    } as unknown as CredentialTokenProviderCache;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET_CONFIG = JSON.stringify({
      issuers: {
        'https://auth.example.com': {
          type: 'RS256',
          jwk_url: 'https://auth.example.com/.well-known/jwks.json',
        },
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns CredentialSession when X-Client-Key and X-Client-Secret provided', async () => {
    vi.mocked(isMcpEnabledForOrg).mockResolvedValue(true);
    mockGetToken.mockResolvedValue({
      accessToken: 'cognito-jwt-token',
      claims: { org_id: 'org_abc', tenant_id: 'TestOrg' },
    });
    const cache = createMockCache();
    const authenticate = createAuthenticator(cache);

    const req = createMockRequest({
      'x-client-key': 'my-key',
      'x-client-secret': 'my-secret',
    });
    const session = await authenticate(req);

    expect(session).toEqual({
      authType: 'credentials',
      orgId: 'org_abc',
      tenant: 'testorg',
      accessToken: 'cognito-jwt-token',
    });
    expect(cache.getProvider).toHaveBeenCalledWith('my-key', 'my-secret');
  });

  it('throws when MCP module is not enabled for org (credential path)', async () => {
    vi.mocked(isMcpEnabledForOrg).mockResolvedValue(false);
    mockGetToken.mockResolvedValue({
      accessToken: 'cognito-jwt-token',
      claims: { org_id: 'org_no_mcp', tenant_id: 'TestOrg' },
    });
    const cache = createMockCache();
    const authenticate = createAuthenticator(cache);

    const req = createMockRequest({
      'x-client-key': 'my-key',
      'x-client-secret': 'my-secret',
    });
    await expect(authenticate(req)).rejects.toThrow('MCP is not enabled');
  });

  it('normalizes credential session tenant to lowercase', async () => {
    vi.mocked(isMcpEnabledForOrg).mockResolvedValue(true);
    mockGetToken.mockResolvedValue({
      accessToken: 'token',
      claims: { org_id: 'org_1', tenant_id: 'MixedCaseTenant' },
    });
    const cache = createMockCache();
    const authenticate = createAuthenticator(cache);

    const req = createMockRequest({
      'x-client-key': 'key',
      'x-client-secret': 'secret',
    });
    const session = await authenticate(req);
    expect(session.tenant).toBe('mixedcasetenant');
  });

  it('still uses OAuth path when Bearer token is present alongside credential headers', async () => {
    vi.mocked(isMcpEnabledForOrg).mockResolvedValue(true);
    const cache = createMockCache();
    const authenticate = createAuthenticator(cache);

    vi.mocked(jsonwebtoken.decode).mockReturnValue({
      header: { alg: 'RS256', kid: 'test-kid' },
      payload: { iss: 'https://auth.example.com', sub: 'user-1' },
      signature: 'sig',
    } as never);

    vi.mocked(jsonwebtoken.verify).mockReturnValue({
      iss: 'https://auth.example.com',
      sub: 'user-1',
      [HASURA_NS]: {
        'x-hasura-org-id': 'org_123',
        'x-hasura-user-id': 'user-1',
        'x-hasura-tenant-name': 'TestTenant',
      },
    } as never);

    const req = createMockRequest({
      authorization: 'Bearer valid-token',
      'x-client-key': 'key',
      'x-client-secret': 'secret',
    });
    const session = await authenticate(req);

    expect(session.authType).toBe('oauth');
    expect(cache.getProvider).not.toHaveBeenCalled();
  });

  it('throws when credential provider fails (e.g., invalid credentials)', async () => {
    mockGetToken.mockRejectedValue(new Error('Invalid client credentials'));
    const cache = createMockCache();
    const authenticate = createAuthenticator(cache);

    const req = createMockRequest({
      'x-client-key': 'bad-key',
      'x-client-secret': 'bad-secret',
    });
    await expect(authenticate(req)).rejects.toThrow(
      'Credential authentication failed'
    );
  });

  it('throws when only X-Client-Key is provided (partial credentials)', async () => {
    const cache = createMockCache();
    const authenticate = createAuthenticator(cache);

    const req = createMockRequest({ 'x-client-key': 'key-only' });
    await expect(authenticate(req)).rejects.toThrow(
      'Both X-Client-Key and X-Client-Secret headers are required'
    );
  });

  it('throws when only X-Client-Secret is provided (partial credentials)', async () => {
    const cache = createMockCache();
    const authenticate = createAuthenticator(cache);

    const req = createMockRequest({ 'x-client-secret': 'secret-only' });
    await expect(authenticate(req)).rejects.toThrow(
      'Both X-Client-Key and X-Client-Secret headers are required'
    );
  });

  it('throws when no headers and no Bearer token even with cache configured', async () => {
    const cache = createMockCache();
    const authenticate = createAuthenticator(cache);

    const req = createMockRequest();
    await expect(authenticate(req)).rejects.toThrow('Missing authentication');
  });

  it('throws when no Bearer token and no cache configured', async () => {
    const authenticate = createAuthenticator(undefined);

    const req = createMockRequest({
      'x-client-key': 'key',
      'x-client-secret': 'secret',
    });
    await expect(authenticate(req)).rejects.toThrow('Missing authentication');
  });
});
