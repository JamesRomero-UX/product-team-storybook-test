import { esbuildPluginFilePathExtensions } from 'esbuild-plugin-file-path-extensions';
import { defineConfig } from 'tsup';

// The fact that this is exposed at all is a code smell. Other services should not be accessing the tenant-configuration tabled directly.
// Unfortunately, until we have a proper API or another mechanism for sharing tenant configuration, other services need to access this directly.
export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.test.ts', '!src/__tests__/**'],
  format: ['esm'],
  target: 'node22',
  sourcemap: true,
  clean: true,
  splitting: false,
  bundle: true,
  skipNodeModulesBundle: true,
  esbuildPlugins: [esbuildPluginFilePathExtensions({ esmExtension: 'js' })],
});
