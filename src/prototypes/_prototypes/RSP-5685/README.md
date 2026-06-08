# RSP-5685 — ERM Entity Hierarchy Picker

**Linear:** https://linear.app/risksmart/issue/RSP-5685  
**Prototype file:** `src/prototypes/RSP-5685-erm-entity-hierarchy.stories.tsx`  
**Storybook path:** `Prototypes/RSP-5685 ERM Entity Hierarchy`  
**Created:** 2026-05-27  
**Design lead:** James Romero

---

## Summary

Users can currently only filter the ERM register by **leaf entities** — parent/ancestor entities are hidden. This is caused by a deliberate `@TODO` filter in two layout files that strips any entity with children before building the picker options.

This prototype proposes a **collapsible hierarchy picker** that replaces the flat `EntityList` with a recursive `EntityTreeNode` tree. Users can select any level of the hierarchy (leaf, parent, or grandparent). Selecting a parent communicates how many descendant entities are included in the scope.

---

## Story index

| Story | Name | What it validates |
|-------|------|------------------|
| `Before` | Before (Current — flat list) | Status quo: leaf-only, no hierarchy visible, USA/UK unseen |
| `TreeDefault` | Tree — Global (no selection) | Full hierarchy rendered, all expanded, nothing selected |
| `LeafSelected` | Tree — Leaf selected (New York) | Existing leaf selection behaviour preserved |
| `ParentSelected` | Tree — Parent selected (UK → 2 entities) | Parent selection + "(2 entities)" scope count |
| `GrandparentSelected` | Tree — Grandparent selected (USA → 4 entities) | 3-level selection + scope count; register shows combined data |
| `CollapsedBranch` | Tree — Collapsed branch (scale) | Collapsed USA branch; demonstrates scale management for large orgs |
| `Loading` | Loading | Spinner state while entities are fetched |
| `EmptyState` | Empty (no entities configured) | Empty state copy + admin guidance |

---

## Acceptance criteria coverage

| # | AC | Story covering it |
|---|----|------------------|
| 1 | User can see all entities in the hierarchy (not just leaves) | `TreeDefault` |
| 2 | User can select a leaf entity and see data for that entity only | `LeafSelected` |
| 3 | User can select a parent entity and see combined data from all descendants | `ParentSelected`, `GrandparentSelected` |
| 4 | Selected parent shows scope indicator ("N entities") in the picker | `ParentSelected`, `GrandparentSelected` |
| 5 | ERM register updates to show combined data on parent selection | `ParentSelected`, `GrandparentSelected` |
| 6 | User can expand/collapse branches in the picker | `CollapsedBranch`, `TreeDefault` |
| 7 | Loading state is handled gracefully | `Loading` |
| 8 | Empty state is handled gracefully | `EmptyState` |
| 9 | Existing leaf-level selection still works unchanged | `LeafSelected` |

---

## Engineering changes required after sign-off

### 1. `packages/web/src/layouts/AuthenticatedAppLayout.tsx`

Remove the leaf-only filter:

```tsx
// REMOVE these 2 lines:
// @TODO: remove filter once support for nested entities is added
.filter((entity) => !entity.children || !entity.children.length)
```

Update `entityOptions` type to accept a hierarchical `EntityNode[]` instead of a flat array.

### 2. `packages/web/src/layouts/PageLayout.tsx`

Same removal — identical `@TODO` filter exists here.

### 3. `packages/components/src/global-header/global-actions/global-entity-picker/GlobalEntityPickerPopup.tsx`

Replace `EntityList` + `EntityOption` imports with the new `EntityTreeList` + `EntityTreeNode` components (reference implementations in the prototype file).

Update the props interface to accept `nodes: EntityNode[]` (hierarchical) instead of `options: { value, label }[]`.

### 4. Type update

The `entityOptions` prop passed down from `AuthenticatedAppLayout` → `Navigation` → `GlobalEntityPicker` → `GlobalEntityPickerPopup` needs its type updated from flat to hierarchical.

---

## Open questions / decisions needed

| # | Question | Status |
|---|----------|--------|
| 1 | **Max depth** — prototype is unlimited; fine for 2–3 levels but may need scroll-capping at 4+ levels. Confirm max depth with product. | ❓ Open |
| 2 | **"Global" label** — prototype uses `'Global'`. Production uses `t('entity.global')` i18n key. Confirm the translation key is correct for all locales. | ❓ Open |
| 3 | **Multi-select** — RSP-5685 is single-select only. Separate ticket needed for multi-entity selection? | ❓ Out of scope |
| 4 | **Selection persistence** — should the selected entity survive page navigation? Currently handled by `entityFilterContext`. Confirm the context change is sufficient or if URL params are needed. | ❓ Open |
| 5 | **Keyboard navigation** — `aria-pressed` on buttons is non-standard for a listbox. Consider `role="option"` + `aria-selected` inside `role="listbox"` for full WCAG compliance. Follow-up ticket? | ❓ Open |

---

## Design token reference

All classes in this prototype are lifted verbatim from production `GlobalEntityPicker`. No new tokens required.

| Token | Value | Usage |
|-------|-------|-------|
| `bg-navy_mid` | `#0F1C42` | Popup background |
| `hover:bg-navy_light` | `#1B2D5F` | Hover state on rows |
| `text-teal` | `#00DECB` | Selected label + check icon |
| `text-transparent` | — | Hides check icon when not selected |
| `shadow-lg` | — | Popup drop shadow |
| `rounded-b-md` | — | Popup bottom corners |
