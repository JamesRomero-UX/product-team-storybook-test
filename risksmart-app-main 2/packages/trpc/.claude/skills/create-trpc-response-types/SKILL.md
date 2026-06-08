---
name: create-trpc-response-types
description: Create a new tRPC response type file that infers types from Drizzle query configs for an entity
argument-hint: <entityName> <tableName> [queryConfigNames]
allowed-tools: Read, Glob, Grep, Edit, Write
---

# Create tRPC Response Types

## Required Inputs

- **entityName**: The entity name in camelCase
  (e.g., `action`, `thirdParty`, `internalAuditReport`).
  Used for deriving the filename and type name prefixes.
- **tableName**: The Drizzle table name in
  snake\_case (e.g., `action`, `third_party`,
  `internal_audit_report`). Used in
  `InferQueryModel<'tableName', ...>`. Table names
  are always snake\_case, matching the export names
  in `packages/drizzle/src/schema.ts` and keys in
  `packages/drizzle/src/relations.ts`. If unsure,
  check the entity's query config file for the
  `satisfies QueryConfig<'...'>` annotation — that
  string is the correct table name.
- **queryConfigNames** (optional): Comma-separated
  list of query config export names to create types for
  (e.g., `getActionByIdQueryConfig,getActionsRegisterQueryConfig`).
  If omitted, auto-detect by reading the entity's query
  config file.

## Input Validation

1. Check that **entityName** is provided and is in
   camelCase. If missing, STOP and tell the user:
   "Please provide the entity name in camelCase
   (e.g., action, thirdParty, internalAuditReport)."
2. Check that **tableName** is provided and is in
   snake\_case. If missing, STOP and tell the user:
   "Please provide the Drizzle table name in snake\_case
   (e.g., action, third\_party, internal\_audit\_report)."
3. If **queryConfigNames** is provided, validate each
   comma-separated value looks like a query config name
   (should start with `get` or `my` and end with
   `QueryConfig`). If invalid, STOP and report the issue.

## Steps

### Step 1: Derive naming conventions

From the entityName, derive:

- **kebab-case filename**: Insert hyphens before
  uppercase letters and lowercase everything
  (e.g., `thirdParty` becomes `third-party`,
  `internalAuditReport` becomes
  `internal-audit-report`).
- **PascalCase**: Capitalize the first letter and
  keep other uppercase letters
  (e.g., `thirdParty` becomes `ThirdParty`).
- **Type file path**:
  `packages/trpc/src/types/{kebab-case}.types.ts`

Check if the type file already exists. If it does,
STOP and inform the user. Ask whether they want to
add new type exports to the existing file instead.

### Step 2: Identify query configs to type

If **queryConfigNames** was provided, use those names.

If **queryConfigNames** was NOT provided, read the entity's query
config file at
`packages/drizzle/src/queries/{kebab-case}.query.ts`
to discover all exported config objects. Each
exported `const` that ends with `QueryConfig` and
uses `as const satisfies QueryConfig<...>` should
get a corresponding response type.

If the query config file does not exist, STOP and
tell the user: "No query config file found at
packages/drizzle/src/queries/{kebab-case}.query.ts.
Create query configs first (use the
create-drizzle-query-config skill in
packages/drizzle/.claude/skills/), then create
response types."

Also check
`packages/drizzle/src/queries/utils.ts` for any
entity-specific configs that may live there instead
of in a dedicated file (this is rare; see the
form-configuration types file for an example).

### Step 3: Read reference type files

Read 2-3 existing type files to confirm the current
conventions before generating code. Choose files
based on complexity:

- **Simple** (basic InferQueryModel types only):
  `packages/trpc/src/types/obligation.types.ts`
- **Standard** (multiple configs, mixed naming):
  `packages/trpc/src/types/action.types.ts`
- **Complex** (extended types, interfaces, cross-file
  imports):
  `packages/trpc/src/types/issue.types.ts`

Note the exact patterns for:

- Import structure and ordering
- Type naming conventions per query config pattern
- When intersection types (`&`) are used to extend
  inferred types with aggregates or computed fields
- When separate `interface` types wrap row types
  into response shapes

### Step 4: Create the type file

Create the file at the path from Step 1.

**Import structure** (order matters, follow the
pattern in the reference files):

1. External type imports (if needed, e.g., domain
   types for extension interfaces):
   `import type { ... } from '@risksmart-app/...';`
2. `InferQueryModel` import (always required):
   `import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';`
   If any type uses `InferSelectModel`, import that
   too from the same path.
3. Query config imports from the drizzle package
   (import from the specific entity file, not the barrel):
   `import type { ... } from '@risksmart-app/drizzle/src/queries/{kebab-case}.query';`
4. Cross-file type imports (only if needed for
   extension interfaces):
   `import type { ... } from './other-entity.types';`

**Type naming conventions** -- derive the type name
from each query config name following these patterns
observed across the codebase:

- `get{Entity}ByIdQueryConfig` produces
  `Get{Entity}ByIdResponseRow` or
  `{Entity}ByIdResponseRow`
- `get{Entities}RegisterQueryConfig` produces
  `{Entity}RegisterResponseRow`
- `get{Entity}ListQueryConfig` or
  `get{Entities}QueryConfig` produces
  `{Entity}ResponseRow` or
  `{Entity}ListResponseRow`
- `get{Entities}By{Parent}IdQueryConfig` produces
  `Get{Entities}By{Parent}IdResponseRow`
- `my{Entities}QueryConfig` produces
  `My{Entities}ResponseRow`

The general rule: strip `QueryConfig` from the end,
strip the leading `get` (optional -- both patterns
exist), and append `ResponseRow`.

**Type definition pattern** -- every row type follows
this exact shape:

```typescript
export type {TypeName} = InferQueryModel<
  '{tableName}',
  typeof {queryConfigName}
>;
```

IMPORTANT: Some query configs may reference a
different table than the entity's primary table
(e.g., a risk type file may have a type using
`risk_assessment_result` table). Use the correct
table name from the query config's
`satisfies QueryConfig<'table'>` annotation.

**Extended types** (only when the user specifies
additional computed/aggregate fields):

- Use intersection types for adding aggregate counts
  or computed fields to a row type
- Use `interface` for wrapping row types into
  response shapes (e.g., arrays with
  form\_configuration)

If the user does not mention any extensions, only
create the basic `InferQueryModel` row types.

### Step 5: Update the barrel export

Read `packages/trpc/src/types/index.ts` and add
the new export in **alphabetical order**:

```typescript
export type * from './{kebab-case}.types';
```

Use `export type *` (not `export *`) since type
files should only contain type exports. The one
exception in the codebase is `permission.types.ts`
which exports a runtime value.

Insert the new line at the correct alphabetical
position among existing exports.

### Step 6: Verify consistency with query configs

Read the query config file one more time and confirm
that every exported query config has a corresponding
response type in the new file. If any are missing,
add them before finishing.

## Verification

1. **File exists**: The type file was created at
   `packages/trpc/src/types/{kebab-case}.types.ts`
2. **Barrel export**:
   `packages/trpc/src/types/index.ts` contains
   `export type * from './{kebab-case}.types'` in
   alphabetical order
3. **InferQueryModel import**: The file imports
   `InferQueryModel` as a type-only import from
   `'@risksmart-app/drizzle/src/db'`
4. **Query config imports**: All query config names
   are imported as type-only imports from
   `'@risksmart-app/drizzle/src/queries/{entity}.query'`
5. **No type casting**: The file contains zero
   instances of `as` followed by a type name. No
   `!` non-null assertions. The only valid `as`
   usage would be inside `as const satisfies` which
   should not appear in type files.
6. **Type naming**: Every exported type name ends
   with `ResponseRow`, `Response`, or `ResponseItem`
   following the naming patterns from the reference
   files
7. **Table name accuracy**: Each `InferQueryModel`
   call uses the correct snake\_case table name
   matching the query config's
   `satisfies QueryConfig<'table'>`. If the table
   name seems wrong, verify against the export names
   in `packages/drizzle/src/schema.ts` or the keys
   in `packages/drizzle/src/relations.ts`
8. **Complete coverage**: Every query config
   identified in Step 2 has a corresponding
   response type exported from the file
9. **Import paths**: All imports use extensionless
   paths (no `.js` or `.ts` suffix)
10. **No backend types**: The file does NOT import
    from or reference anything in
    `packages/trpc/src/types/backend/`
