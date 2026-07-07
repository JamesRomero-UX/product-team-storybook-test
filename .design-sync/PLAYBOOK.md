# RiskSmart × Claude Design — team playbook (get the same result every time)

**Why results differ between teammates:** AI generation is non-deterministic. "Build a Risk
Register" lets each run invent its own data, columns, and layout. The fix is to **fork a fixed
prototype**, not generate from scratch — and to make sure everyone is on the same design system.

---

## Before you prompt (every time)
1. **Select the right design system.** In the Claude Design picker choose
   **"RiskSmart Components (Cloudscape)"** — NOT the older "RiskSmart Design System" kit.
   (If you can't tell them apart, ask the DS owner which is current.)
2. **Use the same model** as your teammates where you can.

---

## The golden rule: fork, don't build
For any screen type we already ship, **do not say "build a Risk Register."** Say "duplicate the
prototype." Paste one of these verbatim:

### Register / list / table page
> Duplicate `prototypes/risk-register.html` to a new file and change ONLY the sample data array,
> the column list, and the page title. Do not modify the `<head>` script/style loaders, the
> `window.RiskSmartApp` composition, or the shell structure. Keep it a React `.html` prototype.

### Dashboard / drill-down board
> Duplicate `prototypes/risk-dashboard.html` and change ONLY the tier data and title. Leave the
> loaders and composition untouched.

### Entity detail (tabbed) page
> Duplicate `prototypes/risk-detail.html` and change ONLY the field values, tab labels, and the
> ratings sidebar data. Leave the loaders and composition untouched.

### Create / edit form
> Duplicate `prototypes/risk-create.html` and change ONLY the form fields and title. Leave the
> loaders and composition untouched.

### Issue register (or any register variant)
> Duplicate `prototypes/risk-issues.html` and change ONLY the sample data, the column list, and
> the title. Leave the loaders and composition untouched.

### Settings / admin hub (tabbed)
> Duplicate `prototypes/risk-settings.html` and change ONLY the tab list and each tab's table/
> form data. Leave the loaders and composition untouched.

### Control register
> Duplicate `prototypes/risk-controls.html` and change ONLY the sample data, columns, and title.
> Leave the loaders and composition untouched.

### Action register / task list
> Duplicate `prototypes/risk-actions.html` and change ONLY the sample data, columns, and title.
> Leave the loaders and composition untouched.

Forking these gives everyone a near-identical result because the starting bytes are identical.

---

## If NO prototype matches (a genuinely new screen)
Then generation is unavoidable — so remove ambiguity with a **precise brief**, not a vague ask.
A good brief specifies all of:
- The layout archetype (register / detail / dashboard / form / full-screen).
- Exact columns or fields (names + order).
- The exact sample data (or "use 8 realistic rows").
- Which states to show (default / empty / loading / error).
- That it must load `_ds_bundle.js` + `_ds_app_bundle.js`, set `<body class="atomic-ui">`, and
  compose `window.RiskSmartApp.*` (per the DS guide).

**Expectation:** a precise brief gives consistent *structure and fidelity* (same shell, same real
components) — but not pixel-identical output. Only forking a prototype is truly repeatable.

---

## Quick reference — what's in the DS
- **Primitives:** `window.RiskSmart.*` (68 Cloudscape components).
- **Real app composites:** `window.RiskSmartApp.*` (PageLayout, Table, DashboardItem,
  PropertyFilterPanel, Navigation, GlobalHeader, rating badges, modals, useCollection, … 76 total).
- **Cards** under `components/`: cloudscape-reference (primitives), page-templates (archetype
  targets), production (real composites) — read a card's `.prompt.md`/`.d.ts` before using it.
- **Prototypes** under `prototypes/`: the fork-me starting points above.

## Troubleshooting
- **Blank screen** → almost always the load order. React UMD must load before `_ds_bundle.js`,
  and `_ds_app_bundle.js` after it; `<body>` must have `class="atomic-ui"`. Fork a prototype to
  get this right automatically.
- **Unstyled / bullet-list nav** → missing `class="atomic-ui"` on `<body>` or the app-bundle CSS.
- **Different look than a teammate** → you're likely on a different design system, or you built
  from scratch instead of forking. Re-check both.
