import type { Meta, StoryObj } from '@storybook/react-vite';

import { cn } from '../../lib/utils';
import defaultThemeCss from '../../theme/default.css?raw';

// ---------------------------------------------------------------------------
// CSS parser — extracts token data from theme CSS at build time via ?raw
// ---------------------------------------------------------------------------

const PRIMITIVE_RE = /--(color-(\w+)-(\w+)):\s*([^;/]+)/g;
const SEMANTIC_RE = /--(?!color-)(\w[\w-]*):\s*var\(--(color-[\w-]+)\)/g;

interface PrimitivePalette {
  shades: string[];
  cssVar: (shade: string) => string;
}

function parsePrimitives(css: string): Record<string, PrimitivePalette> {
  const groups: Record<string, string[]> = {};

  for (const match of css.matchAll(PRIMITIVE_RE)) {
    const profile = match[2];
    const shade = match[3];
    groups[profile] ??= [];
    groups[profile].push(shade);
  }

  return Object.fromEntries(
    Object.entries(groups).map(([profile, shades]) => [
      profile,
      {
        shades,
        cssVar: (shade: string) => `--color-${profile}-${shade}`,
      },
    ])
  );
}

interface SemanticToken {
  token: string;
  primitive: string;
}

function parseSemantics(css: string): Record<string, SemanticToken[]> {
  const groups: Record<string, SemanticToken[]> = {};

  for (const match of css.matchAll(SEMANTIC_RE)) {
    const tokenName = match[1];
    const primitiveRef = match[2];
    const profile = tokenName.split('-')[0];
    groups[profile] ??= [];
    groups[profile].push({
      token: `--${tokenName}`,
      primitive: `--${primitiveRef}`,
    });
  }

  return groups;
}

// Parse default theme
const primitiveColours = parsePrimitives(defaultThemeCss);
const semanticTokens = parseSemantics(defaultThemeCss);

// ---------------------------------------------------------------------------
// Shared presentation components
// ---------------------------------------------------------------------------

function Swatch({
  cssVar,
  label,
  size = 'md',
}: {
  cssVar: string;
  label: string;
  size?: 'sm' | 'md';
}) {
  const dimension = size === 'sm' ? 'size-10' : 'size-14';

  return (
    <div className={cn('flex flex-col items-center gap-1')}>
      <div
        className={cn(
          dimension,
          'rounded-lg border border-neutral-border shadow-xs'
        )}
        style={{ backgroundColor: `oklch(var(${cssVar}))` }}
      />
      <span className={cn('text-xs text-neutral-foreground')}>{label}</span>
    </div>
  );
}

function PaletteRow({
  name,
  palette,
}: {
  name: string;
  palette: PrimitivePalette;
}) {
  return (
    <div className={cn('flex flex-col gap-2')}>
      <span
        className={cn(
          'text-lg font-semibold text-neutral-foreground capitalize'
        )}
      >
        {name}
      </span>
      <div className={cn('flex flex-wrap gap-3')}>
        {palette.shades.map((shade) => (
          <Swatch key={shade} cssVar={palette.cssVar(shade)} label={shade} />
        ))}
      </div>
    </div>
  );
}

function SemanticGroup({
  name,
  tokens,
}: {
  name: string;
  tokens: SemanticToken[];
}) {
  return (
    <div className={cn('flex flex-col gap-3')}>
      <span
        className={cn(
          'text-lg font-semibold text-neutral-foreground capitalize'
        )}
      >
        {name}
      </span>
      <div className={cn('grid gap-2')}>
        {tokens.map(({ token, primitive }) => (
          <div key={token} className={cn('flex items-center gap-3')}>
            <div
              className={cn(
                'size-10 shrink-0 rounded-lg border border-neutral-border shadow-xs'
              )}
              style={{ backgroundColor: `oklch(var(${token}))` }}
            />
            <div className={cn('flex flex-col')}>
              <span
                className={cn('text-sm font-medium text-neutral-foreground')}
              >
                {token}
              </span>
              <span className={cn('text-xs text-muted-foreground')}>
                {primitive}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Storybook config
// ---------------------------------------------------------------------------

const Placeholder = () => <div />;

/**
 * Design tokens for the colour system, parsed directly from theme CSS files.
 * Primitives define the raw palette, semantic tokens reference primitives
 * to express design intent (e.g. "primary-hover").
 *
 * Use the **theme toggle above** in the Storybook toolbar to switch between
 * themes — all stories update live via the CSS cascade.
 *
 * **Rule:** Components must only use semantic tokens — never reference primitives directly.
 */
const meta = {
  title: 'Design Tokens/Colours',
  component: Placeholder,
  parameters: {
    controls: { disable: true },
    actions: { disable: true },
  },
} satisfies Meta<typeof Placeholder>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The raw colour palette defined in OKLCh colour space.
 * These tokens are **not for direct use** in components — they exist
 * to be referenced by semantic tokens.
 *
 * **Toggle the theme** in the Storybook toolbar to see the fire theme's
 * overridden primitive palettes (primary, secondary, neutral).
 */
export const Primitives: Story = {
  render: () => (
    <div className={cn('story-page flex flex-col gap-8')}>
      {Object.entries(primitiveColours).map(([name, palette]) => (
        <PaletteRow key={name} name={name} palette={palette} />
      ))}
    </div>
  ),
};

/**
 * Semantic tokens map design intent to primitives. Each token name encodes
 * its profile, context, and state: `--{profile}-{context?}-{state?}`.
 *
 * These are the tokens that Tailwind utilities resolve to
 * (e.g. `bg-primary`, `text-secondary-foreground-hover`).
 *
 * **Toggle the theme** in the Storybook toolbar to see how semantic
 * tokens resolve to different colours when the underlying primitives change.
 */
export const Semantics: Story = {
  render: () => (
    <div
      className={cn(
        'story-page flex flex-wrap justify-center gap-x-8 gap-y-[96px]'
      )}
    >
      {Object.entries(semanticTokens).map(([name, tokens]) => (
        <SemanticGroup key={name} name={name} tokens={tokens} />
      ))}
    </div>
  ),
};
