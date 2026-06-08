import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: [...configDefaults.exclude, '**/tests/**'],
    setupFiles: [],
    env: {
      STAGE: 'test',
      NODE_ENV: 'test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/tests/**',
      ],
      thresholds: {
        statements: 85,
        branches: 88,
        functions: 76,
        lines: 85,
      },
    },
  },
});
