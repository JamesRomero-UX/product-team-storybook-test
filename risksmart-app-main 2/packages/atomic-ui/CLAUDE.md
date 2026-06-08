# packages/atomic-ui

In-house atomic design component library replacing Cloudscape Design System.

## Commands

```bash
pnpm --filter @risksmart-app/atomic-ui run storybook            # Start Storybook dev server
pnpm --filter @risksmart-app/atomic-ui run build-storybook      # Build static Storybook
pnpm --filter @risksmart-app/atomic-ui run tw:build             # Build Tailwind CSS
pnpm --filter @risksmart-app/atomic-ui run lint                 # Run ESLint
pnpm exec turbo lint --filter=@risksmart-app/atomic-ui          # Lint via Turborepo
pnpm exec turbo test:unit --filter=@risksmart-app/atomic-ui     # Run unit tests
```

## Architecture

Components follow an extended atomic design split into two layers:

- **`src/components/`** — primitive components (Button, Input, Badge, ToggleGroup, …)
- **`src/patterns/`** — composed UI patterns built on top of primitives (ColourSelector, RatingItem, …)

## Primitive Layer

Primitives come from **`@base-ui/react`** (v1.1.0). Import them directly:

```tsx
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';
```

## Shadcn Flavor

The project uses the **`base-maia`** flavor (Base UI, **NOT** Radix UI). This is configured in `components.json`:

```json
{ "style": "base-maia" }
```

To add a new component via the shadcn CLI use the pinned version:

```bash
pnpm shadcn:add <component-name>
```

This is an alias for `npx shadcn@2.3.0 add`. Always use this script — do not call `npx shadcn` directly.

The CLI may output files to `@/components/shadcn/` (an artefact of the alias config). After reviewing the generated code, adapt it into `src/components/<name>/` following the patterns below, then delete the generated files.

## New Component Workflow

Use the `/create-atomic-ui-component` skill when creating a new component from a Figma design. It handles the full workflow: Figma inspection → component code → stories.

## Tailwind

The project uses **Tailwind v3.4.x** (not v4). Avoid v4-only syntax:

| v4 only (DO NOT USE)                    | v3 equivalent                                  |
|-----------------------------------------|------------------------------------------------|
| `data-vertical:flex-col`                | `data-[orientation=vertical]:flex-col`         |
| `gap-[--spacing(var(--gap))]`           | use a static gap token, e.g. `gap-0` or `gap-2` |
| `@container` shorthand variant syntax   | use explicit `@[...]` container queries        |

## Active State Data Attribute

Base UI Toggle sets **`data-pressed`** on active items (not `data-state="on"` which is Radix). Use the `data-[pressed]:` Tailwind modifier to style active states:

```tsx
className={'data-[pressed]:bg-secondary data-[pressed]:text-primary'}
```

## Styling Conventions

- **`cn()`** — always use `cn()` from `../../lib/utils` for class merging. It automatically scopes styles to `.atomic-ui`.
- **CVA** — define variant logic in a separate `variants.ts` file, same as `src/components/button/variants.ts`.
- **`className` prop style** — use curly braces with single-quoted strings: `className={'some-class another-class'}`.
- **`data-slot`** — every component root element should have `data-slot="<component-name>"`.
- **No `"use client"`** — this is a Vite/Storybook project, not Next.js.

## Component Structure

Each component directory should contain:

```
src/components/<name>/
├── index.tsx          # Component implementation
├── variants.ts        # CVA variants (if applicable)
└── <Name>.stories.tsx # Storybook stories
```

Patterns follow the same structure:

```
src/patterns/<name>/
├── index.tsx
└── <Name>.stories.tsx
```

## Barrel Files

Public exports are managed by two barrel files:

- **`src/components/index.ts`** — exports every component
- **`src/patterns/index.ts`** — exports every pattern

When adding a new component or pattern, add its export to the appropriate barrel file **in alphabetical order**. ESLint (`simple-import-sort`) enforces the order and will warn if it is wrong.

```ts
// src/components/index.ts — insert alphabetically
export * from './toggle-group';  // t comes after s (switch, text), before u
```

## Storybook Stories

Follow the pattern in `src/components/button/Button.stories.tsx`:

- Use `story-tile-group` / `story-tile` layout helper classes
- `className={'...'}` — curly braces + single quotes
- Export `default` as the meta object satisfying `Meta<typeof Component>`
- Each story is a `StoryObj<typeof meta>`

## Key Patterns

- **Migration target**: New UI work across the app should use this library instead of Cloudscape. ESLint enforces this in consuming packages.
- All components should have accompanying `.stories.tsx` files.
- Styling uses TailwindCSS utility classes.
