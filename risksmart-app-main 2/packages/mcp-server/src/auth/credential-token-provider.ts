import { createHash } from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import { z } from 'zod';

import { logger } from '../utils/logger';

/** Fraction of token TTL at which proactive refresh triggers (80%). */
const REFRESH_THRESHOLD = 0.8;

/** Timeout for token exchange HTTP requests (10 seconds). */
const FETCH_TIMEOUT_MS = 10_000;

/** Maximum accepted token TTL (24 hours) to guard against unreasonable values. */
const MAX_TTL_SECONDS = 86_400;

/** Default maximum number of cached providers in the provider cache. */
const DEFAULT_MAX_PROVIDERS = 500;

export interface TokenProviderConfig {
  clientKey: string;
  clientSecret: string;
  externalApiBaseUrl: string;
}

const CognitoJwtClaimsSchema = z.object({
  org_id: z.string().min(1),
  tenant_id: z.string().min(1),
  role: z.string().default('rs-external'),
  permissions: z.array(z.string()).default([]),
  source_service: z.string().default('external-api'),
  rl_profile: z.string().default('cruise'),
});

export type CognitoJwtClaims = z.infer<typeof CognitoJwtClaimsSchema>;

const TokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number().positive(),
});

/** Public token result returned by getToken(). */
export interface TokenResult {
  accessToken: string;
  claims: CognitoJwtClaims;
}

interface CachedToken extends TokenResult {
  expiresAt: number; // Unix timestamp (ms)
  refreshAt: number; // Unix timestamp (ms) — proactive refresh threshold
}

/**
 * Manages a Cognito JWT for a single API client (clientKey/clientSecret pair).
 *
 * Each instance caches one token and handles proactive refresh. For
 * multi-client support, use {@link CredentialTokenProviderCache} which
 * maintains a bounded map of providers keyed by clientKey.
 */
export class CredentialTokenProvider {
  private readonly config: TokenProviderConfig;
  private cachedToken: CachedToken | null = null;
  private inflightPromise: Promise<CachedToken> | null = null;

  constructor(config: TokenProviderConfig) {
    if (
      !config.externalApiBaseUrl.startsWith('https://') &&
      process.env.NODE_ENV !== 'development'
    ) {
      throw new Error('externalApiBaseUrl must use HTTPS');
    }
    this.config = config;
  }

  /**
   * Get a valid access token, refreshing proactively if needed.
   * On first call, exchanges credentials for a Cognito JWT (lazy init).
   * Falls back to the cached token if refresh fails and it hasn't hard-expired.
   * Concurrent calls are deduplicated into a single HTTP request.
   */
  readonly getToken = async (): Promise<TokenResult> => {
    // Lazy init or refresh — deduplicate concurrent calls
    if (!this.cachedToken) {
      return this.deduplicatedExchange();
    }

    const now = Date.now();

    // Token hasn't reached refresh threshold — return cached
    if (now < this.cachedToken.refreshAt) {
      return this.cachedToken;
    }

    // Token is past refresh threshold — attempt proactive refresh
    try {
      return await this.deduplicatedExchange();
    } catch (err) {
      // Re-snapshot time after the (potentially slow) refresh attempt
      const fallbackNow = Date.now();

      // If the cached token hasn't hard-expired, fall back to it
      if (fallbackNow < this.cachedToken.expiresAt) {
        logger.warn(
          { err },
          'Token refresh failed — falling back to cached token'
        );

        return this.cachedToken;
      }

      // Cached token has also expired — nothing to fall back to
      logger.error({ err }, 'Token refresh failed and cached token expired');
      throw new Error('Token expired and refresh failed');
    }
  };

  /**
   * Deduplicate concurrent exchange/refresh calls so only one
   * HTTP request is in-flight at a time. Used for both initial
   * authentication and token refresh.
   */
  private readonly deduplicatedExchange = async (): Promise<CachedToken> => {
    if (this.inflightPromise) {
      return this.inflightPromise;
    }

    this.inflightPromise = this.exchangeCredentials()
      .then((token) => {
        const isRefresh = this.cachedToken !== null;
        this.cachedToken = token;
        logger.info(
          { orgId: token.claims.org_id, tenant: token.claims.tenant_id },
          isRefresh
            ? 'Token refreshed successfully'
            : 'Credential authentication successful'
        );

        return token;
      })
      .finally(() => {
        this.inflightPromise = null;
      });

    return this.inflightPromise;
  };

  /**
   * Exchange client key/secret for a Cognito JWT via the External API.
   */
  private readonly exchangeCredentials = async (): Promise<CachedToken> => {
    const url = `${this.config.externalApiBaseUrl}/api/v1/auth/token`;

    logger.debug('Exchanging client credentials for token');

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientKey: this.config.clientKey,
        clientSecret: this.config.clientSecret,
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');

      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid client credentials');
      }

      logger.debug(
        { status: response.status, body: body.slice(0, 200) },
        'Token exchange error response'
      );
      throw new Error(
        `Token exchange failed: ${String(response.status)} ${response.statusText}`
      );
    }

    const raw: unknown = await response.json();
    const data = TokenResponseSchema.parse(raw);

    const claims = decodeTokenClaims(data.accessToken);
    const now = Date.now();
    const ttlMs = Math.min(data.expiresIn, MAX_TTL_SECONDS) * 1000;

    return {
      accessToken: data.accessToken,
      claims,
      expiresAt: now + ttlMs,
      refreshAt: now + ttlMs * REFRESH_THRESHOLD,
    };
  };
}

/**
 * Decode a Cognito JWT to extract custom claims.
 * We do NOT verify the signature here — the token was just received from
 * the trusted External API endpoint over HTTPS, and downstream services
 * (tRPC, External API) verify it independently.
 *
 * NOTE: `org_id` and `tenant_id` are used to construct `CredentialSession`,
 * which scopes tool execution. This is acceptable because the token comes
 * from a trusted first-party endpoint, but if the trust boundary changes
 * (e.g., tokens from third parties), signature verification must be added.
 */
export const decodeTokenClaims = (token: string): CognitoJwtClaims => {
  const decoded: unknown = jsonwebtoken.decode(token);

  if (!decoded || typeof decoded !== 'object') {
    throw new Error('Failed to decode token — invalid JWT format');
  }

  const result = CognitoJwtClaimsSchema.safeParse(decoded);

  if (!result.success) {
    throw new Error(
      `Token missing required claims: ${result.error.issues.map((i) => i.path.join('.')).join(', ')}`
    );
  }

  return result.data;
};

/**
 * Bounded cache of {@link CredentialTokenProvider} instances keyed by clientKey.
 *
 * The MCP server handles connections from multiple API clients, each with
 * their own clientKey/clientSecret. This cache ensures:
 * - Each client gets its own provider with its own cached Cognito JWT
 * - No cross-client token leakage (strict client isolation)
 * - Bounded memory via LRU eviction when max capacity is reached
 */
export class CredentialTokenProviderCache {
  private readonly providers = new Map<string, CredentialTokenProvider>();
  private readonly maxProviders: number;
  private readonly externalApiBaseUrl: string;

  constructor(
    externalApiBaseUrl: string,
    maxProviders = DEFAULT_MAX_PROVIDERS
  ) {
    this.externalApiBaseUrl = externalApiBaseUrl;
    this.maxProviders = maxProviders;
  }

  /**
   * Get or create a token provider for the given client credentials.
   * Keyed on clientKey + SHA-256(clientSecret) to prevent cache poisoning:
   * if a different secret is presented for the same clientKey, a new
   * provider is created (and the old one evicted).
   */
  readonly getProvider = (
    clientKey: string,
    clientSecret: string
  ): CredentialTokenProvider => {
    const cacheKey = this.buildCacheKey(clientKey, clientSecret);

    const existing = this.providers.get(cacheKey);
    if (existing) {
      // Move to end for LRU ordering (Map preserves insertion order)
      this.providers.delete(cacheKey);
      this.providers.set(cacheKey, existing);

      return existing;
    }

    // Evict oldest entry if at capacity
    if (this.providers.size >= this.maxProviders) {
      const oldest = this.providers.keys().next();
      if (!oldest.done && oldest.value) {
        this.providers.delete(oldest.value);
        logger.debug('Evicted oldest token provider from cache');
      }
    }

    const provider = new CredentialTokenProvider({
      clientKey,
      clientSecret,
      externalApiBaseUrl: this.externalApiBaseUrl,
    });
    this.providers.set(cacheKey, provider);

    return provider;
  };

  private readonly buildCacheKey = (
    clientKey: string,
    clientSecret: string
  ): string => {
    const secretHash = createHash('sha256')
      .update(clientSecret)
      .digest('hex')
      .slice(0, 16);

    return `${clientKey}:${secretHash}`;
  };

  /** Number of cached providers. */
  get size(): number {
    return this.providers.size;
  }
}
