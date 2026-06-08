import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { baseConfig } from './baseConfig.js';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const esmConfigTyped = [
  ...baseConfig,
  ...tseslint.configs.recommendedTypeChecked,
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.nodeBuiltin,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // It is safe to disable these rules as the TypeScript compiler and tseslint enforce these checks
      'no-undef': 'off',
      'no-unused-vars': 'off',
      // Disable base no-redeclare in favour of @typescript-eslint/no-redeclare
      // which understands TypeScript type/value merging (e.g. as const + type alias)
      'no-redeclare': 'off',
    },
  },
];
