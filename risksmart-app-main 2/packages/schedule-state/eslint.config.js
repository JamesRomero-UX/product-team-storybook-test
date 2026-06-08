import { esmConfigTyped } from '@risksmart-app/eslint-config/esmConfigTyped';
import eslintPluginImport from 'eslint-plugin-import';

/** @type {import("eslint").Linter.Config} */
export default [
  ...esmConfigTyped,
  {
    // Add project specific rule overrides here
    plugins: {
      import: eslintPluginImport,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
          extensionAlias: {
            '.ts': ['.js'],
          },
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
    rules: {
      // Disallow .js extension on imports (bundler resolution handles this)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ImportDeclaration[source.value=/\\.js$/]',
          message:
            'Do not use .js extension in imports. Use extensionless imports instead.',
        },
        {
          selector: 'ExportNamedDeclaration[source.value=/\\.js$/]',
          message:
            'Do not use .js extension in exports. Use extensionless exports instead.',
        },
        {
          selector: 'ExportAllDeclaration[source.value=/\\.js$/]',
          message:
            'Do not use .js extension in exports. Use extensionless exports instead.',
        },
      ],
    },
  },
];
