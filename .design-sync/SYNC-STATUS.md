# Claude Design — sync status

_Updated 2026-07-06. Project: RiskSmart Components (Cloudscape) `41f173c8-bc0e-4dfd-90c9-a53a47cb3d99`._

## What's live in the design system now

| Group | Count | Notes |
|---|---|---|
| `cloudscape-reference` | 68 | Themed-Cloudscape primitives (the fidelity oracle) — unchanged |
| `page-templates` | **9** | Full-page RiskSmart archetypes — NEW |
| `production` | **39** | Real RiskSmart composite components — NEW |
| `prototypes` | **1** | Forkable 1:1 Risk Register — NEW |

## 1:1 with the live app — the app-components bundle
`_ds_app_bundle.js` exposes the **real app composites** on `window.RiskSmartApp.*` (PageLayout,
RealProviders, Table, DashboardItem, PropertyFilterPanel, Navigation, GlobalHeader, rating
badges, modals, useCollection, …; 31 exports, ~2 MB + 892 KB css). A prototype loads
`_vendor/react` → `_ds_bundle.js` (primitives) → `_ds_app_bundle.js` (composites), sets
`<body class="atomic-ui">`, and composes screens from the REAL production components =
**1:1 with the live app** (verified: `prototypes/risk-register.html` renders pixel-1:1).
Built by `scripts/ds-app-bundle.mjs` from `.design-sync/manifests/app-bundle.spec.json`.
The injected README/guide now instructs agents to build full screens this way and fork
`prototypes/risk-register.html`.

Known polish item: DashboardItem ribbon value renders a muted colour vs teal in one path — a
single CSS-token nuance, not structural.

### page-templates (9 live, rendering 1:1)
TablePage (register), DashboardPage (3-tier board), DetailPage (tabbed entity), CreatePage (form), LoginPage (auth), QuestionnaireTemplateRegisterPage, QuestionnaireBuilderPage, QuestionnaireResponsePage, QuestionnaireFillPage.
- **SettingsPage — deferred.** Its 17 tab modules bundle to ~12 MB, 217 bytes over Claude Design's 12 MB per-file limit. The card only ever displays one tab, so the fix is to render a representative tab subset or split the bundle. The tabbed archetype is already covered by DetailPage. Low priority (admin config).

### production (39 live) — the RiskSmart-specific composites
Badges/ratings: SimpleRatingBadge, RatingSwatch, ResponsiveRatingBadges, BadgeList, Tokens, CardTokens.
Dashboard/widgets: DashboardItem, FilterPropertyDashboardItem, TotalsRibbon.
Tables/collections: PropertyFilterPanel, Cards, EmptyEntityCollection, NoMatchesCollection, Empty.
Nav/headers: Navigation, GlobalHeader, GlobalActions, GlobalBreadcrumbs, UserMenuPopup, PageHeader, TabHeader, BreadcrumbDisplay.
Actions/tabs: ActionsButton, ControlledTabs.
Modals: ConfirmModal, DeleteModal, RemoveModal.
Files/misc: FileItem, EntityTreeList, Circle, EntityLabel, UserAvatar, OrganisationLogo, Loading, WizardSteps, NotificationBanner, FormErrors.
Error pages: NotFoundPage, AccessDeniedPage.

**Deliberately NOT synced:** the ~25 thin Cloudscape wrappers (Button/Link/Modal/Table/Select/Popover/…) — already covered by `cloudscape-reference`; the `Controlled*` form-field wrappers; AI/chat niche components; and atomic-ui (migration target, name-collision risk).

## How it was built (the /design-sync converter is not installed here)

The `/design-sync` skill/converter was absent in this environment, so the preview stage was reconstructed with a purpose-built bundler:

- `scripts/ds-preview-build.mjs` — Vite lib/IIFE build of one story into a self-contained `_preview/<group>/<Name>.js` (React externalized to `window.React` via a jsx-runtime shim; the whole app graph + Cloudscape bundled in, minified), plus its extracted CSS. Reproduces the Storybook preview env (`.atomic-ui` token cascade + `@cloudscape-design/global-styles` + page-template CSS) so the app shell renders styled. Storybook decorators are composed so provider-wrapped stories work.
- `scripts/ds-stage-cards.mjs` — batch-builds a manifest into `_stage/`, authoring each card's HTML shell (`page` = full-bleed, `component` = centered). Resilient to per-story failures.
- `scripts/ds-verify-card.mjs` — headless-Chromium render check (console errors, failed requests, mount signals, screenshot).

Manifests: `.design-sync/manifests/*.manifest.json`.

### Card contract (per component)
- `_preview/<group>/<Name>.js` + `.css` — the compiled preview bundle.
- `components/<group>/<Name>/<Name>.html` — card shell with `@dsCard group="…" viewport="WxH"` marker; loads `_vendor/react.js` → `_vendor/react-dom.js` → `_ds_bundle.js` (for `window.RiskSmart.PreviewRoot`) → the preview JS+CSS, mounts into `#r0` on a `.atomic-ui` body.

## To re-run / extend
1. Widen `.design-sync/sb-config/main.ts` stories glob if adding new dirs (already includes page-templates + production).
2. Add entries to a manifest, then `node scripts/ds-stage-cards.mjs <group> <manifest>`.
3. Push staged files via the `DesignSync` MCP tool (finalize_plan globs → write_files in ≤~15-file batches; the 12 MB/file and request-body limits require batching).
4. Verify with `render_preview` + `scripts/ds-verify-card.mjs`.

## Live end-to-end test — CONFIRMED (2026-07-07)
A fresh agent prompted with only "Build a Risk Register" (no mention of React/bundles)
autonomously: built a React `.html` prototype (not `.dc.html`), loaded
`react → _ds_bundle.js → _ds_app_bundle.js` with `body.atomic-ui`, composed the real
`window.RiskSmartApp.*` components, forked `prototypes/risk-register.html` and extended it
(segment-filtering ribbon, Updated column, 12 rows) — and it rendered **1:1 with the live app**.
The behavioural link (agent follows the guide automatically) is confirmed. Remaining broad item:
make this DS the org default in the picker so every teammate's session lands on it (platform —
see PLATFORM-ASK.md).

## Verified renders (visual, 1:1)
Page templates: Table, Dashboard, Detail, Create, Login. Production: DashboardItem, PropertyFilterPanel, ConfirmModal (+ clean render signals across the rest).
