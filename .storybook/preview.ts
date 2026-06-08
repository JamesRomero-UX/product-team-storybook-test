// @ts-nocheck
import type { Decorator, Preview } from '@storybook/react-vite';

import '../risksmart-app-main 2/packages/atomic-ui/src/index.css';
// Production SCSS-module rules copied verbatim from
// packages/web/src/components/form/controlled-group-and-user-multi-select/style.module.scss
// — fixes dropdown padding/icon alignment for grouped Multiselects.
import '../src/page-templates/_people-picker.css';
// Production SCSS-module rules from
// packages/web/src/pages/risk-dashboard/style.module.scss — hides the
// radio control on tier cards (whole card is clickable instead) and
// tightens spacing/borders. Scoped via [data-rs-tier-card="true"].
import '../src/page-templates/_risk-dashboard.css';
import { createStorybookPreview } from '../risksmart-app-main 2/packages/atomic-ui/config/storybook-preview';

// Apply the .atomic-ui class to <body> so all CSS custom properties defined
// inside .atomic-ui { } in packages/atomic-ui/src/theme/default.css are in
// scope for every story. Without this, --font-size-*, --line-height-*, colour
// tokens etc. are undefined and Tailwind utility classes that reference them
// (text-sm, text-base, …) produce invisible / clipped text.
// This mirrors what the production app does: the app shell root carries the
// atomic-ui class, activating the full design-token cascade.
const withAtomicUI: Decorator = (Story) => {
  document.body.classList.add('atomic-ui');
  return Story();
};

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
          return 0;
        }

        // Top-level section order
        const sectionOrder = [
          'Design Tokens',
          'Components',
          'Patterns',
          'App Shell',
          'Page Templates',
          'Cloudscape Reference',
          'Figma Mockups',
          'Prototypes',
        ];

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

// withAtomicUI must run before the theme decorators so the class is on body
// before any story renders.
export const decorators = [withAtomicUI, ...shared.decorators];

export default preview;
