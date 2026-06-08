import { esmConfigTyped } from '@risksmart-app/eslint-config/esmConfigTyped';

/** @type {import("eslint").Linter.Config} */
export default [
  ...esmConfigTyped,
  {
    // Add project specific rule overrides here
    // TODO: Remove these when possible
    rules: {
      // This rule enforces interfaces over type aliases which is too specific for
      // Cloudscape and causes a significant amount of type errors
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'max-params': ['warn', 4],
      'no-console': 'off',
    },
  },
  { ignores: ['playwright/**', 'playwright-report/**', 'test-results/**'] },
];
