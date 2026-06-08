import { defineConfig } from 'tsup';

const sharedConfig = {
  format: ['esm'] as const,
  target: 'node22' as const,
  sourcemap: true,
  clean: true,
  splitting: false,
  bundle: true,
  // Keep CommonJS packages external to avoid dynamic require issues
  external: ['express', 'helmet', 'pino'],
};

export default defineConfig([
  {
    ...sharedConfig,
    entry: ['src/stub-pdp/app.ts'],
    outDir: 'dist/stub-pdp',
  },
  {
    ...sharedConfig,
    entry: ['src/stub-auth0/app.ts'],
    outDir: 'dist/stub-auth0',
  },
]);
