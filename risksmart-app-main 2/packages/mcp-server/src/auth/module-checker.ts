import {
  isModuleEnabled,
  mergeModulesWithDefaults,
} from '@risksmart-app/modules/src/module-resolver';
import type { ModuleConfig } from '@risksmart-app/modules/src/types';

import { getEnv } from '../utils/environment';
import { logger } from '../utils/logger';
import { requestStore } from '../utils/request-store';

const FETCH_TIMEOUT_MS = 10_000;

/** Cache TTL for module settings per org (5 minutes). */
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  mcpEnabled: boolean;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Check if MCP is enabled for an organisation by querying the
 * organisationModule tRPC procedure.
 *
 * Returns true if either `mcp_server_integrations` or `mcp_personal`
 * sub-module is enabled under the `integrations` module.
 *
 * Results are cached per orgId with a 5-minute TTL.
 */
export const isMcpEnabledForOrg = async (
  orgId: string,
  accessToken: string
): Promise<boolean> => {
  const now = Date.now();
  const cached = cache.get(orgId);
  if (cached && now < cached.expiresAt) {
    return cached.mcpEnabled;
  }

  try {
    const trpcBaseUrl = getEnv('TRPC_SERVICE_BASE_URL');
    const input = encodeURIComponent(JSON.stringify({ json: {} }));
    const url = `${trpcBaseUrl}/trpc/organisationModule.getByOrgId?input=${input}`;

    const correlationId = requestStore.getStore()?.correlationId;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${accessToken}`,
        ...(correlationId ? { 'x-correlation-id': correlationId } : {}),
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      logger.warn(
        { orgId, status: response.status },
        'Failed to fetch organisation module settings'
      );

      // On error, deny access rather than allow potentially unauthorized access
      return false;
    }

    const body = (await response.json()) as {
      result?: {
        data?: {
          json?: {
            organisationModule?: { ModuleSettings?: ModuleConfig } | null;
          };
        };
      };
    };

    const rawSettings =
      body?.result?.data?.json?.organisationModule?.ModuleSettings;

    const modules = mergeModulesWithDefaults(rawSettings ?? {});
    const mcpEnabled =
      isModuleEnabled(
        modules,
        'integrations.subModules.mcp_server_integrations'
      ) || isModuleEnabled(modules, 'integrations.subModules.mcp_personal');

    cache.set(orgId, { mcpEnabled, expiresAt: now + CACHE_TTL_MS });

    logger.debug({ orgId, mcpEnabled }, 'Module check result');

    return mcpEnabled;
  } catch (err) {
    logger.warn({ err, orgId }, 'Module check failed');

    // On error, deny access
    return false;
  }
};
