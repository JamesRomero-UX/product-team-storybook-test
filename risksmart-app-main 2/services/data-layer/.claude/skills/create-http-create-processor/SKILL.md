---
name: create-http-create-processor
description: Creates an HTTP create (insert) mutation processor for a data layer entity following the two-tier architecture with pure processor function, HTTP entry point, dependency injection, event strategy pattern, and mutation handler builder composition.
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
- **file name**: `create.ts`
- **exported processor name**: pattern is
  `create{PascalEntity}Processor`
  (e.g. `createActionUpdateProcessor`)
- **schema variable**: pattern is
  `create{PascalEntity}RequestSchema`

### 2. Research existing patterns for the entity

Read the processor directory to understand what
already exists for this entity.

List the contents of
`services/data-layer/src/handlers/http/client/processors/{entityName}/`.

Check if `create.ts` already exists. If so,
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
  for the create operation (e.g.
  `createActionUpdateRequestSchema`)

If the operation requires a schema that does not
exist yet, STOP and tell the user they must create
the schema first. Alternatively, if the schema is
simple, define it inline in the processor file.
Read the `create.ts` file under
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

### 6. Determine if relationship fields are needed

If the entity supports owners, owner groups, contributors,
contributor groups, tags, or departments, the create
processor must handle these as additional array fields and
call `insertWithRelationships` instead of `insert`.

**Check** whether the repository exposes
`insertWithRelationships`. If it does, the schema and
processor must accept the six relationship array fields:

```typescript
OwnerUserIds: z.array(z.string()).optional().default([]),
OwnerGroupIds: z.array(z.string().uuid()).optional().default([]),
ContributorUserIds: z.array(z.string()).optional().default([]),
ContributorGroupIds: z.array(z.string().uuid()).optional().default([]),
TagTypeIds: z.array(z.string().uuid()).optional().default([]),
DepartmentTypeIds: z.array(z.string().uuid()).optional().default([]),
```

Only include the relationship types the entity actually
uses (e.g., omit `TagTypeIds`/`DepartmentTypeIds` if those
tables don't reference this entity).

In the processor function, build a `{Entity}Relationships`
object from the payload and pass it as the second argument
to `insertWithRelationships(insertData, relationships, context)`.

**Reference**: `services/data-layer/src/handlers/http/client/processors/risks/create.ts`
shows the complete pattern including the schema fields,
`RiskRelationships` struct, and `insertWithRelationships`
call.

### 7. Create the create processor file

Write the file at
`services/data-layer/src/handlers/http/client/processors/{entityName}/create.ts`.

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
`services/data-layer/src/handlers/http/client/processors/action-updates/create.ts`.
Study the `ProcessorDependencies` interface,
the curried `createProcessor` factory, and
how it returns the inserted record.

**Reference** (insert with relationship tables):
`services/data-layer/src/handlers/http/client/processors/risks/create.ts`.
Shows how to define the `{Entity}Relationships` struct,
build it from payload fields, and call
`insertWithRelationships(insertData, relationships, context)`.

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
(`create{PascalEntity}Processor`):

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
`services/data-layer/src/handlers/http/client/processors/action-updates/create.ts`
for the full HTTP entry point pattern showing how
dependencies are wired and the builder chain is
constructed.

**Response helper**:

Use `createdResponse` from
`../../utils/http-response` (returns 201 with
Location header). See the `createdResponse`
function in
`services/data-layer/src/handlers/http/utils/http-response/http-response.ts`.

**Strategy data in withHandler return**:

- For `ObjectEventStrategy`: return
  `{ objectIds: [result.Id] }`.
- For `FormEventStrategy`: return
  `{ formFieldIds: [{ fieldId, parentType }] }`.

**Permissions pattern (ReBAC)**:

When the payload has an **optional** parent ID field
(e.g. `ParentId`, `ParentRiskId`), the permissions
must be **conditional**: include the `rs_node` check
only when a parent is provided, because top-level
creates (no parent) won't have a node to check against.

When the parent ID is **required** (always present),
always include the `rs_node` check unconditionally.

The `rs_node` permission with `objectId` triggers
Permit.io's ReBAC (Relationship-Based Access Control)
evaluation — it verifies the user has `insert` access
on the specific parent node, not just the generic
object type. Without this, users get 403 even when
they have relationship-based access to the parent.

```typescript
// Optional parent — conditional ReBAC check
.withPermissions(({ payload }) =>
  payload.ParentId
    ? [
        { objectName: 'control', action: 'insert' },
        { objectName: 'rs_node', objectId: payload.ParentId, action: 'insert' },
      ]
    : [
        { objectName: 'control', action: 'insert' },
      ]
)

// Required parent — always include ReBAC check
.withPermissions(({ payload }) => [
  { objectName: 'action_update', action: 'insert' },
  { objectName: 'rs_node', objectId: payload.ParentActionId, action: 'insert' },
])
```

Reference: `risks/create.ts` (optional parent),
`action-updates/create.ts` (required parent).

### 8. Update the barrel export

Read the index file at
`services/data-layer/src/handlers/http/client/processors/{entityName}/index.ts`.

If it exists, add the new export following the
existing pattern. If it does not exist, create it
exporting all processors in the directory.

Reference:
`services/data-layer/src/handlers/http/client/processors/form-fields/index.ts`
and
`services/data-layer/src/handlers/http/client/processors/action-updates/create.ts`
for the re-export pattern.

## Verification

After completing all steps, verify:

1. **File exists**: The processor file exists at
   `services/data-layer/src/handlers/http/client/processors/{entityName}/create.ts`.
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
