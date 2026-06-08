import { esmConfig } from '@risksmart-app/eslint-config/esmConfig';

/** @type {import("eslint").Linter.Config} */
export default [
  ...esmConfig,
  {
    // Add project specific rule overrides here
    // TODO: Remove these when possible
    rules: {
      'max-params': ['warn', 5],
      'no-console': 'off',
    },
  },
  {
    // TODO: Fix as-assertion violations and remove this override
    rules: {
      'local-rules/no-as-without-justification': 'off',
    },
  },
];
