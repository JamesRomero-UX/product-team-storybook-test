---
name: create-data-layer-repository
description: Creates a Drizzle ORM repository in services/data-layer using the factory pattern with DB['transaction']. Use when adding a new entity that needs database CRUD operations.
argument-hint: <entity-name> (e.g. "risk-score", "audit-finding")
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

# Create Data Layer Repository

## Required Inputs

- **entityName**: Entity name in kebab-case (e.g.
  `risk-score`, `audit-finding`). Used to derive file
  names, function names, and Drizzle table references.

## Input Validation

Check that **entityName** is provided and is a non-empty
kebab-case string. If missing, STOP and tell the user:
"Please provide an entity name in kebab-case
(e.g. `risk-score`)."

## Prerequisites

Before running this skill, ensure the query config exists
in the drizzle package. If it doesn't, use the
`create-drizzle-query-config` skill first
(in `packages/drizzle/.claude/skills/`):

- `packages/drizzle/src/queries/{kebab}.query.ts`

The types file at `services/data-layer/src/types/{kebab}.types.ts`
may or may not exist. If it is missing, Step 3 below
covers creating it.

## Steps

### 1. Derive naming conventions

From **entityName**, derive:

- **kebab-case**: **entityName** as-is (file names)
- **snake_case**: replace hyphens with underscores
  (Drizzle table name)
- **PascalCase**: capitalize each word, remove hyphens
  (type prefixes)
- **camelCase**: PascalCase with lowercase first letter
  (variable names)

Example for `action-update`:

- kebab: `action-update`
- snake: `action_update`
- Pascal: `ActionUpdate`
- camel: `actionUpdate`

### 2. Determine which methods are needed

Ask the user which repository methods are required.
Common methods to offer:

- **getById** - Find a single record by ID
- **getAll** / **getRegister** - Find multiple records
  with optional filters
- **insert** - Insert a new record, return inserted row
- **delete** - Delete by ID, return affected row count
- **deleteMany** - Delete by multiple IDs
- **persist** - Atomic upsert (insert or update on
  conflict)

If the user does not specify, default to `getById` and
`getAll`.

### 3. Create the types file (if missing)

Check whether
`services/data-layer/src/types/{kebab}-types.ts`
exists. If it does, skip to Step 4.

If it does not exist, create it. The types file
derives typed row shapes from the drizzle query
configs using `InferQueryModel`.

Reference:
`services/data-layer/src/types/action.types.ts`
for the standard pattern.

**Import structure:**

1. `import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';`
2. Import query config names as type imports from
   the specific drizzle query file:
   `import type { ... } from '@risksmart-app/drizzle/src/queries/{kebab-case}.query';`

**Type naming conventions:**

- `get{Entity}ByIdQueryConfig` →
  `Get{Entity}ByIdResponseRow`
- `get{Entities}RegisterQueryConfig` →
  `{Entity}RegisterResponseRow`
- `get{Entity}ListQueryConfig` →
  `{Entity}ListResponseRow`
- `get{Entities}By{Parent}IdQueryConfig` →
  `Get{Entities}By{Parent}IdResponseRow`

**Type definition pattern:**

```typescript
export type {TypeName} = InferQueryModel<
  '{tableName}',
  typeof {queryConfigName}
>;
```

Create one type per exported query config from
the drizzle query file.

Then update `services/data-layer/src/types/index.ts`
to add the new export in alphabetical order. Note
this barrel file uses `.js` extensions:

```text
export * from './{kebab-case}.types.js';
```

### 4. Create the repository file

Create
`services/data-layer/src/repositories/{kebab}-repository.ts`.

Reference these files for the pattern:

- `services/data-layer/src/repositories/action-update-repository.ts`
  for the most complete example with insert, getById,
  getByParentId, delete, and deleteMany methods
- `services/data-layer/src/repositories/form-field-repository.ts`
  for persist/upsert with `onConflictDoUpdate`,
  transactional multi-table writes, and delete within
  a transaction
- `services/data-layer/src/repositories/node-repository.ts`
  for a minimal read-only repository
- `services/data-layer/src/repositories/risk-repository.ts`
  for the `insertWithRelationships` pattern — use this
  when the entity supports owners, owner groups,
  contributors, contributor groups, tags, or departments

**Relationship fields (owners, contributors, tags, departments):**

If the entity supports any of these relationship tables,
the `insert` method alone is insufficient. You must also
implement `insertWithRelationships`.

**CRITICAL**: The main entity insert and ALL relationship
inserts must execute inside a **single `db(async (tx) => {
... })` transaction callback**. This makes the entire
operation atomic — if any relationship insert fails, the
main insert is automatically rolled back. Never split these
into separate `db()` calls.

```typescript
export interface {Pascal}Relationships {
  ownerUserIds: string[];
  ownerGroupIds: string[];
  contributorUserIds: string[];
  contributorGroupIds: string[];
  tagTypeIds: string[];
  departmentTypeIds: string[];
}

insertWithRelationships: async (
  values: typeof {snake}.$inferInsert,
  relationships: {Pascal}Relationships,
  context: ServiceContext
) =>
  // Single db() call = single atomic transaction.
  // If any insert below fails, all inserts are rolled back.
  await db(async (tx) => {
    try {
      const [inserted] = await tx
        .insert({snake})
        .values(values)
        .returning();

      if (!inserted?.Id) {
        throw new Error('Failed to retrieve inserted {entity} ID');
      }

      const parentId = inserted.Id;
      const { userId, orgKey } = context;
      const relationBase = {
        ParentId: parentId,
        OrgKey: orgKey,
        CreatedByUser: userId,
        ModifiedByUser: userId,
      };

      // Promise.all runs relationship inserts in parallel,
      // but all within the same transaction (tx).
      await Promise.all([
        relationships.ownerUserIds.length > 0
          ? tx.insert(owner).values(
              relationships.ownerUserIds.map((userId) => ({ ...relationBase, UserId: userId }))
            ).returning()
          : Promise.resolve([]),
        relationships.ownerGroupIds.length > 0
          ? tx.insert(owner_group).values(
              relationships.ownerGroupIds.map((userGroupId) => ({ ...relationBase, UserGroupId: userGroupId }))
            ).returning()
          : Promise.resolve([]),
        relationships.contributorUserIds.length > 0
          ? tx.insert(contributor).values(
              relationships.contributorUserIds.map((userId) => ({ ...relationBase, UserId: userId }))
            ).returning()
          : Promise.resolve([]),
        relationships.contributorGroupIds.length > 0
          ? tx.insert(contributor_group).values(
              relationships.contributorGroupIds.map((userGroupId) => ({ ...relationBase, UserGroupId: userGroupId }))
            ).returning()
          : Promise.resolve([]),
        relationships.tagTypeIds.length > 0
          ? tx.insert(tag).values(
              relationships.tagTypeIds.map((tagTypeId) => ({ ...relationBase, TagTypeId: tagTypeId }))
            ).returning()
          : Promise.resolve([]),
        relationships.departmentTypeIds.length > 0
          ? tx.insert(department).values(
              relationships.departmentTypeIds.map((departmentTypeId) => ({ ...relationBase, DepartmentTypeId: departmentTypeId }))
            ).returning()
          : Promise.resolve([]),
      ]);

      return inserted;
    } catch (error) {
      logger.error('Failed to insert {entity} with relationships', error as Error);
      throw error;
    }
  }),
```

**`updateWithRelationships` — diff-based relationship sync:**

For UPDATE operations, do NOT delete all relationships
and re-insert. All relationship tables have audit triggers,
so delete-all/reinsert generates spurious DELETE + INSERT
audit entries and resets `CreatedAtTimestamp` on unchanged
rows.

Instead, use a two-step diff approach:

1. **Delete only removed rows**: Delete where `ParentId = id`
   AND the key column `NOT IN` the new array. If the new
   array is empty, delete all rows for that parent.
2. **Insert only new rows**: Insert with
   `.onConflictDoNothing()` — existing rows are skipped,
   only truly new relationships are inserted.

```typescript
updateWithRelationships: async (
  id: string,
  values: Partial<typeof {snake}.$inferInsert>,
  relationships: {Pascal}Relationships,
  context: ServiceContext
) =>
  await db(async (tx) => {
    try {
      const [updated] = await tx
        .update({snake})
        .set({
          ...values,
          ModifiedAtTimestamp: sql`statement_timestamp()`,
        })
        .where(and(eq({snake}.Id, id), eq({snake}.OrgKey, context.orgKey)))
        .returning();

      if (!updated?.Id) {
        throw new Error('Failed to retrieve updated {entity}');
      }

      const { userId, orgKey } = context;
      const relationBase = {
        ParentId: id,
        OrgKey: orgKey,
        CreatedByUser: userId,
        ModifiedByUser: userId,
      };

      // Step 1: Delete only removed relationships
      await Promise.all([
        relationships.ownerUserIds.length > 0
          ? tx.delete(owner).where(
              and(
                eq(owner.ParentId, id),
                notInArray(owner.UserId, relationships.ownerUserIds)
              )
            )
          : tx.delete(owner).where(eq(owner.ParentId, id)),
        // ... same pattern for all relationship types
      ]);

      // Step 2: Insert only new relationships
      await Promise.all([
        relationships.ownerUserIds.length > 0
          ? tx.insert(owner).values(
              relationships.ownerUserIds.map((userId) => ({
                ...relationBase,
                UserId: userId,
              }))
            ).onConflictDoNothing()
          : Promise.resolve(),
        // ... same pattern for all relationship types
      ]);

      return updated;
    } catch (error) {
      logger.error('Failed to update {entity} with relationships', error as Error);
      throw error;
    }
  }),
```

Import `notInArray` from `drizzle-orm` alongside `eq`,
`and`, `inArray`, `sql`.

Reference:
`services/data-layer/src/repositories/risk-repository.ts`
for the complete `updateWithRelationships` implementation.

Import the relation tables from `@risksmart-app/drizzle/src/schema`:
`owner`, `owner_group`, `contributor`, `contributor_group`,
`tag`, `department`. Import `ServiceContext` from `../types`.

Each relation table row needs: `ParentId` (the newly
inserted entity's `Id`), `OrgKey`, `CreatedByUser`,
`ModifiedByUser`, plus the entity-specific ID column
(`UserId` for owner/contributor, `UserGroupId` for groups,
`TagTypeId` for tags, `DepartmentTypeId` for departments).

Only include the relationship types the entity actually
uses. Omit `tagTypeIds`/`departmentTypeIds` if the entity
does not have those relations.

Key rules for the factory function:

- Export a function named
  `create{Pascal}Repository(db: DB['transaction'])`
- Import `DB` from `@risksmart-app/drizzle/src/db`
- Return an object literal with method properties
- Initialize logger with
  `const logger = getLogger()` at module level
- Import `getLogger` from `../utils/logger`

Key rules for each method:

- Wrap the body in try/catch
- In catch: call
  `logger.error(message, { error, ...context })`
  then re-throw
- For reads: use
  `db((tx) => tx.query.{snake}.findMany(...))`
  or `findFirst(...)`, spreading the query config.
  **IMPORTANT**: Relational queries (`tx.query.*`) MUST use
  rbqv2 object-based `where` clauses — NOT `eq()`/`and()`
  from drizzle-orm. Example:
  `findFirst({ where: { Id: someId } })` or
  `findMany({ where: { Id: { in: ids } } })`.
  The `eq()`/`and()`/`inArray()` operators are only for
  CRUD operations (`tx.insert()`, `tx.delete()`,
  `tx.update()`).
- For inserts: use
  `db(async (tx) => tx.insert(table).values(values).returning())`
- For deletes: use
  `db(async (tx) => tx.delete(table).where(...).returning(...))`
- For updates: MUST set
  `ModifiedAtTimestamp: sql\`statement_timestamp()\``
  explicitly in the `.set()` call. The DB column default
  only applies on INSERT — without this, the modified
  timestamp is never refreshed on updates. Never accept
  timestamps from the caller; always set them internally
  in the repository. Import `sql` from `drizzle-orm`.
- For upserts: use `.onConflictDoUpdate({ target, set })`
  inside a `db(async (tx) => { ... })` transaction.
  Include `ModifiedAtTimestamp: sql\`statement_timestamp()\``
  in the `set` object for the same reason as updates
- Import table references from
  `@risksmart-app/drizzle/src/schema`
- Import operators (`eq`, `and`, `inArray`, `sql`) from
  `drizzle-orm` as needed
- For getById returning null when not found: use
  `findMany` then check `data.length === 0`

Export the repository type at the bottom:

```typescript
export type {Pascal}Repository =
  ReturnType<typeof create{Pascal}Repository>;
```

### 5. Register in barrel exports

Update `services/data-layer/src/repositories/index.ts`
to add `export * from './{kebab}-repository';` in
alphabetical order.

Reference `services/data-layer/src/repositories/index.ts`
for the alphabetical ordering convention.

## Verification

After completing all steps, confirm each of these:

1. **Repository file exists** at
   `services/data-layer/src/repositories/{kebab}-repository.ts`
2. **Factory function signature** is
   `create{Pascal}Repository(db: DB['transaction'])`
   with no type casting
3. **Every method** has try/catch with
   `logger.error(...)` and re-throw
4. **Barrel export** in
   `services/data-layer/src/repositories/index.ts`
   includes the new module in alphabetical order
5. **No type casting** (`as`, `<Type>`, or `!`) is used
   anywhere in the new file
