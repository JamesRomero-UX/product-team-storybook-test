import { commonJSConfig } from '@risksmart-app/eslint-config/commonJSConfig';

/** @type {import("eslint").Linter.Config} */
export default [
  ...commonJSConfig,
  {
    // Add project specific rule overrides here
    // TODO: Remove these when possible
    rules: {
      // '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'max-params': ['warn', 5],
      'no-console': 'off',
    },
  },
];
