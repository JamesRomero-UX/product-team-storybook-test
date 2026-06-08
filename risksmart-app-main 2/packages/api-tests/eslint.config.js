import { esmConfigTyped } from '@risksmart-app/eslint-config/esmConfigTyped';

/** @type {import("eslint").Linter.Config} */
export default [
  ...esmConfigTyped,
  {
    // Add project specific rule overrides here
    // TODO: Remove these when possible
    rules: {
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'no-console': 'off',
      // Allow conditional expects for parameterized tests with different expected behaviors
      'vitest/no-conditional-expect': 'off',
      // Allow skipped tests for tests that need future implementation
      'vitest/no-disabled-tests': 'off',
    },
  },
];
