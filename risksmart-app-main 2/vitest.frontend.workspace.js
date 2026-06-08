import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './packages/web/vite.config.mts',
  './packages/third-party-portal/vite.config.ts',
  './packages/components/vite.config.mts',
]);
