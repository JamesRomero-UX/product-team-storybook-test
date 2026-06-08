export type { ModuleKey } from './defaults';
export { defaultModules } from './defaults';
export type { LegacyFeature } from './module-resolver';
export {
  collectEnabledModulePaths,
  getModuleConfigValue,
  isModuleEnabled,
  LEGACY_FEATURE_TO_MODULE_MAP,
  mergeModulesWithDefaults,
  PRE_MODULES_ENABLED_KEYS,
  resolveModuleEnabled,
} from './module-resolver';
export { legacyFeatures } from './module-resolver';
export { moduleConfigSchema } from './module-schema';
export type { ExtractModuleKeys, FeatureFlag, Module, ModuleConfig } from './types';
export { featureFlags,featureFlagSchema } from './types';

import { z } from 'zod';

import { legacyFeatures } from './module-resolver';
import { featureFlags } from './types';

/**
 * All possible values that can appear in an org's features string in the DB.
 * This is the union of:
 * - `FeatureFlag` — pure feature flags for in-progress work
 * - `LegacyFeature` — deprecated feature strings that now map to modules
 *   but remain in the DB for backwards compatibility
 */
export const orgFeatureSchema = z.enum([...featureFlags, ...legacyFeatures]);
export type OrgFeature = z.infer<typeof orgFeatureSchema>;

/**
 * Parse a comma-separated features string from the DB into typed OrgFeature[].
 * Unrecognised values are silently dropped.
 */
export const parseOrgFeatures = (raw: string): OrgFeature[] =>
  raw
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean)
    .filter((f): f is OrgFeature => orgFeatureSchema.safeParse(f).success);
