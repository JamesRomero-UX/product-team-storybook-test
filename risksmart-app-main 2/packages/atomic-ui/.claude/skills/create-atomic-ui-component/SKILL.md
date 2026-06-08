---
name: create-atomic-ui-component
description: Creates a new atomic-ui component with Storybook stories based on a Figma design. Use when user says "create component from Figma", "add atomic-ui component", or provides a Figma URL for a new component.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, ToolSearch, mcp__figma__get_design_context, mcp__figma__get_screenshot, mcp__figma__get_metadata, mcp__figma__get_code_connect_map, mcp__figma__get_variable_defs
model: opus
argument-hint: [figma-frame-url]
---

You are creating a new atomic-ui component based on a Figma design.

Work in the atomic-ui package (`packages/atomic-ui`).

## Figma Design

Create the component based on the Figma frame: $ARGUMENTS

Use the Figma MCP tool to fetch the design context and understand the component's:

- Sizes and dimensions
- Color tokens and states
- Typography
- Spacing and layout

## Implementation Steps

### 1. Find and Generate Base Component

Use the shadcn MCP server to search for the best matching shadcn component. First discover the available shadcn MCP tools using `ToolSearch` with the query `+shadcn`, then:

1. **Search the registry** for components that match the Figma design (e.g. search for "button", "dialog", "input", etc.)
2. **Get component details** to review the component's API, variants, and usage patterns
3. **Install the component** as a starting point:

```bash
cd packages/atomic-ui && pnpm shadcn:add {component-name}
```

This creates a base component in `src/components/shadcn/` which you'll use as reference.

If the shadcn MCP server is not available, fall back to the CLI command above. If you are unsure about the matching component in shadcn, ask for clarification.

### 2. Create Component Structure

Create a new directory under `src/components/{component-name}/` with:

- `index.tsx` - The main component (keep it simple, delegate styling to variants)
- `variants.ts` - All CVA variants and Tailwind styles
- `{ComponentName}.stories.tsx` - Comprehensive Storybook stories

### 3. Follow Existing Patterns

Reference the button component (`src/components/button/`) for patterns:

- Use `@base-ui/react` primitives where available
- Use `class-variance-authority` (CVA) for variants
- Use the `cn()` utility from `@/lib/utils.ts` for class merging
- Export types alongside the component

### 4. Variants File Guidelines

Keep variants and associated Tailwind styles in the variants file:

- Group related classes logically (layout, visual, states, etc.)
- Use design tokens from `tailwind.config.ts` and `src/theme/default.css`
- Avoid direct pixel values, colors - use tokens like `bg-secondary`, `text-primary-foreground`
- Export variant objects for use in stories

### 5. Stories Guidelines

Create comprehensive stories following the pattern in existing components:

- Use `className={'...'}` with curly braces and single quotes (not `className="..."`)
- Include stories for: Default, all variants, all sizes, disabled states, interactive examples
- Use `story-tile-group` and `story-tile` classes for layout
- Add `play` functions for accessibility testing where appropriate
- Import `{ cn, toTitleCase }` from `@/lib/utils.ts`
- Story tags (`new`/`updated`) are managed automatically by the `update-story-tags` skill — do not set them manually
- To optimise costs, avoid adding a large number of different stories. Either render multiple variants in a single story, or if adding interaction tests, add multiple interactions in the same `play()` function.

### 6. Code Style

- Use curly braces with single quotes for className: `className={'text-base'}`
- Wrap string literals in JSX expressions: `{'Label text'}`
- Follow import ordering (type imports first, then React, then external, then internal)
- Run `pnpm lint:fix` to auto-fix formatting issues

### 7. Register the Export

- Add all newly created functional components and types to the corresponding blocks, components or patterns directory `src/{blocks | components | patterns}/index.ts` for export

## Cleanup

After creating your component, delete the auto-generated shadcn file:

```bash
rm packages/atomic-ui/src/components/shadcn/{component-name}.tsx
```

## Verification

1. Run linter: `pnpm lint:fix`
3. Build CSS: `pnpm tw:build`

## Summary

When finished, provide a summary table of any assumptions made about:

- Size dimensions and their token mappings
- Color tokens used for different states
- Focus/disabled styling approaches
- Any arbitrary values used (e.g., `h-[18px]`) that couldn't use standard tokens

This helps human reviewers quickly verify the implementation matches the Figma design.
