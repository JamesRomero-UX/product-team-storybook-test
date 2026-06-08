import { reactConfig } from '@risksmart-app/eslint-config/reactConfig';

/** @type {import("eslint").Linter.Config} */
export default [
  ...reactConfig,
  {
    // Add project specific rule overrides here
    // TODO: Remove these when possible
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      'max-params': ['warn', 5],
      'no-console': 'off',
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
