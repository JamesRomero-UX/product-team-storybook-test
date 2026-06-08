import _ from 'lodash';
import type { ZodType } from 'zod';

import type { ModuleKey } from './defaults';
import { defaultModules } from './defaults';
import type { Module, ModuleConfig } from './types';

/**
 * Module keys that are considered enabled when the "modules" system is not
 * yet active for an org. These are the core modules that existed before the
 * modules feature was introduced.
 */
export const PRE_MODULES_ENABLED_KEYS = new Set<ModuleKey>([
  'risk',
  'risk.subModules.acceptance',
  'risk.subModules.appetite',
  'action',
  'assessment',
  'control',
  'control.subModules.control_group',
  'incident_reporting',
  'indicator',
  'issue',
  'issue.subModules.cause',
  'issue.subModules.consequence',
]);

/**
 * @deprecated These feature flags are superseded by the modules system.
 * They remain in the DB for backwards compatibility with orgs that haven't
 * migrated. New features should use module keys via `isModuleEnabled`, not
 * feature flags. Do not add new entries here.
 */
export const legacyFeatures = [
  'ai_suggest_controls',
  'approvers',
  'attestations',
  'chat',
  'chat_warning',
  'compliance',
  'compliance_monitoring',
  'disable-causes',
  'disable-consequences',
  'enterprise_risk',
  'impacts',
  'integrations',
  'internal_audit',
  'multi_reporting',
  'notifications',
  'policy',
  'reg_feed',
  'scoring_settings',
  'third_party',
  'wizard',
] as const;

export type LegacyFeature = (typeof legacyFeatures)[number];

/**
 * Maps module keys to the legacy feature flag name that controlled them
 * before the modules system existed. Used for backwards compatibility
 * when resolving module state for orgs without `'modules'` in their features.
 *
 * - Normal entries: feature present in org features → module enabled
 * - Inverted entries: feature present in org features → module DISABLED
 *   (e.g. `disable-causes` meant "turn causes off")
 */
export const LEGACY_FEATURE_TO_MODULE_MAP: Partial<
  Record<ModuleKey, { feature: LegacyFeature; inverted?: boolean }>
> = {
  document: { feature: 'policy' },
  'document.subModules.attestation': { feature: 'attestations' },
  obligation: { feature: 'compliance' },
  'obligation.subModules.compliance_monitoring_assessment': {
    feature: 'compliance_monitoring',
  },
  'obligation.subModules.reg_feed': { feature: 'reg_feed' },
  third_party: { feature: 'third_party' },
  enterprise_risk: { feature: 'enterprise_risk' },
  internal_audit_entity: { feature: 'internal_audit' },
  'internal_audit_entity.subModules.internal_audit_report': {
    feature: 'internal_audit',
  },
  approval: { feature: 'approvers' },
  custom_datasource: { feature: 'multi_reporting' },
  notification: { feature: 'notifications' },
  'risk.subModules.impact': { feature: 'impacts' },
  'risk.subModules.rcsa_wizard': { feature: 'wizard' },
  'risk.subModules.risk_scoring': { feature: 'scoring_settings' },
  'ai.subModules.chat': { feature: 'chat' },
  'ai.subModules.chat_warning': { feature: 'chat_warning' },
  'ai.subModules.suggested_controls': { feature: 'ai_suggest_controls' },
  integrations: { feature: 'integrations' },
  'issue.subModules.cause': { feature: 'disable-causes', inverted: true },
  'issue.subModules.consequence': {
    feature: 'disable-consequences',
    inverted: true,
  },
};

/**
 * Check if a module is enabled by traversing a dot-notation path.
 * E.g. `isModuleEnabled(modules, 'risk.subModules.appetite')` checks
 * `modules.risk.subModules.appetite.enabled`.
 *
 * Also verifies all ancestor modules are enabled. A child module is
 * considered disabled if any of its parents are disabled.
 */
export const isModuleEnabled = (
  modules: ModuleConfig,
  id: ModuleKey
): boolean => {
  // Split 'risk.subModules.impact' into module key segments ['risk', 'impact'],
  // filtering out the structural 'subModules' parts.
  const keys = id.split('.').filter((s) => s !== 'subModules');

  let current: Record<string, Module> = modules;
  for (const key of keys) {
    const mod: Module | undefined = current[key];
    if (!mod?.enabled) {
      return false;
    }
    current = mod.subModules ?? {};
  }

  return true;
};

/**
 * Resolve whether a module is enabled, with backwards compatibility for orgs
 * that haven't enabled the "modules" system yet.
 *
 * When the modules system is active, checks the actual module tree.
 * When inactive, checks:
 *   1. Legacy feature map — if a mapping exists, checks the org features array
 *      (with inversion for `disable-*` features)
 *   2. PRE_MODULES_ENABLED_KEYS — core modules that were always on
 */
export const resolveModuleEnabled = (params: {
  modules: ModuleConfig;
  moduleKey: ModuleKey;
  modulesSystemActive: boolean;
  features?: string[];
}): boolean => {
  if (params.modulesSystemActive) {
    return isModuleEnabled(params.modules, params.moduleKey);
  }

  const legacyMapping = LEGACY_FEATURE_TO_MODULE_MAP[params.moduleKey];
  if (legacyMapping && params.features) {
    const hasFeature = params.features.includes(legacyMapping.feature);

    return legacyMapping.inverted ? !hasFeature : hasFeature;
  }

  return PRE_MODULES_ENABLED_KEYS.has(params.moduleKey);
};

/**
 * Recursively walk through a module config and collect **flattened** dot-notation
 * paths of all enabled modules (e.g. `'risk'`, `'risk.impact'`).
 *
 * These paths omit the `.subModules.` segments used by `ModuleKey` and are NOT
 * compatible with `isModuleEnabled`. They are designed for scope matching in the
 * external API where `ResourceScope.module` uses the flattened format.
 *
 * Sub-modules are only walked if their parent is enabled.
 */
export const collectEnabledModulePaths = (
  config: ModuleConfig
): Set<string> => {
  const paths = new Set<string>();

  const walk = (module: Module, path: string) => {
    if (module.enabled) {
      paths.add(path);

      if (module.subModules) {
        for (const [childKey, childModule] of Object.entries(
          module.subModules
        )) {
          walk(childModule, `${path}.${childKey}`);
        }
      }
    }
  };

  for (const [rootKey, module] of Object.entries(config)) {
    walk(module, rootKey);
  }

  return paths;
};

/**
 * Get a typed config value from a module, safely parsed with a Zod schema.
 * Returns the parsed value on success, or `defaultValue` if the key is missing
 * or the value doesn't match the schema.
 *
 * E.g. `getModuleConfigValue(module, 'RiskScoringModel', z.nativeEnum(Risk_Scoring_Model_Enum), Risk_Scoring_Model_Enum.Default)`
 */
export const getModuleConfigValue = <T>(
  module: Module | undefined,
  params: { key: string; schema: ZodType<T>; defaultValue: T }
): T => {
  const value = module?.config?.[params.key];
  const result = params.schema.safeParse(value);

  return result.success ? result.data : params.defaultValue;
};

/**
 * Merge org-specific module settings on top of defaults.
 * Returns a full module config with defaults filled in for any missing keys.
 */
export const mergeModulesWithDefaults = (
  orgModules: Partial<ModuleConfig>
): ModuleConfig => {
  return _.merge(
    {},
    _.cloneDeep(defaultModules),
    _.cloneDeep(orgModules)
  ) as ModuleConfig; // _.merge returns a generic object; we know the shape matches ModuleConfig
};
