/// <reference types="vitest" />

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    exclude: [...configDefaults.exclude, '**/tests/**'],
    setupFiles: ['./vitest-setup.ts'],
  },
  plugins: [tsconfigPaths()],
});
