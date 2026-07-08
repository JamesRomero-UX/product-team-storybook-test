# Claude Design — coverage report & expansion plan

_Generated 2026-07-06 from a full codebase audit (4 parallel catalog passes)._

## TL;DR
The Claude Design project currently contains **68 Cloudscape primitives only** (`components/cloudscape-reference/*`, with AppLayout + TopNavigation as cards among them). The codebase holds far more that would raise fidelity: **178 real RiskSmart production components** and **10 full page templates** — none of which are synced as cards. The sync is scoped this way on purpose: `.design-sync/sb-config/main.ts` restricts the `stories` glob to `src/cloudscape-reference/**` + two authored shell stories.

## What Storybook actually contains (319 loaded stories)
| Namespace | Files | In Claude Design now? |
|---|---|---|
| Production/* (real RiskSmart components) | 178 | ❌ none |
| Cloudscape Reference/* | 81 files → 68 unique | ✅ all 68 synced |
| Components/* (atomic-ui) | 25 | ❌ (intentionally excluded — migration target, name collisions) |
| Patterns/* (atomic-ui) | 9 | ❌ (same) |
| Page Templates/* | 10 | ❌ none as cards |
| Prototypes/* | 9 | ❌ none |
| App Components/* (dupes of production) | 5 | ❌ |
| App Shell/* | 1 | ⚠️ AppLayout card approximates it |
| Design Tokens/* | 1 | ❌ (guidelines cover this) |

## What the live app is actually made of
Routing (`packages/web/src/routes/`) + 36 page folders reveal one dominant pattern: nearly every entity (Risks, Controls, Actions, Issues×8, Policies, Obligations, Third-Party, Indicators, Assessments, Impacts…) repeats a **4-file skeleton**:
1. `Page.tsx` → **Register/list page** (PageLayout + CustomisableRibbon + Table + Export + Add)
2. `update/Page.tsx` → **Tabbed detail page** (PageLayout + ControlledTabs + ActionsButton + DeleteModal)
3. `create/Page.tsx` + `forms/*` → **Create/Edit form** (RHF + Zod + FormFields)
4. `modals/*` → modal variants

Plus a **configurable dashboard board**, a **17-tab settings hub**, and a **public intake form** (FullScreenLayout). UI is overwhelmingly themed Cloudscape; atomic-ui is only ~7 files in the web app (future direction, low current value).

## The gap that limits outcomes today
When an agent builds e.g. a Risk Register, it has the raw Cloudscape primitives but must **reconstruct** the RiskSmart-specific composites from scratch — CustomisableRibbon of DashboardItem stat tiles, PropertyFilterPanel, SimpleRatingBadge / RatingSwatch / BadgeList, the custom Table wrapper, PageHeader/TabHeader, ActionsButton, Navigation + GlobalHeader, EmptyEntityCollection/NoMatchesCollection, ConfirmModal/DeleteModal. These are exactly the pieces that make a screen read as "RiskSmart" rather than "generic Cloudscape."

## Expansion plan (prioritised)

### Phase 1 — Add page templates as cards  ·  HIGH value / LOW risk
Add `src/page-templates/**` (and optionally the strongest `src/prototypes/**`) to the sync glob. These already render standalone via `RealProviders` + `_stubs`, cover the app's real archetypes, and give the agent a full-page starting point instead of a blank canvas.
- Ship: **Table/Register, Tabbed Detail, Dashboard, Create form, Settings hub, Login** (+ Questionnaire register/builder/response/fill).
- Risk: low — self-contained in-repo stories; no new heavy deps beyond what stubs already provide.

### Phase 2 — Add RiskSmart-specific production composites  ·  HIGH value / MEDIUM risk
Add the ~40–50 production components that are **not** thin Cloudscape wrappers. Priority set:
`CustomisableRibbon`/`TotalsRibbon`, `DashboardItem`, `PropertyFilterPanel`, `SimpleRatingBadge`, `RatingSwatch`, `ResponsiveRatingBadges`, `BadgeList`, `ActionsButton`, `ControlledTabs`, `TabHeader`, `PageHeader`, `Navigation`, `GlobalHeader`/`GlobalActions`/`GlobalBreadcrumbs`, `UserMenuPopup`, `EmptyEntityCollection`, `NoMatchesCollection`, `ConfirmModal`/`DeleteModal`/`RemoveModal`, `EntityTreeList`, error pages (`NotFoundPage`, `AccessDeniedPage`, etc.), `Loading`, `FileItem`.
- **Skip:** the ~25 thin Cloudscape wrappers (Button/Link/Modal/Table/Select/Popover/… — already covered by the primitive), the 5 `app-components/*` dupes, `PathTest`, atomic-ui.
- Risk: medium — production stories import from the app repo (`@risksmart-app/components`, web `src/`, RHF `_wrap`), which can pull Apollo/router/zustand into the DS bundle. Must verify each bundles cleanly and doesn't bloat/break `_ds_bundle.js`. Do in vetted batches.

### Keep as-is
68 Cloudscape primitives (the fidelity oracle). Atomic-ui stays out until the app's migration is real.

## Mechanism to execute
1. Widen the `stories` glob in `.design-sync/sb-config/main.ts` to include the chosen dirs (namespaces don't collide — Production/* and Page Templates/* are distinct from Cloudscape Reference/*).
2. Rebuild the reference Storybook (`storybookStatic` → `.design-sync/sb-reference`).
3. Re-run the DesignSync push to mint new component/template cards and rebuild the bundle.
4. Add per-item `overrides` (cardMode/viewport/primaryStory) as needed, mirroring the existing entries.
5. Verify renders (spot-check the heaviest: page templates, PropertyFilterPanel, charts).
