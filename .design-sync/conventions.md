# Building with RiskSmart (themed Cloudscape)

These are the real `@risk-smart/themed-cloudscape-components` — RiskSmart's themed build of
AWS Cloudscape. Every component is on `window.RiskSmart.*`. Build UIs by **composing these
components and passing their props** — this is a prop-driven system, NOT a utility-class one.

## ⚑⚑ RULE 0 — FORK, DON'T BUILD (do this before anything else)
If the request matches a screen we already ship a prototype for, you MUST start by **duplicating
that prototype file verbatim** and then editing only the data — do NOT rebuild it from scratch.
Building from scratch produces a different result every time; forking produces the same result
every time. This is the required workflow, not a suggestion.

| If the ask is a… | Duplicate this file, then edit only the data |
|---|---|
| register / list / table / "all X" page | `prototypes/risk-register.html` |
| issue register (or any register variant) | `prototypes/risk-issues.html` |
| control register | `prototypes/risk-controls.html` |
| action register / task list | `prototypes/risk-actions.html` |
| policy / document register | `prototypes/risk-policy.html` |
| indicator / KRI register | `prototypes/risk-indicators.html` |
| dashboard / drill-down board | `prototypes/risk-dashboard.html` |
| entity detail (tabbed) page | `prototypes/risk-detail.html` |
| create / edit form | `prototypes/risk-create.html` |
| settings / admin hub (tabbed) | `prototypes/risk-settings.html` |
| create/edit modal (dialog form over a page) | `prototypes/risk-modal.html` |
| link / attach existing records modal (table + select) | `prototypes/risk-modal-link.html` |
| submit-for-approval / change-request modal | `prototypes/risk-modal-approval.html` |
| export / bulk options modal | `prototypes/risk-modal-export.html` |
| delete / destructive confirmation | `prototypes/risk-confirm.html` |
| empty / first-run (no data yet) | `prototypes/risk-empty.html` |
| master-detail / side-panel (list + detail pane) | `prototypes/risk-split.html` |
| public intake / report form (no app shell) | `prototypes/risk-report-issue.html` |

Steps: (1) copy the matching file to a new `.html`; (2) change the sample data array,
column/field list, and title; (3) do NOT touch the `<head>` loaders, the `window.RiskSmartApp`
composition, or the shell structure. Only if NO prototype matches the screen type do you compose
from scratch using the rules below.

## ⚑ READ FIRST — do this automatically for every screen (no one needs to ask)
When you build ANY screen with this design system, do BOTH of the following on your own — it is
the required build mode for this DS, not an option:

1. **Create a plain React prototype (a `.html` file). Do NOT create a `.dc.html` Design Component.**
2. **Load React BEFORE `_ds_bundle.js`** (React UMD → `styles.css` → `_ds_bundle.js`), then render
   `window.RiskSmart.*` into a root with `ReactDOM.createRoot`.

Why this is mandatory: `_ds_bundle.js` externalizes React — `window.React`/`window.ReactDOM` must
already be on the page when it loads, or it throws and **`window.RiskSmart` is never defined** →
every component silently no-ops → **blank screen** (the #1 failure). The standard React 18.3.1 UMD
is confirmed working — no special build or `copy_files` needed. The `.dc.html` runtime keeps its own
React private so the bundle can't attach; that is why `.dc.html` produces a blank screen here.
(If you truly must build a `.dc.html`, at minimum load the same React UMD in the `<helmet>` before
`_ds_bundle.js`, and verify components actually mount — otherwise switch to a React prototype.)

Load in EXACTLY this order (`styles.css` + `_ds_bundle.js` come bound with the DS — reference them
at the DS mount path):
```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"
  integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"
  integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<link rel="stylesheet" href="styles.css">   <!-- @imports _ds_bundle.css + Sora font -->
<script src="_ds_bundle.js"></script>       <!-- now window.RiskSmart.* is populated -->
<div id="root"></div>
<script type="text/babel">
  const { AppLayout, TopNavigation, SideNavigation, Table, Header, SpaceBetween } = window.RiskSmart;
  ReactDOM.createRoot(document.getElementById('root')).render(/* your screen */);
</script>
```
That's the whole requirement: standard React UMD first, then the bundle, on a React-prototype page.

## ⚑ For a FULL RiskSmart SCREEN — use the real app components (1:1 with the live app)
`window.RiskSmart.*` are the Cloudscape **primitives**. To build a real product screen (a register,
a tabbed detail page, a dashboard, a create form) that is **1:1 with the live app**, do NOT
reconstruct the shell and composites from primitives — load the **app-components bundle** and use the
REAL production components on `window.RiskSmartApp.*`:

```html
<script src="…react@18.3.1 UMD…"></script>
<script src="…react-dom@18.3.1 UMD…"></script>
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="_ds_app_bundle.css">   <!-- app-shell + composite styles -->
<script src="_ds_bundle.js"></script>               <!-- window.RiskSmart (primitives) -->
<script src="_ds_app_bundle.js"></script>           <!-- window.RiskSmartApp (real composites) -->
<body class="atomic-ui">                             <!-- REQUIRED: activates the design-token cascade -->
<div id="root"></div>
<script>
  const A = window.RiskSmartApp;   // PageLayout, RealProviders, Table, DashboardItem,
                                   // PropertyFilterPanel, Navigation, GlobalHeader, PageHeader,
                                   // TabHeader, ControlledTabs, ActionsButton, SimpleRatingBadge,
                                   // BadgeList, Cards, EmptyEntityCollection, NoMatchesCollection,
                                   // ConfirmModal/DeleteModal/RemoveModal, FileItem, useCollection, …
  const C = window.RiskSmart;      // SpaceBetween, Pagination, Button, Input, Select, …
  // Wrap the screen in A.RealProviders and A.PageLayout — this renders the full navy app
  // shell (nav rail + global header) exactly like production:
  //   <A.RealProviders initialPath="/risks">
  //     <A.PageLayout title="Risks register" counter="(6)" actions={…}>
  //       …compose A.DashboardItem ribbon + A.Table with A.SimpleRatingBadge / A.BadgeList cells…
  //     </A.PageLayout>
  //   </A.RealProviders>
</script>
```

**Two hard requirements:** `<body class="atomic-ui">` (without it the app components lose their
design tokens and render unstyled), and load `_ds_app_bundle.js` AFTER `_ds_bundle.js`.

**Canonical starting points — fork the matching one** (all verified 1:1, built this exact way):
- `prototypes/risk-register.html` — list / register / table page (ribbon + Table + property filter + pagination).
- `prototypes/risk-dashboard.html` — dashboard / drill-down board (Grid of Container + Cards + rating badges).
- `prototypes/risk-detail.html` — tabbed entity detail (ControlledTabs + 2-col form + ratings sidebar + ActionsButton).
- `prototypes/risk-create.html` — create / edit form (ControlledTabs + Form + FormFields + Save/Cancel).

Copy the closest one, swap the data/columns/fields, and you have a new screen at production fidelity.
The cards under **Page Templates** show the target for each archetype; the cards under **Production**
show each real composite. Prefer composing `window.RiskSmartApp.*` over rebuilding from primitives.

## Two component kits — don't mix them in one screen
- **Cloudscape (`window.RiskSmart.*`) + real composites (`window.RiskSmartApp.*`)** — this is what the
  live RiskSmart app is built from. Use this for any real product screen (and it's what every
  prototype uses). This is the default.
- **atomic-ui** (`components/atomic-ui/*` cards) — a newer base-ui/Tailwind kit RiskSmart is
  gradually migrating toward. Available as reference cards (Button, Field, Dialog, Card, Badge,
  patterns like RatingsMatrix/ObjectLevelHeader, …). Use it only if a task specifically calls for
  atomic-ui; **do not mix atomic-ui and Cloudscape components in the same screen** — they have
  separate styling systems.

## Setup — no provider needed
Components render themed straight out of the box: the theme is delivered as CSS custom
properties at `:root` (loaded via `styles.css`), and the default RiskSmart theme applies **no
wrapper class**. Do NOT wrap the tree in a ThemeProvider — there isn't one. Just render
components and make sure `styles.css` is linked (it `@import`s tokens, the Sora font, and
component CSS). Base font is **Sora**. NOTE: per-component docs mention wrapping in
`<PreviewRoot>` — that is a no-op passthrough used only by the sync's own preview harness; it
provides nothing. You do not need it and should not add a provider.

## Styling idiom — props, not classes
There are **no Tailwind/utility classes and no custom className vocabulary** in this system.
Never invent class names or hand-write component CSS. Style and lay out exclusively through
component props and the layout primitives:
- **Variants/states via props:** `Button` `variant="primary|normal|link|icon"`;
  `Alert` `type="success|error|warning|info"`; `Badge` `color=…`; `StatusIndicator` `type=…`.
- **Spacing/layout via components, not margins:**
  - `SpaceBetween` `direction="vertical|horizontal"` `size="xxxs|xxs|xs|s|m|l|xl|xxl"` — the primary way to space stacks/rows.
  - `Grid` (with `gridDefinition` colspans) and `ColumnLayout` `columns={n}` for columnar layouts.
  - `Box` for text/padding/margin via props (`padding`, `margin`, `variant`, `fontSize`, `color`) — use instead of raw `<div>` + CSS.
  - `Container` (optional `header={<Header>…</Header>}`) and `Header` `variant="h1|h2|h3"` for sections.
- **Forms:** wrap each control in `FormField` (`label`, `description`, `errorText`) around `Input` / `Select` / `Multiselect` / `Textarea` / `Checkbox` / `RadioGroup`; group with `Form`.
- **Data:** `Table` (`columnDefinitions` + `items`), `Cards`, `KeyValuePairs`, `Pagination`.

## Page templates — ALWAYS start full screens from these (reference layouts)
Never hand-assemble a page frame. Every full application screen wraps in `TopNavigation` +
`AppLayout`, and picks the matching template. The `AppLayout` card carries all three as
reference stories (read `components/cloudscape-reference/AppLayout/AppLayout.prompt.md` /
`.jsx` for the exact code); `TopNavigation` → "Default" is the top bar.

Routing — match the task to the template:
- **List / register / table / "show all X" view → Table Page template.** `AppLayout`
  `contentType="table"` with a `Table` (`variant="full-page"`, `columnDefinitions`, `items`,
  a `header` with counter + primary action, and `pagination`).
- **Create / edit / settings / "capture details" screen → Form Page template.** `AppLayout`
  `contentType="form"` with a `Form` (`actions` = Cancel + primary submit) wrapping a
  `Container` of `FormField`s (`Input` / `Select` / `Textarea`).
- **Anything else / landing → Page Shell template.** `AppLayout` `contentType="default"` with
  `ContentLayout` + `Header` + `Container`s.

In every case: `navigation={<SideNavigation items=… activeHref=… header={{text:'RiskSmart'}}/>}`,
`breadcrumbs={<BreadcrumbGroup items=…/>}`, `toolsHide` when there's no help panel, and the
page `Header variant="h1"` carries the title + `actions`.

## Spacing & gaps — NEVER use CSS margin/gap
Cloudscape spacing comes ONLY from layout components. Do not write `style={{gap|margin|padding}}`
or CSS classes for spacing between components — it will look wrong and off-grid.
- Stack/row of elements → `SpaceBetween` (`direction="vertical|horizontal"`, `size="xxxs..xxl"`).
- Columns → `ColumnLayout columns={n}` or `Grid gridDefinition={[{colspan:8},{colspan:4}]}`.
- One element's own padding/margin/text → `Box` props (`padding`, `margin`, `variant`, `fontSize`).
- Section wrapper → `Container` (with `header={<Header/>}`). Page title area → `Header variant="h1"`.

## Global navbar + side navbar + table — copy this app-shell structure
Every full screen is `TopNavigation` (global bar) above an `AppLayout` (side nav + content).
Full, correct structure (adapt the items/columns; keep the shape):
```jsx
const { TopNavigation, AppLayout, SideNavigation, BreadcrumbGroup, Table, Header, Button, SpaceBetween, Box } = window.RiskSmart;

// Global navbar (top)
<TopNavigation
  identity={{ href: '#', title: 'RiskSmart' }}
  search={<Input type="search" placeholder="Search…" value="" onChange={()=>{}} ariaLabel="Search" />}
  utilities={[
    { type: 'button', iconName: 'notification', title: 'Notifications', ariaLabel: 'Notifications' },
    { type: 'menu-dropdown', text: 'James Romero', iconName: 'user-profile',
      items: [{ id: 'profile', text: 'Profile' }, { id: 'signout', text: 'Sign out' }] },
  ]}
/>

// Page shell (side navbar + content). contentType: "table" | "form" | "default" | "cards" | "dashboard"
<AppLayout
  navigationOpen
  toolsHide
  contentType="table"
  breadcrumbs={<BreadcrumbGroup items={[{text:'Home',href:'#/'},{text:'Risks',href:'#/risks'}]} />}
  navigation={
    <SideNavigation
      header={{ href: '#/', text: 'RiskSmart' }}
      activeHref="#/risks"
      items={[
        { type: 'link', text: 'Home', href: '#/' },
        { type: 'divider' },
        { type: 'section', text: 'Risk management', items: [
          { type: 'link', text: 'Risk register', href: '#/risks' },
          { type: 'link', text: 'Controls', href: '#/controls' },
        ] },
        { type: 'link', text: 'Settings', href: '#/settings' },
      ]}
    />
  }
  content={
    <Table
      variant="full-page"
      columnDefinitions={[
        { id: 'id', header: 'ID', cell: (i) => i.id },
        { id: 'name', header: 'Risk', cell: (i) => i.name },
        { id: 'owner', header: 'Owner', cell: (i) => i.owner },
      ]}
      items={[{ id: 'R-001', name: 'Unpatched auth service', owner: 'A. Chen' }]}
      header={
        <Header counter="(128)"
          actions={<SpaceBetween direction="horizontal" size="xs"><Button>Export</Button><Button variant="primary">Create risk</Button></SpaceBetween>}>
          Risks
        </Header>
      }
      pagination={<Pagination currentPageIndex={1} pagesCount={12} />}
    />
  }
/>
```
The `AppLayout` card's three stories (Page Shell / Table Page / Form Page) and
`components/cloudscape-reference/{AppLayout,TopNavigation,SideNavigation}/*.jsx` are the full
reference — read them before building a screen.

## Brand guidelines — follow these for on-brand output
Beyond the components, `guidelines/*.md` in this DS carry RiskSmart's brand rules — **read them
and apply them**, especially:
- **Copy & voice:** sentence case everywhere; buttons start with a verb ("Add risk", not "Submit");
  entity nouns (Risk, Control, Action, Issue, Policy, Indicator) stay capitalised; dates "12 Jun 2026";
  column labels "Created"/"Updated" (not "…At"); honest error messages.
- **Colour meaning:** teal = action/CTAs/active/metrics; navy = text/structure; status colours only
  for meaning, always with a label — never colour alone.
- **Accessibility (WCAG AA):** real text, left-aligned; teal text uses ink `#00857A` (never `#00E1D1`
  on white); visible focus; semantic markup; keyboard-operable.
See `guidelines/{copy,voice-and-tone,colour,accessibility,typography,iconography,visual-content,logo,styles}.md`.

## Where the truth lives (read before building)
- `styles.css` and its `@import` closure (`_ds_bundle.css`, `tokens/*.css`, `fonts/`) — the tokens and component styles.
- `components/cloudscape-reference/<Name>/<Name>.prompt.md` — usage + example JSX per component.
- `components/cloudscape-reference/<Name>/<Name>.d.ts` — the exact prop contract (`<Name>Props`).

## Idiomatic example
```jsx
const { Container, Header, SpaceBetween, FormField, Input, Button, Alert } = window.RiskSmart;

<Container header={<Header variant="h2">Report a risk</Header>}>
  <SpaceBetween size="l">
    <Alert type="info">All fields are required.</Alert>
    <FormField label="Risk name" description="A short, unique title">
      <Input value={name} onChange={({ detail }) => setName(detail.value)} />
    </FormField>
    <SpaceBetween direction="horizontal" size="xs">
      <Button variant="link">Cancel</Button>
      <Button variant="primary">Submit</Button>
    </SpaceBetween>
  </SpaceBetween>
</Container>
```
Cloudscape event handlers receive a `{ detail }` payload (e.g. `onChange={({ detail }) => …}`),
not a raw DOM event — see each component's `.d.ts`/`.prompt.md`.
