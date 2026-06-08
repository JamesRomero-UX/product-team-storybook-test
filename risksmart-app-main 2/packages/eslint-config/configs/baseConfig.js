import { globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginOnlyWarn from 'eslint-plugin-only-warn';
import eslintPluginPerfectionist from 'eslint-plugin-perfectionist';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginTurbo from 'eslint-plugin-turbo';
import eslintPluginVitest from '@vitest/eslint-plugin';
import checkFile from 'eslint-plugin-check-file';
import { noAsWithoutJustification } from '../rules/no-as-without-justification.js';

/**
 * Creates relative import restriction patterns dynamically
 * @param {number} maxParentLevels - Maximum number of parent directories to restrict (default: 5)
 * @returns {Array} Array of restriction patterns
 */
function createRelativeImportPatterns(maxParentLevels = 10) {
  const patterns = [];

  for (let i = 1; i <= maxParentLevels; i++) {
    const parentPath = '../'.repeat(i);
    const isDirectSibling = i === 1;

    patterns.push({
      group: [`${parentPath}*/src/**`],
      message: isDirectSibling
        ? 'Relative imports to sibling packages are not allowed. Use workspace package names instead (e.g. @risksmart-app/shared).'
        : 'Relative imports to other packages are not allowed. Use workspace package names instead (e.g. @risksmart-app/shared).',
    });
  }

  return patterns;
}

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const baseConfig = [
  // Ignores files & directories like these recursively throughout the project
  globalIgnores([
    '**/coverage/',
    '**/dev-dist/',
    '**/dist/',
    '**/downloads/',
    '**/generated/',
    '**/generated-db/',
    '**/html/',
    '**/theme/',
    '**/temp/',
    '**/eslint.config.mjs',
    '**/*.d.ts',
    '**/utils/pdf/fonts.ts',
    '**/public/*',
    '**/taxonomy/locales/*',
    '**/.storybook/',
    '**/*.config.js',
    '**/*.config.mjs',
    '**/*.config.ts',
    '**/*.setup.ts',
    '**/setup.ts',
    '**/.lintstagedrc.js',
    '**/.lintstagedrc.cjs',
    '**/.lintstagedrc.mjs',
  ]),
  eslintConfigPrettier,
  eslintPluginVitest.configs.recommended,
  {
    plugins: {
      'check-file': checkFile,
      'local-rules': {
        rules: { 'no-as-without-justification': noAsWithoutJustification },
      },
      onlyWarn: eslintPluginOnlyWarn,
      perfectionist: eslintPluginPerfectionist,
      'simple-import-sort': eslintPluginSimpleImportSort,
      turbo: eslintPluginTurbo,
    },
    rules: {
      'check-file/folder-naming-convention': [
        'error',
        { 'src/**/!(__tests__)/': 'KEBAB_CASE' },
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-definitions': 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'enumMember',
          format: ['PascalCase'],
        },
      ],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: createRelativeImportPatterns(10),
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      curly: 'warn',
      'max-params': ['warn', 3],
      'newline-before-return': 'warn',
      'no-console': 'warn',
      'perfectionist/sort-enums': 'warn',
      'simple-import-sort/exports': 'warn',
      'simple-import-sort/imports': 'warn',
      'vitest/expect-expect': [
        'warn',
        { assertFunctionNames: ['test*', 'expect*'] },
      ],
      'vitest/no-focused-tests': 'warn',
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'error',
      'no-unneeded-ternary': 'error',
      'local-rules/no-as-without-justification': 'warn',
    },
  },
  // `as` assertions in test files are common for mocking/coercion and don't need justification comments
  {
    files: [
      '**/__tests__/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
    ],
    rules: {
      'local-rules/no-as-without-justification': 'off',
    },
  },
];
