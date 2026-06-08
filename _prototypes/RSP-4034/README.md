# RSP-4034 — Surface risk appetite posture toggle in Modules settings

**Linear:** https://linear.app/risksmart/issue/RSP-4034  
**Status:** Needs design → Ready for handoff  
**Library:** Cloudscape (modifying an existing screen)

---

## Stories

| Story | File | Description |
|-------|------|-------------|
| CS User — posture OFF | [cs-user-posture-off.html](./cs-user-posture-off.html) | CS user sees the toggle under Risk → Submodules, in the OFF state |
| CS User — posture ON | [cs-user-posture-on.html](./cs-user-posture-on.html) | CS user sees the toggle in the ON state (posture mode active) |
| Non-CS User — toggle absent | [non-cs-user-toggle-absent.html](./non-cs-user-toggle-absent.html) | Standard user — posture toggle row is completely absent |

> Run `bash _prototypes/build-and-share.sh` (Storybook must be running, `single-file-cli` installed) to generate the `.html` files above.

---

## Acceptance Criteria Coverage

| AC | Covered by |
|----|-----------|
| CS user sees the posture toggle in Settings → Modules | Story 1 & 2 |
| Non-CS user does not see the posture toggle | Story 3 |
| Toggle reflects current flag state (ON / OFF) | Story 1 (OFF), Story 2 (ON) |
| Flipping the toggle updates the flag | Interactive — toggle is live in all stories |
| Same control, label style, no bespoke copy/warnings/modals | Confirmed — verbatim SubModuleSettings pattern |

---

## Design Decisions

**Placement:** After `appetite_cascading` (Risk cascade) in the Risk module's Submodules section, before `acceptance`. This groups it with the other appetite-related submodules logically.

**CS-only gate:** Conditional render — `if (CS_ONLY_SUBMODULES.has(subKey) && !isCustomerSupport) return null`. The row is simply absent for non-CS users; no disabled state, no hidden placeholder.

**Copy:**

| i18n key | String |
|----------|--------|
| `modules.titles.appetite_posture` | `Risk appetite posture mode` |
| `modules.descriptions.appetite_posture` | `Switches risk appetite from banding (upper and lower limits) to posture mode (single threshold).` |

Add both to `packages/i18n/src/locales/default/en/common.json` under `modules.titles` and `modules.descriptions`.

**No confirm dialog / warning:** The AC explicitly states "no bespoke copy, warnings, or modals." The toggle behaves identically to every other submodule toggle — flip, then Save.

---

## Engineering Notes

### What's needed

1. **i18n keys** — add `titles.appetite_posture` and `descriptions.appetite_posture` to `common.json` (see copy above).

2. **Module entry** — add `appetite_posture` to `defaultModules.risk.subModules` in `packages/modules/src/defaults.ts`:
   ```ts
   appetite_posture: {
     enabled: false,
   },
   ```
   OR handle as a standalone feature-flag toggle outside the module system (see write path below).

3. **Read path** — `useIsFeatureFlagEnabled('posture')` already works. Use this to initialise the toggle's checked state.

4. **Write path** ⚠️ — `posture` is NOT module-backed. `UpdateModulesDocument` will not touch it. A separate mutation to add/remove `'posture'` from `org.Meta.features` is required. `UpdateAggregationSettingsForOrgDocument` (already imported in `moduleContext.tsx`) is a candidate — engineering to confirm the right approach.

5. **CS-only gate** — `useRisksmartUser().user?.isCustomerSupport === true`. This is the first CS-gated item in the Modules tab; the pattern needs to be introduced here. Suggested approach: pass `isCustomerSupport` into `SubModuleSettings` and null-render any key in a `CS_ONLY_SUBMODULES` set.

6. **Save behaviour** — the posture flag write should happen inside the existing `saveChanges` flow in `Tab.tsx` (alongside `commit()`). No separate Save button.

### What engineering does NOT need to do

- No new UI components
- No new design tokens
- No Figma mockup (prototype is the reference)
- No confirm modal or warning copy

---

## Open Questions

- [ ] Should `appetite_posture` be added to the module system (`defaultModules`) or handled as a one-off feature-flag toggle? Affects the write path and whether the toggle participates in `isDirty` / `reset()` flow.
- [ ] Does the posture save need to be part of the existing `Save` button flow, or can it be optimistic (immediate on toggle)?

---

## Self-check

- [x] Component plan presented and approved before composing
- [x] All className strings verbatim from production (`ModuleSettings.tsx`, `SubmoduleSettings.tsx`)
- [x] No invented props — Toggle, h4, p, `ml-[8px]` all confirmed against source
- [x] Three states covered: CS+OFF, CS+ON, non-CS
- [x] CS gate is a null-return (absent), not disabled — matches AC intent
- [x] Copy reviewed (Content & Copy lens applied)
- [x] No hardcoded hex or px values beyond what production uses
