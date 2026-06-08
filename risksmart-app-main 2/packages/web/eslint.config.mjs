// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import { reactConfig } from '@risksmart-app/eslint-config/reactConfig';

/** @type {import("eslint").Linter.Config} */
export default [
  ...reactConfig,
  {
    // Add project specific rule overrides here
    // TODO: Remove these when possible
    rules: {
      // This rule enforces interfaces over type aliases which is too specific for
      // Cloudscape and causes a significant amount of type errors
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      'no-console': 'off',
      'max-params': ['warn', 6],
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
  ...storybook.configs['flat/recommended'],
];
