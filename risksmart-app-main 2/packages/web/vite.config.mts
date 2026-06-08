/// <reference types="vitest" />
import type { RollupReplaceOptions } from '@rollup/plugin-replace';
import replace from '@rollup/plugin-replace';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import childProcess from 'child_process';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

import packageConfig from './package.json';
import { getPwaPlugin } from './vitePwa';

const commitHash = childProcess
  .execSync('git rev-parse --short HEAD')
  .toString();

export default defineConfig(({ mode }) => {
  if (mode === 'test') {
    process.env = {
      ...process.env,
      REACT_APP_REST_API_URL: 'http://localhost',
      REACT_APP_TINY_API_KEY: '',
    };
  }

  const replaceOptions: RollupReplaceOptions = {
    __DATE__: new Date().toISOString(),
    preventAssignment: true,
  };
  const reload = process.env.RELOAD_SW === 'true';
  if (reload) {
    replaceOptions.__RELOAD_SW__ = 'true';
  }

  const pwaPlugin = getPwaPlugin(
    mode as 'development' | 'production' | undefined
  );
  const envPrefix = 'REACT_APP';
  const env = loadEnv(mode, process.cwd(), envPrefix);
  const isPwa = env.REACT_APP_NO_PWA !== 'true';

  return {
    envPrefix,
    test: {
      testTimeout: 10000,
      globals: true,
      environment: 'happy-dom',
      exclude: [...configDefaults.exclude, '**/tests/**'],
      setupFiles: ['./setup.ts'],
      reporters: ['default', 'html', 'hanging-process'],
      maxConcurrency: 10,
      useAtomics: true,
    },
    server: {
      port: 3000,
      strictPort: true, // This ensures Vite exits if port 3000 is taken
    },
    build: {
      outDir: 'build',
      sourcemap: true,
      rollupOptions: {
        treeshake: true, // Enable tree shaking explicitly
        output: {
          manualChunks(id) {
            // If you're splitting vendor dependencies
            if (id.includes('ace-builds')) {
              return 'vendor-ace';
            }
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(packageConfig.version),
      __COMMIT_HASH__: JSON.stringify(commitHash),
    },

    plugins: [
      ...(env.REACT_APP_HTTPS === 'true' ? [basicSsl()] : []),
      react(),
      svgr(),
      tsconfigPaths(),
      ...(isPwa ? [pwaPlugin] : []),
      sentryVitePlugin({
        org: 'risksmart',
        project: 'risksmart-app',
        authToken: process.env.SENTRY_AUTH_TOKEN,
        disable:
          process.env.SENTRY_AUTH_TOKEN === undefined ||
          process.env.SENTRY_AUTH_TOKEN === '',
        release: {
          name: commitHash.trim(),
          dist: new Date().toISOString(),
        },
        // @TODO: figure out what files we could delete with `sourcemaps.filesToDeleteAfterUpload` from prod releases
      }),
      replace(replaceOptions),
    ],

    resolve: {
      alias: {
        // see https://cloudscape.design/foundation/visual-foundation/theming/
        '@cloudscape-design/components':
          '@risk-smart/themed-cloudscape-components',
        '@cloudscape-design/design-tokens-themed':
          '@risk-smart/themed-design-tokens',
        './components/update-prompt': isPwa
          ? './components/update-prompt'
          : './components/update-prompt/FakeUpdatePrompt',
        '@pages': '@pages',
      },
    },

    optimizeDeps: {
      include: ['balanced-match'],
    },
  };
});
