# Atomic UI

Custom component library built with [shadcn-ui](https://ui.shadcn.com/), [Base UI](https://base-ui.com/), and Tailwind CSS. Inspect locally with `pnpm dev`.

## Architecture

Three layers, each building on the last:

```
blocks/                 Complete UI sections with lang/state/actions props → drop directly into /web pages
  └─ patterns/          Composed components with interaction logic → reusable UI solutions
       └─ components/   Primitive elements with variant props → building blocks
```

### Components (`src/components/`)

Generic React components. Low-level, no business logic. Accept design props (variant, size, style) and standard HTML props.

```
components/button/
  ├── index.tsx                  # Component definition
  ├── {Component}.stories.tsx    # Component stories and documentation
  └── variants.ts                # CVA variant definitions and tailwind styling
```

Components wrap Base UI primitives for accessibility and use [CVA](https://cva.style/docs) for variant-driven styling. Every component has a `data-slot` attribute for cascade styling from parent layers.

### Patterns (`src/patterns/`)

Opinionated compositions of components that solve specific UI problems. They add interaction logic (click, keyboard, selection) and export compound sub-components for flexible composition.

Example: `SelectableCard` composes Box, Badge, Switch, and Text into an interactive card with `enabled`/`selected` props and keyboard handling.

Patterns use `data-slot` selectors in their CVA variants to style child components from the parent:

```ts
enabled: {
  true: '[&_[data-slot=selectable-card-status]]:text-secondary-foreground',
  false: '[&_[data-slot=selectable-card-status]]:text-muted-foreground',
}
```

### Blocks (`src/blocks/`)

Complete, self-contained feature sections ready to drop into pages. Blocks accept three props:

```ts
interface RiskScoringSettingsProps {
  lang: RiskScoringSettingsLang;         // All UI strings (i18n-ready)
  state: RiskScoringSettingsState;       // Application state
  actions: RiskScoringSettingsActions;   // Callbacks (parent handles state)
}
```

Blocks are purely presentational — they render based on `state` and call `actions`. The parent owns all state management.

### Layer comparison

| | Components | Patterns | Blocks |
|---|---|---|---|
| **Props** | Design variants + HTML | Design + behavioural | `lang` + `state` + `actions` |
| **State** | None | None | Parent-managed via actions |
| **Business logic** | None | Interaction only | Presentation only |
| **Example** | `Button`, `Badge`, `Icon` | `Dialog`, `SelectableCard` | `RiskScoringSettings` |

## Variant System

Variants are defined in `variants.ts` files using CVA. This keeps styling separate from component logic.

**Variants must only reference semantic tokens, never primitives.** This ensures themes work correctly — semantic tokens map to different primitives per theme, so referencing `bg-color-primary-600` directly would bypass theming.

```ts
// variants.ts — CORRECT: semantic tokens
variant: {
  default: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
}

// WRONG: primitive tokens bypass theming
variant: {
  default: 'bg-secondary-500 text-[var(--color-neutral-000)]',
}
```

Compound variants handle multi-condition styles (e.g., "outline + destructive"):

```ts
compoundVariants: [
  { 
    variant: 'destructive', 
    style: 'outline', 
    class: 'text-destructive hover:border-destructive'
  },
]
```

## Design Tokens

Two-tier token system in `src/theme/`:

**Primitives** (not for direct use): Raw colour palette in OKLCh colour space.
```css
--color-primary-600: 0.5765 0.1726 278.64;
```

**Semantics** (use these): Application-level tokens referencing primitives. These are what Tailwind utilities resolve to.
```css
--primary: var(--color-primary-900);
--primary-hover: var(--color-primary-600);
--primary-foreground: var(--color-neutral-000);
```

### Naming: 
`--{profile}-{context?}-{state?}` where:
- **_profile:_** is one of the configured colour palettes `primary|secondary|neutral|muted|destructive|warning|success`,
- **_context:_** is the UI context for that colour palette `foreground|border|minimal` (`background` is omitted for brevity),
- **_state:_** is the current state of the given UI context `hover|active`.

Theme files (`default.css`, `fire.css`) override these tokens. Applied via container class: `class="atomic-ui"` or `class="atomic-ui-fire"`.

### Adding a semantic token

1. Add the CSS variable to `src/theme/default.css` (and any other theme files) referencing a primitive:
   ```css
   --accent: var(--color-secondary-600);
   --accent-foreground: var(--color-primary-900);
   ```

2. Register the corresponding key in `tailwind.config.ts` under `theme.extend.colors`:
   ```ts
    accent: {
      DEFAULT: oklch('accent'),
      foreground: oklch('accent-foreground')
    }
   ```

This makes `bg-accent`, `text-accent-foreground`, etc. available as Tailwind utilities.

## Adding Components

```bash
pnpm shadcn:add [component]    # Imports to src/components/shadcn/
```

Then: move to `src/components/{name}/`, rename to `index.tsx`, extract variants to `variants.ts`, add `{Component}.stories.tsx`.

## Setup

```bash
pnpm install
pnpm tw:watch                           # Generate Tailwind CSS
pnpm exec playwright install chromium   # Install test browsers
pnpm storybook                          # Start Storybook
```

## Dev Workflow
```bash
pnpm test:unit:watch   # Run tests in watch mode
pnpm dev         # Start Storybook and tailwind in watch mode for development and visual testing
# open http://localhost:6006 in your browser to view Storybook
```

## Testing

Uses [Storybook Vitest](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon) with browser-mode rendering (Playwright).

| Command | Description |
|---|---|
| `pnpm test:unit` | Run all tests |
| `pnpm test:unit:watch` | Watch mode |
| `pnpm test:unit:coverage` | With coverage (100% threshold) |

### Interaction tests

Stories can include a `play` function for interaction testing. These run automatically in both Storybook's test widget and vitest. Import test utilities from `storybook/test`:

```ts
import { expect, userEvent, within } from 'storybook/test';

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Query elements using Testing Library
    const button = canvas.getByRole('button', { name: /Submit/i });

    // Assert initial state
    await expect(button).toBeVisible();
    await expect(button).not.toBeDisabled();

    // Simulate user interaction
    await userEvent.click(button);

    // Assert result
    await expect(canvas.getByText('Submitted')).toBeVisible();
  },
};
```

Key points:
- Use `within(canvasElement)` to scope queries to the story's rendered output
- Use `canvas.getByRole`, `canvas.getByText`, `canvas.getByTestId` for element queries
- Use `userEvent` for clicks, keyboard input, etc. — prefer this over `fireEvent`
- All assertions must use `await expect(...)` since tests run in the browser

## PR Workflow

Changes to `packages/atomic-ui` trigger the **AtomicUITest** CI job which runs lint, tests, and a [Chromatic](https://www.chromatic.com/) build. Chromatic posts links on the PR for visual review — both UI Tests and UI Review must be approved before merge.
