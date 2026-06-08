---
name: create-data-layer-schema
description: Creates Zod validation schemas for data-layer HTTP endpoints. Use when adding create, read, update, or delete request validation for a new or existing entity in services/data-layer/src/schemas/.
argument-hint: <entity-name> [operations: create,read,update,delete]
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
---

## Required Inputs

- **entityName**: The kebab-case entity name
  (e.g. `issue-update`, `control-group`,
  `indicator-result`). Determines the schema file name
  and PascalCase type names.
- **operations** (optional): Comma-separated list
  of operations to generate schemas for. Defaults to
  `create`. Valid values: `create`, `read`, `update`,
  `delete`.

## Input Validation

1. Check that **entityName** is provided. If missing,
   STOP and tell the user:
   "Please provide an entity name in kebab-case
   (e.g. `issue-update`, `obligation-impact`)."
2. If **operations** is provided, verify each
   comma-separated value is one of `create`, `read`,
   `update`, or `delete`. If invalid, STOP and list the
   valid operations.
3. Derive the PascalCase entity name from **entityName**
   (e.g. `issue-update` becomes `IssueUpdate`).

## Steps

### Step 1 - Research entity fields

Determine what fields the schema needs by examining
the entity's database table, existing types, or domain
model.

- Search for the entity in the Drizzle schema with
  Grep for the entity name in `packages/drizzle/src/`.
- Search for existing GraphQL types or domain types
  related to the entity in `packages/domain/src/`.
- If the user has specified fields, use those instead.
- Note which fields are required vs optional, which are
  UUIDs, which are enums, and which are nullable.

### Step 2 - Study reference schemas

Read existing production schemas to match the
established patterns exactly.

**Primary reference** (advanced patterns including
discriminated unions, enums, `.merge()`, and
create/update/delete in one file):

- `services/data-layer/src/schemas/form-field.ts`

**Secondary references** (simpler CRUD patterns):

- `services/data-layer/src/schemas/issue-update.ts`
  for a schema file with both a shared validation
  schema and a separate HTTP request schema, plus
  `CustomAttributeData` field pattern.
- `services/data-layer/src/schemas/indicator-result.ts`
  for UUID validation, datetime validation, and
  nullable optional numbers.
- `services/data-layer/src/schemas/control-group.ts`
  for the simplest create-only schema pattern.

**Read references** (GET input validation patterns):

- `services/data-layer/src/schemas/form-configuration.ts`
  for a query parameters schema with comma-separated
  array transform and enum validation. This is the
  primary reference for query parameter schemas.
- `services/data-layer/src/handlers/http/client/processors/actions/get-by-id.ts`
  for the path parameters pattern with a single required
  ID field. Note: this defines the schema inline in the
  processor — new schemas should be created in the
  `schemas/` directory instead.
- `services/data-layer/src/handlers/http/client/processors/actions/get-register.ts`
  for a query parameters pattern with multiple optional
  string filter fields. Note: same as above, new schemas
  should be created in `schemas/`.

When reading these files, note:

- Import style: `import { z } from 'zod'` always
- Enum imports come from `@risksmart-app/domain` or
  other shared packages, never inline string unions
- Schema variable naming: `create<Entity>RequestSchema`,
  `update<Entity>RequestSchema`,
  `delete<Entity>RequestSchema`,
  `<entity>PathParamsSchema`,
  `<entity>QuerySchema`
- Type export naming: `Create<Entity>Request`,
  `Update<Entity>Request`, `Delete<Entity>Request`,
  `<PascalEntity>PathParams`,
  `<PascalEntity>QueryParams`
- JSDoc comments on each exported schema describing the
  HTTP method and path

### Step 3 - Create the schema file

Create the file at
`services/data-layer/src/schemas/<entity-name>.ts`.

Follow these patterns from the reference files:

**Imports:**

- Always `import { z } from 'zod'`
- Import enums with `z.nativeEnum()` from their source
  packages (never hardcode string literal unions)
- Import shared schemas from other packages if needed

**Field patterns** (match exactly what the references
use):

- UUID fields:
  `z.string().uuid('<FieldName> must be a valid UUID')`
- Required strings:
  `z.string().min(1, '<FieldName> is required')`
  with a descriptive message
- Optional fields — choose the correct modifier based on
  what the database/API contract allows:
  - `.optional()` — field can be `undefined` (omitted
    from the request body entirely)
  - `.nullable()` — field can be `null` (explicitly sent
    as `null`)
  - `.nullish()` — shorthand for both `undefined` and
    `null`
  - `.nullable().optional()` — equivalent to `.nullish()`
    but used in some schemas for clarity; see
    `indicator-result.ts` lines 4-9 for this pattern vs
    `form-field.ts` line 38 for `.nullish()`
  Match whichever form the existing database column
  contract requires
- Booleans: `z.boolean()`
- Enums: `z.nativeEnum(EnumType)` (import the enum)
- Datetime strings:
  `z.string().datetime('<message>')`
- CustomAttributeData:
  `z.record(z.string(), z.unknown()).nullable().optional()`
- Arrays: `z.array(<itemSchema>)`
- Relationship ID arrays (owners, contributors, tags,
  departments) — use `.optional().default([])` so the
  field defaults to an empty array when omitted:
  ```typescript
  OwnerUserIds: z.array(z.string()).optional().default([]),
  OwnerGroupIds: z.array(z.string().uuid()).optional().default([]),
  ContributorUserIds: z.array(z.string()).optional().default([]),
  ContributorGroupIds: z.array(z.string().uuid()).optional().default([]),
  TagTypeIds: z.array(z.string().uuid()).optional().default([]),
  DepartmentTypeIds: z.array(z.string().uuid()).optional().default([]),
  ```
  Only include the arrays that the entity actually uses.
  The processor reads these fields and passes them to
  `insertWithRelationships` in the repository.
- Literal discriminators: `z.literal(true)`,
  `z.literal('value')`

**Schema composition patterns:**

- Shared fields across operations: extract a
  `commonFieldsSchema` using `z.object({...})`, then
  `.merge()` into operation schemas
- Discriminated unions: use
  `z.discriminatedUnion('<field>', [v1, v2])`
  when a field determines the shape
- Combining discriminated unions with shared fields:
  use `.and()` (intersection) as shown in the
  `updateFormFieldRequestSchema` in `form-field.ts`

**For each requested operation, generate:**

- **create**: `export const create<Entity>RequestSchema`
  with all fields needed to create the entity. Include
  JSDoc: `Schema for POST /<entity-name>s`.
- **read**: Generates one or both of the following
  depending on the endpoint's needs. Ask the user which
  are required if not obvious from the route definition.
  - **Path parameters** — for endpoints with URL
    parameters like `/<entity-name>s/{id}`. Export as
    `<entity>PathParamsSchema` with type
    `<PascalEntity>PathParams`. Fields are required
    strings validated with `.min(1, '...')`. See
    `actions/get-by-id.ts` for the field pattern and
    `form-configuration.ts` for the file structure to
    follow in `schemas/`.
    Include JSDoc:
    `Path parameters for GET /<entity-name>s/{id}`.
  - **Query parameters** — for endpoints that accept
    query string filters. Export as
    `<entity>QuerySchema` with type
    `<PascalEntity>QueryParams`. All fields should be
    `.optional()` since query parameters are never
    required. For fields that accept comma-separated
    lists, use the `commaSeparatedArray` transform
    pattern with `.pipe()` as shown in
    `form-configuration.ts`. Include JSDoc:
    `Query parameters for GET /<entity-name>s`.
  Pagination is handled automatically by the read
  handler builder (`.withPagination()`) and does not
  need a schema.
- **update**: `export const update<Entity>RequestSchema`
  with an identifier field (usually the entity ID) plus
  updatable fields. Include JSDoc:
  `Schema for PUT /<entity-name>s`.
  If most fields are optional on update, use
  `.partial().required({ Id: true })` to make all fields
  optional except the identifier. See
  `form-field.ts` `updateFormFieldRequestSchema` for an
  alternative approach where the update shape is defined
  explicitly with `.and()` composition instead.
- **delete**: `export const delete<Entity>RequestSchema`
  with only the identifier field(s) needed to locate
  the entity. Include JSDoc:
  `Schema for DELETE /<entity-name>s`.
  Two delete shapes exist in the codebase — choose
  based on the entity's requirements:
  - **Single delete** with a single ID field — see
    `form-field.ts` `deleteFormFieldRequestSchema` for
    a delete schema using a string identifier.
  - **Bulk delete** with an array of UUIDs — see
    `services/data-layer/src/handlers/http/client/processors/issue-updates/delete.ts`
    line 29-31 for the `Ids: z.array(z.string().uuid())`
    pattern. Use this when the endpoint accepts multiple
    IDs in one request.

**Type exports:**

- For every exported schema, export a corresponding
  inferred type immediately below it using `z.infer`.
  See the pattern in any reference file such as
  `control-group.ts` for the exact formatting.

### Step 4 - Verify no boolean naming lint warnings

If any boolean field uses a name that does not start
with `is`, `has`, `should`, `can`, `will`, or similar
boolean prefixes, add the DataDog suppression comment
on the line above it, matching the pattern in
`form-field.ts`:

```text
// no-dd-sa:typescript-best-practices/boolean-prop-naming
```

This only applies to fields whose names come from the
existing database/API contract and cannot be renamed.

## Verification

After completing all steps, confirm each of these:

1. The file exists at
   `services/data-layer/src/schemas/<entity-name>.ts`.
2. Every requested operation (create/read/update/delete)
   has a corresponding exported schema constant and
   inferred type.
3. Mutation schema variable names follow the pattern
   `<operation><PascalEntity>RequestSchema`.
   Read schema variable names follow the patterns
   `<entity>PathParamsSchema` and
   `<entity>QuerySchema`.
4. Mutation type export names follow the pattern
   `<Operation><PascalEntity>Request`.
   Read type export names follow the patterns
   `<PascalEntity>PathParams` and
   `<PascalEntity>QueryParams`.
5. All UUID fields use `.uuid()` with a message.
6. All required string fields use `.min(1, ...)` with a
   descriptive message.
7. Enum fields use `z.nativeEnum()` with an imported
   enum, not inline string literals.
8. `CustomAttributeData` (if present) uses the exact
   pattern:
   `z.record(z.string(), z.unknown()).nullable().optional()`
9. JSDoc comments describe the HTTP method and path for
   each schema.
10. Boolean fields from existing contracts have the
    `no-dd-sa` suppression comment.
11. The TypeScript compiler passes with no errors for
    the data-layer service.
