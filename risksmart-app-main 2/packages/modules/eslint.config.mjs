import { globalIgnores } from 'eslint/config';
import { esmConfigTyped } from '@risksmart-app/eslint-config/esmConfigTyped';

/** @type {import("eslint").Linter.Config} */
export default [
  globalIgnores(['**/*.js', '**/*.js.map', '**/*.d.ts', 'dist/**']),
  ...esmConfigTyped,
];
