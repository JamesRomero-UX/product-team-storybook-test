---
name: add-request-validation-schema
description: Add Zod request validation schemas to the request state API for a new async command type (CREATE_*, UPDATE_*, DELETE_*). Creates a request schema, data schema, simplified body schema, and registers them in the discriminated unions.
argument-hint: <CommandType> e.g. CREATE_RISK_ASSESSMENT
allowed-tools: Read, Glob, Grep, Edit, Bash
---

## Required Inputs

- **commandType** - The command type name in
  SCREAMING_SNAKE_CASE (e.g. `CREATE_RISK_ASSESSMENT`,
  `DELETE_OBLIGATIONS`, `UPDATE_CONTROL`). This must match
  the value that will be added to `CommandTypeNames` in the
  events package.

## Input Validation

Check that **commandType** is provided and is a non-empty
string. It must follow the pattern `CREATE_*`, `UPDATE_*`,
or `DELETE_*` in SCREAMING_SNAKE_CASE. If missing or
malformed, STOP and tell the user:

> Please provide a command type name in
> SCREAMING_SNAKE_CASE matching the pattern
> CREATE_*, UPDATE_*, or DELETE_*
> (e.g. CREATE_RISK_ASSESSMENT).

## Steps

### 1. Find the source request type interface

Read the request types file to find the TypeScript
interface for this command type.

- Read
  `packages/events/src/types/request-types.ts`
- Locate the interface whose name corresponds to
  **commandType**. The naming convention maps as follows:
  - `CREATE_ACTION_UPDATE` maps to
    `CreateActionUpdateRequest`
  - `DELETE_ACTION_UPDATES` maps to
    `DeleteActionUpdatesRequest`
  - `UPDATE_FORM_FIELD` maps to
    `UpdateFormFieldRequest`
- Note every field, its type, and whether it is optional
  or nullable. This interface is the single source of
  truth for the Zod schema you will create.

If no matching interface exists yet, STOP and tell the
user they must first add the request type interface to
`packages/events/src/types/request-types.ts` before
running this skill.

### 2. Verify the command type exists

Read
`packages/events/src/types/command-types.ts`
and confirm **commandType** appears in the
`CommandTypeNames` union type. If it does not, STOP and
tell the user they must first add the value to the
`CommandTypeNames` union.

### 3. Read the existing schemas file

Read the target file that will be modified:

- `services/request-state-api/src/schemas/initiate-request.ts`

Study the existing schemas to understand the three-layer
pattern (described in the following steps). Use the
existing entries as your reference for naming conventions,
JSDoc comment style, and structural placement.

### 4. Add the request schema

Create a Zod object schema that mirrors the interface
found in Step 1. Follow these conventions observed in the
existing file:

- **Naming**: Convert the command type to camelCase and
  append `RequestSchema`.
  Example: `CREATE_ACTION_UPDATE` becomes
  `createActionUpdateRequestSchema`.
- **Placement**: Insert the new schema near other schemas
  of the same operation prefix (CREATE, UPDATE, DELETE),
  keeping the file's existing grouping order.
- **Field mapping rules** (match existing patterns):
  - `string` -> `z.string()`
  - `string` with datetime semantics ->
    `z.string().datetime()`
  - `number` -> `z.number()`
  - `boolean` -> `z.boolean()`
  - `true` (literal) -> `z.literal(true)`
  - Optional field (`field?: T`) ->
    `z.T().optional()`
  - Nullable field (`field: T | null`) ->
    `z.T().nullable()`
  - Optional + nullable (`field?: T | null`) ->
    `z.T().nullish()` (preferred over `.nullable().optional()`)
  - `Record<string, unknown> | null` (optional) ->
    `z.record(z.string(), z.unknown()).nullish()`
  - `string[]` with UUID validation (like `Ids`) ->
    `z.array(z.string().uuid('...')).min(1, '...').max(200, '...')`
  - `unknown` -> `z.unknown()`

> **Important — `.nullish()` requires `| null` in the events interface**:
> React forms send `null` for unset optional fields. The tRPC
> service's `buildRequestBody` uses `field ?? null`. Use
> `.nullish()` for any optional field. But the Zod-inferred
> type (`T | null | undefined`) must also be assignable to
> the events `Create{Entity}Request` interface. If the
> interface has `field?: T` (no `| null`), `tsc` will fail
> with "Type 'T | null | undefined' is not assignable to
> type 'T | undefined'". Both places must agree:
> - Events interface: `field?: T | null` (or `field?: T[] | null`)
> - Zod schema: `.nullish()`
- **JSDoc**: Add a doc comment matching the pattern:
  `/** Schema for XxxRequest - matches @risksmart-app/events RequestTypes */`
- **Export**: The schema must be exported with
  `export const`.

If the request type uses the bulk delete pattern
(just an `Ids: string[]` field), reuse the existing
`bulkDeleteRequestSchema` instead of creating a new one.
Check existing delete schemas in the file for this
pattern.

### 5. Add the data schema

Create a data schema that pairs the request schema with
its `subType` literal. Follow the pattern in the file:

- **Naming**: Convert the command type to camelCase and
  append `DataSchema`.
  Example: `CREATE_ACTION_UPDATE` becomes
  `createActionUpdateDataSchema`.
- **Structure**: Always
  `z.object({ request: <requestSchema>, subType: z.literal('{commandType}') })`
- **JSDoc**: Follow the pattern:
  `/** Schema for {commandType} data payload * Pairs <requestSchemaName> with its corresponding subType */`
- **Placement**: Insert near the other data schemas,
  maintaining alphabetical or grouped order.

### 6. Register in the discriminated union (data)

Add the new data schema to the
`initiateAsyncRequestDataSchema` discriminated union
array. Insert it in alphabetical order among the existing
entries.

### 7. Add the simplified body schema

Create a simplified HTTP body schema following the
existing pattern:

- **Naming**: Convert the command type to camelCase
  prefixed with `simplified` and suffixed with
  `BodySchema`.
  Example: `CREATE_ACTION_UPDATE` becomes
  `simplifiedCreateActionUpdateBodySchema`.
- **Structure**: Always
  `z.object({ request: <requestSchema>, type: z.literal('{commandType}') })`
  Note: uses `type` not `subType` (the simplified
  schemas use `type` as the discriminator).
- **JSDoc**: Follow the pattern:
  `/** Simplified HTTP request body schema for {commandType} */`
- **Placement**: Insert near other simplified schemas of
  the same operation type.

### 8. Register in the simplified discriminated union

Add the new simplified body schema to the
`simplifiedRequestBodySchema` discriminated union array.
Insert it in alphabetical order among the existing
entries.

### 9. Register in TASK_MAP

Read
`services/request-state-api/src/event-store/rules/initiate-async-request.rule.ts`
and locate the `TASK_MAP` constant. It is typed as
`{ [K in CommandTypeNames]: TaskDefinition[] }`, so adding a
new entry to `CommandTypeNames` makes it a **compile error**
until the map is updated.

Add an entry for the new command type following the pattern of
existing entries:

- For `CREATE_*` operations on a domain object (e.g.
  `CREATE_RISK`):
  ```typescript
  CREATE_RISK: [
    {
      eventType: ObjectEvent.ObjectCreated,
      objectType: 'risk',  // snake_case object type name
    },
    {
      eventType: PermissionsEvent.PermissionsUpdated,
      objectType: 'risk',
    },
  ],
  ```
- For `DELETE_*` operations: use `ObjectEvent.ObjectDeleted`
  instead of `ObjectEvent.ObjectCreated`.
- For form/config operations like `CREATE_FORM_FIELD`:
  use `FormEvent.FormConfigured` with no `objectType`.
- Insert the entry in the same alphabetical grouping as
  surrounding entries.

Then add a corresponding test in
`services/request-state-api/src/event-store/rules/initiate-async-request.rule.test.ts`
inside the `describe('TASK_MAP configuration')` block,
following the pattern of the existing tests (e.g. the
`CREATE_ACTION_UPDATE` or `CREATE_RISK` tests).

### 10. Add tests

Read the existing test file:

- `services/request-state-api/src/schemas/initiate-request.test.ts`

Then add tests following the established patterns:

1. **Request schema test**: A `describe` block for the
   new request schema with an
   `it('validates correct request')` test that constructs
   a valid payload matching the interface and asserts
   `safeParse` succeeds.
2. **Data schema test**: Inside the existing
   `describe('data schemas')` block, add an
   `it('validates {commandType} data schema')` test that
   wraps the request in a
   `{ request, subType: '{commandType}' }` object and
   asserts the data schema passes.
3. **Discriminated union test**: Inside the existing
   `describe('initiateAsyncRequestDataSchema discriminated union')`
   block, add an
   `it('validates {commandType} in union')` test that
   passes the same data through
   `initiateAsyncRequestDataSchema` and asserts success.
4. **Full event test**: Inside the existing
   `describe('initiateAsyncRequestSchema')` block, add
   an `it('validates complete {commandType} event')` test
   that wraps the data in a full event with
   `type: EventType.InitiateAsyncRequest` and
   `metadata: mockMetadata`, then asserts the full
   `initiateAsyncRequestSchema` passes.

Import any new schemas at the top of the test file,
adding them to the existing import block from
`'./initiate-request'`.

### 11. Run tests

Run the unit tests for the request-state-api package to
confirm all new and existing tests pass:

```bash
pnpm exec turbo test:unit \
  --filter=@risksmart-app/request-state-api \
  -- src/schemas/initiate-request.test.ts
```

If any tests fail, read the error output, fix the
schemas or tests, and re-run until all pass.

## Error Recovery

| Error | Resolution |
| --- | --- |
| "Invalid discriminator value" | Verify `subType` literal in data schema matches command type name exactly (SCREAMING_SNAKE_CASE) |
| "Type does not match" | Check TypeScript interface in `request-types.ts` and ensure Zod schema field types match exactly |
| "Property does not exist" | Check spelling and casing of field names against the source interface |
| "Type 'unknown' is not assignable" | Use `z.unknown()` for `unknown` or `any` typed fields |

## Scope Boundaries

This skill only adds validation schemas. It does NOT:

- Create request type interfaces (see `packages/events/src/types/request-types.ts`)
- Create command type enums (see `packages/events/src/types/command-types.ts`)
- Register event types for completion tracking (use `add-request-state-event-type` skill)
- Create tRPC services (use `create-trpc-service` skill)
- Create data layer processors (use `create-http-processor` skill)

## Verification

Before reporting completion, confirm all of the
following:

1. A new request schema exists in
   `initiate-request.ts` whose fields match the
   interface in
   `packages/events/src/types/request-types.ts`
   exactly (same field names, types, optionality).
2. A new data schema exists that pairs the request
   schema with `z.literal('{commandType}')` as `subType`.
3. The data schema is registered in
   `initiateAsyncRequestDataSchema`.
4. A new simplified body schema exists that pairs the
   request schema with `z.literal('{commandType}')` as
   `type`.
5. The simplified body schema is registered in
   `simplifiedRequestBodySchema`.
6. An entry for the new command type exists in `TASK_MAP`
   in `initiate-async-request.rule.ts` with the correct
   event types and object type.
7. A test for the TASK_MAP entry exists in
   `initiate-async-request.rule.test.ts`.
8. Tests exist for the request schema, data schema,
   discriminated union, and full event.
9. All unit tests pass.
10. TypeScript compilation succeeds with no errors.
