import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
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
        '**/test/**',
      ],
      thresholds: {
        statements: 70,
        branches: 80,
        functions: 50,
        lines: 70,
      },
    },
    projects: [
      {
        test: {
          name: 'unit',
          globals: true,
          environment: 'node',
          hookTimeout: 30000,
          include: ['**/*.test.ts'],
          exclude: [
            ...configDefaults.exclude,
            '**/test/**',
            '**/*.integration.test.ts',
          ],
          setupFiles: ['./vitest-setup.ts'],
        },
      },
      {
        test: {
          name: 'int',
          globals: true,
          environment: 'node',
          include: ['**/*.integration.test.ts'],
          exclude: [...configDefaults.exclude, '**/test/**'],
          setupFiles: ['./vitest-setup.ts'],
        },
      },
    ],
  },
});
