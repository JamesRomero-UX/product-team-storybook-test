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
      // Allow conditional expects for parameterized tests with different expected behaviors
      'vitest/no-conditional-expect': 'off',
    },
  },
  {
    // TODO: Fix as-assertion violations and remove this override
    rules: {
      'local-rules/no-as-without-justification': 'off',
    },
  },
];
