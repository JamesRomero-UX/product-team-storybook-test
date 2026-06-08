import { FastMCP } from 'fastmcp';
import type { Context } from 'hono';

import type { McpSession } from './auth/authenticate';
import { createAuthenticator } from './auth/authenticate';
import { CredentialTokenProviderCache } from './auth/credential-token-provider';
import { createDCRRoute } from './auth/dcr-proxy';
import { AuthenticationError } from './errors';
import { errorHandlerMiddleware } from './middleware/error-handler';
import { requestContextMiddleware } from './middleware/request-context';
import { executeToolForSession } from './tools/executor-factory';
import { toolDefinitions } from './tools/registry';
import { getEnv, getOptionalEnv } from './utils/environment';
import { logger } from './utils/logger';

const isJsonObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const AS_METADATA_TTL_MS = 5 * 60 * 1000;
const AS_METADATA_FETCH_TIMEOUT_MS = 10_000;

export const createServer = () => {
  const mcpServerUrl = getEnv('MCP_SERVER_URL');
  const auth0Domain = getEnv('AUTH0_DOMAIN');

  // Credential auth uses a per-request model: callers send X-Client-Key and
  // X-Client-Secret headers, which are exchanged for Cognito JWTs via the
  // External API. The cache manages one provider per client, with LRU eviction.
  // Only EXTERNAL_API_BASE_URL is needed at the server level — individual
  // client credentials come from the request, not env vars.
  const externalApiBaseUrl = getOptionalEnv('EXTERNAL_API_BASE_URL');

  let credentialCache: CredentialTokenProviderCache | undefined;
  if (externalApiBaseUrl) {
    try {
      credentialCache = new CredentialTokenProviderCache(externalApiBaseUrl);
      logger.info(
        { externalApiBaseUrl },
        'Credential auth path enabled — callers must provide X-Client-Key and X-Client-Secret headers'
      );
    } catch (err) {
      logger.error(
        { err },
        'Failed to initialise credential cache — OAuth-only mode'
      );
    }
  } else {
    logger.info(
      'Credential auth path disabled — EXTERNAL_API_BASE_URL not set'
    );
  }

  const authenticate = createAuthenticator(credentialCache);

  // Cache for Auth0 AS metadata — scoped to this server instance
  let asMetadataCache:
    | { data: Record<string, unknown>; expiresAt: number }
    | undefined;

  const server = new FastMCP<McpSession>({
    name: 'risksmart',
    version: '1.0.0',
    health: { enabled: true, path: '/health' },
    authenticate,
    oauth: {
      enabled: true,
      protectedResource: {
        resource: mcpServerUrl,
        // Intentionally points to mcpServerUrl (not Auth0 directly) so that
        // mcp-remote fetches /.well-known/oauth-authorization-server from
        // *this* server, where we inject the DCR proxy registration_endpoint
        // override. See CLAUDE.md §Troubleshooting/ServerError at registerClient.
        authorizationServers: [mcpServerUrl],
        scopesSupported: ['openid', 'offline_access'],
        bearerMethodsSupported: ['header'],
        resourceName: 'RiskSmart MCP Server',
      },
    },
  });

  // Override Auth0's AS metadata:
  // - registration_endpoint → our DCR proxy
  // - authorization_endpoint → include audience so Auth0 returns a JWT with Hasura claims
  const apiAudience = getEnv('AUTH0_API_AUDIENCE', '');
  const app = server.getApp();

  // Request context middleware — generates correlation ID, creates request-scoped logger.
  // Must be registered before onError so the error handler has access to the
  // request-scoped logger and correlation ID.
  app.use('*', requestContextMiddleware);

  // Global error handler — catches McpError instances and formats for clients
  app.onError(errorHandlerMiddleware);

  // DCR proxy route (unauthenticated per RFC 7591)
  createDCRRoute(server);

  app.get('/.well-known/oauth-authorization-server', async (c: Context) => {
    const now = Date.now();

    // Return cached metadata if still valid
    if (asMetadataCache && now < asMetadataCache.expiresAt) {
      logger.debug('Returning cached AS metadata');

      return c.json(asMetadataCache.data);
    }

    logger.info('Fetching Auth0 AS metadata for override');
    try {
      const res = await fetch(
        `https://${auth0Domain}/.well-known/oauth-authorization-server`,
        { signal: AbortSignal.timeout(AS_METADATA_FETCH_TIMEOUT_MS) }
      );
      if (!res.ok) {
        logger.error(
          { status: res.status },
          'Auth0 AS metadata returned non-2xx'
        );

        return c.json(
          { error: 'Failed to fetch authorization server metadata' },
          502
        );
      }
      const json: unknown = await res.json();
      if (!isJsonObject(json)) {
        logger.error('Auth0 AS metadata is not a JSON object');

        return c.json(
          { error: 'Failed to fetch authorization server metadata' },
          502
        );
      }
      const metadata = json;
      metadata.registration_endpoint = `${mcpServerUrl}/register`;
      if (apiAudience) {
        metadata.authorization_endpoint = `https://${auth0Domain}/authorize?audience=${encodeURIComponent(apiAudience)}`;
      }

      // Cache the result
      asMetadataCache = {
        data: metadata,
        expiresAt: now + AS_METADATA_TTL_MS,
      };

      logger.debug(
        {
          registrationEndpoint: metadata.registration_endpoint,
          authorizationEndpoint: metadata.authorization_endpoint,
        },
        'Returning AS metadata with overrides'
      );

      return c.json(metadata);
    } catch (err) {
      logger.error({ err }, 'Failed to fetch Auth0 AS metadata');

      return c.json(
        { error: 'Failed to fetch authorization server metadata' },
        502
      );
    }
  });

  // --- Register MCP tools from tRPC procedures ---
  logger.info({ toolCount: toolDefinitions.length }, 'Registering MCP tools');
  for (const toolDef of toolDefinitions) {
    server.addTool({
      name: toolDef.name,
      description: toolDef.description,
      annotations: { readOnlyHint: true, openWorldHint: false },
      parameters: toolDef.parameters,
      execute: async (args: Record<string, unknown>, { session }) => {
        if (!session) {
          throw new AuthenticationError(
            'Session not available — authentication required'
          );
        }
        logger.info(
          { tool: toolDef.name, orgId: session.orgId },
          'Tool execute called'
        );
        const result = await executeToolForSession(toolDef, args, session);
        logger.debug(
          { tool: toolDef.name, resultLength: result.length },
          'Tool execute completed'
        );

        return result;
      },
    });
  }

  return server;
};
