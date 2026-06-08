import type { StorybookConfig } from '@storybook/react-vite';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env so each team member can point RS_APP_PATH at their local dev repo.
// Copy .env.example → .env and set RS_APP_PATH to wherever you cloned risksmart-app.
try {
  const raw = readFileSync(join(__dirname, '../.env'), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([^#\s=]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch { /* no .env file — using default path below */ }

const DEV_REPO = process.env.RS_APP_PATH
  ? resolve(process.env.RS_APP_PATH)
  : resolve(__dirname, '../risksmart-app-main 2');

const ATOMIC_UI_STORIES = join(
  DEV_REPO,
  'packages/atomic-ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
);

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)',
    ATOMIC_UI_STORIES,
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-themes',
    '@github-ui/storybook-addon-performance-panel',
    'storybook-addon-tag-badges',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
