import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/helpers/setup.ts'],
    include: ['test/**/*.test.ts'],
    exclude: ['test/integration/**'],
  },
});
