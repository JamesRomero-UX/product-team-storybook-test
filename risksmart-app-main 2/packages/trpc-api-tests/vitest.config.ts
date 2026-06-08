import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    testTimeout: 60000,
    environment: 'node',
    maxConcurrency: 1,
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 1,
      },
    },
    hookTimeout: 25000,
    env: loadEnv('', process.cwd(), ''),
    setupFiles: ['./vitest-setup.ts'],
    globalSetup: './vitest-globalSetup.ts',
  },
});
