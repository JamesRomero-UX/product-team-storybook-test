# Building with RiskSmart (themed Cloudscape)

These are the real `@risk-smart/themed-cloudscape-components` — RiskSmart's themed build of
AWS Cloudscape. Every component is on `window.RiskSmart.*`. Build UIs by **composing these
components and passing their props** — this is a prop-driven system, NOT a utility-class one.

## Loading — REQUIRED (get this wrong and the screen is blank)
`_ds_bundle.js` externalizes React: `window.React` and `window.ReactDOM` must be on the page
BEFORE it loads, or it throws and **`window.RiskSmart` is never defined** — every component
silently no-ops → blank screen. This is the #1 cause of "it's not using the components." Any
React global satisfies it — the **standard React 18.3.1 UMD is confirmed working** (no special
build or `copy_files` needed).

**Build RiskSmart screens as a React prototype (the React + Babel path) — NOT as a `.dc.html`
Design Component.** The `.dc.html` runtime keeps its own React private, so the external bundle
can't attach and nothing renders. A React prototype is the supported path and works out of the box.

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
