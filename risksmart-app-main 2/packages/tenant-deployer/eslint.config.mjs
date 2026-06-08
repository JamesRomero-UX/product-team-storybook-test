import { globalIgnores } from 'eslint/config';
import { esmConfigTyped } from '@risksmart-app/eslint-config/esmConfigTyped';

/** @type {import("eslint").Linter.Config} */
export default [
  globalIgnores(['**/*.js', '**/*.js.map', '**/*.d.ts', '**/cdk.out/*']),
  ...esmConfigTyped,
  {
    rules: {
      'max-params': ['warn', 9],
    },
  },
  {
    // TODO: Fix as-assertion violations and remove this override
    rules: {
      'local-rules/no-as-without-justification': 'off',
    },
  },
];
