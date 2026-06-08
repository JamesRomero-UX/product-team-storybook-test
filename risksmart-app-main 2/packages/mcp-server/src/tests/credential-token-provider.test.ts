import jsonwebtoken from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CredentialTokenProvider,
  CredentialTokenProviderCache,
  decodeTokenClaims,
  type TokenProviderConfig,
} from '../auth/credential-token-provider';

// ── Helpers ──────────────────────────────────────────────────────────────────

const MOCK_CLAIMS = {
  org_id: 'org-abc-123',
  tenant_id: 'testtenant',
  role: 'rs-external',
  permissions: ['risks:read', 'controls:read'],
  source_service: 'external-api',
  rl_profile: 'cruise',
};

const createMockJwt = (
  claims: Record<string, unknown> = MOCK_CLAIMS
): string => {
  // Create a real JWT structure so jsonwebtoken.decode works
  return jsonwebtoken.sign(claims, 'test-secret', { expiresIn: '1h' });
};

const createTokenResponse = (
  overrides: Record<string, unknown> = {}
): { accessToken: string; tokenType: string; expiresIn: number } => ({
  accessToken: createMockJwt(),
  tokenType: 'Bearer',
  expiresIn: 3600,
  ...overrides,
});

const createConfig = (
  overrides: Partial<TokenProviderConfig> = {}
): TokenProviderConfig => ({
  clientKey: 'test-client-key',
  clientSecret: 'test-client-secret',
  externalApiBaseUrl: 'https://api.example.com',
  ...overrides,
});

const mockFetchSuccess = (
  tokenResponse = createTokenResponse()
): ReturnType<typeof vi.fn> =>
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(tokenResponse),
  } as Response);

// ── Tests ────────────────────────────────────────────────────────────────────

describe('CredentialTokenProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ── Constructor ─────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('throws when externalApiBaseUrl is not HTTPS in non-development', () => {
      const original = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      try {
        expect(
          () =>
            new CredentialTokenProvider(
              createConfig({ externalApiBaseUrl: 'http://api.example.com' })
            )
        ).toThrow('externalApiBaseUrl must use HTTPS');
      } finally {
        process.env.NODE_ENV = original;
      }
    });

    it('allows HTTP in development mode', () => {
      const original = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      try {
        expect(
          () =>
            new CredentialTokenProvider(
              createConfig({ externalApiBaseUrl: 'http://localhost:3000' })
            )
        ).not.toThrow();
      } finally {
        process.env.NODE_ENV = original;
      }
    });

    it('allows HTTPS in any environment', () => {
      expect(() => new CredentialTokenProvider(createConfig())).not.toThrow();
    });
  });

  // ── getToken() — initial authentication (lazy init) ─────────────────────

  describe('getToken() — initial authentication', () => {
    it('exchanges credentials on first call and caches the token', async () => {
      mockFetchSuccess();
      const provider = new CredentialTokenProvider(createConfig());

      const result = await provider.getToken();

      expect(result.accessToken).toBeDefined();
      expect(result.claims.org_id).toBe('org-abc-123');
      expect(result.claims.tenant_id).toBe('testtenant');
    });

    it('calls the correct endpoint with client credentials', async () => {
      mockFetchSuccess();
      const config = createConfig({
        clientKey: 'my-key',
        clientSecret: 'my-secret',
        externalApiBaseUrl: 'https://api.risksmart.com',
      });
      const provider = new CredentialTokenProvider(config);

      await provider.getToken();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.risksmart.com/api/v1/auth/token',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientKey: 'my-key',
            clientSecret: 'my-secret',
          }),
        })
      );
    });

    it('throws on 401 with clear message', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Bad credentials'),
      } as Response);

      const provider = new CredentialTokenProvider(createConfig());

      await expect(provider.getToken()).rejects.toThrow(
        'Invalid client credentials'
      );
    });

    it('throws on 403 with clear message', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: () => Promise.resolve(''),
      } as Response);

      const provider = new CredentialTokenProvider(createConfig());

      await expect(provider.getToken()).rejects.toThrow(
        'Invalid client credentials'
      );
    });

    it('throws on 500 without leaking response body', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Secret internal details'),
      } as Response);

      const provider = new CredentialTokenProvider(createConfig());

      await expect(provider.getToken()).rejects.toThrow(
        'Token exchange failed: 500 Internal Server Error'
      );
      // Ensure body is NOT in the error message
      await expect(provider.getToken()).rejects.not.toThrow(
        'Secret internal details'
      );
    });

    it('throws on network failure', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('ECONNREFUSED'));

      const provider = new CredentialTokenProvider(createConfig());

      await expect(provider.getToken()).rejects.toThrow('ECONNREFUSED');
    });

    it('throws when response is missing accessToken', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ tokenType: 'Bearer', expiresIn: 3600 }),
      } as Response);

      const provider = new CredentialTokenProvider(createConfig());

      await expect(provider.getToken()).rejects.toThrow();
    });
  });

  // ── getToken() — response validation ────────────────────────────────────

  describe('getToken() — response validation', () => {
    it('throws when expiresIn is zero', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            accessToken: createMockJwt(),
            tokenType: 'Bearer',
            expiresIn: 0,
          }),
      } as Response);

      const provider = new CredentialTokenProvider(createConfig());

      await expect(provider.getToken()).rejects.toThrow();
    });

    it('throws when expiresIn is negative', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            accessToken: createMockJwt(),
            tokenType: 'Bearer',
            expiresIn: -100,
          }),
      } as Response);

      const provider = new CredentialTokenProvider(createConfig());

      await expect(provider.getToken()).rejects.toThrow();
    });

    it('throws when expiresIn is not a number', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            accessToken: createMockJwt(),
            tokenType: 'Bearer',
            expiresIn: '3600',
          }),
      } as Response);

      const provider = new CredentialTokenProvider(createConfig());

      await expect(provider.getToken()).rejects.toThrow();
    });

    it('caps expiresIn at 24 hours', async () => {
      const tokenResponse = createTokenResponse({
        expiresIn: 999_999, // ~277 hours
      });
      mockFetchSuccess(tokenResponse);
      const provider = new CredentialTokenProvider(createConfig());

      await provider.getToken();

      // Advance past 80% of 24h (capped) = 69120s, but before 24h
      vi.advanceTimersByTime(70_000 * 1000);

      // Set up refresh response
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createTokenResponse()),
      } as Response);

      await provider.getToken();

      // Should have triggered a refresh (2 calls total)
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  // ── getToken() — caching and refresh ────────────────────────────────────

  describe('getToken() — caching and refresh', () => {
    it('returns cached token immediately after first call', async () => {
      mockFetchSuccess();
      const provider = new CredentialTokenProvider(createConfig());
      await provider.getToken();

      // No time advance — should return cached
      const result = await provider.getToken();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result.claims.org_id).toBe('org-abc-123');
    });

    it('returns cached token when within refresh threshold', async () => {
      mockFetchSuccess();
      const provider = new CredentialTokenProvider(createConfig());
      await provider.getToken();

      // Advance time by 10 minutes (well within 80% of 60-min TTL)
      vi.advanceTimersByTime(10 * 60 * 1000);

      const result = await provider.getToken();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result.claims.org_id).toBe('org-abc-123');
    });

    it('refreshes token when past refresh threshold', async () => {
      const tokenResponse = createTokenResponse();
      mockFetchSuccess(tokenResponse);
      const provider = new CredentialTokenProvider(createConfig());
      await provider.getToken();

      // Advance past 80% of 3600s TTL = 2880s
      vi.advanceTimersByTime(2900 * 1000);

      // Set up new token for refresh
      const newJwt = createMockJwt({
        ...MOCK_CLAIMS,
        org_id: 'org-refreshed',
      });
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            accessToken: newJwt,
            tokenType: 'Bearer',
            expiresIn: 3600,
          }),
      } as Response);

      const result = await provider.getToken();

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(result.claims.org_id).toBe('org-refreshed');
    });

    it('falls back to cached token if refresh fails and token not expired', async () => {
      mockFetchSuccess();
      const provider = new CredentialTokenProvider(createConfig());
      await provider.getToken();

      // Advance past refresh threshold but before expiry
      vi.advanceTimersByTime(2900 * 1000);

      // Make refresh fail
      vi.mocked(fetch).mockRejectedValue(new Error('Network timeout'));

      const result = await provider.getToken();

      // Should return the original cached token
      expect(result.claims.org_id).toBe('org-abc-123');
    });

    it('throws when refresh fails and cached token is expired', async () => {
      mockFetchSuccess();
      const provider = new CredentialTokenProvider(createConfig());
      await provider.getToken();

      // Advance past expiry (3600s + 1s)
      vi.advanceTimersByTime(3601 * 1000);

      // Make refresh fail
      vi.mocked(fetch).mockRejectedValue(new Error('Network timeout'));

      await expect(provider.getToken()).rejects.toThrow(
        'Token expired and refresh failed'
      );
    });
  });

  // ── Concurrent call deduplication ───────────────────────────────────────

  describe('concurrent call deduplication', () => {
    it('deduplicates concurrent first calls into a single HTTP request', async () => {
      // Set up a delayed response
      // (Promise constructor runs synchronously so resolveInit is always assigned)
      let resolveInit: (value: Response) => void;
      const initPromise = new Promise<Response>((resolve) => {
        resolveInit = resolve;
      });
      vi.mocked(fetch).mockReturnValue(initPromise);

      const provider = new CredentialTokenProvider(createConfig());

      // Trigger multiple concurrent getToken calls before any resolves
      const call1 = provider.getToken();
      const call2 = provider.getToken();
      const call3 = provider.getToken();

      // Resolve the single exchange request
      const jwt = createMockJwt();
      resolveInit!({
        ok: true,
        json: () =>
          Promise.resolve({
            accessToken: jwt,
            tokenType: 'Bearer',
            expiresIn: 3600,
          }),
      } as Response);

      const [r1, r2, r3] = await Promise.all([call1, call2, call3]);

      // All three should return the same token
      expect(r1.accessToken).toBe(r2.accessToken);
      expect(r2.accessToken).toBe(r3.accessToken);

      // Only 1 fetch call (not 3)
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('deduplicates concurrent refresh calls into a single HTTP request', async () => {
      mockFetchSuccess();
      const provider = new CredentialTokenProvider(createConfig());
      await provider.getToken();

      // Advance past refresh threshold
      vi.advanceTimersByTime(2900 * 1000);

      // Set up a delayed response for refresh
      let resolveRefresh: (value: Response) => void;
      const refreshPromise = new Promise<Response>((resolve) => {
        resolveRefresh = resolve;
      });
      vi.mocked(fetch).mockReturnValue(refreshPromise);

      // Trigger multiple concurrent getToken calls
      const call1 = provider.getToken();
      const call2 = provider.getToken();
      const call3 = provider.getToken();

      // Resolve the single refresh request
      const newJwt = createMockJwt();
      resolveRefresh!({
        ok: true,
        json: () =>
          Promise.resolve({
            accessToken: newJwt,
            tokenType: 'Bearer',
            expiresIn: 3600,
          }),
      } as Response);

      const [r1, r2, r3] = await Promise.all([call1, call2, call3]);

      // All three should return the same token
      expect(r1.accessToken).toBe(r2.accessToken);
      expect(r2.accessToken).toBe(r3.accessToken);

      // Only 2 fetch calls total: 1 init + 1 refresh (not 3 refreshes)
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  // ── Public return type ──────────────────────────────────────────────────

  describe('return type', () => {
    it('only exposes accessToken and claims (not internal timing fields)', async () => {
      mockFetchSuccess();
      const provider = new CredentialTokenProvider(createConfig());

      const result = await provider.getToken();

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('claims');
      expect(Object.keys(result)).toEqual(
        expect.arrayContaining(['accessToken', 'claims'])
      );
    });
  });
});

// ── decodeTokenClaims() ─────────────────────────────────────────────────────

describe('decodeTokenClaims()', () => {
  it('extracts all custom claims from a Cognito JWT', () => {
    const jwt = createMockJwt(MOCK_CLAIMS);
    const claims = decodeTokenClaims(jwt);

    expect(claims).toEqual({
      org_id: 'org-abc-123',
      tenant_id: 'testtenant',
      role: 'rs-external',
      permissions: ['risks:read', 'controls:read'],
      source_service: 'external-api',
      rl_profile: 'cruise',
    });
  });

  it('throws on invalid JWT format', () => {
    expect(() => decodeTokenClaims('not-a-jwt')).toThrow(
      'Failed to decode token'
    );
  });

  it('throws when org_id is missing', () => {
    const jwt = createMockJwt({ tenant_id: 'test' });

    expect(() => decodeTokenClaims(jwt)).toThrow(
      'Token missing required claims'
    );
  });

  it('throws when tenant_id is missing', () => {
    const jwt = createMockJwt({ org_id: 'org-1' });

    expect(() => decodeTokenClaims(jwt)).toThrow(
      'Token missing required claims'
    );
  });

  it('defaults optional claims when not present', () => {
    const jwt = createMockJwt({
      org_id: 'org-1',
      tenant_id: 'tenant-1',
    });
    const claims = decodeTokenClaims(jwt);

    expect(claims.role).toBe('rs-external');
    expect(claims.permissions).toEqual([]);
    expect(claims.source_service).toBe('external-api');
    expect(claims.rl_profile).toBe('cruise');
  });
});

// ── CredentialTokenProviderCache ────────────────────────────────────────────

describe('CredentialTokenProviderCache', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('returns the same provider for the same clientKey', () => {
    const cache = new CredentialTokenProviderCache('https://api.example.com');

    const p1 = cache.getProvider('key-1', 'secret-1');
    const p2 = cache.getProvider('key-1', 'secret-1');

    expect(p1).toBe(p2);
    expect(cache.size).toBe(1);
  });

  it('returns different providers for different clientKeys', () => {
    const cache = new CredentialTokenProviderCache('https://api.example.com');

    const p1 = cache.getProvider('key-1', 'secret-1');
    const p2 = cache.getProvider('key-2', 'secret-2');

    expect(p1).not.toBe(p2);
    expect(cache.size).toBe(2);
  });

  it('evicts oldest provider when at capacity', () => {
    const cache = new CredentialTokenProviderCache(
      'https://api.example.com',
      2
    );

    const p1 = cache.getProvider('key-1', 'secret-1');
    cache.getProvider('key-2', 'secret-2');

    // Adding a third should evict key-1 (oldest)
    cache.getProvider('key-3', 'secret-3');

    expect(cache.size).toBe(2);

    // key-1 should now return a new instance (was evicted)
    const p1Again = cache.getProvider('key-1', 'secret-1');
    expect(p1Again).not.toBe(p1);
  });

  it('refreshes LRU order on access', () => {
    const cache = new CredentialTokenProviderCache(
      'https://api.example.com',
      2
    );

    const p1 = cache.getProvider('key-1', 'secret-1');
    cache.getProvider('key-2', 'secret-2');

    // Access key-1 again — moves it to end (most recent)
    cache.getProvider('key-1', 'secret-1');

    // Adding key-3 should evict key-2 (now oldest), not key-1
    cache.getProvider('key-3', 'secret-3');

    // key-1 should still be the same instance
    expect(cache.getProvider('key-1', 'secret-1')).toBe(p1);
    expect(cache.size).toBe(2);
  });

  it('each provider gets its own token', async () => {
    const cache = new CredentialTokenProviderCache('https://api.example.com');

    const jwtA = createMockJwt({ ...MOCK_CLAIMS, org_id: 'org-A' });
    const jwtB = createMockJwt({ ...MOCK_CLAIMS, org_id: 'org-B' });

    // First call — provider for client-A
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          accessToken: jwtA,
          tokenType: 'Bearer',
          expiresIn: 3600,
        }),
    } as Response);

    // Second call — provider for client-B
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          accessToken: jwtB,
          tokenType: 'Bearer',
          expiresIn: 3600,
        }),
    } as Response);

    const providerA = cache.getProvider('client-A', 'secret-A');
    const providerB = cache.getProvider('client-B', 'secret-B');

    const tokenA = await providerA.getToken();
    const tokenB = await providerB.getToken();

    expect(tokenA.claims.org_id).toBe('org-A');
    expect(tokenB.claims.org_id).toBe('org-B');
    expect(tokenA.accessToken).not.toBe(tokenB.accessToken);
  });
});
