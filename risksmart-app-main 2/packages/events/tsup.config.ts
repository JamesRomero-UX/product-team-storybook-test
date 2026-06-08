import { esbuildPluginFilePathExtensions } from 'esbuild-plugin-file-path-extensions';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'types/command-types': 'src/types/command-types.ts',
    'types/common': 'src/types/common.ts',
    'types/system-events': 'src/types/system-events.ts',
    'types/tenant-events': 'src/types/tenant-events.ts',
    'types/org-events': 'src/types/org-events.ts',
    'types/orguser-events': 'src/types/orguser-events.ts',
    'types/request-types': 'src/types/request-types.ts',
  },
  format: ['esm'],
  target: 'node22',
  dts: true,
  clean: true,
  bundle: true,
  skipNodeModulesBundle: true,
  esbuildPlugins: [esbuildPluginFilePathExtensions({ esmExtension: 'js' })],
});
