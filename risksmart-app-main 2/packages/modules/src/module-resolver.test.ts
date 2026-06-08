import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import type { ModuleKey } from './defaults';
import { defaultModules } from './defaults';
import {
  collectEnabledModulePaths,
  getModuleConfigValue,
  isModuleEnabled,
  LEGACY_FEATURE_TO_MODULE_MAP,
  mergeModulesWithDefaults,
  PRE_MODULES_ENABLED_KEYS,
  resolveModuleEnabled,
} from './module-resolver';
import type { ModuleConfig } from './types';

describe('module-resolver', () => {
  describe('isModuleEnabled', () => {
    it('returns true for enabled root module', () => {
      const modules: ModuleConfig = { risk: { enabled: true } };

      expect(isModuleEnabled(modules, 'risk')).toBe(true);
    });

    it('returns false for disabled root module', () => {
      const modules: ModuleConfig = { risk: { enabled: false } };

      expect(isModuleEnabled(modules, 'risk')).toBe(false);
    });

    it('returns true for enabled sub-module via dot notation', () => {
      const modules: ModuleConfig = {
        risk: {
          enabled: true,
          subModules: {
            appetite: { enabled: true },
          },
        },
      };

      expect(isModuleEnabled(modules, 'risk.subModules.appetite')).toBe(true);
    });

    it('returns false for disabled sub-module', () => {
      const modules: ModuleConfig = {
        risk: {
          enabled: true,
          subModules: {
            impact: { enabled: false },
          },
        },
      };

      expect(isModuleEnabled(modules, 'risk.subModules.impact')).toBe(false);
    });

    it('returns false for non-existent module path', () => {
      const modules: ModuleConfig = { risk: { enabled: true } };

      expect(isModuleEnabled(modules, 'nonexistent' as ModuleKey)).toBe(false);
    });

    it('returns false for empty config', () => {
      expect(isModuleEnabled({}, 'risk')).toBe(false);
    });

    it('returns false for sub-module when parent is disabled', () => {
      const modules: ModuleConfig = {
        integrations: {
          enabled: false,
          subModules: {
            mcp_server_integrations: { enabled: true },
          },
        },
      };

      expect(
        isModuleEnabled(
          modules,
          'integrations.subModules.mcp_server_integrations'
        )
      ).toBe(false);
    });

    it('returns false for sub-module when grandparent is disabled', () => {
      const modules: ModuleConfig = {
        ai: {
          enabled: false,
          subModules: {
            chat: {
              enabled: true,
              subModules: {
                advanced: { enabled: true },
              },
            },
          },
        },
      };

      expect(
        isModuleEnabled(modules, 'ai.subModules.chat.subModules.advanced' as ModuleKey)
      ).toBe(false);
    });

    it('returns true for sub-module only when all ancestors are enabled', () => {
      const modules: ModuleConfig = {
        integrations: {
          enabled: true,
          subModules: {
            mcp_server_integrations: { enabled: true },
            mcp_personal: { enabled: false },
          },
        },
      };

      expect(
        isModuleEnabled(
          modules,
          'integrations.subModules.mcp_server_integrations'
        )
      ).toBe(true);
      expect(
        isModuleEnabled(modules, 'integrations.subModules.mcp_personal')
      ).toBe(false);
    });

    it('returns false for deeply nested sub-module when mid-level parent is disabled', () => {
      const modules: ModuleConfig = {
        risk: {
          enabled: true,
          subModules: {
            scoring: {
              enabled: false,
              subModules: {
                advanced: { enabled: true },
              },
            },
          },
        },
      };

      expect(
        isModuleEnabled(
          modules,
          'risk.subModules.scoring.subModules.advanced' as ModuleKey
        )
      ).toBe(false);
    });

    it('resolves duplicate subModule names under different parents independently', () => {
      const modules: ModuleConfig = {
        risk: {
          enabled: true,
          subModules: {
            impact: { enabled: true },
          },
        },
        obligation: {
          enabled: true,
          subModules: {
            impact: { enabled: false },
          },
        },
      };

      expect(isModuleEnabled(modules, 'risk.subModules.impact')).toBe(true);
      expect(
        isModuleEnabled(modules, 'obligation.subModules.impact' as ModuleKey)
      ).toBe(false);
    });

    it('resolves same-named subModules at different depths independently', () => {
      const modules: ModuleConfig = {
        a: {
          enabled: true,
          subModules: {
            shared: {
              enabled: true,
              subModules: {
                leaf: { enabled: false },
              },
            },
          },
        },
        b: {
          enabled: true,
          subModules: {
            shared: {
              enabled: true,
              subModules: {
                leaf: { enabled: true },
              },
            },
          },
        },
      };

      expect(
        isModuleEnabled(
          modules,
          'a.subModules.shared.subModules.leaf' as ModuleKey
        )
      ).toBe(false);
      expect(
        isModuleEnabled(
          modules,
          'b.subModules.shared.subModules.leaf' as ModuleKey
        )
      ).toBe(true);
    });

    it('is consistent with collectEnabledModulePaths for disabled parents', () => {
      const modules: ModuleConfig = {
        integrations: {
          enabled: false,
          subModules: {
            mcp_server_integrations: { enabled: true },
            mcp_personal: { enabled: true },
          },
        },
      };

      const paths = collectEnabledModulePaths(modules);

      // collectEnabledModulePaths should not include children of disabled parents
      expect(paths.has('integrations')).toBe(false);
      expect(paths.has('integrations.mcp_server_integrations')).toBe(false);

      // isModuleEnabled should agree
      expect(isModuleEnabled(modules, 'integrations')).toBe(false);
      expect(
        isModuleEnabled(
          modules,
          'integrations.subModules.mcp_server_integrations'
        )
      ).toBe(false);
    });
  });

  describe('resolveModuleEnabled', () => {
    describe('when modules system is active', () => {
      it('returns true when module is enabled in config', () => {
        const modules = mergeModulesWithDefaults({
          risk: { enabled: true },
        });

        expect(
          resolveModuleEnabled({
            modules,
            moduleKey: 'risk',
            modulesSystemActive: true,
          })
        ).toBe(true);
      });

      it('returns false when module is disabled in config', () => {
        const modules = mergeModulesWithDefaults({
          risk: { enabled: false },
        });

        expect(
          resolveModuleEnabled({
            modules,
            moduleKey: 'risk',
            modulesSystemActive: true,
          })
        ).toBe(false);
      });

      it('checks sub-module enabled state', () => {
        const modules = mergeModulesWithDefaults({
          risk: {
            enabled: true,
            subModules: { acceptance: { enabled: true } },
          },
        });

        expect(
          resolveModuleEnabled({
            modules,
            moduleKey: 'risk.subModules.acceptance',
            modulesSystemActive: true,
          })
        ).toBe(true);
      });
    });

    describe('when modules system is NOT active (backwards compat)', () => {
      it('returns true for pre-modules enabled keys', () => {
        for (const key of PRE_MODULES_ENABLED_KEYS) {
          expect(
            resolveModuleEnabled({
              modules: {},
              moduleKey: key,
              modulesSystemActive: false,
            })
          ).toBe(true);
        }
      });

      it('returns false for modules not in pre-modules set', () => {
        expect(
          resolveModuleEnabled({
            modules: {},
            moduleKey: 'obligation',
            modulesSystemActive: false,
          })
        ).toBe(false);
      });

      it('returns false for enterprise_risk without features', () => {
        expect(
          resolveModuleEnabled({
            modules: {},
            moduleKey: 'enterprise_risk',
            modulesSystemActive: false,
          })
        ).toBe(false);
      });
    });

    describe('legacy feature flag backwards compat', () => {
      it.each([
        {
          moduleKey: 'document.subModules.attestation',
          feature: 'attestations',
        },
        { moduleKey: 'obligation', feature: 'compliance' },
        { moduleKey: 'third_party', feature: 'third_party' },
        { moduleKey: 'enterprise_risk', feature: 'enterprise_risk' },
        { moduleKey: 'internal_audit_entity', feature: 'internal_audit' },
        {
          moduleKey: 'internal_audit_entity.subModules.internal_audit_report',
          feature: 'internal_audit',
        },
        { moduleKey: 'approval', feature: 'approvers' },
        { moduleKey: 'custom_datasource', feature: 'multi_reporting' },
        { moduleKey: 'risk.subModules.impact', feature: 'impacts' },
        { moduleKey: 'document', feature: 'policy' },
        { moduleKey: 'notification', feature: 'notifications' },
        {
          moduleKey: 'obligation.subModules.compliance_monitoring_assessment',
          feature: 'compliance_monitoring',
        },
        { moduleKey: 'risk.subModules.rcsa_wizard', feature: 'wizard' },
        {
          moduleKey: 'risk.subModules.risk_scoring',
          feature: 'scoring_settings',
        },
        { moduleKey: 'ai.subModules.chat', feature: 'chat' },
        { moduleKey: 'integrations', feature: 'integrations' },
      ] satisfies { moduleKey: ModuleKey; feature: string }[])(
        'enables $moduleKey when legacy feature $feature is present',
        ({ moduleKey, feature }) => {
          expect(
            resolveModuleEnabled({
              modules: {},
              moduleKey,
              modulesSystemActive: false,
              features: [feature],
            })
          ).toBe(true);
        }
      );

      it.each([
        {
          moduleKey: 'document.subModules.attestation',
          feature: 'attestations',
        },
        { moduleKey: 'obligation', feature: 'compliance' },
        { moduleKey: 'third_party', feature: 'third_party' },
        { moduleKey: 'risk.subModules.impact', feature: 'impacts' },
      ] satisfies { moduleKey: ModuleKey; feature: string }[])(
        'disables $moduleKey when legacy feature $feature is absent',
        ({ moduleKey }) => {
          expect(
            resolveModuleEnabled({
              modules: {},
              moduleKey,
              modulesSystemActive: false,
              features: [],
            })
          ).toBe(false);
        }
      );

      it('disables causes when disable-causes feature is present', () => {
        expect(
          resolveModuleEnabled({
            modules: {},
            moduleKey: 'issue.subModules.cause',
            modulesSystemActive: false,
            features: ['disable-causes'],
          })
        ).toBe(false);
      });

      it('enables causes when disable-causes feature is absent', () => {
        expect(
          resolveModuleEnabled({
            modules: {},
            moduleKey: 'issue.subModules.cause',
            modulesSystemActive: false,
            features: [],
          })
        ).toBe(true);
      });

      it('disables consequences when disable-consequences feature is present', () => {
        expect(
          resolveModuleEnabled({
            modules: {},
            moduleKey: 'issue.subModules.consequence',
            modulesSystemActive: false,
            features: ['disable-consequences'],
          })
        ).toBe(false);
      });

      it('enables consequences when disable-consequences feature is absent', () => {
        expect(
          resolveModuleEnabled({
            modules: {},
            moduleKey: 'issue.subModules.consequence',
            modulesSystemActive: false,
            features: [],
          })
        ).toBe(true);
      });

      it('ignores legacy features when modules system is active', () => {
        const modules = mergeModulesWithDefaults({});

        expect(
          resolveModuleEnabled({
            modules,
            moduleKey: 'document.subModules.attestation',
            modulesSystemActive: true,
            features: ['attestations'],
          })
        ).toBe(false); // attestation is disabled in defaults
      });

      it('falls back to PRE_MODULES_ENABLED_KEYS when features not provided', () => {
        // cause has a legacy mapping but no features array → falls back
        expect(
          resolveModuleEnabled({
            modules: {},
            moduleKey: 'issue.subModules.cause',
            modulesSystemActive: false,
          })
        ).toBe(true); // in PRE_MODULES_ENABLED_KEYS
      });

      it('every entry in LEGACY_FEATURE_TO_MODULE_MAP maps to a non-empty feature', () => {
        const entries = Object.entries(LEGACY_FEATURE_TO_MODULE_MAP);

        for (const [key, value] of entries) {
          expect(value.feature, `${key} has empty feature`).toBeTruthy();
        }
      });
    });
  });

  describe('collectEnabledModulePaths', () => {
    it('collects root enabled modules', () => {
      const config: ModuleConfig = {
        risk: { enabled: true },
        issue: { enabled: true },
        control: { enabled: false },
      };

      const paths = collectEnabledModulePaths(config);

      expect(paths.has('risk')).toBe(true);
      expect(paths.has('issue')).toBe(true);
      expect(paths.has('control')).toBe(false);
    });

    it('collects enabled sub-module paths', () => {
      const config: ModuleConfig = {
        risk: {
          enabled: true,
          subModules: {
            impact: { enabled: true },
            appetite: { enabled: false },
          },
        },
      };

      const paths = collectEnabledModulePaths(config);

      expect(paths.has('risk')).toBe(true);
      expect(paths.has('risk.impact')).toBe(true);
      expect(paths.has('risk.appetite')).toBe(false);
    });

    it('does not walk sub-modules when parent is disabled', () => {
      const config: ModuleConfig = {
        risk: {
          enabled: false,
          subModules: {
            impact: { enabled: true },
          },
        },
      };

      const paths = collectEnabledModulePaths(config);

      expect(paths.size).toBe(0);
    });

    it('returns empty set for empty config', () => {
      expect(collectEnabledModulePaths({}).size).toBe(0);
    });
  });

  describe('getModuleConfigValue', () => {
    it('returns parsed value when key exists and matches schema', () => {
      const module = { enabled: true, config: { maxItems: 10 } };

      expect(
        getModuleConfigValue(module, {
          key: 'maxItems',
          schema: z.number(),
          defaultValue: 5,
        })
      ).toBe(10);
    });

    it('returns default when key is missing', () => {
      const module = { enabled: true, config: {} };

      expect(
        getModuleConfigValue(module, {
          key: 'missing',
          schema: z.string(),
          defaultValue: 'fallback',
        })
      ).toBe('fallback');
    });

    it('returns default when value fails schema validation', () => {
      const module = { enabled: true, config: { maxItems: 'not-a-number' } };

      expect(
        getModuleConfigValue(module, {
          key: 'maxItems',
          schema: z.number(),
          defaultValue: 5,
        })
      ).toBe(5);
    });

    it('returns default when module is undefined', () => {
      expect(
        getModuleConfigValue(undefined, {
          key: 'anything',
          schema: z.string(),
          defaultValue: 'default',
        })
      ).toBe('default');
    });

    it('returns default when config is undefined', () => {
      const module = { enabled: true };

      expect(
        getModuleConfigValue(module, {
          key: 'anything',
          schema: z.boolean(),
          defaultValue: false,
        })
      ).toBe(false);
    });

    it('applies schema transforms', () => {
      const module = { enabled: true, config: { count: '42' } };

      expect(
        getModuleConfigValue(module, {
          key: 'count',
          schema: z.coerce.number(),
          defaultValue: 0,
        })
      ).toBe(42);
    });
  });

  describe('mergeModulesWithDefaults', () => {
    it('returns defaults when given empty object', () => {
      const result = mergeModulesWithDefaults({});

      expect(result.risk?.enabled).toBe(defaultModules.risk?.enabled);
      expect(result.document?.enabled).toBe(defaultModules.document?.enabled);
    });

    it('overrides default values with org settings', () => {
      const result = mergeModulesWithDefaults({
        document: { enabled: true },
      });

      expect(result.document?.enabled).toBe(true);
      expect(result.risk?.enabled).toBe(true);
    });

    it('deep merges sub-module settings', () => {
      const result = mergeModulesWithDefaults({
        risk: {
          enabled: true,
          subModules: {
            impact: { enabled: true },
          },
        },
      });

      expect(result.risk?.subModules?.impact?.enabled).toBe(true);
      expect(result.risk?.subModules?.appetite?.enabled).toBe(true);
      expect(result.risk?.subModules?.acceptance?.enabled).toBe(true);
    });

    it('does not mutate defaults', () => {
      const defaultRiskEnabled = defaultModules.risk?.enabled;

      mergeModulesWithDefaults({
        risk: { enabled: false },
      });

      expect(defaultModules.risk?.enabled).toBe(defaultRiskEnabled);
    });
  });
});
