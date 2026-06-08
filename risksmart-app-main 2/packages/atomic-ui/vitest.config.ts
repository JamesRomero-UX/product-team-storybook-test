import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';
import { createStorybookVitestProject } from './config/storybook-vitest';

const dirname = import.meta.dirname;

export default defineConfig({
  test: {
    coverage: {
      include: ['src/**/*'],
      exclude: [
        'src/index.ts',
        'src/blocks/index.ts',
        'src/components/index.ts',
        'src/patterns/index.ts',
        '**/types.ts',
      ],
      enabled: true,
      thresholds: {
        lines: 98,
        branches: 98,
        functions: 98,
        statements: 98,
      },
    },
    projects: [
      createStorybookVitestProject({
        configDir: path.join(dirname, '.storybook'),
        include: ['src/**/*.stories.tsx'],
        resolve: { alias: { '@': path.resolve(dirname, './src') } },
        tags: { exclude: ['wip'] }
      }),
      {
        plugins: [react()],
        resolve: { alias: { '@': path.resolve(dirname, './src') } },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        },
      },
    ],
  },
});
