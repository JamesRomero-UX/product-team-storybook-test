---
mode: delegated
complexity: complex
type: feature
playwright: true
created: 2026-02-21T12:00:00
---

# Plan: Notification History Admin UI

## Task Description

Add a Notification History tab to the Settings page (`/settings/notifications`) that allows admins to view, filter, and export notification activity across the platform. The backend proxies the Knock Messages API (`GET /v1/messages`) via a new tRPC router, and the frontend presents a register-style table with server-side filtering, cursor-based pagination, configurable date range, and CSV export.

## Objective

When complete, admins will be able to:
- View all notification activity in a dedicated Settings tab
- Filter by date range, object type (workflow), recipient, channel, delivery status, and engagement status
- Navigate through results with cursor-based pagination
- Click through to associated objects via deep links
- Export currently loaded data to CSV

## Problem Statement

Admins currently have no visibility into notification activity within the platform. Investigating delivery issues, answering audit questions, or understanding notification behaviour requires raising support requests or accessing the Knock dashboard directly. This creates a dependency on engineering teams and slows down governance workflows.

## Solution Approach

**Approach A — Direct Knock API Proxy**: A thin tRPC router that proxies requests to the Knock Messages API using the existing `@knocklabs/node` SDK and `KNOCK_SECRET_KEY`. No new data storage. The frontend sends filter and pagination params to tRPC, which forwards them to Knock and returns typed results. A shared workflow-key-to-URL resolver enables deep linking from notification entries to associated objects.

## Relevant Files

### Existing Files (to modify)
- `packages/trpc/src/routers/frontend/index.ts` — Add notification-history router to frontend router
- `packages/web/src/pages/settings/Page.tsx` — Add `notifications` to activeTabId union type
- `packages/web/src/hooks/useTabs.tsx` — Register new notifications tab
- `packages/web/src/routes/settingRoutes.config.tsx` — Add route for `/settings/notifications`
- `packages/web/src/utils/urls.ts` — Add `notificationHistoryUrl()` helper

### Reference Files (patterns to follow)
- `packages/web/src/pages/settings/tabs/audit/Tab.tsx` — Settings tab pattern
- `packages/web/src/pages/risks/config.tsx` — Register table field config pattern
- `packages/web/src/utils/table/hooks/useGetStatelessTableProps.tsx` — Stateless table hook
- `packages/web/src/utils/table/hooks/useGetTableProps.tsx` — Standard table hook
- `packages/web/src/utils/table/hooks/useExportToCsv.tsx` — CSV export pattern
- `packages/web/src/components/export-button/ExportButton.tsx` — Export button component
- `packages/rest-api/src/handlers/notifications/utilities.ts` — Existing Knock SDK usage
- `packages/web/src/components/notifications-list/notification-types/` — Workflow key to URL mapping (per-type handlers)
- `packages/knock/partials/deep-link-partial-email/content.html` — Email deep link mapping

### New Files
- `packages/trpc/src/routers/frontend/notification-history/router.ts` — tRPC router for notification history
- `packages/trpc/src/routers/frontend/notification-history/service.ts` — Knock API service layer
- `packages/trpc/src/routers/frontend/notification-history/types.ts` — Shared types and Zod schemas
- `packages/trpc/src/routers/frontend/notification-history/router.test.ts` — Router unit tests
- `packages/web/src/pages/settings/tabs/notifications/Tab.tsx` — Settings tab component
- `packages/web/src/pages/settings/tabs/notifications/config.tsx` — Table field configuration
- `packages/web/src/pages/settings/tabs/notifications/types.ts` — Frontend types
- `packages/web/src/pages/settings/tabs/notifications/useNotificationHistory.ts` — Data fetching hook with server-side pagination
- `packages/web/src/pages/settings/tabs/notifications/DateRangeSelector.tsx` — Date range preset/custom selector
- `packages/web/src/utils/notificationUrlResolver.ts` — Shared workflow-key-to-URL resolver
- `packages/web/src/utils/notificationUrlResolver.test.ts` — Resolver unit tests

## Implementation Phases

### Phase 1: Foundation
Research existing patterns (tRPC router structure, settings tab wiring, Knock SDK usage) and build the shared workflow-key-to-URL resolver utility.

### Phase 2: Core Implementation
Build the tRPC backend router (list + getContent procedures) and the frontend settings tab with server-side filtering, pagination, and table rendering.

### Phase 3: Integration & Polish
Wire deep links, CSV export, date range selector, handle edge cases (10k count cap, missing recipients, empty data payloads), and run visual verification with Playwright.

## Team Members

- Backend Builder
  - **Role**: Implements tRPC notification-history router, Knock SDK integration, and Zod schemas
  - **Agent Type**: builder

- Utility Builder
  - **Role**: Implements shared workflow-key-to-URL resolver utility
  - **Agent Type**: builder

- Frontend Builder
  - **Role**: Implements settings tab, table configuration, server-side pagination hook, date range selector, and CSV export
  - **Agent Type**: builder

- Integration Tester
  - **Role**: Writes integration tests spanning backend-to-frontend data flow, adversarial edge cases for filters/pagination, and deep link coverage
  - **Agent Type**: tester

- Code Reviewer
  - **Role**: Reviews all code changes for correctness, style, edge cases, security, and spec compliance
  - **Agent Type**: reviewer

- Final Validator
  - **Role**: Runs validation commands and checks all acceptance criteria
  - **Agent Type**: validator

## Review Policy
- **Review After**: each task
- **Fix Loop Trigger**: Critical and Important
- **Max Retries**: 3
- **Skip Review For**: research-patterns, review-all, validate-all

## Step by Step Tasks

### 1. Research Existing Patterns
- **Task ID**: research-patterns
- **Depends On**: none
- **Description**: Gather implementation details needed by builders:
  - Read `packages/trpc/src/routers/frontend/index.ts` to understand how routers are registered
  - Read an existing tRPC router (e.g. risk or action) to understand the service/router/types pattern
  - Read `packages/web/src/hooks/useTabs.tsx` to understand how settings tabs are registered and permissioned
  - Read `packages/web/src/routes/settingRoutes.config.tsx` to understand route registration
  - Read `packages/web/src/pages/settings/Page.tsx` to understand the activeTabId union
  - Read `packages/web/src/utils/table/hooks/useGetStatelessTableProps.tsx` to understand the stateless table API
  - Read `packages/web/src/components/notifications-list/notification-types/` handlers to catalog all workflow-key-to-URL mappings
  - Read `packages/knock/partials/deep-link-partial-email/content.html` for email deep link mappings
  - Read `packages/web/src/utils/urls.ts` for all available URL helpers
  - Check how `@knocklabs/node` is used in existing backend code (e.g. `packages/rest-api/src/handlers/notifications/utilities.ts`)
  - Identify the Knock SDK method for listing messages and its TypeScript types
  - Document findings with file:line references for each pattern
- **Tests**: N/A
- **Assigned To**: Backend Builder
- **Agent Type**: builder
- **Background**: false

### 2. Build Workflow-Key-to-URL Resolver
- **Task ID**: build-url-resolver
- **Depends On**: research-patterns
- **Description**: Create a shared utility that maps Knock workflow keys and data payloads to app object URLs:
  - Create `packages/web/src/utils/notificationUrlResolver.ts`
  - Define a `resolveNotificationUrl(workflowKey: string, data: Record<string, unknown>): string | null` function
  - Map all ~40 workflow keys to their corresponding URL helper functions from `urls.ts`:
    - `risk-*` workflows → `riskDetailsUrl(objectId)` (except `risk-delete` → `null`)
    - `action-*` workflows → `actionDetailsUrl(objectId)` (except `action-delete` → `null`)
    - `control-*` workflows → `controlDetailsUrl(objectId)` (except `control-delete` → `null`)
    - `document-*` workflows → `policyDetailsUrl(objectId)` (except `document-delete` → `null`)
    - `issue-*` workflows → resolve using `issuePath` data field + `issueDetailsUrl` variants (except `issue-delete` → `null`)
    - `indicator-*` workflows → `indicatorDetailsUrl(objectId)`
    - `policy-approver` → `policyDetailsUrl(objectId)`
    - `policy-attestation-reminder`, `attestation-record-insert` → `publicPolicyFileUrl(parentObjectId, objectId)`
    - `policy-document-version-review-*` → `policyDetailsUrl(objectId)`
    - `change-request-*` → `null` (links to register with filter, not a direct object)
    - `third-party-*` → `thirdPartyDetailsUrl(objectId)` or `questionnaireResponseDetailsUrl(objectId, parentObjectId)` where applicable
    - `digest` → `null` (system workflow)
  - Handle missing/undefined `objectId` gracefully by returning `null`
  - Handle missing `issuePath` for issue workflows by defaulting to standard issues path
  - Create `packages/web/src/utils/notificationUrlResolver.test.ts` with tests for:
    - Each major workflow key family (risk, action, control, document, issue, indicator, policy, attestation, third-party)
    - Missing objectId returns null
    - Delete workflows return null
    - Issue workflows with different issuePath values
    - Unknown workflow keys return null
- **Tests**: `packages/web/src/utils/notificationUrlResolver.test.ts` — test each workflow key family, null cases, issue path variants, unknown keys
- **Assigned To**: Utility Builder
- **Agent Type**: builder
- **Background**: true

### 3. Review URL Resolver
- **Task ID**: review-url-resolver
- **Depends On**: build-url-resolver
- **Description**: Review the workflow-key-to-URL resolver for correctness, completeness, and edge cases. Verify all ~40 workflow keys are mapped correctly by cross-referencing with `packages/knock/workflows/` directory and `packages/web/src/components/notifications-list/notification-types/`. Check that URL helper function signatures match, null handling is correct, and test coverage is adequate.
- **Tests**: N/A
- **Assigned To**: Code Reviewer
- **Agent Type**: reviewer
- **Background**: false

### 4. Build tRPC Notification History Router
- **Task ID**: build-trpc-router
- **Depends On**: research-patterns
- **Description**: Create the tRPC backend for notification history:
  - Create `packages/trpc/src/routers/frontend/notification-history/types.ts`:
    - Zod input schema for `list`: `tenant` (string), `after` (cursor, optional), `before` (cursor, optional), `pageSize` (number, 1-50, default 50), `channelId` (string, optional), `status` (array of delivery status strings, optional), `engagementStatus` (array of engagement status strings, optional), `source` (workflow key string, optional), `insertedAtGt` (ISO date string, optional), `insertedAtLt` (ISO date string, optional)
    - Zod input schema for `getContent`: `messageId` (string)
    - Output types for message list response with items and pageInfo
  - Create `packages/trpc/src/routers/frontend/notification-history/service.ts`:
    - `listMessages(params)`: calls Knock API `GET /v1/messages` with mapped params, returns typed response
    - `getMessageContent(messageId)`: calls Knock API `GET /v1/messages/{id}/content`, returns rendered content
    - Use `@knocklabs/node` SDK or direct HTTP calls to Knock API using `KNOCK_SECRET_KEY`
    - Map Knock response to typed output shape
  - Create `packages/trpc/src/routers/frontend/notification-history/router.ts`:
    - `list` procedure: protected by `read:settings` permission, validates input with Zod schema, calls service, returns typed output
    - `getContent` procedure: protected by `read:settings` permission, validates messageId, calls service, returns content
    - Register router on the frontend router at `notificationHistory`
  - Create `packages/trpc/src/routers/frontend/notification-history/router.test.ts`:
    - Mock `@knocklabs/node` SDK / HTTP calls
    - Test `list` procedure: correct params forwarded to Knock, response mapped correctly, pagination cursors passed through
    - Test `list` procedure: filter params (status, engagement_status, channel, source, date range) correctly mapped
    - Test `getContent` procedure: messageId forwarded, content returned
    - Test permission gate: unauthorized user gets rejected
    - Test input validation: invalid pageSize, missing required fields
- **Tests**: `packages/trpc/src/routers/frontend/notification-history/router.test.ts` — list param mapping, response mapping, pagination, getContent, permission gate, input validation
- **Assigned To**: Backend Builder
- **Agent Type**: builder
- **Background**: true

### 5. Review tRPC Router
- **Task ID**: review-trpc-router
- **Depends On**: build-trpc-router
- **Description**: Review the tRPC notification history router for correctness, security, and spec compliance. Verify:
  - Permission checks are in place on both procedures
  - Zod schemas validate all inputs correctly and reject bad data
  - Knock API params are mapped correctly (field name translations, array handling)
  - Response mapping preserves all required fields
  - Error handling for Knock API failures (network errors, rate limits, auth failures)
  - No secrets leaked to frontend
  - Test coverage is adequate
- **Tests**: N/A
- **Assigned To**: Code Reviewer
- **Agent Type**: reviewer
- **Background**: false

### 6. Build Frontend Settings Tab
- **Task ID**: build-frontend-tab
- **Depends On**: build-trpc-router, build-url-resolver
- **Description**: Create the notification history settings tab with server-side filtering and pagination:
  - Create `packages/web/src/pages/settings/tabs/notifications/types.ts`:
    - Define `NotificationHistoryItem` type matching tRPC response shape
    - Define filter state types
  - Create `packages/web/src/pages/settings/tabs/notifications/useNotificationHistory.ts`:
    - Custom hook wrapping the tRPC `notificationHistory.list` query
    - Manages filter state (date range, channel, delivery status, engagement status, workflow source)
    - Manages cursor-based pagination state (current cursor, page direction)
    - Translates property filter changes into tRPC query params
    - Re-fetches when filters or pagination change
    - Returns items, loading state, pagination controls (hasNext, hasPrev, goNext, goPrev), total count
  - Create `packages/web/src/pages/settings/tabs/notifications/DateRangeSelector.tsx`:
    - Preset options: Last 7 days, Last 30 days (default), Last 90 days, Custom
    - Custom mode shows date pickers for start and end
    - Outputs `insertedAtGt` and `insertedAtLt` ISO strings
  - Create `packages/web/src/pages/settings/tabs/notifications/config.tsx`:
    - `useGetFieldConfig()` defining columns:
      - Recipient (name/email)
      - Object Type (i18n label derived from workflow key)
      - Channel (delivery channel name)
      - Delivery Status (queued, sent, delivered, bounced) with status badge styling
      - Engagement Status (seen, read, interacted, archived) — may show multiple
      - Timestamp (`inserted_at` formatted)
      - Link (deep link to associated object using `resolveNotificationUrl`, rendered as icon/button, omitted when null)
    - Filter options for Delivery Status, Engagement Status, Object Type, Channel
    - CSV export value formatters for each column
  - Create `packages/web/src/pages/settings/tabs/notifications/Tab.tsx`:
    - Follow settings tab pattern (see `audit/Tab.tsx`)
    - Use `useNotificationHistory` hook for data
    - Use `useGetStatelessTableProps` with the field config for table rendering
    - Wire property filter `onChange` to update server-side filter params
    - Render DateRangeSelector above the table
    - Render ExportButton for CSV export of loaded data
    - Render pagination controls (Next/Previous buttons) below the table, showing "X of Y" count (with "10,000+" when capped)
    - Handle empty state when no notifications match filters
    - Handle loading state
    - Handle error state (Knock API unavailable)
  - Wire the tab into settings:
    - Add `'notifications'` to the `activeTabId` union in `packages/web/src/pages/settings/Page.tsx`
    - Register the tab in `packages/web/src/hooks/useTabs.tsx` with `read:settings` permission, positioned after the Audit tab
    - Add route in `packages/web/src/routes/settingRoutes.config.tsx` at `/settings/notifications` wrapped in `ProtectedRoute` with `read:settings`
    - Add `notificationHistoryUrl()` to `packages/web/src/utils/urls.ts`
  - Playwright verification:
    - Navigate to `/settings/notifications`
    - Take screenshot of the tab with table rendered
    - Verify no console errors
    - Check that filter controls render
    - Check that date range selector renders with default "Last 30 days"
- **Tests**: Component tests in `packages/web/src/pages/settings/tabs/notifications/Tab.test.tsx` — tab renders, columns display, filter changes trigger query, CSV export button present, pagination controls render, empty state, loading state, deep links render for valid URLs and omit for null. `packages/web/src/pages/settings/tabs/notifications/useNotificationHistory.test.ts` — filter-to-query mapping, cursor pagination state management, date range defaults.
- **Assigned To**: Frontend Builder
- **Agent Type**: builder
- **Background**: false

### 7. Review Frontend Tab
- **Task ID**: review-frontend-tab
- **Depends On**: build-frontend-tab
- **Description**: Review the frontend settings tab implementation for correctness, UX quality, and spec compliance. Verify:
  - Tab is correctly wired in settings (route, Page.tsx, useTabs.tsx)
  - Permission guard (`read:settings`) is applied at route level
  - Server-side filtering correctly maps property filter tokens to tRPC query params
  - Cursor pagination works (next/prev buttons, cursor state management)
  - Date range selector defaults to 30 days and custom mode works
  - Column definitions match spec (separate delivery/engagement status)
  - Deep links use `resolveNotificationUrl` correctly
  - CSV export works with loaded data
  - Edge cases handled: 10k count cap shows "10,000+", missing recipients show fallback, null deep links omitted
  - i18n: workflow keys have translated labels
  - No console errors in Playwright verification
  - Test coverage is adequate
- **Tests**: N/A
- **Assigned To**: Code Reviewer
- **Agent Type**: reviewer
- **Background**: false

### 8. Integration and Edge Case Tests
- **Task ID**: integration-tests
- **Depends On**: build-frontend-tab, build-trpc-router, build-url-resolver
- **Description**: Write integration and adversarial tests that span the full stack:
  - Read the spec and acceptance criteria first, form expectations independently
  - Read existing builder tests to understand what is already covered
  - Write tests targeting:
    - **Integration**: tRPC router returns data that the frontend hook correctly transforms into table rows
    - **Filter mapping**: Various filter combinations (multiple statuses, date range + channel, etc.) produce correct Knock API params
    - **Pagination edge cases**: First page (no `before` cursor), last page (no `after` cursor), empty result set
    - **URL resolver coverage**: Test every workflow key from `packages/knock/workflows/` directory against the resolver — flag any unmapped keys
    - **Boundary values**: pageSize at min (1) and max (50), date ranges spanning retention limits, total count at 10,000 cap
    - **Malformed data**: Missing recipient fields, null data payloads, unexpected workflow keys, empty engagement_statuses array
    - **Error handling**: Knock API returns 429 (rate limit), 500 (server error), network timeout
- **Tests**: Test files in `packages/trpc/src/routers/frontend/notification-history/integration.test.ts` and `packages/web/src/pages/settings/tabs/notifications/integration.test.ts`
- **Assigned To**: Integration Tester
- **Agent Type**: tester
- **Background**: true

### 9. Final Code Review
- **Task ID**: review-all
- **Depends On**: build-trpc-router, build-url-resolver, build-frontend-tab, integration-tests
- **Description**: Review all code changes for correctness, style, edge cases, and security. Report issues by severity (Critical, Important, Minor). Specifically verify:
  - All acceptance criteria have matching implementations
  - No secrets exposed to frontend
  - Permission checks are consistent
  - Error handling is robust across the stack
  - Code follows existing patterns and conventions
  - Tests cover critical paths
  - i18n labels are properly set up
  - Deep linking resolver handles all workflow keys
- **Assigned To**: Code Reviewer
- **Agent Type**: reviewer
- **Background**: false

### 10. Final Validation
- **Task ID**: validate-all
- **Depends On**: review-all
- **Description**: Run all validation commands, verify every acceptance criterion is met. Check:
  1. Notification History tab available in Settings at `/settings/notifications`
  2. Access restricted to users with `read:settings` permission
  3. Displays notification metadata: recipient, related object type, timestamp, delivery channel, delivery status, engagement status
  4. Filterable by date range, object type, recipient, delivery status, engagement status, channel
  5. Delivery statuses clearly shown
  6. Notification entries link to associated objects where applicable
  7. Filtered notification data exportable to CSV
  8. Respects existing permission and visibility rules
  9. Server-side pagination with cursor-based navigation
- **Assigned To**: Final Validator
- **Agent Type**: validator
- **Background**: false

## Documentation Requirements
- Inline comments on the workflow-key-to-URL resolver explaining the mapping logic
- JSDoc on tRPC procedures documenting input/output schemas and Knock API mapping
- JSDoc on `useNotificationHistory` hook documenting filter and pagination behaviour

## Acceptance Criteria
1. Notification History tab available in Settings at `/settings/notifications`
2. Access restricted to users with `read:settings` permission
3. Displays notification metadata: recipient, related object type, timestamp, delivery channel, delivery status, engagement status
4. Filterable by date range, object type (workflow source), recipient, delivery status, engagement status, channel
5. Delivery statuses clearly shown (queued, sent, delivered, bounced)
6. Notification entries link to associated objects where applicable (using shared resolver)
7. Filtered notification data exportable to CSV (client-side loaded data)
8. Respects existing permission and visibility rules
9. Server-side pagination with cursor-based navigation (next/prev)
10. Configurable date range window with presets (7d, 30d, 90d, custom), defaulting to 30 days
11. Total count shows "10,000+" when Knock cap reached
12. Missing recipients display gracefully (email/ID fallback)
13. All unit and integration tests pass
14. No TypeScript errors, lint passes for modified packages

## Validation Commands
```bash
# Type check and lint
pnpm exec turbo lint --filter=@risksmart-app/trpc
pnpm exec turbo lint --filter=@risksmart-app/web

# Unit tests
pnpm exec turbo test:unit --filter=@risksmart-app/trpc -- src/routers/frontend/notification-history/
pnpm exec turbo test:unit --filter=@risksmart-app/web -- src/utils/notificationUrlResolver.test
pnpm exec turbo test:unit --filter=@risksmart-app/web -- src/pages/settings/tabs/notifications/
```

## Notes
- Knock API uses cursor-based pagination with max 50 items per page and total_count capped at 10,000
- Knock message data retention is plan-dependent — older messages may not be available
- The `@knocklabs/node` SDK is already a dependency at version 0.6.19
- `KNOCK_SECRET_KEY` is already available in the tRPC backend via AWS Secrets Manager
- The workflow-key-to-URL resolver should be designed so it can later replace the per-type handlers in `packages/web/src/components/notifications-list/notification-types/` (future scope, not this ticket)
- Rate limits on Knock message endpoints are Tier 4 (200 req/s) — generous for admin use
