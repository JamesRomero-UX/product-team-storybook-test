---
name: create-processor-unit-test
description: Create a vitest unit test for a data layer processor (create, update, delete) in services/data-layer/src/handlers/http/client/processors/{object}/
argument-hint: <object-name> <operation>
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
---

## Required Inputs

- **objectName**: Kebab-case directory name under
  `processors/` (e.g. `control-groups`, `form-fields`,
  `action-updates`).
- **operation**: Operation to test (e.g. `create`,
  `delete`, `update`).

## Input Validation

Check that both **objectName** and **operation** are
provided. If either is missing, STOP and tell the user:

> Please provide the object name in kebab-case and the
> operation (e.g. `control-groups delete`).

Then verify the source processor file exists at
`services/data-layer/src/handlers/http/client/processors/{objectName}/{operation}.ts`.
If it does not exist, STOP and report:

> Processor file not found at
> `services/data-layer/src/handlers/http/client/processors/{objectName}/{operation}.ts`.
> Create the processor first before writing its test.

## Steps

### 1. Read the processor under test

Read the processor file at:

```text
services/data-layer/src/handlers/http/client/processors/{objectName}/{operation}.ts
```

Identify:

- The `createProcessor` function signature and its
  `ProcessorDependencies` interface (or inline deps type)
- The processor's input shape (`payload`, `context`, `body`,
  `id`, etc.)
- Repository methods called and their return types
- External package functions called (e.g. orchestrator
  functions from `@risksmart-app/form-configuration`)
- Error classes used (`NotFound`, `BadRequest`,
  `FormFieldOperationError`, etc.)
- What the processor returns on success

### 2. Identify which modules need mocking

Scan the processor's imports for modules with side effects
at import time. At minimum, every processor test needs:

```text
vi.mock('../../../../../clients/permit/constants', () => ({
  pdpEndpoint: 'http://mock-pdp',
}));
```

Determine if additional mocks are needed by checking
the processor's imports. Common candidates:

- **Logger** - if the processor calls `getLogger()` at
  module level, mock `../../../../../utils/logger`
- **External orchestrator functions** - if the processor
  imports from packages like
  `@risksmart-app/form-configuration`, mock those modules
  and provide `vi.fn()` stubs for each function plus
  mock class implementations for error classes
- **Database client** - if the processor imports
  `getDatabaseConnection` at module level, mock
  `../../../../../repositories/db-client`
- **Repository factory** - if the processor imports a
  `create*Repository` function at module level, mock that
  repository module
- **Permit client** - if the processor imports from
  `../../../../../clients/permit`, mock it
- **Event producers** - if the processor imports from
  `../../../../../events/producers/data-event-producers`,
  mock it

Use reference tests to see exactly how each mock is
structured:

- Simple processor (few mocks):
  `services/data-layer/src/handlers/http/client/processors/control-groups/delete.test.ts`
- Complex processor (many mocks, dynamic import):
  `services/data-layer/src/handlers/http/client/processors/action-updates/create.test.ts`
- Orchestrator-dependent processor:
  `services/data-layer/src/handlers/http/client/processors/form-fields/delete.test.ts`

### 3. Determine import strategy

Check whether the processor file has side-effect imports
that execute at module load time (e.g. `getLogger()` called
at top level, repository factories called at top level).

- **If YES**: All `vi.mock()` calls MUST come BEFORE the
  processor import. Place the import of `createProcessor`
  after all mocks with a `// Import after mocks` comment.
  See reference:
  `services/data-layer/src/handlers/http/client/processors/action-updates/create.test.ts`
  (lines 5-36)

- **If NO**: Import `createProcessor` at the top alongside
  vitest imports and type imports. Place `vi.mock()` calls
  after imports. See reference:
  `services/data-layer/src/handlers/http/client/processors/form-fields/delete.test.ts`
  (lines 1-11)

Note: type-only imports (`import type { ... }`) are always
safe at the top regardless of mock ordering because they
are erased at compile time.

### 4. Build mock data fixtures

Create mock fixtures outside the `describe` block:

- **Mock payload**: Typed against the request schema type
  (e.g. `DeleteFormFieldRequest`,
  `CreateControlGroupRequest`). Include all required fields
  with realistic test values.
- **Mock context**: Use the `ServiceContext` type from
  `../../../../types/service-context`. Standard shape:

  ```text
  { tenant: 'tenant-1', orgKey: 'org-1',
    userId: 'user-1', correlationId: 'corr-1' }
  ```

- **Mock repository**: Create `vi.fn()` mocks for each
  repository method the processor calls. Type them against
  the repository interface. Two patterns exist:
  - Direct typed mock:
    `const mockInsert = vi.fn<Repository['insert']>();`
  - Composed mock object:
    `const mockRepo: Repository = { insert: mockInsert };`
- **Mock dependencies**: Build a `ProcessorDependencies`
  object (or equivalent) from the mock repository.

See reference for typing patterns:
`services/data-layer/src/handlers/http/client/processors/control-groups/create.test.ts`
(lines 13-37)
`services/data-layer/src/handlers/http/client/processors/indicator-results/create.test.ts`
(lines 13-33)

### 5. Write the test file

Create the test at:

```text
services/data-layer/src/handlers/http/client/processors/{objectName}/{operation}.test.ts
```

Structure the file in this order:

1. **Vitest imports** (`beforeEach, describe, expect, it,
   vi`) and any error class imports (`NotFound`,
   `BadRequest`)
2. **Type-only imports** (repository types, request types,
   `ServiceContext`)
3. **`vi.mock()` calls** (permit constants is always first)
4. **Processor import** (either at top or after mocks
   depending on Step 3 analysis)
5. **Mock fixtures** (payload, context, repository mocks,
   dependencies)
6. **`describe` block** with `beforeEach(() =>
   vi.clearAllMocks())` and test cases

### 6. Write test cases across four categories

#### Success cases

- Test the happy path: processor returns expected result
- Verify repository methods called with correct arguments
- Verify context fields (userId, orgKey) are propagated
  correctly to repository calls

#### Error cases

- Test repository/dependency rejection (database errors)
  propagate correctly
- Test domain-specific error handling (e.g. `NotFound`
  when 0 rows affected, `BadRequest` for invalid state)
- Test that domain errors are caught and re-wrapped
  when the processor does error translation

#### Context propagation

- Verify `userId`, `orgKey`, and other context fields
  are forwarded to downstream calls
- If the processor passes a `persist` callback to an
  orchestrator, capture it via `mockImplementation` and
  invoke it, then verify the repository received the
  correct user context. See reference:
  `services/data-layer/src/handlers/http/client/processors/form-fields/delete.test.ts`
  (lines 147-189)

#### Edge cases

- Null/undefined handling (e.g. missing schema,
  null `CustomAttributeData`)
- Empty results from repository (e.g. insert returns `[]`)
- Partial operations (e.g. batch delete where some
  IDs are not found)

Not every category will apply to every processor. Write
tests only for behaviors that exist in the processor code.

#### Delete-specific test cases

Delete processors have additional validation logic that
requires targeted test coverage. Two patterns exist in the
codebase — identify which one the processor uses by reading
the processor file.

**Single-ID delete** (repository returns affected row count):

The processor checks if the returned count is 0 and throws
`NotFound`. Tests must cover:

- Success: repository returns 1 (or more) — no error thrown
- Not found: repository returns 0 — throws `NotFound` with
  a descriptive message
- Optimistic locking: if the processor accepts an
  `OriginalTimestamp` in the body and passes it as
  `modifiedAtTimestamp` to the repository, verify the
  argument is forwarded correctly
- Database error: repository rejects — error propagates

See reference:
`services/data-layer/src/handlers/http/client/processors/control-groups/delete.test.ts`
— covers all four cases including optimistic locking
verification.

**Batch delete** (repository returns array of deleted IDs):

The processor checks if the returned array is empty and
throws `NotFound`. Tests must cover:

- Full success: repository returns all requested IDs —
  processor returns the same array
- Total failure: repository returns empty array — throws
  `NotFound` with a message like
  "None of the specified {objects} were found"
- Partial success: repository returns a subset of requested
  IDs — processor returns only the deleted subset (no error)
- Single ID: verify batch logic works for a single-element
  array
- Database error: repository rejects — error propagates

See references:
`services/data-layer/src/handlers/http/client/processors/action-updates/delete.test.ts`
— batch delete with partial success and single ID cases.
`services/data-layer/src/handlers/http/client/processors/issue-updates/delete.test.ts`
— batch delete with a partial delete test that asserts
the processor throws when fewer rows are deleted than
requested (an alternative validation strategy).

### 7. Run the test

Execute:

```bash
cd /Users/lewis/Workspace/RiskSmart/risksmart-app && \
  pnpm exec turbo test:unit \
    --filter=@risksmart-app/data-layer \
    -- src/handlers/http/client/processors/{objectName}/{operation}.test.ts
```

If tests fail, read the error output, fix the test, and
re-run until all tests pass.

## Verification

Before reporting completion, confirm all of the following:

- [ ] Test file exists at
  `services/data-layer/src/handlers/http/client/processors/{objectName}/{operation}.test.ts`
- [ ] `vi.mock('../../../../clients/permit/constants')`
  is present (required for all processor tests)
- [ ] All modules with side effects at import time are
  mocked before any non-type import of the processor
- [ ] `beforeEach(() => vi.clearAllMocks())` is present
  inside the `describe` block
- [ ] At least one success test verifies the return value
- [ ] At least one success test verifies repository method
  arguments
- [ ] At least one error test verifies error propagation
- [ ] All tests pass when run with
  `pnpm exec turbo test:unit --filter=@risksmart-app/data-layer -- src/handlers/http/client/processors/{objectName}/{operation}.test.ts`
- [ ] No type casting (`as`, `<Type>`, non-null assertions
  `!`) is used in the test file -- find type-safe
  alternatives instead
