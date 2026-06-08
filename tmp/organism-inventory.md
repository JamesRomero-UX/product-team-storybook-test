# RiskSmart Organism Inventory

Generated 2026-04-30 from a sweep of:
- `~/Documents/risksmart-app-main 2/packages/components/src/` (34 dirs)
- `~/Documents/risksmart-app-main 2/packages/web/src/components/` (69 dirs)
- `~/Documents/risksmart-app-main 2/packages/web/src/blocks/` (4 dirs)

**Method.** For every component dir, counted `import` statements in `packages/web/src/pages/**` and `packages/web/src/blocks/**`. Each row records the **page-import count** (rough Reuse proxy) plus a subjective Visual Impact rating (S = atomic / inline element, M = card / row / section, L = page-frame / chrome). Score = Visual × Reuse, used to sort the Reusable Organism list.

**Source-package codes.** `PC` = `packages/components/src` (cross-app library). `WC` = `packages/web/src/components` (web-app-only). `WB` = `packages/web/src/blocks`.

---

## ⏭️ ALREADY WIRED (skip)

| Component | Source | Reuse |
|---|---|---|
| `button` (custom Button) | PC | 141 |
| `table` (custom Table) | PC | 165 |
| `controlled-tabs` | WC | 44 |
| `page-filter-container` | WC | 4 |
| `property-filter-panel` | WC | 7 |
| `form/select` (custom Select) | WC | (subset) |
| `navigation` (left rail) | PC | indirect via PageLayout |
| `global-header` (top toolbar) | PC | indirect via PageLayout |
| `page-header` | PC | indirect via PageLayout |

---

## ✅ REUSABLE ORGANISMS — Top 30

Sorted by **Visual × Reuse**, ties broken by reuse count.

| # | Component | Source | Reuse | Visual | What it is |
|---|---|---|---|---|---|
| 1 | `tab-header` | WC | 55 | L | 26-LOC tab/page-section header — used on every entity detail tab |
| 2 | `delete-modal` | WC | 63 | M | Confirm-delete dialog (header + body + onDelete) |
| 3 | `help-panel` | WC | 57 | M | Right-side help drawer with HTML content |
| 4 | `simple-rating-badge` | WC | 78 | S | Risk severity / status pill (the colored chip you see everywhere) |
| 5 | `link` | WC | 81 | S | Internal-aware Link (auto-routes via react-router) |
| 6 | `link` | PC | 10 | S | Cross-app Link wrapper (sibling of WC/link) |
| 7 | `export-button` | WC | 33 | M | Export menu button (CSV / PDF) |
| 8 | `actions-button` | WC | 13 | M | Actions dropdown — collapses many buttons into one menu |
| 9 | `notifications` | PC | 43 | L | Toast/banner notification provider + hook |
| 10 | `file` | PC | 45 | M | File upload + display widget |
| 11 | `error-pages` | PC | 11 | L | Full-page 404/403/500 chrome |
| 12 | `loading` (WC) | WC | 8 | M | Loading skeleton/spinner block |
| 13 | `loading` (PC) | PC | 7 | S | Inline loading spinner |
| 14 | `latest-ratings-preview` | WC | 8 | M | Mini ratings card (last N risk ratings) |
| 15 | `highcharts` | WC | 8 | L | Charts wrapper (Highcharts theme integration) |
| 16 | `side-panel` | WC | 7 | L | Right-side editing drawer |
| 17 | `empty-collection` | WC | 7 | M | Empty-state card (with EmptyCollection / NoMatches / EmptyEntity variants) |
| 18 | `confirm-modal` | WC | 6 | M | Generic confirm dialog (yes/no) |
| 19 | `badge-list` | WC | 5 | S | Inline list of badges (tags / labels) |
| 20 | `ai-workflows` | WC | 4 | M | AI workflow card (probably card + actions) |
| 21 | `action-status-badge` | WC | 4 | S | Status pill specifically for actions/issues |
| 22 | `tokens` | WC | 3 | S | Token chips (likely permission/role tokens) |
| 23 | `responsive-rating-badges` | WC | 2 | S | Multi-rating badge group (responsive layout) |
| 24 | `popover` | WC | 2 | S | Themed popover wrapper |
| 25 | `policy-document-status-badge` | WC | 2 | S | Policy doc status pill |
| 26 | `issues-status-badge` | WC | 2 | S | Issues status pill |
| 27 | `indicators-popover` | WC | 2 | S | Risk indicators popover |
| 28 | `date-time-filter` | WC | 2 | M | Date range filter widget |
| 29 | `totals-ribbon` | WC | 1 | M | Totals/summary ribbon (35 LOC, tiny) |
| 30 | `view-selector` | WC | 1 | S | Saved-view selector |

Honorable mentions just outside top 30: `tolerance` (1, S), `attestations-cards` (2, M), `register-dashboard` (3 — see warning under Page-Specific), `breadcrumbs` (PC, indirect via global-header).

---

## ⚠️ PAGE-SPECIFIC COMPOSITION (skip — use as design reference only)

| Component | Source | Reuse | Why skip |
|---|---|---|---|
| `customisable-ribbon` | WC | 70 | Driven by formCustomisation queries + parent-type registry. Used on register pages but each instance is data-bound to that entity's filters — not a generic organism. |
| `register-dashboard` | WC | 3 | Composed dashboard tiles for the risk-tier dashboard. Contains `FilterPropertyDashboardItem`, `DashboardItem`. Page-specific composition. |
| `add-to-enterprise-risk-modal` | WC | 1 | Single-page modal. |
| `instantiate-enterprise-risk-modal` | WC | 3 | Single-page modal flow. |
| `tab-settings-modal` | WC | 1 (already stubbed) | Per-user tab preference editor. Backend-driven. |
| `attest-button` | WC | 1 | Specific to attestation flows. |
| `change-request-levels` / `-override-modal` / `-preview` | WC | 0–1 | Specific to change-request flow. |
| `entity-notification-history` | WC | 0 | Specific to entity panel. |
| `notification-history-table` | WC | 0 | Specific table. |
| `tenant-notification-preferences` | WC | 1 | Settings page. |
| `update-prompt` | WC | 0 | Specific upgrade nag. |
| `text-inference` | WC | 0 | AI inference UI. |
| `idle-timer` | WC | 0 | Session-idle warning UI. |
| `card-tokens` / `tokens` (sub-utility) | WC | 1–3 | Permission/role chips for specific contexts. |
| `chat` | WC | 0 (already stubbed) | AI chat side panel. |
| `messages` | WC | 0 | Specific notification surface. |
| `popover-footer` / `tab-settings-modal` | WC | 1 each | Page-specific UI. |
| `cards`, `card-tokens` | WC | 0 / 3 | Specific entity card layouts. |
| `obligation-change-details` (WB) | WB | 0 | Block for obligation-change page. |
| `risk-scoring-settings` (WB) | WB | 0 | Block for risk-scoring settings page. |
| `form-editor-dialog` (WB) | WB | 0 | Form-config editor (admin tool). |

---

## ⛔ SCHEMA-DRIVEN ENGINES (defer entirely)

These are not "components" in the props-driven organism sense — they are runtime engines that compose UI from schemas / registries / Apollo queries. Wiring them requires the schema + data layer too.

| Component | Source | Reuse | Why defer |
|---|---|---|---|
| `form` (CustomisableForm + sub-tree) | WC | 613 | Zod-schema-driven form chrome with react-hook-form context, dirty-state tracking, approval flow, modal provider, FormContext, EditableFormProvider, ModalFooter, customisable-form, customisable-form-data. The single largest engine in the app. |
| `customisable-ribbon` | WC | 70 | Reads `formCustomisation` GraphQL queries, composes filter widgets per parent-type. Cross-listed under page-specific because effectively-page-bound. |
| `form-builder` (JSONForms) | PC | 10 | JSONForms-based dynamic form renderer (admin form-config screens). |
| `wizard` | WC | 9 | Multi-step assessment/RCSA wizards. Backend-state-driven. |
| `form` (legacy package-level form) | PC | 11 | Older form chrome — being replaced by WC/form. |
| `register-dashboard` | WC | 3 | Filter-property dashboard tile composition tied to register filtering. |
| `attestations-cards` | WC | 2 | Attestation card composition tied to attestation schemas. |

These can be re-evaluated **only** with a parallel mock-data-layer effort (fixture-only schema provider, Apollo mocks for the form-config queries, etc.). Out of scope for organism wiring.

---

## Skipped categories (not UI)

| Source dir | What it is |
|---|---|
| `packages/components/src/{hooks,utils,stores,contexts,providers,rbac,routes,errors,testing,assets,segment,tools}` | Logic / data / config (not UI) |
| `packages/components/src/auth-pages` | Specific auth-flow pages (already-stubbed Auth0 path). |
| `packages/components/src/dragable-item` | DnD primitive — orchestrate but doesn't render visible chrome on its own. |
| `packages/components/src/styled-stars-02` | Niche rating star widget (1 page). |
| `packages/web/src/components/SideControlContainer.tsx` / `Circle.tsx` | Loose .tsx files in components/ — utility primitives. |

---

## Suggested wiring order if you green-light proceeding

1. `simple-rating-badge` — highest visual ROI, used on virtually every register and detail page. Likely tiny (status pill with theme colors).
2. `link` (WC) + `link` (PC) — atomic, ubiquitous.
3. `tab-header` — 26 LOC, unlocks more accurate detail-page templates.
4. `loading` (WC + PC) — pure presentation, used everywhere data loads.
5. `empty-collection` — fixes empty-state visuals across templates.
6. `delete-modal` + `confirm-modal` — modal organism set.
7. `actions-button` — useful for detail-page action area.
8. `export-button` — pairs with table chrome.
9. `help-panel` — chrome but heavier (HTML content + store).
10. `tab-settings-modal` is already stubbed; `side-panel` is similar — wire the visible chrome only if needed.

Anything below row 10 in the Top-30 list has narrow-enough surface that I'd wire on demand rather than batch.

---

## Caveats on the count

- Reuse counts are *page imports*. A component may be heavily reused inside layouts (e.g. `page-header`, `breadcrumbs`) and show 0 here. I added those to "Already wired" with the indirect note.
- Counts include test-spec imports — so a high count can be inflated by `.test.tsx` siblings. I didn't filter those out; the relative ordering is reliable.
- "Visual impact" is a subjective S/M/L call from the directory name + a quick LOC peek for borderline cases. Disagree freely.
- The `form` count of 613 is one component getting imported from 613 places. That's not 613 distinct organisms — it's one massive engine.
