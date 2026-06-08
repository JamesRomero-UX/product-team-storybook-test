import type { ManagementClient } from 'auth0';
import type { FastMCP } from 'fastmcp';
import type { Context } from 'hono';

import { RateLimitError, ValidationError } from '../errors';
import { getEnv } from '../utils/environment';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { getManagementClient, resetManagementClient } from './auth0-management';
import type { McpSession } from './authenticate';

// Allowlisted redirect URI patterns for known MCP clients
const ALLOWED_REDIRECT_PATTERNS = [
  /^https:\/\/claude\.ai\/api\/mcp\/auth_callback$/,
  /^https:\/\/chatgpt\.com\/connector_platform_oauth_redirect$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?\/callback\/?$/,
  /^https?:\/\/localhost(:\d+)?\/callback\/?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?\/oauth\/callback\/?$/,
  /^https?:\/\/localhost(:\d+)?\/oauth\/callback\/?$/,
  /^https:\/\/vscode\.dev\/redirect$/,
  /^https:\/\/insiders\.vscode\.dev\/redirect$/,
  /^https:\/\/actions\.zapier\.com\/oauth\/redirect\/?$/, // trailing slash tolerated — query params intentionally rejected per RFC 6749 §3.1.2
];

export const validateRedirectUris = (uris: string[]): boolean => {
  if (uris.length === 0) {
    return false;
  }

  return uris.every((uri) =>
    ALLOWED_REDIRECT_PATTERNS.some((pattern) => pattern.test(uri))
  );
};

// Simple in-memory rate limiter: 10 requests per IP per 15 minutes.
// NOTE: This is a single-instance rate limiter. If the MCP server is
// horizontally scaled, a distributed store (e.g. Redis) would be needed.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

// Periodically clean up expired entries to prevent unbounded memory growth
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  },
  5 * 60 * 1000
).unref();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });

    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;

  return true;
};

interface DCRRequestBody {
  client_name?: string;
  redirect_uris?: string[];
  grant_types?: string[];
  response_types?: string[];
  token_endpoint_auth_method?: string;
  scope?: string;
}

/**
 * Search for an existing Auth0 client whose callbacks exactly match the
 * requested redirect_uris. Returns the first match, or undefined.
 */
const findExistingClient = async (
  managementClient: ManagementClient,
  redirectUris: string[]
) => {
  try {
    const sorted = [...redirectUris].sort();
    const fields = [
      'client_id',
      'client_secret',
      'name',
      'callbacks',
      'grant_types',
      'token_endpoint_auth_method',
    ].join(',');

    // Paginate through all regular_web clients
    const PAGE_SIZE = 100;
    let page = 0;

    for (;;) {
      const response = await managementClient.clients.getAll({
        app_type: 'regular_web',
        fields,
        include_fields: true,
        page,
        per_page: PAGE_SIZE,
      });

      const clients = response.data;

      const match = clients.find((client) => {
        const callbacks = [...(client.callbacks ?? [])].sort();

        return (
          callbacks.length === sorted.length &&
          callbacks.every((uri, i) => uri === sorted[i])
        );
      });

      if (match) {
        return match;
      }

      if (clients.length < PAGE_SIZE) {
        break;
      }

      page++;
    }

    return undefined;
  } catch (err) {
    logger.warn({ err }, 'Failed to search for existing Auth0 clients');

    return undefined;
  }
};

export const createDCRRoute = (server: FastMCP<McpSession>) => {
  const app = server.getApp();

  app.post('/register', async (c: Context) => {
    // Prefer the socket remote address for rate limiting to prevent
    // x-forwarded-for spoofing. Fall back to the header only if needed.
    const ip =
      ((c.env as Record<string, unknown>)?.remoteAddr as string) ||
      c.req.header('x-real-ip') ||
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';

    logger.info({ ip }, 'DCR /register request received');

    if (!checkRateLimit(ip)) {
      logger.warn({ ip }, 'DCR rate limit exceeded');
      throw new RateLimitError(
        'Too many registration requests. Please try again later.'
      );
    }

    let body: DCRRequestBody;
    try {
      const rawBody = await c.req.text();
      if (rawBody.length > 8192) {
        throw new ValidationError('Request body too large');
      }
      body = JSON.parse(rawBody) as DCRRequestBody;
    } catch (parseErr) {
      if (parseErr instanceof ValidationError) {
        throw parseErr;
      }
      logger.warn('DCR request with invalid JSON body');
      throw new ValidationError('Invalid JSON body');
    }

    logger.info(
      {
        clientName: body.client_name?.slice(0, 100),
        redirectUris: body.redirect_uris,
      },
      'DCR request parsed'
    );

    const redirectUris = body.redirect_uris;
    if (
      !redirectUris ||
      !Array.isArray(redirectUris) ||
      redirectUris.length === 0
    ) {
      throw new ValidationError('redirect_uris is required');
    }

    if (!validateRedirectUris(redirectUris)) {
      logger.warn(
        { redirectUris },
        'DCR request with disallowed redirect URIs'
      );
      throw new ValidationError('One or more redirect_uris are not allowed');
    }

    // Find existing client or create via Auth0 Management API
    const auth0Domain = getEnv('AUTH0_DOMAIN');

    const clientPayload = {
      name: body.client_name?.slice(0, 100) || 'MCP Client',
      app_type: 'regular_web' as const,
      callbacks: redirectUris,
      grant_types: ['authorization_code', 'refresh_token'],
      token_endpoint_auth_method: 'client_secret_post' as const,
      organization_usage: 'require' as const,
      organization_require_behavior: 'post_login_prompt' as const,
      is_first_party: true,
      jwt_configuration: {
        alg: 'RS256' as const,
        lifetime_in_seconds: 600,
      },
      refresh_token: {
        rotation_type: 'rotating' as const,
        expiration_type: 'expiring' as const,
        token_lifetime: 86400, // 24 hours
        idle_token_lifetime: 14400, // 4 hours
      },
      oidc_conformant: true,
      initiate_login_uri: `https://${auth0Domain}/authorize`,
    };

    const formatClientResponse = (client: {
      client_id?: string;
      client_secret?: string;
      name?: string;
      callbacks?: string[];
      grant_types?: string[];
      token_endpoint_auth_method?: string;
    }) => ({
      client_id: client.client_id,
      client_secret: client.client_secret,
      client_name: client.name,
      redirect_uris: client.callbacks,
      grant_types: client.grant_types,
      response_types: ['code'],
      token_endpoint_auth_method: client.token_endpoint_auth_method,
    });

    try {
      const managementClient = getManagementClient();

      // Deduplication: look for an existing client with matching redirect_uris.
      // If found, return only the client_id (not the secret) so that the
      // original registrant's credentials are not exposed.
      const existingClient = await findExistingClient(
        managementClient,
        redirectUris
      );
      if (existingClient) {
        logger.info(
          { clientId: existingClient.client_id },
          'Returning existing Auth0 client for matching redirect_uris'
        );
        metrics.dcrRequest('existing');

        return c.json(
          {
            client_id: existingClient.client_id,
            client_name: existingClient.name,
            redirect_uris: existingClient.callbacks,
            grant_types: existingClient.grant_types,
            response_types: ['code'],
            token_endpoint_auth_method:
              existingClient.token_endpoint_auth_method,
          },
          200
        );
      }

      const response = await managementClient.clients.create(clientPayload);
      metrics.dcrRequest('created');

      return c.json(formatClientResponse(response.data), 201);
    } catch (err) {
      // If the Management API token expired, reset the singleton and retry once
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 401) {
        logger.warn(
          'Management API returned 401 — resetting client and retrying'
        );
        resetManagementClient();

        try {
          const retryClient = getManagementClient();
          const retryResponse = await retryClient.clients.create(clientPayload);
          metrics.dcrRequest('created');

          return c.json(formatClientResponse(retryResponse.data), 201);
        } catch (retryErr) {
          logger.error(
            { err: retryErr },
            'DCR retry after token reset also failed'
          );
          metrics.dcrRequest('error');

          return c.json({ error: 'Failed to register client' }, 500);
        }
      }

      logger.error({ err }, 'Failed to create Auth0 client via DCR');
      metrics.dcrRequest('error');

      return c.json({ error: 'Failed to register client' }, 500);
    }
  });
};
