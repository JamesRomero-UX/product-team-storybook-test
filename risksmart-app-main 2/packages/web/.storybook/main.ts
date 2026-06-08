import type { StorybookConfig } from '@storybook/react-vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { loadEnv } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');

// Load REACT_APP_* vars from packages/web/.env so they're available to Vite.
// In CI / Chromatic these are provided as environment variables instead.
const envPrefix = 'REACT_APP';
const fileEnv = loadEnv('development', packageRoot, envPrefix);
for (const [key, value] of Object.entries(fileEnv)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

// Provide fallback defaults for vars that may not be in .env or CI env,
// to prevent getEnv() from throwing.
const storybookEnvDefaults: Record<string, string> = {
  REACT_APP_REST_API_URL: 'http://localhost',
  REACT_APP_TINY_API_KEY: '',
};

for (const [key, value] of Object.entries(storybookEnvDefaults)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-themes'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('storybook-addon-tag-badges'),
    getAbsolutePath('@github-ui/storybook-addon-performance-panel'),
    getAbsolutePath('@chromatic-com/storybook'),
  ],
  framework: getAbsolutePath('@storybook/react-vite'),
  refs: (_config, { configType }) => {
    if (configType === 'DEVELOPMENT') {
      return {
        'atomic-ui': {
          title: 'Atomic UI',
          url: 'http://localhost:6007',
        },
      };
    }
    return {
      'atomic-ui': {
        title: 'Atomic UI',
        url: 'https://main--69788451dd8ffa38db205207.chromatic.com/',
      },
    };
  },
  docs: {},
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};
export default config;
