// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import { reactConfig } from '@risksmart-app/eslint-config/reactConfig';

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ['postcss-atomic-scope.cjs'],
  },
  ...storybook.configs['flat/recommended'],
  ...reactConfig,
  {
    // Add project specific rule overrides here
    rules: {
      'react-hooks/rules-of-hooks': 'off', // Disable the rules of hooks for storybook stories, as they are not actual React components and may not follow the same rules as regular components.
    },
  },
  {
    // TODO: Fix as-assertion violations and remove this override
    rules: {
      'local-rules/no-as-without-justification': 'off',
    },
  },
];
