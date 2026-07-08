# RiskSmart → Claude Design sync — Handoff

_Last updated: 2026-07-06_

## Goal
Sync the RiskSmart design system to claude.ai/design so anyone can build prototypes that render **1:1** with the live app.

## What's live now
- **DS project:** RiskSmart Components (Cloudscape) — `41f173c8-bc0e-4dfd-90c9-a53a47cb3d99`
  - https://claude.ai/design/p/41f173c8-bc0e-4dfd-90c9-a53a47cb3d99
- **68 components** — the real `@risk-smart/themed-cloudscape-components`, each verified against the repo's own Storybook.
- **App shell + page templates as cards:** AppLayout (Page Shell / Table Page / Form Page) + TopNavigation.
- **10 brand guideline docs** (`.design-sync/guidelines/`): colour, typography, voice & tone, copy, iconography, visual content, logo, accessibility, styles + overview — distilled from the design-system site.
- **Agent guide** (auto-injected into Claude Design): loading rules, spacing idiom, page-template routing, brand rules.

## How it was built — key decisions & fixes
- Scoped to the reusable themed-Cloudscape library (not app composites or atomic-ui).
- Built a **cloudscape-reference-only Storybook** config as the fidelity oracle (removed atomic-ui name-collision contamination).
- Fixed: Sora font shipped; dead "Courier Prime" suppressed; `withThemeByClassName` decorator crash → a no-op `PreviewRoot` provider; grid-overflow card modes.
- Verified every component (solo pass + 3 fan-out waves). All match; FileTokenGroup close; HelpPanel/SideNavigation are floor cards.
- Trimmed Storybook SideNavigation to the live-app icon nav only.

## ⚑ The critical gotcha (READ FIRST)
A "Risk Register" screen came out **blank** — not a wrong-DS problem (the agent used the right DS and wrote good code) but because it built a `.dc.html`, and our bundle **externalizes React**: `window.React` must load **before** `_ds_bundle.js`, or `window.RiskSmart` never initializes.

**Fix:** build screens as a **React prototype** (load React UMD → then the bundle), **not** `.dc.html`. Verified working with React 18.3.1 UMD. This is embedded as a top-of-guide "⚑ READ FIRST" directive so the agent picks it up automatically.

## Deliverables & links
- DS project: https://claude.ai/design/p/41f173c8-bc0e-4dfd-90c9-a53a47cb3d99
- Working reference prototype (verified render): `Risk Register (working).html` — https://claude.ai/design/p/ef4e4eb6-e609-4482-b4fa-482c1737522d?file=Risk+Register+(working).html
- Teammate one-pager: https://claude.ai/code/artifact/287d5827-bd46-4e87-b8be-4b76e57326cc
- PR #1 (sync state): https://github.com/JamesRomero-UX/product-team-storybook-test/pull/1
- Repo: `product-team-storybook`, branch `design-sync/risksmart-cloudscape`. Durable sync state in `.design-sync/`.

## Open items
1. **Make the new DS the default.** The old "RiskSmart Design System" kit is still `is_default` and the only one in the picker; the new one isn't registered as default. This is a **Claude Design UI/platform action** — no tool exposes it. See `.design-sync/PLATFORM-ASK.md`.
2. **Live end-to-end confirmation.** The React-prototype path is embedded and artifacts render, but no fresh post-fix agent run has been watched succeed. One test (prompt with the DS selected → share link → inspect) turns "should work" into "confirmed."
3. **Remaining working-tree changes** (not in PR): `.storybook/preview.ts` fidelity fix (decorator ordering) + `main.ts` dev-tunnel tweak, plus a WIP Scheduler prototype. Held back because `preview.ts` couples to an untracked `_scheduler.css` and would drag the prototype in. Decide separately.

## ⚠️ Housekeeping flags
- **Secret in working tree:** `-RSMAC013.env` is untracked — do **not** commit it; consider deleting or `.gitignore`-ing.
- **Token in git remote:** `origin` URL embeds a `ghp_…` GitHub PAT. Rotate it and switch to a credential helper / SSH.
- Build artifacts loose in the tree: `_component-audit.zip`, `risksmart-design-system.zip`, `_component-audit/` — gitignore or remove.

## Honest status
Design system and components are **verified working** (real 1:1 renders prove it). The "just works automatically for anyone" goal has two links outside my control: the DS being the **selected/default** one, and the agent reliably choosing the **React-prototype path** — best closed by the platform-default fix + one live test.
