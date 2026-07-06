// design-sync reference storybook config.
//
// Inherits the repo's real .storybook/main.ts (framework, addons, viteFinal) but
// restricts `stories` to ONLY the Cloudscape Reference set — the fidelity oracle
// for the themed-cloudscape design system we sync. The repo's own config also
// globs product-app stories and the atomic-ui package, whose `Components/<Name>`
// titles collide by last-segment with themed-cloudscape export names and would
// pair unrelated Tailwind components to our exports (unstyled/wrong previews).
//
// Because the config dir lives outside the repo root, @storybook/react-vite no
// longer auto-discovers the repo's vite.config.ts (which defines the `src/` and
// `@risksmart-app/*` aliases every reference story needs), so we point at it
// explicitly via builder.viteConfigPath.
import base from '../../.storybook/main';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');

const config = {
  ...base,
  stories: [
    '../../src/cloudscape-reference/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    // design-sync-authored static shell stories (AppLayout, TopNavigation)
    '../stories/**/*.stories.@(ts|tsx)',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: { builder: { viteConfigPath: resolve(repoRoot, 'vite.config.ts') } },
  },
};

export default config;
