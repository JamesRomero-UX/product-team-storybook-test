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
        statements: 40,
        branches: 70,
        functions: 55,
        lines: 40,
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
            STAGE: 'test',
            NODE_ENV: 'test',
          },
          include: ['**/*.integration.test.ts'],
          exclude: [...configDefaults.exclude, '**/test/**'],
        },
      },
    ],
    // pool: 'forks',
    // poolOptions: {
    //   forks: {
    //     singleFork: true,
    //   },
    // },
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  // Add this for better source map support
  esbuild: {
    sourcemap: 'both', // Generate both inline and external source maps
  },
});
