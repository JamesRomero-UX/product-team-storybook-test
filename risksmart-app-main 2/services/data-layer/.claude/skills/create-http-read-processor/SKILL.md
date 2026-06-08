---
name: create-http-read-processor
description: Creates an HTTP read processor for a data layer entity using the single-tier architecture with createHttpReadHandler builder. Supports get-all, get-by-id, get-by-parent, and get-register variants with permission filtering and pagination.
argument-hint: <entity-name> <variant> where entity-name is kebab-case (e.g. action-updates) and variant is get-all, get-by-id, get-by-parent, or get-register
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

## Required Inputs

- **entityName**: Kebab-case entity name matching
  the processor directory name
  (e.g. `action-updates`, `control-groups`).
- **variant**: One of `get-all`, `get-by-id`,
  `get-by-parent`, or `get-register`.

## Input Validation

Check that **entityName** and **variant** are both
present. **variant** must be one of `get-all`,
`get-by-id`, `get-by-parent`, or `get-register`.
If either is missing or invalid, STOP and tell the user:

> Please provide the entity name in kebab-case and a
> variant (get-all | get-by-id | get-by-parent |
> get-register).

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
- **file name**: `{variant}.ts` (e.g. `get-all.ts`,
  `get-by-id.ts`, `get-by-parent.ts`,
  `get-register.ts`)
- **exported processor name**: depends on variant:
  - **get-all**: `get{PascalEntities}Processor`
    (plural, e.g. `getUsersProcessor`,
    `getNodesProcessor`)
  - **get-by-id**: `get{PascalEntity}ByIdProcessor`
    (singular, e.g. `getActionByIdProcessor`)
  - **get-by-parent**:
    `get{PascalEntities}ByParentProcessor` or
    `get{PascalEntities}By{ParentEntity}Processor`
    (e.g. `getActionUpdatesByParentProcessor`)
  - **get-register**:
    `get{PascalEntities}RegisterProcessor`
    (e.g. `getActionsRegisterProcessor`)

### 2. Research existing patterns for the entity

Read the processor directory to understand what
already exists for this entity.

List the contents of
`services/data-layer/src/handlers/http/client/processors/{entityName}/`.

Check if the target file already exists. If so,
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
  - Available methods (`getAll`, `getById`,
    `getByParentId`, etc.)
  - Return types from the methods

If no repository exists, STOP and tell the user
they must create the repository first.

### 4. Create the read processor file

> **Client vs Internal**: Processors consumed by the tRPC service or
> frontend go in `client/processors/`. Processors consumed only by the
> permissions service (nodes, users, user-groups, linked-items, etc.) go
> in `internal/processors/` and are registered in `internal/handler.ts`.
> Default to `client/processors/` unless the entity is clearly an
> internal/backend-only read.

Write the file at
`services/data-layer/src/handlers/http/client/processors/{entityName}/{variant}.ts`.

Read processors have a **single-tier architecture** -
there is no separate `createProcessor` factory or
`ProcessorDependencies` interface. The exported
function is the Lambda handler that uses the
`createHttpReadHandler` builder directly.

**Key differences from mutation processors:**

- No event strategy (reads don't emit events).
- No body schema. Instead, validate path params
  and/or query params via `withPathParamsSchema`
  and `withQueryParamsSchema`.
- Permissions are post-fetch filtering via
  `withPermissionFilter`, not pre-flight checks.
- The handler function returns data directly
  (the result from the repository). Response
  formatting is handled automatically by the
  builder's middleware.
- Use `createHttpReadHandler` instead of
  `createHttpMutationHandler`.

**Builder method reference:**

Read
`services/data-layer/src/handlers/http/utils/create-http-read-handler/create-http-read-handler.ts`
for the full builder API. The available methods are:

- `withPathParamsSchema(schema)` - validates
  `event.pathParameters` against a Zod schema.
- `withQueryParamsSchema(schema)` - validates
  `event.queryStringParameters` against a Zod schema.
- `withObjectName(name)` - sets the entity name for
  logging and error messages. **Required.**
- `withPagination()` - enables offset/limit
  pagination. Use for all list endpoints.
- `withPermissionFilter({ resourceType, idExtractor })`
  - enables post-fetch ABAC filtering via Permit.io.
- `withHandler(fn)` - the data-fetching function.
  Receives `{ pathParams, queryParams, serviceContext, pagination }`
  and returns the data directly. **Required.**
- `forSingleItem()` - marks the response as a single
  object (not an array). Use only for get-by-id.

**Generic type parameters:**

When using path param schemas, query param schemas,
or a typed response, supply the generic parameters:
`createHttpReadHandler<TPathSchema, TQuerySchema, TData>()`.
Use `undefined` for unused schema slots. The get-all
variant typically needs no generics.

**Reference files per variant:**

- **get-all**: Read
  `services/data-layer/src/handlers/http/client/processors/form-configurations/get-all.ts`.
  Study the minimal builder chain: `withObjectName`,
  `withPagination`, `withHandler`. No generics needed.

- **get-by-id**: Read
  `services/data-layer/src/handlers/http/client/processors/actions/get-by-id.ts`.
  Study the inline `pathParamsSchema` Zod object
  defined before the processor function, the three
  generic type parameters on the builder call, the
  `withPermissionFilter` configuration, and the
  `forSingleItem()` call.

- **get-by-parent**: Read
  `services/data-layer/src/handlers/http/client/processors/action-updates/get-by-parent.ts`.
  Study the `pathParamsSchema` for the parent ID,
  `withPagination` combined with
  `withPermissionFilter`, and how `pathParams` is
  used in the handler to call the repository.

- **get-register**: Read
  `services/data-layer/src/handlers/http/client/processors/actions/get-register.ts`.
  Study the `queryParamsSchema` for filter fields,
  how `undefined` is used as the first generic
  (no path params), how comma-separated query string
  values are split in the handler, and how filters
  are passed to the repository.

**Permission filter guidance:**

- Most read endpoints that return objects with
  row-level permissions should use
  `withPermissionFilter`. The `resourceType` is the
  Permit.io resource name (e.g. `rs_node`), and
  `idExtractor` is a function that returns the
  object's ID for the permission check.
- Simple get-all endpoints without row-level
  permissions (e.g. users, user groups) can omit
  `withPermissionFilter`.

**Path/query param schema guidance:**

- Define schemas inline at the top of the processor
  file as a `const` (not exported). This is the
  established pattern across all read processors.
- Path param schemas validate `event.pathParameters`.
- Query param schemas validate
  `event.queryStringParameters`. Fields are typically
  optional strings since query params are always
  strings. Parse or split values inside the handler.

### 5. Update the barrel export

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
   `services/data-layer/src/handlers/http/client/processors/{entityName}/{variant}.ts`.
2. **Barrel export**: The index file re-exports
   the new processor.
3. **Single-tier structure**: The file exports a
   single Lambda handler function that uses
   `createHttpReadHandler` directly.
5. **Read builder chain**: The handler uses the
   appropriate builder methods for the variant
   (`withObjectName` and `withHandler` are always
   required; `withPagination`, `forSingleItem`,
   `withPathParamsSchema`, `withQueryParamsSchema`,
   and `withPermissionFilter` are used as needed).
6. **No event strategy**: The read processor does not
   instantiate or use any event strategy.

## Next Step

After creating the processor, register its route
using the `register-data-layer-route` skill.
