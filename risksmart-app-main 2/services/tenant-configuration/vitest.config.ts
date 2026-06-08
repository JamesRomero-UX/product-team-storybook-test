import { defineConfig, configDefaults } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: [
      ...configDefaults.exclude,
      '**/test/**',
      '**/*.integration.test.ts',
    ],
    env: {
      STAGE: 'test',
      NODE_ENV: 'test',
    },
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.d.ts', '**/*.test.ts'],
      thresholds: {
        statements: 5,
        branches: 70,
        functions: 65,
        lines: 5,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
        },
      },
      {
        test: {
          name: 'int',
          globals: true,
          environment: 'node',
          setupFiles: ['dotenv/config'],
          env: {
            AWS_ENDPOINT_URL_DYNAMODB: 'http://localhost:8000',
            AWS_ACCESS_KEY_ID: 'test',
            AWS_SECRET_ACCESS_KEY: 'test',
            AWS_SESSION_TOKEN: '',
          },
          include: ['**/*.integration.test.ts'],
          exclude: [...configDefaults.exclude, '**/test/**'],
          testTimeout: 30000,
        },
      },
    ],
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    sourcemap: 'both',
  },
});
