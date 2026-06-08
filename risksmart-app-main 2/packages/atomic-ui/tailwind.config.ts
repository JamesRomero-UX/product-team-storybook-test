/** @type {import('tailwindcss').Config} */

// Helper to create oklch color with alpha support
const oklch = (cssVar: string) => `oklch(var(--${cssVar}) / <alpha-value>)`;

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{html,ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  plugins: [require('tailwindcss-animate')],
  theme: {
    extend: {
      colors: {
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
        xs: ['var(--font-size-xs, 0.75rem)', 'var(--line-height-1, 0.25rem)'],
        sm: ['var(--font-size-sm, 0.875rem)', 'var(--line-height-2, 0.5rem)'],
        base: ['var(--font-size-base, 1rem)', 'var(--line-height-3, 0.75rem)'],
        lg: ['var(--font-size-lg, 1.125rem)', 'var(--line-height-4, 1rem)'],
        xl: ['var(--font-size-xl, 1.25rem)', 'var(--line-height-5, 1.25rem)'],
        '2xl': ['var(--font-size-2xl, 1.5rem)', 'var(--line-height-6, 1.5rem)'],
        '3xl': [
          'var(--font-size-3xl, 1.875rem)',
          'var(--line-height-7, 1.75rem)',
        ],
        '4xl': ['var(--font-size-4xl, 2.25rem)', 'var(--line-height-8, 2rem)'],
        '5xl': ['var(--font-size-5xl, 3rem)', 'var(--line-height-9, 2.25rem)'],
        '6xl': [
          'var(--font-size-6xl, 3.75rem)',
          'var(--line-height-10, 2.5rem)',
        ],
      },
      lineHeight: {
        1: 'var(--line-height-1, 0.25rem)',
        2: 'var(--line-height-2, 0.5rem)',
        3: 'var(--line-height-3, 0.75rem)',
        4: 'var(--line-height-4, 1rem)',
        5: 'var(--line-height-5, 1.25rem)',
        6: 'var(--line-height-6, 1.5rem)',
        7: 'var(--line-height-7, 1.75rem)',
        8: 'var(--line-height-8, 2rem)',
        9: 'var(--line-height-9, 2.25rem)',
        10: 'var(--line-height-10, 2.5rem)',
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
        DEFAULT:
          '0 4px 6px 0 rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
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
        'drag-pop': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
        'save-pulse': {
          '0%, 100%': {
            transform: 'scale(1)',
            color: 'oklch(var(--primary))',
          },
          '15%': {
            transform: 'scale(1.02)',
            color: 'oklch(var(--primary) / 0.8)',
          },
          '30%': {
            transform: 'scale(1.04)',
            color: 'oklch(var(--secondary-active))',
          },
          '45%, 55%': {
            transform: 'scale(1.08)',
            color: 'oklch(var(--secondary))',
          },
          '70%': {
            transform: 'scale(1.04)',
            color: 'oklch(var(--secondary-active))',
          },
          '85%': {
            transform: 'scale(1.02)',
            color: 'oklch(var(--primary) / 0.8)',
          },
        },
        'drop-target-peek': {
          '0%': { height: '0px', opacity: '0' },
          '100%': { height: '6px', opacity: '1' },
        },
        'drop-flash': {
          '0%': {
            boxShadow: '0 0 0 0 oklch(var(--secondary) / 0.6)',
          },
          '40%': {
            boxShadow: '0 0 0 4px oklch(var(--secondary) / 0.3)',
          },
          '100%': {
            boxShadow: '0 0 0 0 oklch(var(--secondary) / 0)',
          },
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
        'drag-pop':
          'drag-pop 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22) forwards',
        'save-pulse': 'save-pulse 4s ease-in-out infinite',
        'drop-target-peek': 'drop-target-peek 200ms ease-out forwards',
        'drop-flash': 'drop-flash 500ms ease-out forwards',
        'field-shake': 'field-shake 300ms ease-out',
        'spin-in': 'spin-in 250ms ease-out',
      },
      spacing: {
        border: '1.5px',
      },
    },
  },
  safelist: [
    // =========================================================================
    // Safelist: utilities always generated for custom JSX styling in web app
    // =========================================================================

    // Spacing - padding (p, px, py, pt, pb, pl, pr)
    { pattern: /^p-[0-9]+(\.[0-9]+)?$/ },
    { pattern: /^p[xytblr]-[0-9]+(\.[0-9]+)?$/ },
    { pattern: /^-?p-[0-9]+(\.[0-9]+)?$/ },

    // Spacing - margin (m, mx, my, mt, mb, ml, mr)
    { pattern: /^-?m-[0-9]+(\.[0-9]+)?$/ },
    { pattern: /^-?m[xytblr]-[0-9]+(\.[0-9]+)?$/ },
    { pattern: /^m-auto$/ },
    { pattern: /^m[xytblr]-auto$/ },

    // Spacing - gap
    { pattern: /^gap-[0-9]+(\.[0-9]+)?$/ },
    { pattern: /^gap-[xy]-[0-9]+(\.[0-9]+)?$/ },

    // Spacing - space between
    { pattern: /^space-[xy]-[0-9]+(\.[0-9]+)?$/ },
    { pattern: /^-space-[xy]-[0-9]+(\.[0-9]+)?$/ },

    // Typography - font size
    { pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/ },

    // Typography - font weight
    {
      pattern:
        /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
    },

    // Typography - text alignment
    { pattern: /^text-(left|center|right|justify|start|end)$/ },

    // Typography - text colors (using theme colors)
    {
      pattern:
        /^text-(primary|secondary|neutral|muted|destructive|warning|success)(-foreground)?(-hover|-active|-minimal)?$/,
    },

    // Typography - line height
    {
      pattern:
        /^leading-(none|tight|snug|normal|relaxed|loose|[0-9]+|[0-9]+\.[0-9]+)$/,
    },

    // Typography - letter spacing
    { pattern: /^tracking-(tighter|tight|normal|wide|wider|widest)$/ },

    // Layout - display
    { pattern: /^(block|inline-block|inline|flex|inline-flex|grid|hidden)$/ },

    // Layout - flex
    { pattern: /^flex-(row|row-reverse|col|col-reverse)$/ },
    { pattern: /^flex-(wrap|wrap-reverse|nowrap)$/ },
    { pattern: /^flex-(1|auto|initial|none)$/ },
    { pattern: /^(grow|grow-0|shrink|shrink-0)$/ },

    // Layout - flex/grid alignment
    {
      pattern:
        /^items-(start|end|center|baseline|stretch|flex-start|flex-end)$/,
    },
    {
      pattern:
        /^justify-(start|end|center|between|around|evenly|flex-start|flex-end)$/,
    },
    { pattern: /^self-(auto|start|end|center|stretch|baseline)$/ },
    { pattern: /^place-(content|items|self)-.+$/ },

    // Layout - grid
    { pattern: /^grid-cols-[0-9]+$/ },
    { pattern: /^grid-rows-[0-9]+$/ },
    { pattern: /^col-span-[0-9]+$/ },
    { pattern: /^row-span-[0-9]+$/ },

    // Layout - width/height
    { pattern: /^w-[0-9]+(\.[0-9]+)?$/ },
    { pattern: /^w-(full|screen|min|max|fit|auto|px)$/ },
    { pattern: /^w-[0-9]+\/[0-9]+$/ },
    { pattern: /^min-w-(0|full|min|max|fit|[0-9]+)$/ },
    { pattern: /^max-w-(none|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full)$/ },
    { pattern: /^h-[0-9]+(\.[0-9]+)?$/ },
    { pattern: /^h-(full|screen|min|max|fit|auto|px)$/ },
    { pattern: /^min-h-(0|full|screen|min|max|fit)$/ },
    { pattern: /^max-h-(none|full|screen|min|max|fit|[0-9]+)$/ },

    // Layout - overflow
    { pattern: /^overflow-(auto|hidden|clip|visible|scroll)$/ },
    { pattern: /^overflow-[xy]-(auto|hidden|clip|visible|scroll)$/ },

    // Layout - position
    { pattern: /^(static|fixed|absolute|relative|sticky)$/ },
    { pattern: /^(inset|top|right|bottom|left)-[0-9]+(\.[0-9]+)?$/ },
    { pattern: /^(inset|top|right|bottom|left)-(auto|px|full)$/ },
    { pattern: /^z-[0-9]+$/ },
    { pattern: /^z-(auto)$/ },

    // Visual - border radius
    { pattern: /^rounded(-[a-z]+)?(-[a-z]+)?$/ },

    // Visual - border width
    { pattern: /^border(-[0-9]+)?$/ },
    { pattern: /^border-[trbl](-[0-9]+)?$/ },
    { pattern: /^border-[xy](-[0-9]+)?$/ },

    // Visual - border color (theme colors)
    {
      pattern:
        /^border-(primary|secondary|neutral|muted|destructive|warning|success|border|input|ring)(-hover|-active|-minimal)?$/,
    },

    // Visual - background colors (theme colors)
    {
      pattern:
        /^bg-(primary|secondary|neutral|muted|destructive|warning|success|background|card|popover|button|transparent)(-hover|-active|-minimal)?$/,
    },

    // Visual - opacity
    { pattern: /^opacity-[0-9]+$/ },

    // Visual - shadow
    { pattern: /^shadow(-[a-z]+)?$/ },

    // Visual - ring
    { pattern: /^ring(-[0-9]+)?$/ },
    { pattern: /^ring-offset-[0-9]+$/ },
    {
      pattern: /^ring-(primary|secondary|muted|accent|destructive)$/,
    },

    // Effects - transitions
    { pattern: /^transition(-[a-z]+)?$/ },
    { pattern: /^duration-[0-9]+$/ },
    { pattern: /^ease-(linear|in|out|in-out)$/ },
    { pattern: /^delay-[0-9]+$/ },

    // Interactivity
    {
      pattern:
        /^cursor-(auto|default|pointer|wait|text|move|not-allowed|grab|grabbing)$/,
    },
    { pattern: /^select-(none|text|all|auto)$/ },
    { pattern: /^pointer-events-(none|auto)$/ },

    // SVG
    { pattern: /^(fill|stroke)-(current|none)$/ },

    // Size utility (for icons)
    { pattern: /^size-[0-9]+(\.[0-9]+)?$/ },

    // Animations (used by blocks consumed in web)
    { pattern: /^animate-(drop-flash|drop-target-peek|field-shake|drag-pop)$/ },
  ],
};
