# packages/eslint-config

Shared ESLint configuration for the monorepo.

## Exported Configs

```javascript
import { commonJSConfig } from '@risksmart-app/eslint-config/commonJSConfig';
import { esmConfig } from '@risksmart-app/eslint-config/esmConfig';
import { esmConfigTyped } from '@risksmart-app/eslint-config/esmConfigTyped';
import { reactConfig } from '@risksmart-app/eslint-config/reactConfig';
```

## Key Rules

- **No relative cross-package imports**: Enforces workspace imports, disallows `../../../` patterns.
- **Kebab-case folders**: `check-file` plugin enforces kebab-case in `src/` directories.
- **PascalCase enums**: Enum members must be PascalCase.
- **Max 3 function parameters**: Warning level (not error).
- **Unused vars**: `_` prefix pattern allowed.
- **Cloudscape ban**: `reactConfig` bans direct `@cloudscape-design/components` imports (use themed/atomic-ui).
- **Simple import sort**: Two-pass import sorting with perfectionist plugin.
- **No console**: Warning level in all configs.

## Config Hierarchy

- `baseConfig` - Core rules, plugins, ignores (shared by all)
- `esmConfig` - ESM + TypeScript recommended (backend packages)
- `esmConfigTyped` - ESM + TypeScript with type checking (stricter)
- `reactConfig` - Extends esmConfig + React hooks + i18next + Cloudscape ban (frontend packages)
- `commonJSConfig` - For CommonJS packages

No build or tests - configuration-only package.
