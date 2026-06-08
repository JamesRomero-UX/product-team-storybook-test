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
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'max-params': ['warn', 7],
      'vitest/expect-expect': 'off',
      'vitest/valid-describe-callback': 'off',
      'vitest/valid-title': 'off',
      // Allow conditional expects for parameterized tests with different expected behaviors
      'vitest/no-conditional-expect': 'off',
      // Allow expects in beforeAll/beforeEach hooks for setup assertions
      'vitest/no-standalone-expect': 'off',
    },
  },
  {
    // TODO: Fix as-assertion violations and remove this override
    rules: {
      'local-rules/no-as-without-justification': 'off',
    },
  },
];
