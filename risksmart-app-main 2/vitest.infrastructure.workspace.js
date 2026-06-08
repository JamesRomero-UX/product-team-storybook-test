import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './packages/shared/vite.config.js',
  './packages/api-tests/vitest.config.mts',
  './packages/request-state-api/vitest.config.ts',
  './cdk-stack/vitest.config.ts',
]);
