import type { IncomingMessage } from 'http';
import type { Algorithm, JwtPayload } from 'jsonwebtoken';
import jsonwebtoken from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { z } from 'zod';

import {
  AuthenticationError,
  AuthorizationError,
  McpError,
  ValidationError,
} from '../errors';
import { getEnv } from '../utils/environment';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import type { CredentialTokenProviderCache } from './credential-token-provider';
import { isMcpEnabledForOrg } from './module-checker';

const HASURA_NS = 'https://hasura.io/jwt/claims';

export interface OAuthSession {
  [key: string]: unknown;
  authType: 'oauth';
  orgId: string;
  userId: string;
  tenant: string;
  accessToken: string;
}

export interface CredentialSession {
  [key: string]: unknown;
  authType: 'credentials';
  orgId: string;
  tenant: string;
  accessToken: string;
}

export type McpSession = OAuthSession | CredentialSession;

const IssuerConfigSchema = z.object({
  type: z.string(),
  key: z.string().optional(),
  jwk_url: z.string().optional(),
  allowed_skew: z.number().optional(),
});

type IssuerConfig = z.infer<typeof IssuerConfigSchema>;

const JWTSecretConfigSchema = z.object({
  issuers: z.record(IssuerConfigSchema).optional(),
  type: z.string().optional(),
  key: z.string().optional(),
  jwk_url: z.string().optional(),
});

type JWTSecretConfig = z.infer<typeof JWTSecretConfigSchema>;

const jwksClients = new Map<string, jwksRsa.JwksClient>();

const getJWTConfig = (): JWTSecretConfig => {
  const raw: unknown = JSON.parse(getEnv('JWT_SECRET_CONFIG'));

  return JWTSecretConfigSchema.parse(raw);
};

const getJwksClient = (jwkUrl: string): jwksRsa.JwksClient => {
  let client = jwksClients.get(jwkUrl);
  if (!client) {
    client = jwksRsa({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: jwkUrl,
    });
    jwksClients.set(jwkUrl, client);
  }

  return client;
};

const findIssuerConfig = (
  config: JWTSecretConfig,
  issuer: string
): IssuerConfig | undefined => {
  if (!config.issuers) {
    return undefined;
  }

  // Try exact match, then with/without trailing slash
  const candidates = [
    issuer,
    issuer.endsWith('/') ? issuer.slice(0, -1) : `${issuer}/`,
  ];

  for (const candidate of candidates) {
    const cfg = config.issuers[candidate];
    if (cfg) {
      return cfg;
    }
  }

  return undefined;
};

const getSigningKey = async (
  issuerConfig: IssuerConfig,
  kid: string | undefined
): Promise<string> => {
  if (issuerConfig.key) {
    return issuerConfig.key;
  }
  if (issuerConfig.jwk_url) {
    const client = getJwksClient(issuerConfig.jwk_url);
    const key = await client.getSigningKey(kid);

    return key.getPublicKey();
  }
  throw new Error('Issuer config has neither key nor jwk_url');
};

/** Safe algorithm values — excludes 'none' */
const SAFE_ALGORITHMS: ReadonlySet<string> = new Set<Algorithm>([
  'HS256',
  'HS384',
  'HS512',
  'RS256',
  'RS384',
  'RS512',
  'ES256',
  'ES384',
  'ES512',
  'PS256',
  'PS384',
  'PS512',
]);

const isSafeAlgorithm = (alg: string): alg is Algorithm =>
  SAFE_ALGORITHMS.has(alg);

const isJwtPayload = (value: unknown): value is JwtPayload =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const verifyToken = (
  token: string,
  signingKey: string,
  algorithms: Algorithm[],
  clockTolerance?: number
): JwtPayload => {
  const result = jsonwebtoken.verify(token, signingKey, {
    algorithms,
    clockTolerance,
  });

  if (!isJwtPayload(result)) {
    throw new Error('JWT verify returned unexpected non-object payload');
  }

  return result;
};

const authenticateOAuthRequest = async (
  request: IncomingMessage
): Promise<OAuthSession> => {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    logger.warn('Authentication failed: missing bearer token');
    throw new AuthenticationError('Missing bearer token');
  }

  const token = authHeader.slice(7);
  const config = getJWTConfig();

  // Decode header to get kid and algorithm, and payload to get issuer
  const decoded = jsonwebtoken.decode(token, { complete: true });
  if (!decoded) {
    logger.warn('Authentication failed: could not decode token');
    throw new AuthenticationError('Invalid or malformed token');
  }

  const kid = decoded.header.kid;
  const payload = decoded.payload;

  if (typeof payload === 'string') {
    logger.warn('Authentication failed: token payload is not JSON');
    throw new AuthenticationError('Invalid token payload');
  }

  const issuer = payload.iss;

  logger.debug(
    { issuer, sub: payload.sub, hasHasuraClaims: !!payload[HASURA_NS] },
    'Decoded JWT'
  );

  if (!issuer) {
    logger.warn('Authentication failed: token missing issuer');
    throw new AuthenticationError('Token missing issuer');
  }

  // Find the issuer configuration
  const issuerConfig = findIssuerConfig(config, issuer);
  if (!issuerConfig) {
    logger.warn({ issuer }, 'No JWT config found for issuer');
    throw new AuthenticationError('Token issued by an unrecognised authority');
  }

  // Reject unsafe algorithm configurations
  if (!issuerConfig.type || issuerConfig.type.toLowerCase() === 'none') {
    logger.warn({ issuer }, 'Unsafe JWT algorithm configured');
    throw new AuthenticationError('Unsafe JWT algorithm configured');
  }

  if (!isSafeAlgorithm(issuerConfig.type)) {
    logger.warn({ issuer, alg: issuerConfig.type }, 'Unknown JWT algorithm');
    throw new AuthenticationError('Unsafe JWT algorithm configured');
  }

  // Get signing key and verify
  let verified: JwtPayload;
  try {
    const signingKey = await getSigningKey(issuerConfig, kid);
    verified = verifyToken(
      token,
      signingKey,
      [issuerConfig.type],
      issuerConfig.allowed_skew
    );
  } catch (err) {
    logger.warn({ err, issuer }, 'JWT verification failed');
    throw new AuthenticationError('JWT verification failed');
  }

  // Extract Hasura claims
  const hasuraRaw: unknown = verified[HASURA_NS];
  const hasura: Record<string, string> = isJwtPayload(hasuraRaw)
    ? Object.fromEntries(
        Object.entries(hasuraRaw).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string'
        )
      )
    : {};
  const orgId = hasura['x-hasura-org-id'] || String(verified.org_id ?? '');
  const userId = hasura['x-hasura-user-id'] || String(verified.sub ?? '');
  const tenantRaw =
    hasura['x-hasura-tenant-name'] || String(verified.tenant_id ?? '');
  const tenant = tenantRaw.toLowerCase();

  if (!orgId || !tenant) {
    logger.warn('Token missing required org/tenant claims');
    throw new AuthenticationError(
      'Token is missing required organisation claims'
    );
  }

  // Check if MCP is enabled for this org via the modules system
  const mcpEnabled = await isMcpEnabledForOrg(orgId, token);
  if (!mcpEnabled) {
    logger.warn({ orgId }, 'MCP module not enabled for this organization');
    metrics.authFailure('oauth', 'mcp_not_enabled');
    throw new AuthorizationError(
      'MCP is not enabled for this organisation. Contact your admin to enable MCP in Settings → Modules.'
    );
  }

  logger.info(
    { orgId, tenant },
    'Authentication successful — OAuth session created'
  );
  metrics.authSuccess('oauth');

  return { authType: 'oauth', orgId, userId, tenant, accessToken: token };
};

/**
 * Extract per-request client credentials from custom headers.
 * Returns undefined if neither header is present — this is not an error,
 * it just means the credential path is not being attempted.
 * Throws if only one header is present (partial credentials = caller mistake).
 */
/** Normalize a header value to a single string (takes first element if array). */
const headerToString = (
  value: string | string[] | undefined
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const extractClientCredentials = (
  request: IncomingMessage
): { clientKey: string; clientSecret: string } | undefined => {
  const clientKey = headerToString(request.headers['x-client-key']);
  const clientSecret = headerToString(request.headers['x-client-secret']);

  if (!clientKey && !clientSecret) {
    return undefined;
  }

  if (!clientKey || !clientSecret) {
    throw new ValidationError(
      'Both X-Client-Key and X-Client-Secret headers are required'
    );
  }

  return { clientKey, clientSecret };
};

/**
 * Create an `authenticateRequest` function, optionally backed by a
 * credential token provider cache for the system-to-system auth path.
 *
 * Auth routing precedence (Bearer token always wins):
 * 1. Bearer JWT present → OAuth path (Auth0 JWT validation)
 * 2. X-Client-Key + X-Client-Secret headers → credential path
 *    (exchange for Cognito JWT via External API, cached per client)
 * 3. Neither → reject with clear error
 */
export const createAuthenticator = (
  credentialCache?: CredentialTokenProviderCache
) => {
  return async (request: IncomingMessage): Promise<McpSession> => {
    const authHeader = request.headers.authorization;

    // Bearer token always takes precedence — even if credential headers are
    // also present, the OAuth path is used. This prevents ambiguity when a
    // caller accidentally sends both.
    if (authHeader?.startsWith('Bearer ')) {
      return authenticateOAuthRequest(request);
    }

    // Credential path — require per-request client key/secret headers
    if (credentialCache) {
      const credentials = extractClientCredentials(request);
      if (credentials) {
        return authenticateWithCredentials(credentialCache, credentials);
      }
    }

    logger.warn(
      'Authentication failed: no bearer token and no client credentials provided'
    );
    throw new AuthenticationError('Missing authentication');
  };
};

const authenticateWithCredentials = async (
  cache: CredentialTokenProviderCache,
  credentials: { clientKey: string; clientSecret: string }
): Promise<CredentialSession> => {
  try {
    const provider = cache.getProvider(
      credentials.clientKey,
      credentials.clientSecret
    );
    const { accessToken, claims } = await provider.getToken();

    // Check if MCP is enabled for this org via the modules system
    const mcpEnabled = await isMcpEnabledForOrg(claims.org_id, accessToken);
    if (!mcpEnabled) {
      logger.warn(
        { orgId: claims.org_id },
        'MCP module not enabled for this organization'
      );
      metrics.authFailure('credentials', 'mcp_not_enabled');
      throw new AuthorizationError(
        'MCP is not enabled for this organisation. Contact your admin to enable MCP in Settings → Modules.'
      );
    }

    logger.info(
      { orgId: claims.org_id, tenant: claims.tenant_id },
      'Authentication successful — credential session created'
    );
    metrics.authSuccess('credentials');

    return {
      authType: 'credentials',
      orgId: claims.org_id,
      tenant: claims.tenant_id.toLowerCase(),
      accessToken,
    };
  } catch (err) {
    // Re-throw typed errors
    if (err instanceof McpError) {
      throw err;
    }

    logger.warn({ err }, 'Credential authentication failed');
    metrics.authFailure('credentials', 'invalid_credentials');
    throw new AuthenticationError('Credential authentication failed');
  }
};
