import { esmConfigTyped } from '@risksmart-app/eslint-config/esmConfigTyped';
import eslintPluginImport from 'eslint-plugin-import';

/** @type {import("eslint").Linter.Config} */
export default [
  ...esmConfigTyped,
  {
    plugins: {
      import: eslintPluginImport,
    },
    // Add project specific rule overrides here
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      'max-params': ['warn', 4],
      // Require .js extension on internal (relative) imports only; do not enforce for packages
      'import/extensions': [
        'error',
        'always',
        {
          ignorePackages: true,
          checkTypeImports: true,
          js: 'always',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
    },
  },
  {
    // TODO: Fix as-assertion violations and remove this override
    rules: {
      'local-rules/no-as-without-justification': 'off',
    },
  },
];
