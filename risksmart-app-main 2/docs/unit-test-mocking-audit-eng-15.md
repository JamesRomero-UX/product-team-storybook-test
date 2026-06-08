# Unit Test Mocking Audit — ENG-15

Audit of unit tests across 4 key packages to identify excessive mocking that reduces test value.

## Summary

| Package | Test Files | Files with `vi.mock` | Key Issue |
|---------|-----------|---------------------|-----------|
| `packages/web` | ~230 | 116 (50%) | Boilerplate GraphQL mock tax on every component test |
| `packages/trpc` | 11 | 6 (55%) | Router tests mock entire service layer — test only wiring |
| `packages/external-api` | ~103 | 36 (35%) | Pass-through service tests with dead mock declarations |
| `packages/rest-api` | ~120 | 107 (89%) | Smoke tests that prove nothing; duplicated notifier patterns |

## Cross-Package Anti-Patterns

### 1. "Does calling A call B" tests (all 4 packages)

The most pervasive anti-pattern. Tests mock a dependency, call the subject, then assert the mock was called with certain args. When the subject is a thin pass-through (router calling service, service calling client), this tests implementation wiring, not behaviour.

**Affected areas:**
- `trpc`: All 5 router test files
- `external-api`: All read-service test files (actions, issues, risks, controls, indicators)
- `rest-api`: Due/overdue notifier tests (4 files)
- `web`: `AIChatSidePanel.test.tsx` asserting props passed to mocked children

### 2. Tests asserting on their own test data

Tests that construct mock data and then assert properties of that same data without ever calling the code under test.

- `rest-api`: `changeRequestNotifier.test.ts` — never calls `handler`, asserts on locally-constructed objects
- `rest-api`: `data.test.ts` — 1,122-line type snapshot that only works at compile time, not runtime

### 3. Locally-copied schemas tested instead of real schemas

- `trpc`: 5 router tests redeclare Zod schemas locally and run `safeParse` on the copy — production schema could break without failing tests

### 4. Duplicated test patterns

- `web`: ~14 `useGetDefaultRibbonFilters.test.ts` files testing the same pattern per domain
- `web`: 2 files with near-identical 40-60 line i18n taxonomy mocks
- `rest-api`: 4 due/overdue notifier files with identical 180-line setups
- `external-api`: ~15 transformer tests all mocking `utils/transforms` with a re-implementation of the real function

---

## Package: `packages/web`

### Statistics
- ~230 test files, ~110 mock data files in `testing/mock-data/`
- Every connected component test requires 7-12 baseline GraphQL mocks (org, users, groups, roles, modules, tags, departments)

### Top Offenders

| File | Lines | Issue |
|------|-------|-------|
| `ActivityUpdateTab.test.tsx` | 875 | 700+ lines of copy-pasted inline GraphQL objects for 10 tests checking text strings |
| `useChatMessaging.test.ts` | 502 | 18 mock functions on store; tests internal callback wiring |
| `AIChatSidePanel.test.tsx` | 291 | 6 `vi.mock` calls; tests that mocked children receive props unchanged |
| `LatestRatingsPreview.test.tsx` | 309 | 40-line inline i18n taxonomy mock duplicated in another file |
| `home/Page.test.tsx` | — | Mocks all children to test a ternary expression |
| `AcceptanceForm.test.tsx` | 70 | 10 mocks + 7 providers for 1 assertion (radio group has 4 buttons) |
| `ChatMessages.test.tsx` | — | Mocks CSS modules and all Cloudscape components; tests `.map()` works |

### What works well
- Mock data factory pattern is well-designed (typed, accepts overrides)
- Pure logic tests (dateUtils, calculateAppetitePerformance, conditionsGraph) are clean and high-value
- `useChatStore.test.ts` tests real Zustand state transitions

### Recommendations
1. **Enforce `defaultMocks` consistently** — ~80 component tests manually list the same 7 baseline mocks
2. **Extract shared i18n taxonomy mock** into `testing/mock-i18n.ts`
3. **Consolidate ~14 `useGetDefaultRibbonFilters` test files** into 1 parameterised test
4. **Refactor `ActivityUpdateTab.test.tsx`** with builder pattern (700 lines -> ~150)
5. **Delete CSS module mocks** — Vitest handles these by default
6. **Eliminate "child mock" tests** for pure routing components (`home/Page.test.tsx`)

---

## Package: `packages/trpc`

### Statistics
- 11 test files total: 5 router tests (all heavily mocked), 6 utility tests (zero mocks, high value)

### Core Problem
All 5 router tests follow the same anti-pattern:
1. Mock `@sentry/node`, `permitio`, and `../../services/frontend/index`
2. Stub entire service object (7-11 `vi.fn()` methods)
3. Assert `mockInsertX` was called with certain args
4. Locally redeclare the Zod input schema and test `safeParse` on the copy

The service layer (`risk.service.ts`, `control.service.ts`, etc.) contains all the real logic — Drizzle queries, permission scoping, HTTP calls to data-layer — and is entirely untested.

### Top Offenders

| File | Mock Count | Issue |
|------|-----------|-------|
| `risk.router.test.ts` | 3 + 7 service methods | Locally-copied schema tested; service method call assertion only |
| `control.router.test.ts` | 3 + 11 service methods | Same pattern, worst stub bloat |
| `appetite.router.test.ts` | 3 + 6 service methods | Copies complex discriminated union schema locally |

### What works well
- `pagination.test.ts` — 60+ test cases, zero mocks, real cursor logic
- `change-requests.test.ts`, `schedule-state.test.ts`, `jwt.test.ts` — pure function tests
- `query.schema.test.ts` — tests the real exported schema (not a copy)

### Recommendations
1. **Delete locally-copied schema blocks** — test validation through the router (`caller.insert(invalidInput)`) as `action.router.test.ts` already does
2. **Collapse "calls service" tests** to 1 smoke test per procedure
3. **Write service-layer tests instead** (high priority net-new) — `risk.service.ts`, `control.service.ts` have untested business logic
4. **Centralise Sentry/permitio mocks** in vitest.setup.ts

---

## Package: `packages/external-api`

### Statistics
- ~103 test files, 36 with `vi.mock` (35%)
- 67 files are clean pure-logic tests (schemas, transformers, utilities)

### Top Offenders

| File | Issue |
|------|-------|
| `risks.service.test.ts` (106 tests) | Mock client with 20+ methods; dead transformer mocks never triggered; 8 sub-resource tests with identical structure |
| `controls.service.test.ts` | Same pattern, dead transformer mock |
| `trpc/client.test.ts` (16 tests) | Mocks the entire subject (`createTRPCClient`); documents a double-slash URL bug as a test |
| `route-wrapper.auth.test.ts` | Mocks all scope functions; tests that middleware calls them in order |
| ~15 transformer tests | Mock `utils/transforms` with re-implementation of the real function |

### What works well
- Schema tests under `schemas/*/` — pure Zod validation, zero mocks
- `middleware/error-handler.middleware.test.ts` — no mocks, tests real handler
- `graphql/client.test.ts` — spies on `globalThis.fetch` (correct boundary)
- `app.test.ts` — integration-style with supertest

### Recommendations
1. **Remove `vi.mock` for transforms in ~15 transformer tests** — mock is functionally identical to real code
2. **Remove dead transformer mocks** in `risks.service.test.ts` and `controls.service.test.ts`
3. **Collapse 8 sub-resource service tests** into a single parameterised test
4. **Delete the double-slash URL bug test** in `trpc/client.test.ts` — fix the bug instead

---

## Package: `packages/rest-api`

### Statistics
- ~120 test files, 107 with `vi.mock` (89%), 419 total `vi.mock` calls
- Average 3.9 mocks per mocked file

### Top Offenders

| File / Pattern | Issue |
|----------------|-------|
| 7 notification smoke tests | Single test per file: pass empty `stub<{}>({})`, assert it throws. Tests nothing. |
| `changeRequestNotifier.test.ts` | Never calls `handler`; asserts only on locally-constructed mock data |
| `data.test.ts` (1,122 lines) | Type snapshot masquerading as runtime test; all assertions trivially true |
| 4 due/overdue notifier tests | Identical 180-line setups testing a single feature-flag branch |

### What works well
- `riskComparator.test.ts`, `filters.test.ts` — pure logic, no mocks
- `deleteKnockUser.test.ts`, `identifyKnockUser.test.ts` — mock only external SDK, test real retry logic
- `processGenericPermitEntity.test.ts` — mock only one external utility
- `updateStatus.test.ts` — table-driven state transition tests

### Recommendations
1. **Delete 7 smoke-only notifier tests** — they verify nothing useful
2. **Fix `changeRequestNotifier.test.ts`** — make it actually call the handler
3. **Move `data.test.ts`** to type-check-only (not in test suite)
4. **Consolidate 4 due/overdue notifier tests** into one parameterised test

---

## Patterns for Improving Test Utility Helpers (feeds into ENG-24/25)

### Current state
- `packages/web/src/testing/wrapper.tsx` — composable provider wrapper with string-based provider selection
- `packages/web/src/testing/mock-data/` — well-typed GraphQL mock factories
- `packages/web/src/testing/formHelpers.tsx`, `tableHelpers.tsx` — form/table interaction helpers
- `packages/trpc` — no shared test utilities
- `packages/rest-api` — `stub<T>()` utility for partial object construction

### Gaps to fill
1. **Shared mock centralisation** — Sentry, permitio, i18n should be in vitest setup files, not repeated per test
2. **Builder patterns** — web needs entity builders (risk, control, obligation) to replace inline GraphQL object construction
3. **tRPC test helpers** — service-layer tests need a mock Drizzle client factory and mock data-layer HTTP client
4. **Parameterised test factories** — for the many "same test, different entity type" patterns across all packages
