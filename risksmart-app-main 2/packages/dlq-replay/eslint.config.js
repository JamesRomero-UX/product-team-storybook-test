import { esmConfig } from '@risksmart-app/eslint-config/esmConfig';

/** @type {import("eslint").Linter.Config} */
export default [
  ...esmConfig,
  {
    // Add project specific rule overrides here
    // TODO: Remove these when possible
    rules: {
      'no-console': 'off',
    },
  },
];
