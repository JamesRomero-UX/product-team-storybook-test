import { commonJSConfig } from '@risksmart-app/eslint-config/commonJSConfig';

/** @type {import("eslint").Linter.Config} */
export default [
  ...commonJSConfig,
  {
    // Add project specific rule overrides here
    // TODO: Remove these when possible
    rules: {
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'check-file/folder-naming-convention': 'off',
    },
  },
  {
    // TODO: Fix as-assertion violations and remove this override
    rules: {
      'local-rules/no-as-without-justification': 'off',
    },
  },
];
