import {
  spaceScaledXxxs,
  spaceScaledXxs,
  spaceScaledXs,
  spaceScaledS,
  spaceScaledM,
  spaceScaledL,
  spaceScaledXl,
  spaceScaledXxl,
  spaceScaledXxxl,
} from '@risk-smart/themed-design-tokens/visual-refresh';

import theme from '@risk-smart/web-theme';
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../components/**/*.{ts,tsx}',
    '!../components/node_modules/**',
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    ...theme,
    // https://github.com/cloudscape-design/components/blob/main/src/internal/styles/foundation/breakpoints.scss
    screens: {
      xxs: '576px',
      xs: '688px',
      sm: '992px',
      md: '1200px',
      lg: '1400px',
      xl: '1920px',
      xxl: '2540px',
    },
    spacing: {
      // Cloudscape: https://cloudscape.design/foundation/visual-foundation/spacing/
      // Tailwind: https://tailwindcss.com/docs/customizing-spacing#default-spacing-scale
      0: '0px',
      1: spaceScaledXxxs, // 2
      2: spaceScaledXxs, // 4
      3: spaceScaledXs, // 8
      4: spaceScaledS, // 12
      5: spaceScaledM, // 16
      6: spaceScaledL, // 20
      7: spaceScaledXl, // 24
      8: spaceScaledXxl, // 32
      9: spaceScaledXxxl, // 40
    },
    extend: {
      borderWidth: {
        ...theme.borderWidth,
        DEFAULT: '1.5px',
      },
      animation: {
        'border-pulse': 'border-pulse 2s linear infinite',
      },
      keyframes: {
        'border-pulse': {
          '0%, 100%': {
            borderColor: '#00DECB',
          },
          '50%': {
            borderColor: '#FFFFFF',
          },
        },
      },
    },
  },
  plugins: [],
};
