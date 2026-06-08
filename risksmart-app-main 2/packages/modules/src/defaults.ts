import type { ExtractModuleKeys, Module } from './types';

/**
 * Default module configuration. If a customer has a different set of modules,
 * their settings are merged on top of these defaults.
 *
 * Gotchas:
 * - If the module or submodule allows tab configuration, the key / module id
 *   _must_ be the same as the Parent Type.
 * - When adding a new module, ensure that the useNavItems hook is also updated.
 * - When adding a new module, update the translation files for titles and descriptions.
 */
export const defaultModules = {
  risk: {
    enabled: true,
    allowTabConfig: true,
    subModules: {
      impact: {
        enabled: false,
      },
      risk_scoring: {
        enabled: false,
      },
      appetite: {
        enabled: true,
      },
      appetite_cascading: {
        enabled: false,
      },
      acceptance: {
        enabled: true,
      },
      rcsa_wizard: {
        enabled: false,
      },
    },
  },
  document: {
    enabled: false,
    allowTabConfig: true,
    subModules: {
      attestation: {
        enabled: false,
      },
      public_document: {
        enabled: true,
      },
    },
  },
  obligation: {
    enabled: false,
    allowTabConfig: true,
    subModules: {
      compliance_monitoring_assessment: {
        enabled: false,
        allowTabConfig: true,
      },
      reg_feed: {
        enabled: false,
      },
    },
  },
  third_party: {
    enabled: false,
    allowTabConfig: true,
  },
  internal_audit_entity: {
    enabled: false,
    allowTabConfig: true,
    subModules: {
      internal_audit_report: {
        enabled: true,
        allowTabConfig: true,
      },
    },
  },
  issue: {
    enabled: true,
    allowTabConfig: true,
    subModules: {
      cause: {
        enabled: true,
      },
      consequence: {
        enabled: true,
      },
    },
  },
  control: {
    enabled: true,
    allowTabConfig: true,
    subModules: {
      control_group: {
        enabled: true,
      },
    },
  },
  action: {
    enabled: true,
    allowTabConfig: true,
  },
  indicator: {
    enabled: true,
    allowTabConfig: false,
  },
  assessment: {
    enabled: true,
    allowTabConfig: true,
  },
  incident_reporting: {
    enabled: true,
  },
  approval: {
    enabled: false,
  },
  custom_datasource: {
    enabled: false,
  },
  notification: {
    enabled: true,
  },
  enterprise_risk: {
    enabled: false,
    allowTabConfig: true,
  },
  ai: {
    enabled: false,
    subModules: {
      chat: {
        enabled: false,
      },
      chat_warning: {
        enabled: false,
      },
      suggested_controls: {
        enabled: false,
      },
    },
  },
  integrations: {
    enabled: false,
    subModules: {
      zapier_self_managed: {
        enabled: true,
      },
      zapier_by_risksmart: {
        enabled: true,
      },
      mcp_server_integrations: {
        enabled: true,
      },
      mcp_personal: {
        enabled: true,
      },
      rest_api: {
        enabled: true,
      },
      slack: {
        enabled: false,
      },
    },
  },
} as const satisfies Record<string, Module>;

/**
 * Union of all valid module key paths derived from `defaultModules`.
 * Use this as the parameter type for `useIsModuleEnabled`, `isModuleEnabled`, etc.
 * to get compile-time validation of module keys.
 *
 * Examples: 'risk' | 'risk.subModules.impact' | 'document.subModules.attestation' | ...
 */
export type ModuleKey = ExtractModuleKeys<typeof defaultModules>;
