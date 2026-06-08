// @ts-nocheck
import type { Preview } from '@storybook/react-vite';
import '../src/output.css';

import { createStorybookPreview } from '../config/storybook-preview';

const shared = createStorybookPreview();

const preview: Preview = {
  ...shared,
  globalTypes: {
    theme: {
      type: 'string',
    },
  },
  initialGlobals: {
    ...shared.initialGlobals,
    backgrounds: { value: 'light' },
  },
  parameters: {
    layout: 'centered',
    backgrounds: {
      options: {
        dark: { name: 'Dark', value: '#282840' },
        light: { name: 'Light', value: '#f9f9fd' },
      },
    },
    controls: {
      sort: 'requiredFirst',
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    options: {
      storySort: (a, b) => {
        // Same component: docs first, then preserve declaration order
        if (a.title === b.title) {
          if (a.type === 'docs' && b.type !== 'docs') return -1;
          if (a.type !== 'docs' && b.type === 'docs') return 1;
          return 0; // Preserve original order within component
        }

        // Sort sections in specific order
        const sectionOrder = ['Design Tokens', 'Components', 'Patterns'];

        const getSectionIndex = (title) => {
          const section = title.split('/')[0];
          const index = sectionOrder.indexOf(section);
          return index === -1 ? sectionOrder.length : index;
        };

        const aSection = getSectionIndex(a.title);
        const bSection = getSectionIndex(b.title);

        if (aSection !== bSection) {
          return aSection - bSection;
        }

        // Within same section: sort alphabetically by title
        return a.title.localeCompare(b.title, undefined, { numeric: true });
      },
    },
  },
};

export const decorators = shared.decorators;

export default preview;
