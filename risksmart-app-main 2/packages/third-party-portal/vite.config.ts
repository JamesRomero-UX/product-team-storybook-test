/// <reference types="vitest" />
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import childProcess from 'child_process';
import path from 'path';
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
    };
  }

  return {
    envPrefix: 'REACT_APP_',
    test: {
      globals: true,
      environment: 'happy-dom',
      exclude: [...configDefaults.exclude, '**/tests/**'],
      setupFiles: ['./setup.ts'],
    },
    server: {
      port: 3002,
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
    resolve: {
      alias: {
        // see https://cloudscape.design/foundation/visual-foundation/theming/
        '@cloudscape-design/components':
          '@risk-smart/themed-cloudscape-components',
        '@cloudscape-design/design-tokens-themed':
          '@risk-smart/themed-design-tokens',
      },
    },
    plugins: [
      react(),
      svgr(),
      tsconfigPaths(),
      sentryVitePlugin({
        org: 'risksmart',
        project: 'risksmart-third-party-portal',
        silent: mode === 'development',
      }),
    ],
  };
});
