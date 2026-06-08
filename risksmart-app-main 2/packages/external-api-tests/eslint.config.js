import { esmConfigTyped } from '@risksmart-app/eslint-config/esmConfigTyped';

/** @type {import("eslint").Linter.Config} */
export default [
  ...esmConfigTyped,
  {
    rules: {
      // Allow conditional expects for parameterized tests with different expected behaviors
      'vitest/no-conditional-expect': 'off',
      // Disallow .js extensions in imports (handled by build tooling)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ImportDeclaration[source.value=/\\.js$/]',
          message:
            'Do not use .js extension in imports. The build tooling handles extensions.',
        },
      ],
    },
  },
];
