# tRPC API Tests Agent Memory

## Key patterns confirmed

### Mutation insert tests — structure
- Add `insert` tests as a nested `describe('insert', ...)` block inside the existing entity describe block
- Use `beforeEach` (not `beforeAll`) with `createTestContext` inside the describe block
- Declare context as `let context: Awaited<ReturnType<typeof createTestContext>>`
- Reference: `packages/trpc-api-tests/src/tests/frontend/action.test.ts` (insert section) and `risk.test.ts`

### Frontend test structure
- Use `createTestContext` in `beforeEach` (from `src/utils/test-context`)
- Store as `let context: Awaited<ReturnType<typeof createTestContext>>`
- Destructure `{ orgKey, userId, trpcClient }` per test
- Follow `risk.test.ts` as canonical reference for insert mutations

### Invalid UUID cast pattern
For rejection tests with invalid UUID, cast the string:
```typescript
ParentId: 'not-a-uuid' as `${string}-${string}-${string}-${string}-${string}`
```

### Existing tests must be preserved
When adding tests to an existing file, always read the full file first and preserve all existing tests. Only append the new `describe` block.

### Lint vs tsc
- `lint` script only runs ESLint (`eslint . --max-warnings 0`)
- `tsc` script runs `tsc --noEmit`
- Both must pass. Run both to verify.
- `skipLibCheck: true` is set — workspace package types from built `.d.ts` files

### Test file location
`packages/trpc-api-tests/src/tests/frontend/{entity}.test.ts`

### Import paths
- Entity-specific types from `@risksmart-app/domain/src/types/consts/{type-file}`
- `build{Entity}`, `insert{Entity}` from `@risksmart-app/test-data`
- `createTestContext` from `src/utils/test-context`
- vitest: named imports `{ beforeEach, describe, expect, it }`

### Issue entity specifics
- `buildIssue(orgKey, userId)` — positional args (not object), no overrides wrapper
- `insertIssue` — direct insert client
- Issue router required fields for insert: `Title`, `DateOccurred`, `DateIdentified`, `Type`
- `Type` accepts issue type strings e.g. `'issue'`, `'issue_breach_log'`, etc. (see `IssueTypeArray`)
- Service method `insertIssue` exists in `IssueServiceImpl` but the router `insert` procedure must be added separately

### Obligation entity specifics
- `ObligationType` from `@risksmart-app/domain/src/types/consts/obligation-type`
- `buildObligation`, `insertObligation` from `@risksmart-app/test-data`
- `getById` query returns array; check `obligations[0]?.owners`, `obligations[0]?.contributors`
- Router path: `trpcClient.frontend.obligation.insert.mutate(...)` and `trpcClient.frontend.obligation.getById.query({ id })`

### Rejection tests with incomplete discriminated union objects
Use `JSON.parse(JSON.stringify({...})) as Parameters<typeof trpcClient.frontend.X.insert.mutate>[0]`
to bypass TypeScript's type system when passing invalid/incomplete inputs for rejection tests.
Do NOT use `as any` — it triggers `no-explicit-any` AND `no-unsafe-argument` lint warnings.
```typescript
const invalidInput = JSON.parse(
  JSON.stringify({ AppetiteType: AppetiteType.Impact, ParentIds: [...] })
) as Parameters<typeof trpcClient.frontend.appetite.insert.mutate>[0];
await expect(trpcClient.frontend.appetite.insert.mutate(invalidInput)).rejects.toThrow();
```

### Cause entity specifics
- No `buildCause`/`insertCause` existed — created them in `packages/test-data/src/builders/cause.ts` and `clients/causeClient.ts`
- `buildCause({ orgKey, userId, parentIssueId, overrides? })` — uses object arg syntax (not positional like `buildIssue`)
- Cause requires a parent issue: `buildIssue(orgKey, userId)` then `await insertIssue(parentIssue)` before inserting a cause
- Cause `updateCause` service returns `Promise<void>` (not `{ Id: string }`) — do NOT assert `response.Id` after update
- Use `getById` query after update to verify fields changed
- Cause delete input uses uppercase `Ids` (not `ids`) — schema: `z.object({ Ids: z.array(z.string().uuid()).min(1).max(200) })`
- `deleteCauses` also returns `void` (204) which serializes to `''` at the tRPC boundary
- Cause update `OriginalTimestamp` pattern: insert via builder/client, use `new Date(insertedCause.ModifiedAtTimestamp).toISOString()`
- Router already had all procedures (`insert`, `update`, `delete`) but the test file was missing
- Cause has FK constraint: `cause.Id` → `node.Id` (DB trigger handles this automatically, no manual node insertion needed)

### Consequence entity specifics
- No builder/inserter existed — created `packages/test-data/src/builders/consequence.ts` and `clients/consequenceClient.ts`
- `buildConsequence({ orgKey, userId, parentIssueId, overrides? })` — object arg syntax, same as cause
- Requires a parent issue: `buildIssue(orgKey, userId)` then `await insertIssue(parentIssue)` before inserting
- `CostType` is a TypeScript enum (NOT `as const`) — must use `CostType.Financial` from `@risksmart-app/domain/src/types/consts/cost-type`, not the string literal `'financial'` in the builder
- `CostValue` is `numericCasted` which has `data: number` — use number (e.g. `100`), not string in builder
- Router path: `trpcClient.frontend.consequence` with procedures `insert`, `update`, `delete`
- Read-back for update uses `consequenceById` (not `getById`) — takes `{ id: string }` and returns array
- Delete returns `''` at the tRPC boundary (same pattern as cause), despite data-layer returning `{ deletedCount: number }`
- Router already had all procedures when tests were created

### data-layer-api-client input types
All `create*` methods in `packages/trpc/src/clients/data-layer-api-client.ts` should use
specific request types (e.g., `CreateAppetiteRequest`), NOT `Record<string, unknown>`.
Using `Record<string, unknown>` causes TS2345 errors in downstream consumers.
If a new entity's method uses `Record<string, unknown>`, fix it by:
1. Adding `Create{Entity}Request` to the import from `@risksmart-app/events/src/types/request-types`
2. Changing the method signature's `input` param type to `Create{Entity}Request`
