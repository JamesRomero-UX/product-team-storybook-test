import { esbuildPluginFilePathExtensions } from 'esbuild-plugin-file-path-extensions';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.test.ts', '!src/__tests__/**'],
  format: ['esm'],
  target: 'node22',
  sourcemap: true,
  clean: true,
  splitting: false,
  bundle: true,
  skipNodeModulesBundle: true,
  noExternal: ['dayjs'], // Bundle dayjs so plugin subpath imports resolve without .js extensions
  esbuildPlugins: [esbuildPluginFilePathExtensions({ esmExtension: 'js' })],
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
              // Skip bare package imports (e.g. @risksmart-app/domain)
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
