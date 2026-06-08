---
name: live-app-component-import
description: >
  The canonical recipe for wiring up a custom production component from the
  RiskSmart dev repo into the local product-team-storybook, read-only, with
  1:1 fidelity. Use this whenever the user wants to add a component, page,
  modal, toolbar, layout, or any other production-built UI to local Storybook
  without modifying the dev repo. Triggers: "add the X from the live app",
  "use the production X in Storybook", "wire up the real X component",
  "import the live app's X", or any task requiring 1:1 fidelity for a
  component that already exists in the risksmart-app codebase.
---

# live-app-component-import

The canonical 6-step recipe for importing real production components from the
RiskSmart dev repo into product-team-storybook. Read-only on the dev repo,
1:1 fidelity in Storybook because the actual production code runs.

This skill exists because every custom component (Navigation, Toolbar, custom
Tables, custom Modals, etc.) has the same wiring pattern. Instead of
rediscovering it each time, follow this recipe.

## Prerequisites

- product-team-storybook project exists at `~/Documents/product-team-storybook/`
- Dev repo exists at `~/Documents/risksmart-app-main 2/` (read-only forever)
- Storybook running at http://localhost:6007
- GitHub PAT configured in `~/.npmrc` (for @risk-smart/* packages)
- Playwright + scripts/screenshot-story.mjs available

## The 6-Step Recipe

### Step 1 — Find the production source in the dev repo

Search systematically:

```
~/Documents/risksmart-app-main 2/packages/components/src/
~/Documents/risksmart-app-main 2/packages/web/src/components/
~/Documents/risksmart-app-main 2/packages/web/src/blocks/
~/Documents/risksmart-app-main 2/packages/atomic-ui/src/
```

Identify:
- Path to the component file
- Public export name (check the package's index.ts)
- All props and their types
- Any sibling files imported (the component's internal pieces)

If the component doesn't exist in the dev repo, this skill doesn't apply —
the component is genuinely new and should be built fresh in atomic-ui or
prototyped via figma-visual-iterate.

### Step 2 — Add a Vite path alias to the source file

Edit `~/Documents/product-team-storybook/vite.config.ts`. Add an alias
resolving to the dev repo source path:

```ts
resolve: {
  alias: {
    '@risksmart-app/components/navigation': path.resolve(
      __dirname,
      '../risksmart-app-main 2/packages/components/src/navigation/index.ts'
    ),
    // Add new aliases here as you import more components
  }
}
```

Pattern: alias the public export path the dev codebase would use, point at
the actual source file in the dev repo. Vite reads the source on every HMR;
nothing is copied or modified.

### Step 3 — Resolve transitive runtime dependencies

Custom components depend on libraries (Auth0, react-router, untitled icons,
react-query, etc.). The dev repo's `node_modules` aren't always resolvable
from the alias path, so install the same versions into product-team-storybook:

1. Read the dev repo's package.json + the component's import statements
2. List every import the component (and its internal pieces) uses
3. Install the same versions in product-team-storybook:
   ```
   cd ~/Documents/product-team-storybook
   pnpm add @auth0/auth0-react react-router @untitled-ui/icons-react ...
   ```
4. Match versions against the dev repo's pnpm-workspace.yaml catalog. Don't
   guess versions — find them.

If multiple components share deps, install them once and reuse.

### Step 4 — Mirror Tailwind theme tokens locally

The dev repo uses `@risk-smart/web-theme` (Tailwind v4) but
product-team-storybook uses Tailwind v3. The web-theme package can't be a
preset — its config is the wrong version.

Workaround:
1. Read the colours/spacing/typography from
   `~/Documents/risksmart-app-main 2/packages/web/web-theme/base.config.ts`
   (or wherever the team's Tailwind theme lives)
2. Mirror the colours map into `~/Documents/product-team-storybook/tailwind.config.ts`'s
   `theme.extend.colors`
3. Extend `content` to scan the dev repo source files used by the component:
   ```
   content: [
     './src/**/*.{ts,tsx}',
     '../risksmart-app-main 2/packages/components/src/navigation/**/*.{ts,tsx}',
     // Add new dev-repo paths as you import more components
   ]
   ```

Why: Tailwind needs to see the source files to know which classes to compile.

### Step 5 — Wrap in required providers (router, auth, query, theme)

Custom components often expect provider context. Common ones:

- **React Router** — many components use `<Link>`, `useMatches`, etc.
  Use `createMemoryRouter` + `RouterProvider` (NOT `MemoryRouter` — that
  doesn't satisfy `useMatches` in v7).
  ```tsx
  const router = createMemoryRouter(
    [{ path: '/', element: <YourComponent /> }],
    { initialEntries: ['/'] }
  );
  return <RouterProvider router={router} />;
  ```

- **Auth0** — components reading user state.
  Mock with a stub `Auth0ContextInterface` value or pass a custom auth
  context via the component's `authContext` prop if it accepts one.

- **React Query** — components that fetch data.
  Wrap in `<QueryClientProvider>` with a default `QueryClient`.

- **Theme provider** — only needed if the component uses CSS-in-JS or theme
  variables that aren't already loaded.

Mock data goes in the story, not in the dev repo. Build minimal mocks that
exercise the visible UI states.

### Step 6 — Write the story and verify

Create the story file at:
`~/Documents/product-team-storybook/src/cloudscape-reference/<ComponentName>/<ComponentName>.stories.tsx`

Or under `src/atomic-ui/<...>/` if it's an atomic-ui-adjacent component.

Story essentials:
- Import from the alias (e.g. `@risksmart-app/components/navigation`)
- Wrap in required providers
- Pass realistic mock data (matches what the live app passes)
- `tags: ['cloudscape-real']` (or `['live-app-real']`)
- `parameters.layout: 'fullscreen'` for full-screen components like nav/toolbar
- Docs banner: "1:1 with live app — uses RiskSmart's production X. Imported
  read-only via Vite alias from the dev repo."

Verify:
1. Hot reload — Storybook should pick up the new story without errors
2. Open the story in browser
3. Take a Playwright screenshot:
   ```
   node scripts/screenshot-story.mjs <story-id> tmp/visual-iterate/<name>.png
   ```
4. Compare to the live app or to a Figma render
5. Verify dev repo is clean: no files modified, no new files added in the dev
   repo. (`git status` won't work since the dev repo isn't a git checkout —
   compare against the OneDrive _package snapshot or trust your modifications
   list.)

## Common Pitfalls (Discovered During the Navigation Component Setup, then Page-Templates Wiring)

### Alias ordering: specific subpaths MUST come before catch-alls
Vite tries `resolve.alias` entries in order; the first match wins. A
catch-all like `@risksmart-app/i18n` → `<dev-repo>/packages/i18n/src` will
hijack a more-specific subpath like `@risksmart-app/i18n/src/ratings`,
rewriting it to `<dev-repo>/packages/i18n/src/src/ratings` (duplicate `src`)
and 404ing.

Rule: list every specific subpath alias **above** the package-root
catch-all. If you need to add a new specific entry, find the catch-all and
put your entry directly above it.

### Plain-string aliases are prefix-matched and can corrupt subpaths
`{ find: 'zustand/vanilla', replacement: '.../esm/vanilla.mjs' }` will match
`zustand/vanilla/shallow` and produce `.../esm/vanilla.mjs/shallow` — a
broken path. **This trap recurs every time you add a "wrapper index" alias
for a directory that also has sibling files** (e.g. aliasing
`@risksmart-app/components/src/button` to `button/index.ts` will hijack
`@risksmart-app/components/src/button/utils` and rewrite it to
`button/index.ts/utils`). The fix is the same in both cases:
use an **anchored regex**:

```ts
{ find: /^zustand\/vanilla$/, replacement: '.../esm/vanilla.mjs' },
{ find: /^zustand\/middleware$/, replacement: '.../esm/middleware.mjs' },
{ find: /^zustand\/(.+)$/, replacement: '.../esm/$1.mjs' }, // catch-all last
```

### Relative imports from dev-repo files bypass `resolve.alias`
`resolve.alias` only matches the import-specifier *string*. When a dev-repo
file does `import X from '../tab-settings-modal'`, Vite resolves that
relatively and never consults the alias map. Two patterns work:

1. **Relative-stub plugin** — a tiny Vite plugin with `enforce: 'pre'` that
   implements `resolveId(source, importer)`, resolves relative `source` to
   an absolute path, and redirects matching paths to a stub. We use this
   for `tab-settings-modal` and the rewrite plugin pattern is already in
   `vite.config.ts` (`interceptRelativeStubs`).
2. **Stub the imports the heavy file pulls in** — sometimes the heavy file
   itself has many bare-imports you can shim cheaply. Less reliable; use
   the resolveId plugin instead unless the heavy file is one or two imports
   away from rendering correctly.

### Relative imports into hoisted `node_modules`
Some dev-repo files do
`import X from '../../../node_modules/@cloudscape-design/...'` to reach a
hoisted package. Outside the dev repo's pnpm tree those paths don't
resolve. Solution: a `transform()` plugin (`enforce: 'pre'`) that rewrites
`(\.\./)+node_modules/(.+)` import strings to bare specifiers — see
`rewriteRelativeNodeModules` in `vite.config.ts`. After rewrite, normal
alias / `node_modules` resolution takes over.

### .scss CSS modules from the dev repo
Custom wrappers commonly use `import styles from './style.module.scss'`.
Vite handles `.module.scss` natively if `sass` is installed in
product-team-storybook (`pnpm add -D sass`). No extra config needed —
Vite generates scoped class names automatically. CSS-module-scoped
overrides may rely on selectors that depend on the dev-repo Tailwind
tokens; mirror those tokens (see "Token unavailable in CSS" below).

### Hook stubs MUST return stable references
This is the most subtle trap in the project. Several dev-repo `useEffect`
hooks list functions returned by stubbed hooks in their dependency
arrays — e.g. `AuthenticatedAppLayout` has:

```ts
useEffect(() => {
  locationChanged();
  toolsLocationChanged(location.pathname);
}, [location, locationChanged, toolsLocationChanged]);
```

If `useTools()` (stubbed) returns a fresh tuple `[undefined, () => {}, () => {}]`
on every call, the `toolsLocationChanged` reference changes every render
→ effect re-runs every render → calls `locationChanged()` from the real
zustand store → `set()` produces a new state-object reference → all
subscribers (including the parent that drives this effect) re-render →
useTools gets called again → … = "Maximum update depth exceeded".

Symptom is brutal: every story that uses RealProviders crashes with the
loop, and Storybook's React-Router error boundary swallows the React
error so the iframe shows the dev-error overlay or blank.

Rule: **hoist any function returned by a stub to module scope** so its
reference is stable across calls:

```ts
const noopSet = (_v: any) => {};
const noopChanged = (_loc: string) => {};
const STABLE_TUPLE = [undefined, noopSet, noopChanged] as const;
export const useTools = () => STABLE_TUPLE;
```

This bites whenever you wire a *real* zustand store next to a *stubbed*
sibling hook that participates in the same effect dep array. The same
trap applies to `useHasPermissionQuery` if any consumer destructures the
returned object reference into a useMemo/useEffect dep — destructure
primitives (booleans / strings) to be safe.

### Promoting a stubbed component to a real wired organism
The vite.config.ts has a number of `… → stub('NullComponent.tsx')` aliases
for components we explicitly null-render (modals/buttons that would
otherwise pull in heavy chains). When an organism graduates from "stub"
to "real wiring" (e.g. `actions-button` and `delete-modal` did in
Batch B), you must **remove** its stub alias before the catch-all can
resolve to the real source. Search vite.config for the directory name and
delete the line — leave a `// (Was: … stub. Removed when … was wired.)`
comment so the history is visible.

If you ALSO want to keep some entry-point of that dir stubbed (e.g. a
`/SomeSpecificFile` import the production code does directly to bypass
the index), leave that more-specific alias in place; only remove the
broad one.

### CSF static-indexer is stricter than Vite's runtime parser
Storybook's static indexer (the thing that builds the sidebar story list
without executing the file) parses each `*.stories.tsx` with babel and
will fail on edge-case JSX or identifier collisions that Vite's runtime
transform tolerates. Two specific traps:

1. **Reserved-feeling identifier names for story exports.** Naming a
   story export `Loading` produced
   `SyntaxError: Identifier 'Loading' has already been declared.` —
   probably because the auto-generated docs source-block re-uses the
   name. Use `LoadingState`, `LoadingSpinner`, etc. instead. Same is
   likely true for any common React component name.

2. **`replace_all` edits that produce mashed-together JSX** (e.g.
   `<Wrap><Stack>` adjacent without whitespace, generated by string
   substitutions) parse fine in Vite's transform but trip the indexer
   with "Unexpected token, expected '}'". When you see a
   `🚨 Unable to index ./src/.../SomeFile.stories.tsx` in the log,
   re-check that file with fresh eyes and rewrite cleanly rather than
   chasing a phantom syntax error.

Symptom: the iframe renders fine in the browser, screenshots come back
clean — but the story is missing from the sidebar.

### Stub fallout from real-component imports
When you remove a stub or wire a new organism, the dev-server's
dependency pre-scan crawls deeper into the dev repo and may surface
**previously-hidden** missing exports on existing stubs. Example: wiring
delete-modal/confirm-modal caused Vite to scan FormInner.tsx (part of
the deferred form engine) which imports `HasuraErrorCodes` and
`isPermissionError` from `@/utils/graphqlUtils`. Our existing stub for
that path only exported `evictField`. Fix: add the missing exports to
the stub (no-op enum / always-false function). If the missing identifier
clearly isn't reachable at runtime, a static stub is enough.

Watch for these signals in the log:
- `Failed to scan for dependencies from entries: ... for import "X"`
- `No matching export for "X"`

### When NO new alias is needed
If the component lives under a path already covered by a catch-all alias
(e.g. `src/components` → `WEB_SRC/components`, or
`@risksmart-app/components/src` → `COMPONENTS_SRC`), and none of the more-
specific stub aliases above the catch-all hijack its name, you don't need
to add anything to `vite.config.ts`. Just write the story; Vite will
resolve through the catch-all on first request.

When a story file imports from such a path, prefix the import with
`// eslint-disable-next-line import/no-unresolved` so the IDE's TS server
doesn't complain (we don't add `paths` to `tsconfig.json` for these — the
alias is Vite-only).

### Global i18next vs the React-bound instance
RiskSmart has two i18n instances at runtime:

1. The React-bound instance created in `_providers.tsx` (used by
   `useTranslation()` inside components rendered through `<RealProviders>`).
2. The **global default-export** of `i18next` from
   `@risksmart-app/i18n/src/i18n` — utility helpers like
   `labelWithPlural`, `EmptyEntityCollection`, etc. import this directly
   and call `i18next.t(...)` / `i18next.format(...)` on it.

If only #1 is initialised, helpers that touch #2 throw at runtime
("`i18next.format is not a function`", or render the bare key like
`noItems`). Fix by ALSO initialising the global default-export module in
`_providers.tsx`:

```ts
import defaultI18nextModule from 'i18next';
import commonTranslations from '@risksmart-app/i18n/locales/default/en/common.json';

if (!defaultI18nextModule.isInitialized) {
  void defaultI18nextModule.init({
    lng: 'en', fallbackLng: 'en', defaultNS: 'common', ns: ['common'],
    resources: { en: { common: commonTranslations as any } },
    interpolation: { escapeValue: false },
  });
}
const f = (defaultI18nextModule as any).services?.formatter;
f?.add('plural', (v: string) => `${v}s`);
f?.add('lowercase', (v: string) => v?.toLowerCase());
f?.add('capitalize', (v: string) => `${v[0]?.toUpperCase() ?? ''}${v.slice(1)}`);
f?.add('capitalizeAll', (v: string) => v?.replace(/(^\w{1})|(\s+\w{1})/g, (l: string) => l?.toUpperCase()));
f?.add('article', (v: string) => `${['a','e','i','o','u'].includes(v?.[0]?.toLowerCase()) ? 'an' : 'a'} ${v}`);
```

The set of formatters mirrors `packages/i18n/src/i18n.ts`'s `init()`. The
real `common.json` is loaded from the dev repo via the
`@risksmart-app/i18n` alias — no copying required.

### Provider-shaped organisms (toast / notifications)
`packages/components/src/notifications/NotificationProvider` mounts a
`<Toaster />` from `react-hot-toast` once at the root and exposes
`useNotifications().addNotification(...)` for any descendant to fire.
The natural place for this is `RealProviders` itself, so every story
that renders inside the AppShell can show toasts:

```tsx
import { NotificationProvider } from '@risksmart-app/components/src/notifications/NotificationProvider';
// inside RealProviders:
<MockedProvider …>
  <NotificationProvider>
    <RouterProvider router={router} />
  </NotificationProvider>
</MockedProvider>
```

When you wire the provider, **also remove any stub for the matching
`useNotifications` hook** — otherwise stories will call the stub instead
of the real `addNotification` and silently no-op.

### Mock zustand-store-driven panels (HelpPanel / SidePanel)
Components like HelpPanel and SidePanel render their content from a
zustand store (`useHelpStore`, `useSidePanelStore`). For Storybook,
populate the store from the story itself in a `useEffect` decorator:

```tsx
const PopulateStore = ({ summary }) => {
  const setSummary = useHelpStore((s) => s.setSummaryHelpContent);
  useEffect(() => { setSummary(summary); }, [summary, setSummary]);
  return null;
};

export const Open = {
  render: () => (
    <Stage>
      <PopulateStore summary={[{ title: '…', content: '<p>…</p>' }]} />
      <HelpPanel />
    </Stage>
  ),
};
```

Tip: drive the store via *individual selectors* (one selector per
function) rather than destructuring the whole state. Calling
`useStore()` without a selector subscribes to the entire state and
re-runs on every set, even unrelated ones.

### TinyMCE / heavy editor stubs that need named exports
`@tinymce/tinymce-react` is heavy enough that we stub it. The previous
catch-all stub had only a default export — but consumers like HelpSection
do `import { Editor } from '@tinymce/tinymce-react'`, so a missing
*named* `Editor` export trips the dep-scan. The right pattern: write
a tiny `Editor` component that renders `initialValue` directly via
`dangerouslySetInnerHTML`. Most TinyMCE consumers in the dev repo use
inline + disabled mode anyway — they're rendering pre-sanitised HTML,
not editing.

```tsx
// _stubs/tinymceReact.tsx
export const Editor: FC<EditorProps> = ({ initialValue }) => (
  <div dangerouslySetInnerHTML={{ __html: initialValue ?? '' }} />
);
export default Editor;
```

### `import.meta.env` getters (`getEnv`) need a stub
`@risksmart-app/components/src/utils/environment.getEnv` reads from
`import.meta.env.REACT_APP_*` and **throws** when a key is missing.
Storybook has none of the real env vars defined. The cleanest fix is to
alias the entire module to a stub that returns a placeholder string:

```ts
{ find: '@risksmart-app/components/src/utils/environment',
  replacement: stub('environment.ts') }
```

```ts
// _stubs/environment.ts
export const getEnv = () => 'storybook-stub';
```

Consumers using the value (TinyMCE API key, Sentry DSN, Auth0 domain)
already have the underlying SDK stubbed elsewhere — the placeholder
string never reaches a real network call.

### Highcharts wrapper integration
`RSHighcharts` works **standalone** with simple wiring:

1. Install: `pnpm add highcharts highcharts-react-official` (match the
   versions in the dev repo's `pnpm-workspace.yaml` catalog).
2. Alias `highcharts`, `highcharts/<subpath>`, and
   `highcharts-react-official` to the local `node_modules` (anchored
   regexes — see the prefix-match trap above).

Two gotchas inside a *full AppShell* template:

1. **Pass options from module scope, not inline.** RSHighcharts merges
   the supplied options with defaults via `useMergeChartOptions`. If
   you pass a fresh `{...}` object on every render, HighchartsReact
   treats it as a new chart and reconstructs from scratch — which can
   cascade into render loops. Hoist your options to a const outside the
   component (or `useMemo` them).

2. **Don't nest the chart inside Cloudscape `<Container>`** if you also
   have other resize-observed siblings around it. The container's
   resize observer + RSHighcharts's `chart.events.render → reflow()`
   default can interact badly. A plain `<div>` with a fixed pixel
   height + `width:100%` works without surprises. (As of Batch C the
   chart works fine inside Container for the dashboard template, but
   keep this in your back pocket if a future template loops.)

### Stories that use react-router hooks need a router wrapper
Any wrapper that calls `useNavigate()` / `useLocation()` (e.g. `Link`,
`Button`, `ControlledTabs`) will throw "useNavigate() may be used only
in the context of a `<Router>`" if rendered without one. The simplest
fix is to wrap the story render in `<RealProviders>` — it includes a
`createMemoryRouter`. Don't use `<MemoryRouter>` directly: it doesn't
satisfy `useMatches`, which other production code relies on.

### Apollo MockedProvider for layout-level queries
`AuthenticatedAppLayout` fires queries like `getEntities` regardless of
which page renders. Per-story mocks become repetitive; declare a baseline
mock in `_providers.tsx` that gets prepended to story-supplied mocks.
MockedProvider consumes a mock once per matching query, so duplicate the
baseline 3-4× to survive re-renders. See `RealProviders` in
`src/app-shell/_providers.tsx`.

### Collection-hooks data fixtures for Table templates
RiskSmart's custom `<Table>` (from `@risksmart-app/components/src/table`) is
a thin wrapper over Cloudscape Table — it doesn't itself integrate
`useCollection`. To exercise the chrome (sort indicators, multi-select
checkbox, pagination, empty state) in a template, wrap your sample items in
`useCollection` from `@cloudscape-design/collection-hooks`:

```ts
const { items, propertyFilterProps, paginationProps, collectionProps } =
  useCollection(sampleItems, {
    propertyFiltering: { filteringProperties: FILTERING_PROPERTIES, empty: <Box>No matches</Box> },
    pagination: { pageSize: 10 },
    sorting: {},
    selection: {},
  });
return <Table {...collectionProps} columnDefinitions={COLS}
  items={items} selectionType={'multi'} trackBy={'id'} ... />;
```

Each column needs `sortingField` for sort indicators to render.

### URL-routed Tabs wrapper (ControlledTabs)
RiskSmart's `ControlledTabs` (from `src/components/controlled-tabs`)
navigates when `activeTabHref` is set on a tab. For a Storybook template
without real routes, **omit `href` from the tab objects** and manage
`activeTabId` with `useState` + `onChange` — the wrapper falls back to a
plain controlled-tabs swap.

Also pass `disableSettings` to hide the gear icon, since the
`<TabSettingsModal>` it opens is stubbed (it would otherwise need Apollo
queries we don't mock).

## Stub catalog (what's already stubbed and why)

The `_stubs/` directory holds null components and weak hooks for things
that exist in production but aren't useful in a template. When you need a
new stub, prefer adding an export to an existing file (e.g. another null
component → `NullComponent.tsx`) over creating a new file.

Common patterns:
- `NullComponent.tsx` — every "render nothing" need (modals, side panels,
  buttons we don't want firing actions).
- `shared.ts` — Proxy that returns chained no-op functions and recursive
  proxies for any property access. Use as the destination for
  catch-all-style aliases (`@risksmart-app/shared/**`, etc.).
- `queries.ts` / `mutations.ts` — Proxy that returns no-data react-query
  hook shapes for anything imported from `@/hooks/queries/**`.



### Path alias to a TypeScript file
Use `path.resolve(__dirname, '...')` and point at the actual `.ts` or `.tsx`
file. Vite handles TS source directly.

### Transitive deps that can't be resolved from the dev repo
The dev repo's monorepo structure means deeply nested `node_modules` aren't
always reachable from outside. Solution: install duplicates in
product-team-storybook's own `node_modules`. Yes this is some duplication.
It's worth it for isolation.

### Tailwind v3 vs v4
The dev repo's web-theme is Tailwind v4. Don't try to use it as a preset.
Mirror the values into product-team-storybook's v3 config manually.

### React Router v7 hash hrefs
NavLink resolves hash-only hrefs (`#/path`) to the current pathname, which
makes EVERY link match → all selected. Use real path hrefs (`/path`).
Use `createMemoryRouter` + `RouterProvider`, NOT `MemoryRouter`.

### CSS not generated for dev-repo classes
If the component uses Tailwind classes that aren't being generated, extend
`content` in `tailwind.config.ts` to scan the dev-repo path you aliased.

### Token unavailable in CSS
If the component uses a Tailwind colour token like `bg-navy_mid` that isn't
in your config, add it to `theme.extend.colors`. Match the dev repo's value
exactly (read from web-theme's base.config.ts).

## When to NOT Use This Skill

- Component already in atomic-ui (just import from atomic-ui)
- Component already in stock themed Cloudscape (just use that)
- Component is genuinely new (build it fresh in atomic-ui via design system
  governance, or prototype it via figma-visual-iterate)
- Component depends on heavy infrastructure (live tRPC, real Hasura, real
  WebSocket) that can't reasonably be mocked — handle as Tier 3 work
  requiring a mock data layer

## Output

When done, the user should have:
- A new story file at `~/Documents/product-team-storybook/src/.../<Name>.stories.tsx`
- Real production code rendering at http://localhost:6007 with 1:1 fidelity
- A Playwright screenshot in `tmp/visual-iterate/` proving the render
- Dev repo unchanged

## Example Invocation

User: "Add the live app's TopNavigation to my Storybook."

Skill runs:
1. Search dev repo, find `~/Documents/risksmart-app-main 2/packages/components/src/global-header/index.tsx` (or wherever)
2. Add alias `@risksmart-app/components/global-header` → that file
3. Install `@some-dep`, `@another-dep` versions matching dev repo
4. Mirror `--color-toolbar-bg` and any other needed tokens
5. Wrap in QueryClientProvider + RouterProvider + AuthContext stub
6. Write story with mock user data and notification count
7. Verify hot-reload works, screenshot matches the live app

User opens browser, sees the live app's toolbar in their local Storybook.
Done.

## Maintenance

When the dev team changes a custom component:
- Vite reads the latest source on next HMR — no action required
- If they add a new transitive dep — Storybook will error, install the dep
- If they change Tailwind tokens — update the local mirror
- If they change provider context expectations — update the wrapper

This is the cost of using real source. Worth it for 1:1 fidelity.

---

This skill captures the wiring pattern that worked for the Navigation
component. Every future "add X from the live app" task should follow it
without re-discovering the steps.
