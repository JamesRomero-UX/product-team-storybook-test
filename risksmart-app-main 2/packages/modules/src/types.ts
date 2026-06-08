import { z } from 'zod';

/**
 * Feature flags that are NOT module-backed. These are for in-progress work
 * and are resolved via the org features array or environment variables.
 *
 * For module-backed features, use module keys with `isModuleEnabled` instead.
 */
export const featureFlags = [
  'alt_values',
  'appetite_links',
  'attestation_improvements',
  'authentication',
  'bedrock',
  'conditional_fields',
  'custom_attribute_alternate_values',
  'day_attestations',
  'easter_eggs',
  'empty_default_dashboard',
  'guidance',
  'issue-allica',
  'issue-gc',
  'modules',
  'no_inherit',
  'pdf_export',
  'policy_auto_draft',
  'posture',
  'scoring_settings_data',
  'sso_configuration',
  'tpp_contacts',
  'trpc',
  'turn-off-regulatory-breaches',
] as const;

export const featureFlagSchema = z.enum(featureFlags);
export type FeatureFlag = z.infer<typeof featureFlagSchema>;

export interface Module {
  enabled: boolean;
  config?: Record<string, unknown>;
  subModules?: Record<string, Module>;
  allowTabConfig?: boolean;
}

export type ModuleConfig = Record<string, Module>;

/**
 * Extracts all valid dot-notation module key paths from a module tree type.
 * E.g. 'risk' | 'risk.subModules.impact' | 'document.subModules.attestation' | ...
 */
export type ExtractModuleKeys<
  T extends Record<string, Module>,
  Prefix extends string = '',
> = {
  [K in keyof T & string]:
    | `${Prefix}${K}`
    | (T[K] extends { readonly subModules: infer S extends Record<string, Module> }
        ? ExtractModuleKeys<S, `${Prefix}${K}.subModules.`>
        : never);
}[keyof T & string];
