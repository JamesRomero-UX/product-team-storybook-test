import type { ModuleConfig, ModuleKey } from '@risksmart-app/modules/src/index';
import {
  mergeModulesWithDefaults,
  moduleConfigSchema,
  resolveModuleEnabled,
} from '@risksmart-app/modules/src/index';
import { getDefaultDeepLinkBaseUrl } from '@risksmart-app/shared/links/getDefaultDeepLinkBaseUrl';
import type { Meta } from '@risksmart-app/shared/organisation/Meta';
import {
  GetModuleSettingsDocument,
  GetOrgMetaDataDocument,
} from 'generated/graphql';
import { getHasuraClient } from 'src/graphqlClient';
import { Config } from 'sst/node/config';

import { getLogger } from '../logger';
const logger = getLogger();

export interface Details {
  OrgKey: string;
  OrgName: string;
  Meta?: Meta;
}

export const getOrgDetails = async ({
  orgKey,
  tenant,
}: {
  orgKey: string;
  tenant: string;
}): Promise<Details> => {
  logger.info('Requesting org', { orgKey });
  const hasuraClient = getHasuraClient({
    tenantName: tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetOrgMetaDataDocument,
    variables: {
      orgKey: orgKey,
    },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get org');
  }

  if (!data.auth_organisation_by_pk) {
    throw new Error('Org not found');
  }

  return {
    OrgKey: data.auth_organisation_by_pk.OrgKey,
    OrgName: data.auth_organisation_by_pk.Name,
    Meta: {
      ...(data.auth_organisation_by_pk.Meta ?? {}),
      // Provide a default base URL if not specified for deep link construction
      baseUrl:
        data.auth_organisation_by_pk.Meta?.baseUrl ||
        getDefaultDeepLinkBaseUrl(),
    },
  };
};

export const getOrgMeta = async (request: {
  orgKey: string;
  tenant: string;
}): Promise<Meta> => {
  const orgData = await getOrgDetails(request);

  return orgData.Meta ?? {};
};

/**
 * Get the raw feature flags for an org from org metadata.
 * Use this only for pure feature flags (not module-backed features).
 * For module-backed features, use `isOrgModuleEnabled`.
 */
export const getOrgFeatures = async (options: {
  orgKey: string;
  tenant: string;
}): Promise<string[]> => {
  const meta = await getOrgMeta(options);

  return (meta.features || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

/**
 * Fetch the module settings for an org, merged with defaults.
 * Returns the full module config tree.
 */
export const getOrgModuleConfig = async (options: {
  orgKey: string;
  tenant: string;
}): Promise<ModuleConfig> => {
  const hasuraClient = getHasuraClient({
    tenantName: options.tenant,
    adminSecret: Config.HASURA_ADMIN_SECRET,
  });

  const { data, errors } = await hasuraClient.query({
    query: GetModuleSettingsDocument,
    variables: { orgKey: options.orgKey },
  });

  if (errors) {
    errors.map((e) => logger.error(e.message, e as Error));
    throw new Error('Failed to get module settings');
  }

  const raw = data.organisation_module_by_pk?.ModuleSettings;
  const parsed = moduleConfigSchema.safeParse(raw);
  if (!parsed.success) {
    logger.error('Invalid ModuleSettings in DB, falling back to defaults', {
      orgKey: options.orgKey,
      error: parsed.error.message,
    });
  }
  const orgModules = parsed.success ? parsed.data : {};

  return mergeModulesWithDefaults(orgModules);
};

/**
 * Fetch the org context needed for module resolution in one go.
 * Returns features and modules so callers can check multiple
 * modules/flags without redundant Hasura queries.
 */
export const getOrgModuleContext = async (options: {
  orgKey: string;
  tenant: string;
}): Promise<{ features: string[]; modules: ModuleConfig }> => {
  const [features, modules] = await Promise.all([
    getOrgFeatures(options),
    getOrgModuleConfig(options),
  ]);

  return { features, modules };
};

/**
 * Check whether a module is enabled for an org. Uses `resolveModuleEnabled`
 * which handles backwards compatibility when the modules system is not active.
 *
 * For callers that also need the raw features array, use `getOrgModuleContext`
 * directly to avoid redundant queries.
 *
 * @param moduleKey - Dot-notation module path (e.g. 'risk.subModules.impact')
 */
export const isOrgModuleEnabled = async (
  options: { orgKey: string; tenant: string },
  moduleKey: ModuleKey
): Promise<boolean> => {
  const { features, modules } = await getOrgModuleContext(options);

  return resolveModuleEnabled({
    modules,
    moduleKey,
    modulesSystemActive: features.includes('modules'),
    features,
  });
};

export const isNotificationsEnabled = async (m: {
  OrgKey: string;
  Tenant: string;
}) => {
  logger.appendKeys({ orgKey: m.OrgKey, tenant: m.Tenant });

  const enabled = await isOrgModuleEnabled(
    { orgKey: m.OrgKey, tenant: m.Tenant },
    'notification'
  );

  if (!enabled) {
    logger.info('"notification" module not enabled', { orgKey: m.OrgKey });
  }

  return enabled;
};
