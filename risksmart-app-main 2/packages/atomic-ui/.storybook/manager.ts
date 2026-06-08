import { addons } from 'storybook/manager-api';
import {
  defaultConfig,
  type TagBadgeParameters,
} from 'storybook-addon-tag-badges/manager-helpers';

function isComposedRef(): boolean {
  if (window.self === window.top) return false;
  try {
    // Accessing top.location.origin throws SecurityError when cross-origin
    void window.top?.location.origin;
    return false;
  } catch {
    return true;
  }
}

if (!isComposedRef()) {
  addons.setConfig({
    tagBadges: [
      {
        tags: 'wip',
        badge: {
          text: 'WIP',
          style: {
            backgroundColor: '#fef3c7',
            color: '#92400e',
          },
        },
        display: {
          sidebar: [
            {
              type: 'component',
              skipInherited: true,
            },
          ],
          toolbar: true,
          mdx: true,
        },
      },
      {
        tags: 'updated',
        badge: {
          text: 'Updated',
          style: {
            backgroundColor: '#cffafe',
            color: '#0e7490',
          },
        },
        display: {
          sidebar: [
            {
              type: 'component',
              skipInherited: true,
            },
          ],
          toolbar: true,
          mdx: true,
        },
      },
      // Place the default config after your custom matchers.
      ...defaultConfig,
    ] satisfies TagBadgeParameters,
  });
}
