import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const oklch = (cssVar: string) => `oklch(var(--${cssVar}) / <alpha-value>)`;

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{html,ts,tsx}',
    './.storybook/**/*.{ts,tsx}',
    './risksmart-app-main 2/packages/atomic-ui/src/**/*.{html,ts,tsx}',
    // Production layouts (PageLayout, AuthenticatedAppLayout) live under
    // packages/web/src and use Tailwind classes that previously weren't
    // being generated — so `h-screen`, the grid template, `overflow-hidden`,
    // and the page-header padding (`px-7 py-5`) all silently no-opped. That
    // caused (a) the whole iframe to scroll instead of just the content area,
    // and (b) the page header to render without padding. Adding this path
    // makes Tailwind compile the classes production code actually uses.
    './risksmart-app-main 2/packages/web/src/**/*.{html,ts,tsx}',
    // Custom organisms (GlobalHeader, Navigation, side panels, custom Table)
    // live here. Same fix — without it, GlobalHeader chrome and various
    // wrappers render unstyled.
    './risksmart-app-main 2/packages/components/src/**/*.{html,ts,tsx}',
  ],
  corePlugins: {
    preflight: false,
  },
  plugins: [tailwindcssAnimate],
  safelist: ['w-[70px]'],
  theme: {
    extend: {
      colors: {
        // Full web-theme palette — values from @risk-smart/web-theme/base.config.ts
        light_blue: '#ECFBFA',
        navy: '#0F0F2D',
        navy_light: '#2D2D53',
        navy_mid: '#14143A',
        teal: '#00DECB',
        dark_green: '#0F4D55',
        teal2: '#15BEB0',
        teal3: '#079589',
        white: '#FFFFFF',
        off_white: '#F6F6FB',
        transparent: 'rgba(0,0,0,0)',
        blue100: '#F2F8FD',
        blue200: '#D9F7F5',
        grey: '#B9B9C6',
        grey150: '#EDEDF2',
        grey200: '#E8E8EC',
        grey250: '#E4E4E8',
        grey300: '#D0D0D9',
        grey500: '#8B8BA0',
        grey550: '#73738C',
        grey600: '#5C5C79',
        grey650: '#454566',
        grey800: '#121233',
        red: '#d91515',
        orange: '#F2A041',
        orange_light: '#FEF6EE',
        magenta: '#C24297',
        primary: {
          DEFAULT: oklch('primary'),
          foreground: {
            DEFAULT: oklch('primary-foreground'),
            hover: oklch('primary-foreground-hover'),
            active: oklch('primary-foreground-active'),
          },
          hover: oklch('primary-hover'),
          active: oklch('primary-active'),
          minimal: oklch('primary-minimal'),
        },
        secondary: {
          DEFAULT: oklch('secondary'),
          foreground: {
            DEFAULT: oklch('secondary-foreground'),
            hover: oklch('secondary-foreground-hover'),
            active: oklch('secondary-foreground-active'),
          },
          hover: oklch('secondary-hover'),
          active: oklch('secondary-active'),
          focus: oklch('secondary-focus'),
          minimal: oklch('secondary-minimal'),
        },
        neutral: {
          DEFAULT: oklch('neutral'),
          foreground: {
            DEFAULT: oklch('neutral-foreground'),
            hover: oklch('neutral-foreground-hover'),
            active: oklch('neutral-foreground-active'),
          },
          border: {
            DEFAULT: oklch('neutral-border'),
            hover: oklch('neutral-border-hover'),
          },
          hover: oklch('neutral-hover'),
          active: oklch('neutral-active'),
          minimal: oklch('neutral-minimal'),
        },
        muted: {
          DEFAULT: oklch('muted'),
          foreground: {
            DEFAULT: oklch('muted-foreground'),
            hover: oklch('muted-foreground-hover'),
          },
          minimal: oklch('muted-minimal'),
        },
        destructive: {
          DEFAULT: oklch('destructive'),
          foreground: oklch('destructive-foreground'),
          hover: oklch('destructive-hover'),
          minimal: oklch('destructive-minimal'),
        },
        warning: {
          DEFAULT: oklch('warning'),
          hover: oklch('warning-hover'),
          foreground: oklch('warning-foreground'),
          minimal: oklch('warning-minimal'),
        },
        success: {
          DEFAULT: oklch('success'),
          foreground: oklch('success-foreground'),
          minimal: oklch('success-minimal'),
        },
      },
      fontSize: {
        // Pure CSS variable references — no hardcoded fallbacks.
        // Values resolve from .atomic-ui in packages/atomic-ui/src/theme/default.css,
        // which is applied to <body> via the withAtomicUI Storybook decorator.
        xs:   ['var(--font-size-xs)',   { lineHeight: 'var(--line-height-1)' }],
        sm:   ['var(--font-size-sm)',   { lineHeight: 'var(--line-height-2)' }],
        base: ['var(--font-size-base)', { lineHeight: 'var(--line-height-3)' }],
        lg:   ['var(--font-size-lg)',   { lineHeight: 'var(--line-height-4)' }],
        xl:   ['var(--font-size-xl)',   { lineHeight: 'var(--line-height-5)' }],
        '2xl':['var(--font-size-2xl)',  { lineHeight: 'var(--line-height-6)' }],
        '3xl':['var(--font-size-3xl)',  { lineHeight: 'var(--line-height-7)' }],
        '4xl':['var(--font-size-4xl)',  { lineHeight: 'var(--line-height-8)' }],
        '5xl':['var(--font-size-5xl)',  { lineHeight: 'var(--line-height-9)' }],
        '6xl':['var(--font-size-6xl)',  { lineHeight: 'var(--line-height-10)' }],
      },
      lineHeight: {
        1:  'var(--line-height-1)',
        2:  'var(--line-height-2)',
        3:  'var(--line-height-3)',
        4:  'var(--line-height-4)',
        5:  'var(--line-height-5)',
        6:  'var(--line-height-6)',
        7:  'var(--line-height-7)',
        8:  'var(--line-height-8)',
        9:  'var(--line-height-9)',
        10: 'var(--line-height-10)',
      },
      borderRadius: {
        xs: 'var(--radius-xs, 0.125rem)',
        sm: 'var(--radius-sm, 0.25rem)',
        DEFAULT: 'var(--radius-sm, 0.25rem)',
        md: 'var(--radius-md, 0.375rem)',
        lg: 'var(--radius-lg, 0.5rem)',
        xl: 'var(--radius-xl, 0.75rem)',
        '2xl': 'var(--radius-2xl, 1rem)',
        '3xl': 'var(--radius-3xl, 1.5rem)',
      },
      borderWidth: {
        1: '1px',
        DEFAULT: '1.5px',
      },
      boxShadow: {
        '2xs': '0 1px rgba(0, 0, 0, 0.05)',
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        DEFAULT: '0 4px 6px 0 rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--accordion-panel-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--accordion-panel-height)' },
          to: { height: '0' },
        },
        'field-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-2px)' },
          '80%': { transform: 'translateX(2px)' },
        },
        'spin-in': {
          from: { transform: 'rotate(-90deg)', opacity: '0' },
          to: { transform: 'rotate(0deg)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'field-shake': 'field-shake 300ms ease-out',
        'spin-in': 'spin-in 250ms ease-out',
      },
      spacing: {
        border: '1.5px',
      },
    },
  },
};

export default config;
