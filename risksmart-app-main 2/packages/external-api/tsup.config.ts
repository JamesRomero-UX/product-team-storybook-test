import { esbuildPluginFilePathExtensions } from 'esbuild-plugin-file-path-extensions';
import type { Plugin } from 'esbuild';
import { resolve } from 'path';
import { defineConfig } from 'tsup';

/**
 * esbuild plugin that forces files within a workspace package to be bundled
 * inline rather than treated as external by skipNodeModulesBundle. This is
 * needed because skipNodeModulesBundle externalises resolved paths inside
 * node_modules (including symlinked workspace packages), but noExternal only
 * matches the initial import specifier, not the transitive relative imports
 * within the package.
 */
const bundleWorkspacePackage = (packageName: string): Plugin => ({
  name: `bundle-${packageName}`,
  setup(build) {
    // Match both symlink-resolved path and node_modules path
    const packageDir = `/packages/${packageName.split('/')[1]}/`;
    const nodeModulesDir = `/node_modules/${packageName}/`;
    build.onResolve({ filter: /^\./ }, (args) => {
      if (args.resolveDir.includes(packageDir) || args.resolveDir.includes(nodeModulesDir)) {
        // Try .ts extension first since workspace packages use TypeScript source
        const resolved = resolve(args.resolveDir, args.path);
        const tsPath = resolved.endsWith('.ts') ? resolved : `${resolved}.ts`;
        return { path: tsPath, external: false };
      }
      return undefined;
    });
  },
});

export default defineConfig({
  entry: ['src/**/*.ts'],
  format: ['esm'],
  target: 'node22',
  sourcemap: true,
  clean: true,
  splitting: false,
  bundle: true,
  skipNodeModulesBundle: true, // Treat node_modules as external
  noExternal: ['@risksmart-app/domain', /^@risksmart-app\/modules/], // Bundle workspace TS packages that lack compiled output
  esbuildPlugins: [
    bundleWorkspacePackage('@risksmart-app/modules'),
    esbuildPluginFilePathExtensions({ esmExtension: 'js' }),
  ],
  async onSuccess() {
    // Post-process to add .js extensions to workspace package imports
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
          // Add .js extension to workspace package imports that don't have one
          content = content.replace(
            /from\s+["'](@risksmart-app\/[^"']+?)["']/g,
            (match, importPath) => {
              // Skip if already has extension
              if (/\.(js|mjs|cjs|json)$/.test(importPath)) {
                return match;
              }
              // Skip bare package imports (e.g. @risksmart-app/modules)
              if (/^@risksmart-app\/[^/]+$/.test(importPath)) {
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
