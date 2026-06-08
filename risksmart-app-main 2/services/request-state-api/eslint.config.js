import { globalIgnores } from 'eslint/config';
import { esmConfigTyped } from '@risksmart-app/eslint-config/esmConfigTyped';
import checkFile from 'eslint-plugin-check-file';

/** @type {import("eslint").Linter.Config} */
export default [
  globalIgnores(['**/*.js', '**/*.js.map', '**/*.d.ts', '**/cdk.out/*']),
  ...esmConfigTyped,
  {
    plugins: {
      'check-file': checkFile,
    },
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'max-params': ['warn', 7],
      // Add file naming convention rule (folder naming is inherited from base config)
      'check-file/filename-naming-convention': [
        'error',
        {
          // Standard TypeScript files without special extensions should use KEBAB_CASE
          '**/*.ts': 'KEBAB_CASE',
          '**/*.tsx': 'KEBAB_CASE',
          // But disable the rule for files with multiple dots since KEBAB_CASE doesn't support them
          '**/*.test.ts': 'KEBAB_CASE',
          '**/*.rule.ts': 'KEBAB_CASE',
          '**/*.processor.ts': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
    },
  },
  {
    // TODO: Fix as-assertion violations and remove this override
    rules: {
      'local-rules/no-as-without-justification': 'off',
    },
  },
];
