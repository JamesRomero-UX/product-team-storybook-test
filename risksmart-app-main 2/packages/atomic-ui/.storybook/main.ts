import type { StorybookConfig } from '@storybook/react-vite';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const baseAddons = [
  getAbsolutePath('@storybook/addon-themes'),
  getAbsolutePath('@storybook/addon-vitest'),
  getAbsolutePath('@storybook/addon-a11y'),
  getAbsolutePath('@storybook/addon-docs'),
  getAbsolutePath('@github-ui/storybook-addon-performance-panel'),
];

// When served as a composed ref inside another Storybook, the tag-badges addon
// triggers a cross-origin SecurityError because its manager reads config from
// the parent frame. Only include it when running standalone.
if (!process.env.STORYBOOK_COMPOSED_REF) {
  baseAddons.push(getAbsolutePath('storybook-addon-tag-badges'));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  staticDirs: ['../public'],
  addons: baseAddons,
  framework: getAbsolutePath('@storybook/react-vite'),
};

export default config;
