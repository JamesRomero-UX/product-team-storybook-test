import eslintConfigI18Next from 'eslint-plugin-i18next';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

import { esmConfig } from './esmConfig.js';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const reactConfig = [
  ...esmConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  reactHooks.configs['recommended-latest'],
  reactPlugin.configs.flat['jsx-runtime'], // Add this if you are using React 17+
  reactRefresh.configs.recommended,
  eslintConfigI18Next.configs['flat/recommended'],
  {
    rules: {
      'i18next/no-literal-string': 'off',
      'no-restricted-imports': ['warn', '@cloudscape-design/components'],
      'prefer-const': 'warn',
      'react/prop-types': 'off',
      'react/jsx-curly-brace-presence': [
        'warn',
        { props: 'always', children: 'always' },
      ],
    },
  },
  {
    ignores: [
      '*.config.js',
      '**/fonts.ts',
      '**/public/*',
      '**/taxonomy/locales/*',
    ],
  },
];
