import storybookTest from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

interface StorybookVitestOptions {
  configDir: string;
  tags?: { exclude?: string[] };
  include?: string[];
  exclude?: string[];
  resolve?: { alias?: Record<string, string> };
}

export function createStorybookVitestProject(options: StorybookVitestOptions) {
  const { configDir, tags, include, exclude, resolve } = options;

  return {
    plugins: [react(), storybookTest({ configDir, tags })],
    ...(resolve ? { resolve } : {}),
    test: {
      name: 'storybook',
      ...(include ? { include } : {}),
      ...(exclude ? { exclude } : {}),
      browser: {
        enabled: true,
        headless: true,
        provider: 'playwright',
        instances: [{ browser: 'chromium' }],
      },
      setupFiles: [path.join(configDir, 'vitest.setup.ts')],
    },
  };
}
