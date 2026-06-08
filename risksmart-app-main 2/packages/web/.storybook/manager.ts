import { addons } from 'storybook/manager-api';
import { defaultConfig } from 'storybook-addon-tag-badges/manager-helpers';

addons.setConfig({
  tagBadges: [
    {
      tags: 'wip',
      badge: {
        text: 'In Progress',
        style: {
          backgroundColor: '#fef3c7',
          color: '#92400e',
        },
        tooltip: 'This component can catch flies!',
      },
      display: {
        sidebar: [
          {
            type: 'component',
            skipInherited: true,
          },
        ],
        toolbar: false,
        mdx: true,
      },
    },
    // Place the default config after your custom matchers.
    ...defaultConfig,
  ],
});

// Must run after addons initialize — the tag-badges addon overwrites
// sidebar config via a shallow Object.assign in its own setConfig call,
// so collapsedRoots set above would be lost.
addons.register('sidebar-config', () => {
  const existing = addons.getConfig();
  addons.setConfig({
    sidebar: {
      ...existing.sidebar,
      collapsedRoots: ['deprecated'],
    },
  });
});
