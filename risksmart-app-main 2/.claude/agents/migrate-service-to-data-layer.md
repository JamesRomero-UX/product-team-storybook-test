---
name: migrate-service-to-data-layer
description: Migrates tRPC service methods from direct Drizzle queries to the data-layer API client pattern. Creates missing data-layer infrastructure (query configs, repositories, processors, routes) and API client methods, then rewrites the tRPC service. Use when converting existing Drizzle-based service methods to use the data-layer HTTP API.
tools: Read, Write, Edit, Glob, Grep, Bash, Task
model: sonnet
memory: project
---

# Migrate tRPC Service to Data-Layer API Client

You migrate tRPC service methods from the deprecated direct-Drizzle
pattern to the target data-layer API client pattern. This includes
creating any missing data-layer infrastructure (query configs,
repositories, processors, routes) and API client methods. Each
invocation migrates a single service file.

## Input

The prompt contains:

- **Entity name** (required): The service entity name, e.g.
  `IssueUpdate`, `Risk`, `Control`
- **Method names** (optional): Specific methods to migrate. If
  omitted, migrate ALL Drizzle-based methods in the service.

## Skill Inventory

### Drizzle skills (`packages/drizzle/.claude/skills/`)

| Skill | Purpose |
|---|---|
| `create-drizzle-query-config` | Drizzle query config for column selections and relations |

### Data-layer skills (`services/data-layer/.claude/skills/`)

| Skill | Purpose |
|---|---|
| `create-data-layer-repository` | Drizzle ORM repository with factory pattern (also creates types file) |
| `create-data-layer-schema` | Zod validation schemas for mutation endpoints |
| `create-http-read-processor` | HTTP read processor (get-all, get-by-id, get-by-parent, get-register) |
| `create-http-create-processor` | HTTP create mutation processor |
| `create-http-update-processor` | HTTP update mutation processor |
| `create-http-delete-processor` | HTTP delete mutation processor |
| `register-data-layer-route` | Register routes in the HTTP handler |

### tRPC skills (`packages/trpc/.claude/skills/`)

| Skill | Purpose |
|---|---|
| `create-trpc-response-types` | Response types inferred from Drizzle query configs |

## Dependency Order

Skills must be executed in dependency order:

```
[drizzle] query-config → [data-layer] repository → schema (mutations only)
                                  ↓
                        processors → routes → API client method → service rewrite
```

## Reference Files

These define the canonical target patterns for the service rewrite:

- **Target read pattern**:
  `packages/trpc/src/services/frontend/action.service.ts`
- **Target mutation pattern**:
  `packages/trpc/src/services/frontend/form-configuration.service.ts`
- **Data-layer API client** (existing methods + pattern for new):
  `packages/trpc/src/clients/data-layer-api-client.ts`
- **Client utilities** (toApiContext):
  `packages/trpc/src/clients/client-utils.ts`
- **Error mapping** (mapHttpStatusToTRPCError):
  `packages/trpc/src/utils/error-mapping.ts`

## Workflow

### Phase 1: Analysis

#### Step 1 — Read memory

Read the memory file at the project memory directory
(`migrate-service-to-data-layer-agent.md`). If it does not
exist, skip.

#### Step 2 — Derive names

From the entity name, derive:

- **PascalCase**: e.g. `IssueUpdate`
- **camelCase**: e.g. `issueUpdate`
- **kebab-case**: e.g. `issue-update`
- **snake_case** (Drizzle table name): e.g. `issue_update`
- **Service file path**:
  `packages/trpc/src/services/frontend/{kebab-case}.service.ts`

#### Step 3 — Read the existing service

Read the service file. If it does not exist, STOP and report.

For each method, categorize as:

- **Drizzle-based** — contains any of: `createDrizzleClient`,
  `db.org((tx)`, `tx.query.`, `filter(` from permitio
- **Already migrated** — calls `dataLayerApiClient.` or
  `executeAsyncRequest`

If specific methods were requested, only target those. Otherwise
target all Drizzle-based methods.

If no Drizzle-based methods remain, STOP and report the service
is fully migrated.

For each Drizzle-based method, extract:

- The **query config** name being used (e.g.
  `getIssueUpdateByIdQueryConfig`)
- The **Drizzle table** being queried (e.g. `issue_update`)
- The **where clause** fields (e.g. `{ Id: id }`,
  `{ ParentIssueId: id }`)
- The **operation type**: read (`findMany`/`findFirst`) or
  mutation (`insert`/`delete`/`update`)
- The **return shape** (what the method returns after filtering)
- The **filter resource type** (e.g. `'rs_node'`)

#### Step 4 — Audit existing data-layer artifacts

Check which data-layer artifacts already exist for this entity:

1. **Query config**:
   `packages/drizzle/src/queries/{kebab-case}.query.ts`
2. **Repository**:
   `services/data-layer/src/repositories/{kebab-case}-repository.ts`
3. **Processors**:
   `services/data-layer/src/handlers/http/client/processors/{kebab-case}/`
   or `{plural-kebab-case}/`
4. **Routes**: Grep for the entity path in
   `services/data-layer/src/handlers/http/client/handler.ts`
5. **API client methods**: Grep for the entity in
   `packages/trpc/src/clients/data-layer-api-client.ts`
6. **tRPC response types**:
   `packages/trpc/src/types/{kebab-case}.types.ts`

Build a checklist of what EXISTS vs what is MISSING. Only create
what is missing.

#### Step 5 — Build the migration plan

For each Drizzle-based method, determine what needs to happen:

**For read methods** (getById, getRegister, getByParent):

1. Data-layer query config (if missing)
2. Data-layer repository method (if missing)
3. Data-layer read processor (if missing)
4. Data-layer route registration (if missing)
5. tRPC response types (if missing)
6. Data-layer API client method (if missing)
7. Service method rewrite

**For mutation methods** (insert, update, delete):

1. Data-layer schema (if missing)
2. Data-layer repository method (if missing)
3. Data-layer mutation processor (if missing)
4. Data-layer route registration (if missing)
5. Data-layer API client method (if missing)
6. Service method rewrite

Map each service method to the read processor variant:

| Service method pattern | Processor variant |
|---|---|
| `getById` / `get{Entity}ById` | `get-by-id` |
| `get{Entities}Register` | `get-register` |
| `get{Entity}sByParent{X}Id` | `get-by-parent` |
| All entities (no filter) | `get-all` |

If a method has complex post-processing logic after the Drizzle
query (sorting, grouping, derived fields, multiple queries
combined) that the data-layer endpoint cannot handle, STOP and
report the complexity to the user. Do not silently drop logic.

### Phase 2: Data-Layer Infrastructure

Execute skills in dependency order. For each skill, read its
SKILL.md from the appropriate directory, then execute the
instructions.

#### Step 6 — Create query config (if missing)

If a query config does not exist for the entity, invoke the
`create-drizzle-query-config` skill.

**Skill location**:
`packages/drizzle/.claude/skills/create-drizzle-query-config/SKILL.md`

**Arguments**: `{camelCase} {snake_case} {configTypes}`

Determine `configTypes` from the service methods being migrated:

- `getById` method → needs `byId` config
- `getRegister` method → needs `register` config
- `getByParent` method → needs `byId` or a custom config
- list/getAll method → needs `list` config

If query configs already exist in
`packages/drizzle/src/queries/{kebab-case}.query.ts`, check
whether they cover the columns and relations needed.

#### Step 7 — Create repository (if missing)

If a repository does not exist, invoke the
`create-data-layer-repository` skill.

**Skill location**:
`services/data-layer/.claude/skills/create-data-layer-repository/SKILL.md`

**Arguments**: `{kebab-case}`

The repository needs methods matching the service operations:

- `getById` service method → `getById` repository method
- `getRegister` → `getRegister` or `getAll` with filters
- `getByParent` → `getByParent{X}Id` method
- `insert` → `insert` method
- `delete` → `delete` / `deleteMany` method

#### Step 8 — Create schemas (if missing, mutations only)

If mutation methods are being migrated and schemas don't exist,
invoke the `create-data-layer-schema` skill.

**Skill location**:
`services/data-layer/.claude/skills/create-data-layer-schema/SKILL.md`

**Arguments**: `{kebab-case} {operations}`

#### Step 9 — Create processors (if missing)

For each missing processor, invoke the appropriate skill:

- **Read**: `create-http-read-processor` with
  `{kebab-case} {variant}`
- **Create**: `create-http-create-processor` with `{kebab-case}`
- **Update**: `create-http-update-processor` with `{kebab-case}`
- **Delete**: `create-http-delete-processor` with `{kebab-case}`

**Skill location**:
`services/data-layer/.claude/skills/{skill-name}/SKILL.md`

#### Step 10 — Register routes (if missing)

If any new processors were created, invoke the
`register-data-layer-route` skill.

**Skill location**:
`services/data-layer/.claude/skills/register-data-layer-route/SKILL.md`

**Arguments**: `{kebab-case} {HTTP-methods}`

Where `{HTTP-methods}` is a comma-separated list of the HTTP
methods for the new processors (e.g. `GET` or `GET,POST,DELETE`).

#### Step 11 — Create tRPC response types (if missing)

If the tRPC response types file does not exist, invoke the
`create-trpc-response-types` skill.

**Skill location**:
`packages/trpc/.claude/skills/create-trpc-response-types/SKILL.md`

**Arguments**: `{camelCase} {snake_case}`

### Phase 3: API Client & Service Rewrite

#### Step 12 — Add data-layer API client methods (if missing)

Read
`packages/trpc/src/clients/data-layer-api-client.ts`
to understand the existing pattern.

For each missing client method, add it to the
`DataLayerApiClient` class following the established patterns:

**For read-by-id methods:**

Follow the `getActionById` method pattern:
- `method: 'GET'`, `path: '/{entities}/{id}'`
- `isResponseWrapped: true`, `isSingleItem: true`
- Returns `Promise<{ data: ResponseRow[]; status: number }>`

**For register methods:**

Follow the `getActionsRegister` method pattern:
- `method: 'GET'`, `path: '/{entities}/register'`
- Query params for filters (parentId, departmentTypeIds, etc.)
- Returns
  `Promise<{ data: PaginatedResponse<ResponseRow>; status: number }>`

**For get-by-parent methods:**

Follow the `getActionUpdatesByParentActionId` method pattern:
- `method: 'GET'`,
  `path: '/{entities}/by-parent/{parentEntityId}'`
- Returns
  `Promise<{ data: PaginatedResponse<ResponseRow>; status: number }>`

**For mutation methods:**

Follow existing create/delete method patterns:
- POST for create, DELETE for delete, PUT for update
- `isResponseWrapped: true` for creates/updates
- `correlationId` parameter for mutations

Import any new response types at the top of the file from
`'../types'`.

#### Step 13 — Rewrite service methods

Read these reference files:

- `packages/trpc/src/services/frontend/action.service.ts`
  (canonical read pattern)
- `packages/trpc/src/services/frontend/form-configuration.service.ts`
  (canonical mutation pattern — only if migrating mutations)

For each Drizzle-based method, rewrite it:

**Read methods (getById, getRegister, getByParent):**

- Call `dataLayerApiClient.{method}(toApiContext(ctx), ...args)`
- Check `if (status >= 400)` and throw
  `mapHttpStatusToTRPCError(status, data, { 404: '...' })`
- `getById`: return `data` directly
- `getRegister`: return `{ {entityName}: data.data }`
  (match existing return shape)
- `getByParent`: return `data.data`

**Mutation methods (insert, update, delete):**

- Use `executeAsyncRequest` with `requestType`,
  `buildRequestBody`, `apiCall`, `errorMessages`
- For deletes: `successStatus: 204`
- For updates: `successStatus: 200`

#### Step 14 — Update imports

**Add** (if not already present):

- `import { toApiContext } from '../../clients/client-utils';`
- `import { dataLayerApiClient } from '../../clients/data-layer-api-client';`
- `import { mapHttpStatusToTRPCError } from '../../utils/error-mapping';`
- For mutations:
  `import { executeAsyncRequest } from '../../clients/async-request';`

**Remove** (if no longer used by ANY method in the file):

- `import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';`
- Query config imports from `@risksmart-app/drizzle/src/queries/...`
- `import { filter } from '@risksmart-app/permitio/src/permit';`
- Response type imports from `'../../types/index'` ONLY if they
  were exclusively used as `filter<T>()` type parameters and not
  referenced elsewhere in the file

Check every removed import is truly unused before removing.

#### Step 15 — Verify return shape compatibility

Read the service interface from
`packages/trpc/src/services/service.types.ts` and confirm each
migrated method's return type matches:

- Interface returns `T[]`, client returns
  `PaginatedResponse<T>`: use `data.data`
- Interface returns `{ entity: T[] }`, client returns
  `PaginatedResponse<T>`: use `{ entity: data.data }`
- Interface returns `T[]`, client returns array via
  `isSingleItem: true`: return `data` directly

### Phase 4: Verification

#### Step 16 — Run lint

Run scoped lint on both affected packages:

```bash
pnpm exec turbo lint --filter=@risksmart-app/trpc --filter=@risksmart-app/data-layer
```

Fix issues in files you modified and re-run. Ignore pre-existing
warnings in untouched files.

#### Step 17 — Record learnings

If you encountered anything unexpected (unusual return shapes,
complex post-processing, edge cases), write it to the memory file
`migrate-service-to-data-layer-agent.md` in the project memory
directory. Group entries by topic, not date.

## Loading Skills

Before executing any skill, **Read** its SKILL.md to load the
instructions. Only read skills you need — do not read all upfront.

Skill locations:

- Drizzle:
  `packages/drizzle/.claude/skills/{skill-name}/SKILL.md`
- Data-layer:
  `services/data-layer/.claude/skills/{skill-name}/SKILL.md`
- tRPC:
  `packages/trpc/.claude/skills/{skill-name}/SKILL.md`

## Important Notes

- NEVER use type casting (`as`, `<Type>`, or `!`). Find
  type-safe alternatives.
- Do NOT change the service interface or method signatures.
  The migration is an internal implementation change only.
- Do NOT modify the router file. The router calls the same
  service methods — only the internal implementation changes.
- If a method has complex post-processing (sorting, grouping,
  derived fields, multiple queries combined) that cannot be
  delegated to the data-layer, STOP and report to the user.
- Hybrid services (some methods Drizzle, some already migrated)
  are normal. Only migrate the specified methods.
- Query configs live exclusively in `packages/drizzle/src/queries/`.
  Repositories import from there directly. Do not duplicate configs.
- Skip any skill whose output artifact already exists. Only
  create what is missing.
