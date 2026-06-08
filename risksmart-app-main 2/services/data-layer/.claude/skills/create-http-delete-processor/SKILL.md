---
name: create-http-delete-processor
description: Creates an HTTP delete mutation processor for a data layer entity following the two-tier architecture with pure processor function, HTTP entry point, dependency injection, event strategy pattern, and mutation handler builder composition. Includes delete-specific validation for verifying actually deleted IDs.
argument-hint: <entity-name> where entity-name is the kebab-case entity (e.g. action-updates)
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

## Required Inputs

- **entityName**: Kebab-case entity name matching
  the processor directory name
  (e.g. `action-updates`, `control-groups`).

## Input Validation

Check that **entityName** is present.
If missing, STOP and tell the user:

> Please provide the entity name in kebab-case
> (e.g. `action-updates`, `control-groups`).

## Steps

### 1. Derive naming conventions

From the arguments, derive all names needed throughout:

- **directory**: **entityName** (kebab-case, e.g. `action-updates`)
- **processor dir path**:
  `services/data-layer/src/handlers/http/client/processors/{entityName}/`
- **snake_case object name**: convert **entityName**
  from kebab-case to snake_case, singular
  (e.g. `action-updates` -> `action_update`)
- **PascalCase entity**: for naming exports
  (e.g. `action-updates` -> `ActionUpdate`).
  Derived from **entityName**.
- **repository factory**: pattern is
  `create{PascalEntity}Repository`
- **repository type**: `{PascalEntity}Repository`
- **file name**: `delete.ts`
- **exported processor name**: pattern is
  `delete{PascalEntity}Processor`
  (e.g. `deleteActionUpdateProcessor`)
- **schema variable**: pattern is
  `delete{PascalEntity}RequestSchema`

### 2. Research existing patterns for the entity

Read the processor directory to understand what
already exists for this entity.

List the contents of
`services/data-layer/src/handlers/http/client/processors/{entityName}/`.

Check if `delete.ts` already exists. If so,
STOP and report that the processor already exists.

Read any existing processors in the same entity
directory to understand the repository, schema,
and dependency patterns already in use.

### 3. Locate or confirm the repository

Search for the repository the entity uses:

- Glob for
  `services/data-layer/src/repositories/*{entity}*`
- Read the repository file to understand:
  - The factory function name (e.g.
    `createActionUpdateRepository`)
  - The repository type name
  - Available methods (`insert`, `update`,
    `delete`, `deleteMany`, `findById`, `getAll`,
    `getById`, `getByParentId`, etc.)
  - Return types from the methods
  - **Important for delete**: verify that `deleteMany`
    returns the IDs that were actually deleted
    (not void).

If no repository exists, STOP and tell the user
they must create the repository first.

### 4. Locate or confirm the Zod schema

Search for the request validation schema:

- Glob for `services/data-layer/src/schemas/*{entity}*`
- Read the schema file to find the correct schema
  for the delete operation (e.g.
  `deleteActionUpdateRequestSchema`)

If the operation requires a schema that does not
exist yet, STOP and tell the user they must create
the schema first. Alternatively, if the schema is
simple, define it inline in the processor file.
Read the `delete.ts` file under
`services/data-layer/src/handlers/http/client/processors/action-updates/`
and study the inline Zod schema defined before the
processor function for the pattern.

### 5. Determine the event strategy

Decide which event strategy to use:

- **ObjectEventStrategy** (most common): For standard
  CRUD on database entities. Read
  `services/data-layer/src/handlers/http/events/object-event-strategy.ts`
  for the constructor signature and the
  `ObjectStrategyData` type.

- **FormEventStrategy**: Only for form-field
  configuration operations. Read
  `services/data-layer/src/handlers/http/events/form-event-strategy.ts`
  for the constructor and the `FormStrategyData` type.

- **New Domain-Specific Strategy**: If the entity
  belongs to a new event domain (users, user groups,
  reports, etc.) that doesn't fit ObjectEventStrategy,
  create a new strategy class in
  `services/data-layer/src/handlers/http/events/event-strategies.ts`.
  Name it `{Domain}EventStrategy`
  (e.g. `UserEventStrategy`, `ReportEventStrategy`).
  It must implement the `EventStrategy` interface with
  `validateContext`, `extractEventData`,
  `emitSuccessEvent`, and `emitFailureEvent` methods.
  Read the existing strategies for the interface
  contract before creating a new one.

**Strategy selection priority:**

1. `ObjectEventStrategy` - default for standard
   object CRUD (use this ~95% of the time).
2. `FormEventStrategy` - only for form-field
   configuration operations.
3. New domain-specific strategy - only when the
   entity belongs to a distinct event domain not
   covered above.

### 6. Create the delete processor file

Write the file at
`services/data-layer/src/handlers/http/client/processors/{entityName}/delete.ts`.

The file has two exported functions following a strict
two-tier architecture:

**Tier 1 - Pure processor function** (`createProcessor`):

- Defined as a curried factory that receives a
  `ProcessorDependencies` interface and returns an
  async function taking `{ payload, context }`.
- `payload` is typed as `z.infer<typeof schema>`.
- `context` is typed as `ServiceContext`.
- Contains only business logic (no HTTP, no AWS
  clients, no middleware).
- Logs operation start and success.
- Returns the result (deleted IDs).

**Reference files:**

- **Delete (batch)**: Read
  `services/data-layer/src/handlers/http/client/processors/action-updates/delete.ts`.
  Study how batch deletes validate results
  and handle missing IDs.

- **Delete (single item by path param)**: Read
  `services/data-layer/src/handlers/http/client/processors/control-groups/delete.ts`.
  Study how the processor receives `id` separately
  from `payload`.

**Delete processor validation rules (CRITICAL):**

Delete processors must validate which IDs were
actually deleted to prevent misleading audit events:

- The repository `deleteMany` method must return the
  IDs that were actually deleted (not the requested
  IDs). Verify the repository does this; if it returns
  `void`, it needs updating first.
- Throw `NotFound` if zero rows were deleted
  (`deletedIds.length === 0`).
- Log a warning if some requested IDs were not found
  (partial delete), including `requestedIds`,
  `deletedIds`, and `missingIds`.
- Only pass actually deleted IDs in `strategyData`
  (`objectIds: deletedIds`), never the full
  requested list.

This prevents silent failures, ensures audit events
reflect database state, and gives clients clear
feedback on partial successes.

**Error handling in processors:**

When the processor calls domain logic that can throw
known operation errors, catch them in Tier 1 and
re-throw as `BadRequest` (from `http-errors`).
Unknown errors should re-throw unmodified to let the
middleware chain handle them. Only catch errors you
can meaningfully translate to an HTTP status.

**Tier 2 - HTTP entry point**
(`delete{PascalEntity}Processor`):

- Standard Lambda handler signature:
  `(event: APIGatewayProxyEvent, context: LambdaContext) => Promise<APIGatewayProxyResult>`
- Wires up dependencies in this order:
  1. Extract service context via
     `extractServiceContext(event)`
  2. Get database connection via
     `getDatabaseConnection({ tenant, orgKey })`
  3. Create repository instance
  4. Create pure processor via
     `createProcessor({ repository })`
  5. Create `EventBridgeClient` and event strategy
  6. Build and execute mutation handler chain

The mutation handler chain uses the builder pattern
from `createHttpMutationHandler`. It chains these
builder methods in order: `withSchema`,
`withObjectName`, `withEventStrategy`,
`withPermissions`, `withHandler`.

Read the exported processor function in
`services/data-layer/src/handlers/http/client/processors/action-updates/delete.ts`
for the full HTTP entry point pattern showing how
dependencies are wired and the builder chain is
constructed.

**Response helper**:

Use `deletedResponse` from
`../../utils/http-response` (returns 204).
See the `deletedResponse` function in
`services/data-layer/src/handlers/http/utils/http-response/http-response.ts`.

**Strategy data in withHandler return**:

- For `ObjectEventStrategy`: return
  `{ objectIds: deletedIds }` for batch deletes, or
  `{ objectIds: [id] }` for single-item deletes.
- For `FormEventStrategy`: return
  `{ formFieldIds: [{ fieldId, parentType }] }`.

**Permissions pattern (ReBAC)**:

Always include `[{ objectName, action: 'delete' }]`.
For child objects that exist as nodes in the `rs_node`
tree, also add an `rs_node` permission check with the
object's ID. This triggers Permit.io's ReBAC evaluation
to verify the user has relationship-based access to the
specific node. Without this, users get 403 even when
they have relationship-based access.

```typescript
.withPermissions(({ pathParams }) => [
  { objectName: 'action_update', action: 'delete' },
  { objectName: 'rs_node', objectId: pathParams.id, action: 'delete' },
])
```

Reference: See `action-updates/delete.ts` for the
full pattern including bulk deletes.

**Bulk delete (OR-per-item)**: When deleting multiple
IDs where each needs its own permission check,
return `PermissionCheck[][]` where each inner
array is an OR group for one ID. See the
`withPermissions` call in
`action-updates/delete.ts` for the pattern of
iterating `payload.Ids` and building a permission
group per ID.

### 7. Update the barrel export

Read the index file at
`services/data-layer/src/handlers/http/client/processors/{entityName}/index.ts`.

If it exists, add the new export following the
existing pattern. If it does not exist, create it
exporting all processors in the directory.

Reference:
`services/data-layer/src/handlers/http/client/processors/form-fields/index.ts`
for the re-export pattern.

## Verification

After completing all steps, verify:

1. **File exists**: The processor file exists at
   `services/data-layer/src/handlers/http/client/processors/{entityName}/delete.ts`.
2. **Barrel export**: The index file re-exports
   the new processor.
3. **Two-tier structure**: The file exports both
   `createProcessor` (pure function) and the named
   HTTP processor function.
5. **Dependency injection**: `createProcessor`
   receives dependencies through a
   `ProcessorDependencies` interface, not via
   direct imports of AWS clients or database
   connections.
6. **Mutation builder chain**: The HTTP entry point
   uses `createHttpMutationHandler()` with all five
   builder methods: `withSchema`, `withObjectName`,
   `withEventStrategy`, `withPermissions`,
   `withHandler`.
7. **Event strategy**: An appropriate strategy
   (`ObjectEventStrategy` or `FormEventStrategy`)
   is instantiated and passed to the builder.
8. **Delete validation**: The processor validates
   actually deleted IDs and only passes those to
   the event strategy (not the requested IDs).

## Next Step

After creating the processor, register its route
using the `register-data-layer-route` skill.
