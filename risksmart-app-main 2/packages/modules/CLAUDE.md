# packages/modules

Shared module and feature-flag resolution logic. Pure TypeScript — no React, no GraphQL, no infrastructure code.

## What This Package Provides

- **Types**: `Module`, `ModuleConfig`, `FeatureFlag`
- **Defaults**: `defaultModules` — the full default module tree
- **Module Resolver**: `isModuleEnabled`, `resolveModuleEnabled`, `collectEnabledModulePaths`, `mergeModulesWithDefaults`
- **Zod Schema**: `moduleConfigSchema` — validates module tree from DB
- **Pre-modules defaults**: `PRE_MODULES_ENABLED_KEYS` — modules enabled before the modules system

## Key Patterns

- All functions are **pure** — they take data in and return results, no side effects.
- `resolveModuleEnabled` handles backwards compat: when the modules system isn't active, returns `true` for modules in `PRE_MODULES_ENABLED_KEYS`.
- `mergeModulesWithDefaults` deep-merges org settings on top of `defaultModules`.
- Module keys use dot-notation paths: `'risk.subModules.appetite'`

## Consumers

- `packages/web` — React hooks (`useIsModuleEnabled`, `useIsFeatureFlagEnabled`) wrap the pure functions
- `packages/external-api` — Scope resolution uses `collectEnabledModulePaths`
- `packages/mcp-server` — Module gate uses `isModuleEnabled`
