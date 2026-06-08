import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { baseConfig } from './baseConfig.js';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const esmConfig = [
  ...baseConfig,
  ...tseslint.configs.recommended, // Override the typeChecked config to prevent lint errors in projects without TypeScript
  js.configs.recommended,
  {
    rules: {
      // It is safe to disable these rules as the TypeScript compiler and tseslint enforce these checks
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.nodeBuiltin,
      },
    },
  },
];
