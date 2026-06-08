---
name: create-drizzle-query-config
description: Create a Drizzle ORM query config file in packages/drizzle/src/queries/ that defines column selections and relation includes for an entity. Use when adding a new entity or when an existing entity needs new query config variants.
argument-hint: <entityName> <tableName> [configTypes]
allowed-tools: Read, Glob, Grep, Edit, Write
---

# Create Drizzle Query Config

## Required Inputs

- **entityName**: The entity name in camelCase
  (e.g., `action`, `thirdParty`, `internalAuditReport`).
  Used for variable naming and fragment imports.
- **tableName**: The Drizzle table name in
  snake_case (e.g., `action`, `third_party`,
  `internal_audit_report`). Used in
  `QueryConfig<'tableName'>`.
- **configTypes** (optional): Comma-separated list
  of config types to generate. Defaults to `register,byId`.
  Valid values: `register`, `byId`, `list`.

## Input Validation

1. Check that **entityName** is provided. If missing,
   STOP and tell the user: "Please provide the entity name
   in camelCase (e.g., action, thirdParty)."
2. Check that **tableName** is provided. If missing,
   STOP and tell the user: "Please provide the Drizzle
   table name in snake_case (e.g., action, third_party)."
3. If **configTypes** is provided, validate each
   comma-separated value is one of: `register`, `byId`,
   `list`. If invalid, STOP and report the invalid
   config type.

## Steps

### Step 1: Derive naming conventions

From the **entityName**, derive:

- **kebab-case**: insert hyphens before uppercase letters
  and lowercase (e.g., `thirdParty` becomes
  `third-party`). Used for file names.
- **PascalCase**: capitalize each segment
  (e.g., `ThirdParty`). Used for config name prefixes.
- **Plural PascalCase**: pluralize the PascalCase form
  (e.g., `ThirdParties`, `Actions`). Used for register
  config names.

### Step 2: Check for existing query config file

Check if
`packages/drizzle/src/queries/{kebab-case}.query.ts`
already exists.

If the file already exists, STOP and inform the user.
Ask whether they want to add new config exports to the
existing file instead.

### Step 3: Check for a base fragment

Look for a matching fragment file in
`packages/drizzle/src/queries/fragments/`.

- Read
  `packages/drizzle/src/queries/fragments/index.ts`
  to see what fragments are exported
- If a fragment exists for the entity (matching the
  camelCase entityName), read it to understand what
  columns it excludes/includes. Note the export name.
- If no fragment exists, the query configs will define
  their own `columns` directly. Proceed without a
  fragment.

Reference:
`packages/drizzle/src/queries/fragments/action.ts`
shows a typical fragment that excludes `OrgKey` and
`Meta` columns.

### Step 4: Determine which relations to include

Read the shared relation utilities at
`packages/drizzle/src/queries/utils.ts` to
understand what reusable fragments are available:

- `ownersAndContributors` - owners, contributors, groups
- `tagsAndDepartments` - tags with types, departments
- `ancestorContributors` - inherited contributors
- `scheduleAndState` - schedule and schedule state
- `relationFiles` - attached files
- `modifiedByAndCreatedByUser` - audit trail users

Ask the user which relations the entity needs. If they
do not specify, use these defaults:

- **register** config: `ownersAndContributors`,
  `tagsAndDepartments`, plus
  `modifiedByUser` and `createdByUser` inline
- **byId** config: `ownersAndContributors`,
  `tagsAndDepartments`, `ancestorContributors`,
  `relationFiles`
- **list** config: `ownersAndContributors`,
  `tagsAndDepartments`

### Step 5: Study reference query config files

Read 2-3 existing query config files to match the
exact style and structure. Choose based on entity
complexity:

- **Standard entity with fragment and utils**:
  `packages/drizzle/src/queries/action.query.ts`
  -- shows fragment spreading, utils spreading,
  inline user relations, and nested parent relations
- **Simple entity with explicit columns**:
  `packages/drizzle/src/queries/owner.query.ts`
  -- shows explicit column inclusion without
  fragments, simple `with` relations
- **Entity with custom schema relations**:
  `packages/drizzle/src/queries/form-configuration.query.ts`
  -- shows inline `satisfies` on nested relations,
  column exclusion pattern, custom relation shapes

Match the conventions observed in the reference files
exactly: import order, spacing, JSDoc comments, and
export style.

### Step 6: Create the query config file

Create the file at
`packages/drizzle/src/queries/{kebab-case}.query.ts`.

**Import order** (follow this exactly):

1. Type import for QueryConfig:
   `import type { QueryConfig } from '@risksmart-app/drizzle/src/db';`
2. Fragment import (only if a fragment exists from
   Step 3):
   `import { {entityName} } from '@risksmart-app/drizzle/src/queries/fragments';`
3. Utils import (only if using shared relations from
   Step 4):
   `import { ... } from './utils';`

**Config naming conventions:**

- `get{PluralEntities}RegisterQueryConfig` - register
  view (list with full detail)
- `get{Entity}ByIdQueryConfig` - single entity detail
- `get{Entity}ListQueryConfig` - lightweight list view

**Type annotation:** every config object MUST end with
`as const satisfies QueryConfig<'{tableName}'>`. Never
use type casting.

**Column patterns:**

- When a fragment exists, spread it at the top level:
  `{ ...{entityName}, with: { ... } }`
- When no fragment exists, define columns directly
  using either inclusion (`Id: true, Title: true`) or
  exclusion (`OrgKey: false, Meta: false`)
- Simple configs without relations omit the `with`
  property entirely

**Relation patterns within `with`:**

- Spread shared utils: `...ownersAndContributors`,
  `...tagsAndDepartments`, etc.
- Inline user references as:
  `createdByUser: { columns: { FriendlyName: true } }`
- Nested relations with their own column selections
  use inline `as const satisfies QueryConfig<'table'>`
  only when the nested relation needs explicit type
  narrowing (see the form-configuration reference)
- For simple nested relations within top-level configs,
  the inline `satisfies` is optional

**JSDoc comments:** add a JSDoc comment above each
config export describing its purpose. Reference
`packages/drizzle/src/queries/owner.query.ts` and
`packages/drizzle/src/queries/node.query.ts` for
the comment style used in simpler configs.

### Step 7: Update the barrel export

Read `packages/drizzle/src/queries/index.ts` and
add the new export in alphabetical order:

```text
export * from './{kebab-case}.query';
```

The exports in index.ts are sorted alphabetically.
Insert the new line in the correct position.

## Verification

After completing all steps, confirm each of these:

1. **Query config file exists** at
   `packages/drizzle/src/queries/{kebab}.query.ts`
2. **Barrel export updated**:
   `packages/drizzle/src/queries/index.ts` includes
   the new module in alphabetical order
3. **Import correctness**: the query config file
   imports `QueryConfig` as a type import, fragment
   from the correct path (if applicable), and utils
   from `'./utils'` (if applicable)
4. **No type casting**: the file contains zero
   instances of `as` followed by a type name (other
   than `as const satisfies`), no `!` non-null
   assertions, no `<Type>` angle-bracket casts
5. **Type annotations**: every exported config object
   ends with
   `as const satisfies QueryConfig<'{tableName}'>`
6. **Naming conventions**: config export names follow
   `get{Entity/Entities}{Register|ById|List}QueryConfig`
7. **Fragment usage**: if a base fragment exists in
   `packages/drizzle/src/queries/fragments/`, configs
   spread it; if not, columns are defined directly
8. **Utils usage**: shared relation patterns are
   imported from `'./utils'` rather than defined
   inline
9. **Import paths**: all imports use extensionless
   paths (no `.js` suffix)
