import { esbuildPluginFilePathExtensions } from 'esbuild-plugin-file-path-extensions';
import type { Plugin } from 'esbuild';
import { resolve } from 'path';
import { defineConfig } from 'tsup';

/**
 * esbuild plugin that forces files within a workspace package to be bundled
 * inline rather than treated as external by skipNodeModulesBundle. Needed
 * because skipNodeModulesBundle externalises resolved paths inside
 * node_modules (including symlinked workspace packages), but noExternal only
 * matches the initial import specifier, not transitive relative imports.
 */
const bundleWorkspacePackage = (packageName: string): Plugin => ({
  name: `bundle-${packageName}`,
  setup(build) {
    const packageDir = `/packages/${packageName.split('/')[1]}/`;
    const nodeModulesDir = `/node_modules/${packageName}/`;
    build.onResolve({ filter: /^\./ }, (args) => {
      if (args.resolveDir.includes(packageDir) || args.resolveDir.includes(nodeModulesDir)) {
        const resolved = resolve(args.resolveDir, args.path);
        const tsPath = resolved.endsWith('.ts') ? resolved : `${resolved}.ts`;
        return { path: tsPath, external: false };
      }
      return undefined;
    });
  },
});

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.test.ts', '!src/__tests__/**'],
  format: ['esm'],
  target: 'node22',
  sourcemap: true,
  clean: true,
  splitting: false,
  bundle: true,
  skipNodeModulesBundle: true,
  noExternal: [/^@risksmart-app\/modules/], // Bundle workspace TS packages that lack compiled output
  esbuildPlugins: [
    bundleWorkspacePackage('@risksmart-app/modules'),
    esbuildPluginFilePathExtensions({ esmExtension: 'js' }),
  ],
  onSuccess: async () => {
    const { readdir, readFile, writeFile } = await import('fs/promises');
    const { join } = await import('path');

    const processDirectory = async (dir: string): Promise<void> => {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          await processDirectory(fullPath);
        } else if (entry.name.endsWith('.js')) {
          let content = await readFile(fullPath, 'utf-8');
          content = content.replace(
            /from\s+["'](@risksmart-app\/[^"']+?)["']/g,
            (match, importPath) => {
              // Skip if already has extension
              if (/\.(js|mjs|cjs|json)$/.test(importPath)) {
                return match;
              }
              // Don't append .js to bare package imports (e.g. @risksmart-app/foo)
              if (!/\//.test(importPath.slice(importPath.indexOf('/') + 1))) {
                return match;
              }
              return `from "${importPath}.js"`;
            }
          );
          await writeFile(fullPath, content);
        }
      }
    };

    await processDirectory('./dist');
  },
});
