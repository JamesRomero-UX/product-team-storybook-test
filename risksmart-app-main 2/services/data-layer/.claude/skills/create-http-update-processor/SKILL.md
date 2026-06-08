---
name: create-http-update-processor
description: Creates an HTTP update mutation processor for a data layer entity following the two-tier architecture with pure processor function, HTTP entry point, dependency injection, event strategy pattern, and mutation handler builder composition.
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
- **file name**: `update.ts`
- **exported processor name**: pattern is
  `update{PascalEntity}Processor`
  (e.g. `updateFormFieldProcessor`)
- **schema variable**: pattern is
  `update{PascalEntity}RequestSchema`

### 2. Research existing patterns for the entity

Read the processor directory to understand what
already exists for this entity.

List the contents of
`services/data-layer/src/handlers/http/client/processors/{entityName}/`.

Check if `update.ts` already exists. If so,
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

If no repository exists, STOP and tell the user
they must create the repository first.

### 4. Locate or confirm the Zod schema

Search for the request validation schema:

- Glob for `services/data-layer/src/schemas/*{entity}*`
- Read the schema file to find the correct schema
  for the update operation (e.g.
  `updateActionUpdateRequestSchema`)

If the operation requires a schema that does not
exist yet, STOP and tell the user they must create
the schema first. Alternatively, if the schema is
simple, define it inline in the processor file.
Read the `create.ts` and `delete.ts` files under
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

### 6. Create the update processor file

Write the file at
`services/data-layer/src/handlers/http/client/processors/{entityName}/update.ts`.

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
- Returns the result object.

**Reference**: Read
`services/data-layer/src/handlers/http/client/processors/form-fields/update.ts`.
Study the `ProcessorDependencies` interface,
the curried `createProcessor` factory, and
the update-specific patterns.

**Error handling in processors:**

When the processor calls domain logic that can throw
known operation errors, catch them in Tier 1 and
re-throw as `BadRequest` (from `http-errors`).
Unknown errors should re-throw unmodified to let the
middleware chain handle them. Only catch errors you
can meaningfully translate to an HTTP status. See
`services/data-layer/src/handlers/http/client/processors/form-fields/create.ts`
for an example of catching `FormFieldOperationError`
and mapping it to `BadRequest`.

**Tier 2 - HTTP entry point**
(`update{PascalEntity}Processor`):

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
`services/data-layer/src/handlers/http/client/processors/form-fields/update.ts`
for the full HTTP entry point pattern showing how
dependencies are wired and the builder chain is
constructed.

**Timestamp rule**:

The repository's update method MUST explicitly set
`ModifiedAtTimestamp: sql\`statement_timestamp()\``
(import `sql` from `drizzle-orm`) inside the `.set()`
call. The DB column default only applies on INSERT —
without this, the modified timestamp is never refreshed
on updates. Never accept timestamps from the caller;
always set them internally in the repository.

**Relationship sync rule (for entities with relationships)**:

When updating relationships (owners, contributors, tags,
departments), use the **diff-based sync** pattern — NOT
delete-all/reinsert. All relationship tables have audit
triggers, so delete-all/reinsert generates spurious
DELETE + INSERT audit entries and resets
`CreatedAtTimestamp` on unchanged rows.

1. Delete only removed rows:
   `tx.delete(table).where(and(eq(table.ParentId, id), notInArray(table.KeyCol, newIds)))`
   If the new array is empty, delete all:
   `tx.delete(table).where(eq(table.ParentId, id))`
2. Insert only new rows:
   `tx.insert(table).values(...).onConflictDoNothing()`

Import `notInArray` from `drizzle-orm`. Reference:
`services/data-layer/src/repositories/risk-repository.ts`
for the complete `updateWithRelationships` implementation.

**Response pattern**:

Return a manual 200 response with
`JSON.stringify({ data: result })`. See
the handler return in
`services/data-layer/src/handlers/http/client/processors/form-fields/update.ts`.

**Strategy data in withHandler return**:

- For `ObjectEventStrategy`: return
  `{ objectIds: [result.Id] }`.
- For `FormEventStrategy`: return
  `{ formFieldIds: [{ fieldId, parentType }] }`.

**Permissions pattern (ReBAC)**:

Always include `[{ objectName, action: 'update' }]`.
When updating an object that exists as a node in the
`rs_node` tree, also add an `rs_node` permission check
with the object's ID (from path parameters). This
triggers Permit.io's ReBAC evaluation to verify the
user has relationship-based access to the specific node.
Without this, users get 403 even when they have
relationship-based access.

```typescript
.withPermissions(({ pathParams }) => [
  { objectName: 'action_update', action: 'update' },
  { objectName: 'rs_node', objectId: pathParams.id, action: 'update' },
])
```

Reference: See `risks/create.ts` for the conditional
ReBAC pattern (optional parent) and
`action-updates/create.ts` for the unconditional pattern.

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
   `services/data-layer/src/handlers/http/client/processors/{entityName}/update.ts`.
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

## Next Step

After creating the processor, register its route
using the `register-data-layer-route` skill.
