import { globalIgnores } from 'eslint/config';
import { esmConfigTyped } from '@risksmart-app/eslint-config/esmConfigTyped';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config} */
export default [
  globalIgnores(['lib/int/**', 'lib/int/', 'cdk.out/**', 'cdk.out.*/**']),
  ...esmConfigTyped,
  {
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    rules: {
      'max-params': ['warn', 7],
    },
  },
  {
    // TODO: Fix as-assertion violations and remove this override
    rules: {
      'local-rules/no-as-without-justification': 'off',
    },
  },
];
