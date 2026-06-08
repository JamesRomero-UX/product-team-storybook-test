import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/integration/setup.ts'],
    include: ['test/integration/**/*.integration.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    sequence: {
      sequential: true,
    },
  },
});
