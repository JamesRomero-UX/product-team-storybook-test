import type { MutableToken } from 'oauth2-mock-server';
import { OAuth2Server } from 'oauth2-mock-server';

import { logger } from './utils/logger.js';

const MOCK_AUTH_PORT = process.env.MOCK_AUTH_PORT || '3232';

interface ServiceRequest {
  body: {
    scope?: string;
    client_id?: string;
    org_id?: string;
    exp_hours?: number;
    hasura_feature_flags?: string;
    user_id?: string;
    source_service?: string;
    permissions?: string;
  };
}

const defaultHasuraFeatureFlags = [
  'notifications',
  'reports',
  'compliance',
  'policy',
  'notification-preferences',
  'impacts',
  'approvers',
  'attestations',
  'internal_audit',
  'compliance_monitoring',
  'attestations',
  'multi_reporting',
  'enterprise_risk',
  'permit',
  'aie_chat',
  'modules',
  'trpc',
  'mcp',
];

async function start() {
  const server = new OAuth2Server();
  await server.issuer.keys.generate('RS256');

  server.service.on(
    'beforeTokenSigning',
    (token: MutableToken, req: ServiceRequest) => {
      const requestedScope = req.body?.scope || 'openid offline_access';
      const clientId = req.body?.client_id || 'client-one';
      const userId = req.body?.user_id || 'auth0|test_user_123';
      const tokenExpiry = req.body?.exp_hours || 8;

      //standard claims
      token.payload.exp = Math.floor(Date.now() / 1000) + tokenExpiry * 3600;
      token.payload.token_use = 'access';
      token.payload.aud = clientId;

      // payload for ext-api claims
      token.payload.permissions = req.body?.permissions;
      token.payload.scope = requestedScope;
      token.payload.tenant_id = req.body?.org_id || 'org_test';
      token.payload.org_id = req.body?.org_id || 'org_test';
      token.payload.sub = userId;
      token.payload.azp = clientId;
      if (req.body?.source_service) {
        token.payload.source_service = req.body.source_service;
      }

      // payload for hasura claims
      const hasuraNamespace = {
        'x-hasura-allowed-roles': ['RiskManager'],
        'x-hasura-default-role': 'RiskManager',
        'x-hasura-logo': 'default',
        'x-hasura-taxonomy': 'default',
        'x-hasura-features':
          Array.from(
            new Set([
              ...(req.body?.hasura_feature_flags?.split(',') ||
                defaultHasuraFeatureFlags),
            ])
          ).join(',') || '',
        'x-hasura-org-id': req.body?.org_id || 'org_test',
        'x-hasura-tenant-name': 'MultiTenant',
        'x-hasura-user-id': userId,
      };
      if (!token.payload?.source_service) {
        // drop hasura claims if source service is provided.
        token.payload['https://hasura.io/jwt/claims'] = hasuraNamespace;
      }
      token.payload.claims_roles = ['RiskManager'];
    }
  );

  await server.start(parseInt(MOCK_AUTH_PORT));

  logger.info(`🚀 Mock OIDC server started at: ${server.issuer.url}`);
  logger.info(`🔑 JWK endpoint: ${server.issuer.url}/jwks`);
  logger.info(`🎫 Token endpoint: ${server.issuer.url}/token`);
}

start().catch((err) => {
  logger.error({ err: err as Error }, 'Failed to start mock server');
  process.exit(1);
});
