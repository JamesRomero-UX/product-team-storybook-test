---
name: create-trpc-api-test
description: Creates an integration test file for a tRPC procedure in the trpc-api-tests package. Use when adding API tests for new or existing tRPC router procedures (queries or mutations) on either the frontend or backend namespace.
argument-hint: <entity-name> <procedure-name> [frontend|backend]
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
---

## Required Arguments

- `$1` - Entity name in kebab-case (e.g. `risk`,
  `action`, `enterprise-risk`, `form-configuration`).
  Maps to the router name in the tRPC router tree.
- `$2` - Procedure name to test (e.g. `register`,
  `actionById`, `riskScoresByRiskId`). Use `all` to
  create tests for every procedure on the router.
- `$3` - Namespace: `frontend` or `backend`.
  Defaults to `frontend` if omitted.

## Argument Validation

Check that `$1` (entity name) and `$2` (procedure name)
are provided. If either is missing, STOP and tell the
user:

> Please provide the entity name and procedure name.
> Example: `risk riskScoresByRiskId frontend`
> Use `all` as the procedure name to test every
> procedure on the router.

Validate that `$3`, if provided, is either `frontend`
or `backend`. If invalid, STOP and report the error.

## Prerequisites: Verify Docker Environment

Before doing anything else, verify that Docker is running:

```bash
docker ps
```

If Docker is NOT running or the command fails, STOP and
tell the user:

> Docker is not running. Please start Docker Desktop
> and try again.

Next, ensure the test environment services are up:

```bash
pnpm run trpc:docker:build
pnpm run docker:compose:mock-auth-provider
pnpm run docker:compose:stub-pdp
```

If any of these commands fail, STOP and tell the user:

> Failed to build/start Docker services. Ensure Docker
> is running and has sufficient resources.

## Steps

### 1. Identify the router and its procedures

Read the tRPC router file for the target entity to
understand what procedures exist and their input/output
shapes.

- **Frontend routers** live at:
  `packages/trpc/src/routers/frontend/{entity}.router.ts`
- **Backend routers** live at:
  `packages/trpc/src/routers/backend/{entity}.router.ts`

Read the router file. For each procedure to be tested,
note:

- Whether it is a `query` or `mutation`
- Its input schema (Zod validation)
- Which service method it calls

If the procedure calls a service, read the service file
to understand what data it returns. Service files live
at:

- `packages/trpc/src/services/frontend/{entity}.service.ts`
- `packages/trpc/src/services/backend/{entity}.service.ts`

### 2. Check for existing tests

Search for an existing test file at:

- `packages/trpc-api-tests/src/tests/frontend/{entity}.test.ts`
- `packages/trpc-api-tests/src/tests/backend/{entity}.test.ts`

If a test file already exists for this entity and
namespace, read it to understand which procedures are
already covered. Add new test cases to the existing
file rather than creating a duplicate.

### 3. Find test-data builders and inserters

Search the test-data package for builders and inserters
for the target entity.

Use Grep to search in `packages/test-data/src/` for:

- `build{EntityPascalCase}` (e.g. `buildRisk`)
- `insert{EntityPascalCase}` (e.g. `insertRisk`)

Read the builder file to understand:

- Required parameters (`orgKey`, `userId`, etc.)
- Available `overrides` fields
- What the builder returns (which fields are generated)

Read the inserter file to understand:

- What it returns after insertion
- Any fields that get stripped (like `Meta`, `OrgKey`)

Reference these existing builder/inserter files:

- `packages/test-data/src/builders/` - all builders
- `packages/test-data/src/clients/` - all inserters

If a builder does not exist for the entity, create one
at `packages/test-data/src/builders/{entity}.ts`.
Read an existing builder in that directory for the
pattern. The builder should:

- Accept `orgKey` and `userId` parameters
- Generate a UUID for `Id`
- Return an object matching the Drizzle table type
- Include all required fields with sensible defaults

If an inserter does not exist for the entity, create
one at `packages/test-data/src/clients/{entity}Client.ts`.
Read an existing client in that directory for the
pattern. The inserter should:

- Import `db` from `@risksmart-app/drizzle/src/db.js`
- Import the table from the Drizzle schema
- Provide an `insert{Entity}` function that inserts a
  record using `db().insert(table).values(object)`
- Optionally provide a `delete{Entity}ById` function

### 4. Determine test setup pattern

There are two distinct patterns based on namespace:

**Frontend tests** use `createTestContext` which
creates a fresh org, user, and tRPC client per test.
Reference:

- `packages/trpc-api-tests/src/utils/test-context.ts`

Frontend tests insert their own test data using
builders and inserters from `@risksmart-app/test-data`.

**Backend tests** use a hardcoded org key
(`org_Qshp7tYsxxAWwhVa`) with a pre-seeded database
and external-api scoped tokens. Reference:

- `packages/trpc-api-tests/src/tests/backend/actions.test.ts`

### 5. Write the test file

Create the test file at:

```text
packages/trpc-api-tests/src/tests/{namespace}/{entity}.test.ts
```

#### Frontend test structure

Follow the pattern established in these reference files,
choosing the closest match for the entity type:

- **Register + getById queries**:
  `packages/trpc-api-tests/src/tests/frontend/issue.test.ts`
- **Queries with complex relations**:
  `packages/trpc-api-tests/src/tests/frontend/risk.test.ts`
- **Queries with linked entities**:
  `packages/trpc-api-tests/src/tests/frontend/linked-item.test.ts`
- **Mutations (insert/update/delete)**:
  `packages/trpc-api-tests/src/tests/frontend/action.test.ts`
- **Form configuration CRUD**:
  `packages/trpc-api-tests/src/tests/frontend/form-configuration.test.ts`

Key patterns for frontend tests:

- Use `createTestContext` in `beforeEach` to get a
  fresh `orgKey`, `userId`, and `trpcClient`
- Store context as
  `let context: Awaited<ReturnType<typeof createTestContext>>`
- Destructure `{ orgKey, userId, trpcClient }` from
  context at the start of each test
- Build test data with `build{Entity}({ orgKey, userId })`
- Insert test data with `insert{Entity}(builtData)`
- Destructure `Meta` and `OrgKey` out when comparing
  inserted data to query responses (these fields are
  not returned by queries)
- Call procedures via
  `trpcClient.frontend.{routerName}.{procedure}.query()`
  or `.mutate()`
- Use `expect.objectContaining()` for partial matches
- Use `expect.arrayContaining()` for list responses
- Test edge cases: empty results, non-existent IDs

#### Backend test structure

Follow the pattern in these reference files:

- **List + byId + pagination**:
  `packages/trpc-api-tests/src/tests/backend/controls.test.ts`
- **List with linked sub-resources**:
  `packages/trpc-api-tests/src/tests/backend/risks.test.ts`
- **Linked items with datetime pagination**:
  `packages/trpc-api-tests/src/tests/backend/linked-items.test.ts`

Key patterns for backend tests:

- Use `beforeAll` (not `beforeEach`) to set up the
  client once with a scoped token
- Use hardcoded org key `org_Qshp7tYsxxAWwhVa`
- Generate token with `generateTestToken` using the
  appropriate scope (e.g. `read:risks`) and
  `source_service: 'external-api'`
- Call procedures via
  `trpcClient.backend.v1.{routerName}.{procedure}.query()`
- Test pagination: `limit`, `afterSequentialId`,
  `beforeSequentialId`
- Test page metadata: `hasNext`, `hasPrev`, `nextId`,
  `prevId`, `count`
- Test round-trip pagination (forward then backward)
- Test boundary conditions (afterId beyond max,
  beforeId at minimum)
- Test validation errors using `TRPCClientError`

### 6. Write test cases for each procedure

For each procedure being tested, include these
categories of test cases:

**For queries (both namespaces):**

- Happy path: returns expected data with valid input
- Empty result: returns empty array or null for
  non-existent IDs
- Data shape: verify response contains expected fields

**For frontend queries specifically:**

- Isolation: data from one org is not visible to
  another (inherent via `createTestContext` creating
  fresh orgs)
- Relations: verify nested/related data is populated
  correctly

**For backend queries specifically:**

- Pagination: limit, afterSequentialId,
  beforeSequentialId
- Page metadata: hasNext, hasPrev, nextId, prevId
- Round-trip pagination: forward then backward
- Boundary conditions: cursor beyond max/min

**For mutations:**

- Insert: verify response contains an `Id`
- Update: verify updated fields match
- Delete: verify returns empty string on success
- Validation: reject invalid input (empty arrays,
  bad UUIDs)

**For mutations with relationship fields (owners,
contributors, tags, departments):**

If the mutation accepts any of `OwnerUserIds`,
`OwnerGroupIds`, `ContributorUserIds`,
`ContributorGroupIds`, `TagTypeIds`, or
`DepartmentTypeIds`, include ALL of these relationship
persistence test cases. Use `risk.test.ts` as the
canonical reference.

- **Owner persistence** — pass `OwnerUserIds: [userId]`,
  then read back via `{entity}ById` query and assert
  `owners` array has length 1 with matching `UserId`
- **Owner group persistence** — seed a user group using
  `buildUserGroup`/`insertUserGroup`, pass
  `OwnerGroupIds: [groupId]`, read back and assert
  `ownerGroups` array has length 1 with matching
  `UserGroupId`
- **Contributor persistence** — pass
  `ContributorUserIds: [userId]`, read back and assert
  `contributors` array has length 1 with matching
  `UserId`
- **Contributor group persistence** — seed a user group,
  pass `ContributorGroupIds: [groupId]`, read back and
  assert `contributorGroups` array has length 1 with
  matching `UserGroupId`
- **Tag persistence** — seed a tag type using
  `buildTagType`/`insertTagType`, pass
  `TagTypeIds: [tagTypeId]`, read back and assert
  `tags` array has length 1 with matching `TagTypeId`
- **Department persistence** — seed a department type
  using `buildDepartmentType`/`insertDepartmentType`,
  pass `DepartmentTypeIds: [departmentTypeId]`, read
  back and assert `departments` array has length 1 with
  matching `DepartmentTypeId`
- **Multiple owners and contributors together** — pass
  both `OwnerUserIds` and `ContributorUserIds`, read
  back and assert both arrays are populated
- **Empty relationship arrays** — pass all six arrays
  as `[]`, read back and assert all relationship arrays
  have length 0

Pattern for read-back verification:
```typescript
const result = await trpcClient.frontend.{entity}.getById.query({
  id: response.Id,
});
expect(result).toHaveLength(1);
expect(result[0]?.owners).toHaveLength(1);
expect(result[0]?.owners[0]?.UserId).toBe(userId);
```

For tags and departments, seed the reference data first:
```typescript
const tagType = await insertTagType(
  buildTagType(orgKey, userId, { Name: 'Test Tag' })
);
// ... pass tagType!.TagTypeId in TagTypeIds array
```

### 7. Run the tests

Run the test file to verify tests pass:

```bash
pnpm --filter @risksmart-app/trpc-api-tests test {testFile}
```

If tests fail, investigate and fix. See Error Recovery
below for common failure causes.

## Critical: Foreign Key Constraints in Test Data

Many fields in the database have foreign key constraints
that require values to reference existing records. **Never
use hardcoded strings** (e.g., `'user@example.com'`) for
fields that have FK constraints. Instead, use values from
the test context or seed the referenced record first.

Common FK-constrained fields:

- **`CompletedByUser`** → references `user.Id` table.
  Use `context.userId`, NOT a string like
  `'user@example.com'`.
- **`CreatedByUser`** / **`ModifiedByUser`** → references
  `user.Id`. Use `context.userId`.
- **`OriginatingItemId`** → references `node.Id`. Must
  insert a parent record first and use its ID.
- **`ParentId`** / **`ParentRiskId`** → references
  `node.Id`. Must insert a parent record first.

**How to check:** If a field name ends in `Id`, `User`,
`ByUser`, or references another entity, assume it has a FK
constraint. Use test context values (`userId`, `orgKey`)
or seed the referenced record with a test-data builder.

Example — WRONG:
```typescript
CompletedByUser: 'user@example.com',  // FK violation!
```

Example — CORRECT:
```typescript
const { userId } = context;
CompletedByUser: userId,  // valid FK reference
```

## Error Recovery

**If test fails with FK constraint violation:**

- Check the Drizzle schema (`packages/drizzle/src/schema.ts`)
  for `foreignKey()` definitions on the table
- Replace hardcoded strings with `context.userId`,
  `context.orgKey`, or a seeded record's ID

**If builder/inserter doesn't exist:**

- Create them following the patterns in the existing
  builder/client directories (see Step 3)
- Read an existing file in the same directory for
  reference

**If test fails with schema mismatch:**

- Check the Drizzle schema for required fields
- Update the builder to include all required fields

**If test fails with empty response:**

- Verify the insert is using the correct `OrgKey`
- Check permission filtering in the service layer

**If imports fail:**

- Check existing clients/builders for import patterns
- Verify file paths match the conventions in
  `packages/test-data/src/`

## Verification

Before reporting completion, confirm every item:

- [ ] Test file exists at the correct path under
  `packages/trpc-api-tests/src/tests/{namespace}/`
- [ ] File name matches the entity in kebab-case
  with `.test.ts` extension
- [ ] Imports use the correct paths:
  `src/utils/test-context` or `src/utils/test-auth`
  (or relative `../../utils/` equivalent)
- [ ] Frontend tests use `createTestContext` in
  `beforeEach` (not `beforeAll`)
- [ ] Backend tests use `beforeAll` with
  `generateTestToken` and hardcoded org key
- [ ] All vitest imports (`describe`, `expect`, `it`,
  `beforeAll`/`beforeEach`) are explicit named imports
- [ ] Test data builders/inserters are imported from
  `@risksmart-app/test-data`
- [ ] tRPC procedure calls use the correct namespace
  path (e.g. `trpcClient.frontend.{router}.{proc}`)
- [ ] Each procedure under test has at least a happy
  path test and an edge case test
- [ ] For mutations with relationship fields: all 8
  relationship persistence test cases are present
  (owner, owner group, contributor, contributor group,
  tag, department, multiple together, empty arrays)
- [ ] Relationship tests read back via `{entity}ById`
  query and assert on nested arrays (not just insert
  response)
- [ ] Tests run and pass
