# design-sync notes — RiskSmart themed-cloudscape

Syncing `@risk-smart/themed-cloudscape-components` (v0.1.8) → Claude Design project
"RiskSmart Components (Cloudscape)". Storybook shape; the `Cloudscape Reference/*`
stories are the fidelity oracle. `window.RiskSmart` is the bundle global.

## Solo-phase learnings ([GENERAL] = applies to all components)

- **[GENERAL] Reference oracle is scoped to Cloudscape Reference stories only.**
  The repo's `.storybook` also globs product-app stories and the atomic-ui package.
  atomic-ui stories are titled `Components/<Name>` and collide by last-segment with
  themed-cloudscape export names (Button/Alert/Badge/Box/Checkbox/Container/Icon/
  Input/RadioGroup/Select/Spinner/Textarea) — the converter would pair those
  unrelated Tailwind components to our exports and render them unstyled. Fix: build
  the reference from `.design-sync/sb-config` (glob = `src/cloudscape-reference/**`
  only). That config inherits the repo config but overrides `stories` and points
  `builder.viteConfigPath` at the repo `vite.config.ts` (needed because the config
  dir lives outside repo root, so react-vite no longer auto-finds the vite aliases
  for `src/` and `@risksmart-app/*`). Reference build cmd:
  `npx storybook build -c .design-sync/sb-config -o <repoRoot>/.design-sync/sb-reference`.

- **[GENERAL] Provider: `cfg.provider = PreviewRoot` (a Fragment passthrough).**
  The repo's `.storybook/preview` decorators call `withThemeByClassName` from
  `@storybook/addon-themes`, which the converter stubs to `undefined` → every preview
  crashed with "withThemeByClassName is not a function". themed-cloudscape needs NO
  React context: its theming is CSS custom properties at `:root` (default `risksmart`
  theme applies no wrapper class), shipped in `_ds_bundle.css`. Setting `cfg.provider`
  skips decorator bundling entirely and fixes all previews. Provider module:
  `.design-sync/preview-root.tsx` (registered via `cfg.extraEntries`).

- **[GENERAL] Fonts.** Base UI font is **Sora** (`--font-family-base`); shipped from
  `@fontsource/sora` latin weights 100–800 via `.design-sync/fonts/sora.css`
  (`cfg.extraFonts`). **Courier Prime** is only the 4th entry in a monospace fallback
  stack (`Monaco, Menlo, Consolas, "Courier Prime", …`) that never loads even in
  production (system monospace resolves first) — suppressed via
  `cfg.runtimeFontPrefixes: ["Courier Prime"]`, not a real brand font.

- **[GENERAL] `[TOKENS_MISSING]` 12 `--awsui-*-g964ok` vars are benign** — Cloudscape
  injects them at runtime via inline style/JS (split-panel height, flashbar stack
  index, slider positions). Verified on rendered previews; do NOT chase.

- **Grid overflow / portals (presentation only — cardMode).**
  `cardMode: column` → Table, Alert, Badge, Box (stories wider than a grid cell).
  `cardMode: single` → RadioGroup, Select (fixed/portal content), Modal (overlay).
  These are card-layout only; grading is per-story `?story=` capture so fidelity is
  unaffected.

- **Floor cards: HelpPanel, SideNavigation (all stories `skip`ped).** Their
  cloudscape-reference stories are RiskSmart *app-level* compositions, not the plain themed
  component: HelpPanel renders the local `src/components/help-panel` store-driven wrapper
  (zustand `useHelpStore` + `RealProviders` = Apollo/Auth0/i18n), and SideNavigation renders
  the app's `@risksmart-app/components/navigation` (`RiskSmartNavigation`, icon-extended).
  Both import app composites esbuild can't resolve in the bundle context, and even if forced
  to render the bare themed component they would NOT match the app-flavored reference. So all
  their story ids are `cfg.overrides.<Name>.skip`ped — the components still ship fully
  functional in the bundle and get the typographic floor card; the design agent can compose
  them from the `.d.ts`. To author real previews later: own the `.tsx`, render the themed
  `HelpPanel` / `SideNavigation` directly with static content, and rebuild the reference so
  the oracle shows the same plain component.

## Solo set (graded match): Button, Alert, Modal, PieChart, TextContent.

## App shell cards (added post-initial-sync)
`AppLayout` and `TopNavigation` had no cloudscape-reference story upstream, so they were
bundle-only (no card). Added static reference stories under `.design-sync/stories/`
(globbed by `sb-config/main.ts`): `AppLayout.stories.tsx` (3 reference page templates — "Page Shell", "Table Page", "Form Page")
and `TopNavigation.stories.tsx` ("Default" — identity/search/utilities). Pure Cloudscape,
no app providers/data, so they render + verify cleanly. `AppLayout` is `cardMode: column`
(all 3 templates shown stacked, viewport 1280x820); `TopNavigation` is `cardMode: single`
(viewport 1200x120). These are the canonical page templates the design agent routes to
(table view → Table Page, form → Form Page) — see conventions.md. To extend/add templates:
add stories in `.design-sync/stories/` and rebuild the reference + driver.

## Accepted `close` grades
- **FileTokenGroup** (Default): storybook tokens show a faint cyan interior fill; the
  preview interior is white. Border color/theme matches on both sides, so the theme is
  applied correctly — it's a FileToken background nuance baked into the compiled bundle,
  not fixable via a preview (the generated preview compiles the story module 1:1). Isolated
  to this one component; accepted as `close`.

## Observations (not defects)
- AreaChart / LineChart / MixedLineBarChart `Default` stories render with **no plotted
  series** on BOTH storybook and preview (the story fixtures start with an empty/filtered
  dataset; x-axis falls back to a linear 0–1 scale). Previews reproduce the reference 1:1,
  so grades are `match`. If those stories are later expected to show data, fix the story
  fixtures — not the previews.
- Storybook canvas has a light-lavender background (`#f9f9fd`, backgrounds addon); previews
  render on white. Framing only — ignored per rubric.

## Re-sync risks
- Reference must be rebuilt from `.design-sync/sb-config` (NOT `.storybook`) or atomic-ui
  contamination returns. `storybookConfigDir` in config already points there.
- `@risk-smart/*` packages install from GitHub Packages (auth in `~/.npmrc`).
- Sora woff2 files are committed under `.design-sync/fonts/` (the nested app's
  node_modules is a separate git repo and not durable).
