import { esmConfigTyped } from '@risksmart-app/eslint-config/esmConfigTyped';

/** @type {import("eslint").Linter.Config} */
export default [
  ...esmConfigTyped,
  {
    // Add project specific rule overrides here
    // TODO: Remove these when possible
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'max-params': ['warn', 7],
    },
  },
];
