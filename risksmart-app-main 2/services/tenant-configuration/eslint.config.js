import { globalIgnores } from 'eslint/config';
import { esmConfigTyped } from '@risksmart-app/eslint-config/esmConfigTyped';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

/** @type {import("eslint").Linter.Config} */
export default [
  globalIgnores(['**/*.js', '**/*.js.map', '**/*.d.ts', '**/cdk.out/*']),
  ...esmConfigTyped,
  {
    plugins: {
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      'max-params': ['warn', 7],
      // Custom rule to enforce kebab-case file naming
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: [
            // Allow specific patterns that should not be kebab-case
            '^[A-Z][a-zA-Z0-9]*\.tsx?$', // Allow PascalCase for React components
          ],
        },
      ],
    },
  },
];
