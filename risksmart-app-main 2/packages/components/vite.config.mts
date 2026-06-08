/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import childProcess from 'child_process';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

import packageConfig from './package.json';

const commitHash = childProcess
  .execSync('git rev-parse --short HEAD')
  .toString();

export default defineConfig(({ mode }) => {
  if (mode === 'test') {
    process.env = {
      ...process.env,
      REACT_APP_REST_API_URL: 'http://localhost',
      REACT_APP_ENVIRONMENT: mode,
    };
  }

  return {
    envPrefix: 'REACT_APP_',
    test: {
      globals: true,
      environment: 'happy-dom',
      exclude: [...configDefaults.exclude, '**/tests/**'],
      setupFiles: ['./src/testing/setupTests.ts'],
      reporters: ['default', 'html'],
      useAtomics: true,
      pool: 'threads',
      coverage: {
        enabled: false,
        reporter: ['html'],
        outputDir: 'coverage/.tmp',
        all: false,
        include: ['**'],
        exclude: [
          'coverage/**',
          'dist/**',
          '**/node_modules/**',
          '**/[.]**',
          'packages/*/test?(s)/**',
          '**/*.d.ts',
          '**/virtual:*',
          '**/__x00__*',
          '**/\x00*',
          'cypress/**',
          'test?(s)/**',
          'test?(-*).?(c|m)[jt]s?(x)',
          '**/*{.,-}{test,spec,bench,benchmark}?(-d).?(c|m)[jt]s?(x)',
          '**/__tests__/**',
          '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
          '**/vitest.{workspace,projects}.[jt]s?(on)',
          '**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}',
        ],
        provider: 'v8',
        thresholds: {
          lines: 5,
          functions: 40,
          statements: 5,
          branches: 60,
        },
      },
    },
    build: {
      outDir: 'build',
      sourcemap: mode !== 'production',
    },
    define: {
      __APP_VERSION__: JSON.stringify(packageConfig.version),
      __COMMIT_HASH__: JSON.stringify(commitHash),
    },
    plugins: [react(), svgr(), tsconfigPaths()],
  };
});
