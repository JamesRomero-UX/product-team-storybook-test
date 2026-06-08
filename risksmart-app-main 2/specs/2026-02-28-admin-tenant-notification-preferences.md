---
mode: team
complexity: medium
type: feature
playwright: true
created: 2026-02-28T12:00:00
---

# Plan: Admin Tenant Notification Preferences Management

## Task Description

Create a UI dialog and tRPC endpoints to allow admins to view and edit tenant-level default notification preferences. Currently managed via a manual script (`packages/knock/knock_scripts/setDefaultTenantPreferenceSet.mjs`), this feature exposes the same capability through the admin settings UI. A temporary "Notification Defaults" button on the Settings > Users tab opens a modal with a workflow x channel grid where each cell has an on/off toggle and a lock (enforce) control.

Linear ticket: RSP-92

## Objective

Admins can view and modify tenant-level Knock notification preference defaults from the Settings > Users tab without running manual scripts. Changes are persisted via tRPC endpoints that proxy the Knock tenant API.

## Problem Statement

Tenant notification defaults are currently set by running a Node.js script with hardcoded preferences and a Knock API key. This is error-prone, requires developer access, and easily drifts out of sync with the codebase's workflow definitions. Admins need a self-service UI to manage these defaults.

## Solution Approach

1. **tRPC layer** proxies Knock's tenant API (`GET /v1/tenants/{id}` and `PUT /v1/tenants/{id}`) following the pattern established in PR #5515 (notification history). Service uses raw `fetch()` with `KNOCK_HOST` and `KNOCK_SECRET_KEY` env vars.
2. **Frontend modal** renders a grid of workflows (from `useWorkflows()`) grouped by category, with columns for each enabled channel (`email`, `in_app_feed`, `chat`). Each cell has a toggle (default on/off) and a lock icon (enforced via `__strategy__: 'replace'`). Category rows are computed read-only aggregates. A confirmation dialog guards the save action.
3. **Temporary button** placed alongside the Export button in the Users tab header opens the modal.

## Relevant Files

### Existing Files to Modify
- `packages/trpc/src/routers/router.ts` — register new tenant preferences router
- `packages/web/src/pages/settings/tabs/users/Tab.tsx` — add "Notification Defaults" button

### Existing Files to Reference (read-only)
- `packages/knock/knock_scripts/setDefaultTenantPreferenceSet.mjs` — current manual script, shows Knock API shape and preference payload structure
- `packages/shared/src/knock/schemas.ts` — shared Zod schemas (`preferencesSetSchema`, `ENABLED_CHANNELS`, `PreferencesSet`, `PreferenceCategory`)
- `packages/web/src/components/notification-settings-modal/util.ts` — `useWorkflows()` hook with workflow definitions, labels, categories, feature flags
- `packages/web/src/components/notification-settings-modal/NotificationSettingsModal.tsx` — existing user-level preferences modal pattern
- `packages/web/src/components/notification-settings-modal/NotificationSettingsForm.tsx` — hierarchical form logic reference
- `packages/rest-api/src/handlers/notification-preferences/get.ts` — existing Knock SDK usage for user preferences
- `packages/trpc/src/routers/frontend/notification-history/` (PR #5515 branch) — reference tRPC-to-Knock pattern with `fetchJsonWithRetry`, permission gating, env var usage

### New Files
- `packages/trpc/src/routers/frontend/tenant-preferences/service.ts` — Knock tenant API proxy functions
- `packages/trpc/src/routers/frontend/tenant-preferences/router.ts` — tRPC router with get/set procedures
- `packages/trpc/src/routers/frontend/tenant-preferences/types.ts` — Zod input/output schemas
- `packages/trpc/src/routers/frontend/tenant-preferences/service.test.ts` — service unit tests
- `packages/trpc/src/routers/frontend/tenant-preferences/router.test.ts` — router unit tests
- `packages/web/src/components/tenant-notification-preferences/TenantNotificationPreferencesModal.tsx` — main modal component
- `packages/web/src/components/tenant-notification-preferences/TenantNotificationPreferencesModal.test.tsx` — modal component tests
- `packages/web/src/components/tenant-notification-preferences/types.ts` — frontend types for grid cell state
- `packages/web/src/components/tenant-notification-preferences/utils.ts` — data mapping (UI state ↔ Knock payload) and category derivation
- `packages/web/src/components/tenant-notification-preferences/utils.test.ts` — utils unit tests

## Implementation Phases

### Phase 1: Foundation (tRPC Backend)
Build the tRPC service and router that proxies the Knock tenant preferences API. This has no frontend dependencies and can be developed and tested independently.

### Phase 2: Core Implementation (Frontend Modal)
Build the modal component with the workflow x channel grid, toggle + lock controls, category derivation, and confirmation dialog. Wire it to the tRPC endpoints and add the button to the Users tab.

### Phase 3: Integration & Polish
Integration testing across tRPC and frontend, final code review, and visual verification with Playwright.

## Team Configuration
- **Display Mode**: in-process
- **Coordinate Only**: true
- **Max Active Agents**: 6
- **Rotation After**: 3

## Review Policy
- **Review After**: each task
- **Fix Loop Trigger**: Critical and Important
- **Max Retries**: 3
- **Skip Review For**: none

## Step by Step Tasks

### 1. Build tRPC Tenant Preferences Backend
- **Task ID**: build-trpc
- **Depends On**: none
- **Description**:
  - Create `packages/trpc/src/routers/frontend/tenant-preferences/types.ts`:
    - Zod input schema for `set` mutation: `{ preferences: { channel_types, categories, workflows } }` where each workflow/category entry has `{ channel_types: Record<channel, boolean>, enforced: boolean }` — the `enforced` boolean maps to `__strategy__: 'replace'` in the Knock payload
    - Zod output schema for `get` query matching the `PreferencesSet` shape from `@risksmart-app/shared/knock/schemas` extended with enforcement info
  - Create `packages/trpc/src/routers/frontend/tenant-preferences/service.ts`:
    - `getTenantPreferences(tenant: string)`: `GET {KNOCK_HOST}/v1/tenants/{tenant}` with Bearer auth, extract `settings.preference_set` from response, parse and return. Use `fetchJsonWithRetry` pattern from PR #5515 notification history service (retry on 429 with exponential backoff, map HTTP errors to TRPCError codes)
    - `setTenantPreferences(tenant: string, preferenceSet: TenantPreferenceSetInput)`: transform the input into Knock API format — for each workflow, if `enforced` is true set `__strategy__: 'replace'` alongside `channel_types`; for the top-level, compute `channel_types` from workflow aggregate. Send via `PUT {KNOCK_HOST}/v1/tenants/{tenant}` with `{ settings: { preference_set: { __persistence_strategy__: 'replace', channel_types, categories, workflows } } }`
    - Helper functions: `getKnockApiBase()`, `getKnockSecretKey()` reading from env vars `KNOCK_HOST` and `KNOCK_SECRET_KEY`
  - Create `packages/trpc/src/routers/frontend/tenant-preferences/router.ts`:
    - `get` query: assert `read:settings` permission via `bulkCheck` (same pattern as notification history's `assertReadSettings`), call `getTenantPreferences(ctx.user.tenant)` — respect `KNOCK_TENANT_OVERRIDE` env var like notification history does
    - `set` mutation: assert `update:settings` permission via `bulkCheck`, call `setTenantPreferences(tenant, input)`
    - Export as `tenantPreferencesRouter`
  - Register `tenantPreferencesRouter` in `packages/trpc/src/routers/router.ts` under `frontend.tenantPreferences`
- **Tests**:
  - `packages/trpc/src/routers/frontend/tenant-preferences/service.test.ts`:
    - `getTenantPreferences` returns parsed preference set from Knock response
    - `getTenantPreferences` retries on 429 with backoff
    - `getTenantPreferences` throws TRPCError on non-retryable errors (404, 500)
    - `getTenantPreferences` throws if KNOCK_HOST not configured
    - `setTenantPreferences` sends correct PUT payload with `__persistence_strategy__: 'replace'`
    - `setTenantPreferences` maps `enforced: true` to `__strategy__: 'replace'` per workflow
    - `setTenantPreferences` computes top-level `channel_types` from workflow aggregate
    - `setTenantPreferences` handles Knock API errors
  - `packages/trpc/src/routers/frontend/tenant-preferences/router.test.ts`:
    - `get` query rejects without `read:settings` permission
    - `get` query returns preferences for authenticated user's tenant
    - `set` mutation rejects without `update:settings` permission
    - `set` mutation calls service with correct tenant
    - Uses `KNOCK_TENANT_OVERRIDE` when set
- **Assigned To**: builder
- **Agent Type**: builder
- **Parallel**: true
- **Plan Approval**: true

### 2. Review tRPC Backend
- **Task ID**: review-trpc
- **Depends On**: build-trpc
- **Description**: Review all tRPC code changes for correctness, style consistency with existing routers, proper error handling, security (no tenant leakage, permission checks), and test coverage. Verify the Knock API payload format matches what the manual script produces. Report issues by severity (Critical, Important, Minor).
- **Assigned To**: reviewer
- **Agent Type**: reviewer
- **Parallel**: true
- **Plan Approval**: false

### 3. Build Frontend Modal Component
- **Task ID**: build-frontend
- **Depends On**: none
- **Description**:
  - Create `packages/web/src/components/tenant-notification-preferences/types.ts`:
    - `CellState`: `{ enabled: boolean; enforced: boolean }`
    - `WorkflowPreferenceRow`: `{ workflowKey: string; label: string; category: PreferenceCategory; channels: Record<EnabledChannel, CellState> }`
    - `CategorySummaryRow`: `{ category: PreferenceCategory; label: string; channels: Record<EnabledChannel, CellState>; isExpanded: boolean }`
  - Create `packages/web/src/components/tenant-notification-preferences/utils.ts`:
    - `knockPayloadToGridState(preferenceSet)`: convert Knock `PreferencesSet` (with `__strategy__` flags) to array of `WorkflowPreferenceRow`, detecting `__strategy__: 'replace'` as `enforced: true`
    - `gridStateToKnockPayload(rows)`: convert grid state back to Knock-compatible payload, setting `__strategy__: 'replace'` for enforced workflows, computing category aggregates (any child enabled → category channel enabled; all children enforced → category enforced)
    - `deriveCategorySummaries(rows)`: compute read-only category summary rows from workflow rows
  - Create `packages/web/src/components/tenant-notification-preferences/TenantNotificationPreferencesModal.tsx`:
    - Modal dialog using existing `ModalForm` or Cloudscape `Modal` pattern
    - Fetch tenant preferences via `trpc.frontend.tenantPreferences.get.useQuery()`
    - Display grid: rows grouped by category with collapsible category headers. Category rows show derived aggregate state (read-only). Workflow rows have per-channel toggle + lock icon
    - Toggle interaction: clicking toggle flips `enabled`, clicking lock flips `enforced`
    - Visual indicators: locked cells show a lock icon, category rows are visually distinct (bold/grey background)
    - Save: on save click, show confirmation dialog ("These changes will affect notification defaults for all users in this organisation. Continue?"). On confirm, call `trpc.frontend.tenantPreferences.set.useMutation()` with `gridStateToKnockPayload()` result
    - Loading/error states: spinner while loading, error alert on failure
    - Channel column headers: "Email", "In-App", "Chat" (matching user UI labels)
  - Modify `packages/web/src/pages/settings/tabs/users/Tab.tsx`:
    - Import `TenantNotificationPreferencesModal`
    - Add `const [isPrefsOpen, setIsPrefsOpen] = useState(false)` state
    - Add "Notification Defaults" button in the `SpaceBetween` actions area alongside the Export button, wrapped in `<Permission permission={'read:settings'}>` guard
    - Render `{isPrefsOpen && <TenantNotificationPreferencesModal onClose={() => setIsPrefsOpen(false)} />}`
- **Tests**:
  - `packages/web/src/components/tenant-notification-preferences/utils.test.ts`:
    - `knockPayloadToGridState` correctly maps channel booleans
    - `knockPayloadToGridState` detects `__strategy__: 'replace'` as enforced
    - `knockPayloadToGridState` handles empty/missing preferences gracefully
    - `gridStateToKnockPayload` produces correct Knock format with `__strategy__` flags
    - `gridStateToKnockPayload` computes category aggregates correctly
    - `deriveCategorySummaries` aggregates child workflow states
    - `deriveCategorySummaries` marks category enforced only when all children enforced
  - `packages/web/src/components/tenant-notification-preferences/TenantNotificationPreferencesModal.test.tsx`:
    - Renders loading spinner while fetching
    - Renders error alert on fetch failure
    - Renders workflow rows grouped by category
    - Toggle click updates enabled state
    - Lock click updates enforced state
    - Category rows are read-only (clicks ignored)
    - Save button triggers confirmation dialog
    - Confirming save calls tRPC mutation with correct payload
    - Cancelling confirmation does not save
    - Modal closes on dismiss
- **Assigned To**: builder
- **Agent Type**: builder
- **Parallel**: true
- **Plan Approval**: true

### 4. Review Frontend Modal
- **Task ID**: review-frontend
- **Depends On**: build-frontend
- **Description**: Review all frontend code changes for correctness, accessibility, component patterns consistency with existing codebase (ModalForm usage, Permission guards, Cloudscape patterns), proper tRPC hook usage, and test coverage. Verify the data mapping between UI state and Knock payload is bidirectional and lossless. Report issues by severity (Critical, Important, Minor).
- **Assigned To**: reviewer
- **Agent Type**: reviewer
- **Parallel**: true
- **Plan Approval**: false

### 5. Integration Tests
- **Task ID**: test-integration
- **Depends On**: build-trpc, build-frontend
- **Description**: Write integration tests that verify the tRPC ↔ frontend wiring works end-to-end:
  - Test that `TenantNotificationPreferencesModal` correctly fetches and displays data from the tRPC `get` endpoint (using MSW or tRPC test utils)
  - Test that saving from the modal calls the tRPC `set` mutation with the correctly transformed payload
  - Test the full round-trip: load preferences → modify a toggle and lock → save → verify the mutation payload matches expected Knock format
  - Test permission denial: verify the modal/button is not rendered without `read:settings` permission
- **Tests**:
  - `packages/web/src/components/tenant-notification-preferences/TenantNotificationPreferencesModal.integration.test.tsx`:
    - Fetches and renders tenant preferences from tRPC mock
    - Saves modified preferences via tRPC mutation
    - Round-trip: load → edit → save produces correct payload
    - Hidden when user lacks `read:settings` permission
- **Assigned To**: tester
- **Agent Type**: tester
- **Parallel**: true
- **Plan Approval**: false

### 6. Visual Verification with Playwright
- **Task ID**: playwright-verify
- **Depends On**: build-trpc, build-frontend
- **Description**: Use Playwright MCP to visually verify the implementation:
  - Navigate to Settings > Users tab
  - Verify the "Notification Defaults" button is visible alongside the Export button
  - Click the button and verify the modal opens
  - Take a screenshot of the modal showing the grid layout
  - Verify workflow rows are grouped under category headers
  - Toggle a switch and verify visual state change
  - Click the lock icon and verify visual state change
  - Click Save and verify the confirmation dialog appears
  - Take a screenshot of the confirmation dialog
  - Check browser console for errors
- **Tests**: N/A (visual verification only, Playwright MCP screenshots)
- **Assigned To**: tester
- **Agent Type**: tester
- **Parallel**: true
- **Plan Approval**: false

### 7. Final Code Review
- **Task ID**: review-all
- **Depends On**: build-trpc, build-frontend, test-integration, playwright-verify
- **Description**: Review all code changes holistically for correctness, style consistency, edge cases, security (tenant isolation, permission checks, no API key leakage), and completeness. Verify tRPC and frontend integrate correctly. Report issues by severity (Critical, Important, Minor).
- **Assigned To**: reviewer
- **Agent Type**: reviewer
- **Parallel**: false
- **Plan Approval**: false

### 8. Final Validation
- **Task ID**: validate-all
- **Depends On**: review-all
- **Description**: Run all validation commands, verify every acceptance criterion is met. Produce pass/fail report.
- **Assigned To**: validator
- **Agent Type**: validator
- **Parallel**: false
- **Plan Approval**: false

## Documentation Requirements
- Inline JSDoc comments on `getTenantPreferences` and `setTenantPreferences` service functions explaining the Knock API contract
- Brief comment in `types.ts` explaining the `enforced` ↔ `__strategy__: 'replace'` mapping
- Comment on the Users tab button marking it as temporary (to be replaced with proper settings tab)

## Acceptance Criteria
- [ ] `trpc.frontend.tenantPreferences.get` query returns current tenant preference set from Knock API
- [ ] `trpc.frontend.tenantPreferences.set` mutation updates tenant preference set via Knock API with correct `__strategy__` and `__persistence_strategy__` flags
- [ ] Both tRPC endpoints are permission-gated (`read:settings` / `update:settings`)
- [ ] "Notification Defaults" button appears on Settings > Users tab alongside Export button
- [ ] Button is only visible to users with `read:settings` permission
- [ ] Clicking button opens modal with workflow x channel grid
- [ ] Grid shows all workflows from `useWorkflows()` grouped by category
- [ ] Each cell has a toggle (on/off) and lock (enforced) control
- [ ] Category rows display derived aggregate state and are not directly editable
- [ ] Channels displayed: Email, In-App, Chat
- [ ] Save triggers a confirmation dialog warning about tenant-wide impact
- [ ] Confirming save persists changes via tRPC mutation
- [ ] All tRPC unit tests pass
- [ ] All frontend component tests pass
- [ ] All integration tests pass
- [ ] TypeScript compiles with no errors (`tsc --noEmit`) in both packages
- [ ] Lint passes in both packages

## Validation Commands
```bash
# tRPC package
pnpm exec turbo test:unit --filter=@risksmart-app/trpc -- src/routers/frontend/tenant-preferences/
pnpm exec turbo lint --filter=@risksmart-app/trpc

# Web package
pnpm exec turbo test:unit --filter=@risksmart-app/web -- src/components/tenant-notification-preferences/
pnpm exec turbo lint --filter=@risksmart-app/web
```

## Notes
- The "Notification Defaults" button is intentionally temporary — future work will move this to a dedicated notifications settings tab
- The tRPC service uses raw `fetch()` to the Knock REST API (not the `@knocklabs/node` SDK) to stay consistent with the PR #5515 notification history pattern
- `KNOCK_TENANT_OVERRIDE` env var is respected for local development (same as notification history)
- The preference set uses `__persistence_strategy__: 'replace'` at the top level to do a full replacement (not merge), matching the manual script behaviour
- Category-level preferences in the Knock payload are computed from workflow children — the admin never directly edits categories
