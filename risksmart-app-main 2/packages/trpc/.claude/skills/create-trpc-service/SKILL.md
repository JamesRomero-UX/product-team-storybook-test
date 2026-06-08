---
name: create-trpc-service
description: Create a new frontend tRPC service implementation that uses the data-layer API client pattern
argument-hint: <EntityName> [methods]
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

# Create Frontend tRPC Service

## Required Inputs

- **EntityName**: The entity name in PascalCase
  (e.g., `Action`, `ThirdParty`, `InternalAuditReport`).
  Used for the class name (`{EntityName}ServiceImpl`),
  the interface name (`{EntityName}Service`), and
  the factory function name (`create{EntityName}Service`).
- **methods** (optional): Comma-separated list of
  method patterns to generate. Defaults to
  `getById,getRegister`. Valid values:
  `getById`, `getRegister`, `getByParentId`,
  `insert`, `delete`, `update`.

## Input Validation

1. Check that **EntityName** is provided and is in
   PascalCase. If missing, STOP and tell the user:
   "Please provide the entity name in PascalCase
   (e.g., Action, ThirdParty, InternalAuditReport)."
2. If **methods** is provided, validate each comma-separated
   value is one of: `getById`, `getRegister`,
   `getByParentId`, `insert`, `delete`, `update`.
   If invalid, STOP and report the invalid method type.

## Reference Files

These are the canonical production files that define the
correct patterns. Read them before generating any code:

- **Read operations reference** (getById, getRegister, getByParentId, delete with executeAsyncRequest):
  `packages/trpc/src/services/frontend/action.service.ts`
- **Mutation operations reference** (create, update, delete with executeAsyncRequest):
  `packages/trpc/src/services/frontend/form-configuration.service.ts`
- **Service interface definitions**:
  `packages/trpc/src/services/service.types.ts`
- **Service registration/index**:
  `packages/trpc/src/services/frontend/index.ts`
- **Data-layer API client** (available methods):
  `packages/trpc/src/clients/data-layer-api-client.ts`
- **Client utilities** (toApiContext):
  `packages/trpc/src/clients/client-utils.ts`
- **Async request helper** (executeAsyncRequest):
  `packages/trpc/src/clients/async-request.ts`
- **Error mapping** (mapHttpStatusToTRPCError):
  `packages/trpc/src/utils/error-mapping.ts`

## Steps

### Step 1: Derive naming conventions

From the EntityName, derive:

- **kebab-case**: Insert hyphens before uppercase letters
  and lowercase (e.g., `ThirdParty` becomes
  `third-party`, `InternalAuditReport` becomes
  `internal-audit-report`).
- **camelCase**: Lowercase the first letter (e.g.,
  `ThirdParty` becomes `thirdParty`).
- **Service file path**:
  `packages/trpc/src/services/frontend/{kebab-case}.service.ts`
- **Class name**: `{EntityName}ServiceImpl`
- **Interface name**: `{EntityName}Service`
- **Factory function**: `create{EntityName}Service`

Check if the service file already exists. If it does,
STOP and inform the user. Ask whether they want to add
methods to the existing file instead.

### Step 2: Read reference files

Only read the reference files relevant to the methods
being generated:

- If generating **read methods** (getById, getRegister,
  getByParentId): Read
  `packages/trpc/src/services/frontend/action.service.ts`
- If generating **mutation methods** (insert, update,
  delete): Read
  `packages/trpc/src/services/frontend/form-configuration.service.ts`
- Always read
  `packages/trpc/src/services/frontend/index.ts`
  for service registration.

### Step 3: Verify the service interface exists

Read `packages/trpc/src/services/service.types.ts` and
look for `export interface {EntityName}Service`. Note
the methods defined on the interface — these are the
methods the implementation must provide.

If the interface does not exist, STOP and tell the user
they need to add the interface to `service.types.ts`
first. List what methods they plan to implement so the
interface can be created.

### Step 4: Verify data-layer API client methods exist

Read
`packages/trpc/src/clients/data-layer-api-client.ts`
and identify the client methods that correspond to each
service method being implemented.

For example, if the service needs `getById`, look for a
matching `dataLayerApiClient.get{EntityName}ById`
method.

If any required client method is missing, STOP and tell
the user which data-layer API client methods need to
be added first.

### Step 5: Create the service implementation file

Create the file at the path from Step 1.

Follow the exact patterns from the reference files read
in Step 2:

- **For read methods** (getById, getRegister,
  getByParentId): Follow the pattern in
  `action.service.ts`. Key conventions:
  - Destructure `{ data, status }` from the API client call
  - Pass `toApiContext(ctx)` as the first argument
  - Check `if (status >= 400)` and throw `mapHttpStatusToTRPCError`
  - Provide meaningful 404 messages in the overrides object
  - For register endpoints, return `{ {entityName}: data.data }` (see `getActionsRegister`)
  - For byParentId endpoints, return `data.data`

- **For mutation methods** (insert, update, delete):
  Follow the pattern in
  `form-configuration.service.ts`. Key conventions:
  - Use `executeAsyncRequest` helper
  - `requestType` must be a valid `CommandTypeNames` string
  - `buildRequestBody` maps input fields to the request payload
  - `apiCall` calls the data layer client with `toApiContext(ctx)`, input, and correlationId
  - For deletes, set `successStatus: 204`
  - For creates, the default `successStatus` is 201 (no need to specify)
  - For updates, set `successStatus: 200`
  - Provide relevant `errorMessages` overrides

- **Relationship fields in `buildRequestBody`**: If the
  entity supports owners, owner groups, contributors,
  contributor groups, tags, or departments, these arrays
  MUST be included in `buildRequestBody` with `?? []`
  defaults. Omitting them causes silent data loss — the
  data-layer will receive empty arrays and skip the
  relationship inserts. Use this pattern:
  ```typescript
  buildRequestBody: (input) => ({
    // ... scalar fields
    OwnerUserIds: input.OwnerUserIds ?? [],
    OwnerGroupIds: input.OwnerGroupIds ?? [],
    ContributorUserIds: input.ContributorUserIds ?? [],
    ContributorGroupIds: input.ContributorGroupIds ?? [],
    TagTypeIds: input.TagTypeIds ?? [],
    DepartmentTypeIds: input.DepartmentTypeIds ?? [],
  }),
  ```
  Only include the arrays that the entity and its
  `Create{Entity}Request` type define.

CRITICAL: Do NOT follow the old deprecated pattern seen
in other service files that use:

- `createDrizzleClient(ctx)` — NEVER import or use
- `db.org((tx) => tx.query.*.findMany(...))` — NEVER
  use direct Drizzle queries
- `filter()` from `@risksmart-app/permitio` — NEVER
  import or use
- Query configs from `../../queries/index` — NEVER
  import (those are for the old pattern)

### Step 6: Register the service in the index file

Read `packages/trpc/src/services/frontend/index.ts`
and add:

1. The type import for the service interface, inserted
   alphabetically in the existing type import block
   from `'../service.types'`
2. The implementation import, inserted alphabetically
   among the existing implementation imports
3. The factory function, following the same pattern as
   the existing factory functions in the file

## Verification

1. **File exists**: The service file was created at
   `packages/trpc/src/services/frontend/{kebab-case}.service.ts`
2. **No Drizzle imports**: The file does NOT contain
   any of these imports:
   - `createDrizzleClient`
   - `@risksmart-app/drizzle`
   - `@risksmart-app/permitio`
   - `../../queries/`
3. **Uses data-layer API client**: The file imports
   `dataLayerApiClient` from
   `'../../clients/data-layer-api-client'`
4. **Uses toApiContext**: Every method that calls the
   data layer client passes `toApiContext(ctx)` as the
   first argument
5. **Error handling**: Every read method checks
   `if (status >= 400)` and throws
   `mapHttpStatusToTRPCError(status, data, ...)`
6. **Mutations use executeAsyncRequest**: Every
   insert/update/delete method uses
   `executeAsyncRequest` rather than calling the API
   client directly
7. **Implements interface**: The class declares
   `implements {EntityName}Service` and provides all
   methods defined on the interface
8. **Registered in index**: The factory function
   `create{EntityName}Service` is exported from
   `packages/trpc/src/services/frontend/index.ts`
9. **No type casting**: The file contains zero
   instances of `as` type casting or `!` non-null assertions
