/// <reference types="vitest" />

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    exclude: [...configDefaults.exclude, '**/tests/**', '**/*.int.test.ts'],
    setupFiles: ['./vitest-setup.ts'],
    env: { SST_STAGE: 'dev-local' },
  },
  plugins: [tsconfigPaths()],
});
