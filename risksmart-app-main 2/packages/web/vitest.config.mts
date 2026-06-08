import { defineConfig } from 'vitest/config';

import { createStorybookVitestProject } from '../atomic-ui/config/storybook-vitest';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      all: true,
      include: ['src/**'],
      exclude: [
        'src/setupTests.ts',
        'src/generated',
        'src/testing',
        'coverage/**',
        'dist/**',
        '**/[.]**',
        'packages/*/test?(s)/**',
        '**/*.d.ts',
        '**/virtual:*',
        '**/__x00__*',
        '**/\x00*',
        'cypress/**',
        'test?(s)/**',
        'test?(-*).?(c|m)[jt]s?(x)',
        '**/*{.,-}{test,spec}?(-d).?(c|m)[jt]s?(x)',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/vitest.{workspace,projects}.[jt]s?(on)',
        '**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}',
        '**/universal-widget/data-sources/**',
      ],
      provider: 'v8',
      thresholds: {
        statements: 46,
        branches: 75,
        functions: 46,
        lines: 46,
        'src/blocks/**/*.tsx': {
          statements: 58,
          branches: 75,
          functions: 46,
          lines: 58,
        },
      },
    },
    projects: [
      {
        extends: './vite.config.mts',
        test: { name: 'unit' },
      },
      createStorybookVitestProject({
        configDir: '.storybook',
        tags: { exclude: ['deprecated'] },
        exclude: ['src/components/**', 'src/pages/**'],
      }),
    ],
  },
});
