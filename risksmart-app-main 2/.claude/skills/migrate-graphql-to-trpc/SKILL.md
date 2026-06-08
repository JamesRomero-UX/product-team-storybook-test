---
name: migrate-graphql-to-trpc
description: Orchestrates a full GraphQL-to-tRPC migration by analyzing a GraphQL query/mutation, building a plan across all 5 layers (data-layer, tRPC, web, request-state-api, trpc-api-tests), and dispatching specialized sub-agents in parallel. Use when migrating any GraphQL document to the tRPC stack.
argument-hint: <graphql-query-or-mutation-name>
allowed-tools: Task, Read, Glob, Grep, Bash, Explore
---

# Migrate GraphQL to tRPC

## Required Arguments

- `$1` — The GraphQL query or mutation name exactly as it
  appears in the `.graphql` file (e.g., `getActionById`,
  `insertChildAction`, `deleteActions`).

## Argument Validation

Check that `$1` is provided and non-empty. If missing, STOP
and tell the user:

> Usage: migrate-graphql-to-trpc <queryOrMutationName>
>
> Provide the GraphQL query or mutation name as it appears
> in the .graphql file (e.g., getActionById).

Do not proceed until the argument is validated.

## Steps

### Phase 1: Planning (via Explore Agent)

#### Step 1 — Dispatch Explore agent for research

Use the Task tool with `subagent_type: "Explore"` and
thoroughness level `"very thorough"` to research the
codebase. The Explore agent should gather ALL information
needed to build the migration plan in a single pass.

Construct the Explore agent prompt with these instructions:

> I need to plan a GraphQL-to-tRPC migration for the
> query/mutation named `$1`. Research the codebase and
> return a structured report with the following sections.
>
> **Section 1: GraphQL Document**
>
> 1. Search for the `.graphql` file containing this
>    definition by grepping for `^(query|mutation) $1`
>    inside `packages/web-graphql-client/graphql/`.
> 2. Read the full `.graphql` file and extract:
>    - Operation type: `query` or `mutation`
>    - Root field name (the entity being queried)
>    - Entity directory name (the subdirectory)
>    - All fragments used (`...FragmentName` references)
>    - All variables (name, type, required?)
>    - All nested relations beyond the root fragment
>      (e.g., `tags`, `departments`, `files`, `owners`)
>    - Query modifiers: `distinct_on`, `order_by`,
>      `limit`, `_aggregate`, complex `where` clauses
> 3. For each fragment referenced, find and read its
>    definition file in the same graphql directory to
>    list all fields it selects.
>
> **Section 2: Drizzle Table & Relations**
>
> 1. Search `packages/drizzle/src/schema.ts` for an
>    exported table matching the root field name.
> 2. Read `packages/drizzle/src/relations.ts` and find
>    the relation block for that table.
> 3. Check `packages/drizzle/src/queries/fragments/` for
>    a fragment file matching the entity.
> 4. Report the Drizzle table export name, all available
>    relations, and the fragment columns if found.
>
> **Section 3: Existing Artifacts**
>
> Check each of these locations and report whether the
> artifact EXISTS or is MISSING:
>
> Data layer:
>
> - Processor: `services/data-layer/src/handlers/http/processors/{entity}/`
> - Repository: `services/data-layer/src/repositories/{entity}-repository.ts`
> - Route: grep for the entity in `services/data-layer/src/handlers/http/handler.ts`
>
> tRPC:
>
> - Query config: `packages/trpc/src/queries/{entity}.query.ts`
> - Response types: `packages/trpc/src/types/{entity}.types.ts`
> - Service: `packages/trpc/src/services/frontend/{entity}.service.ts`
> - Router: `packages/trpc/src/routers/frontend/{entity}.router.ts`
> - API client method: grep for the query name in `packages/trpc/src/clients/data-layer-api-client.ts`
>
> Web:
>
> - Hook: `packages/web/src/hooks/queries/{entity}/use{PascalName}.tsx`
> - Barrel export: grep for the hook name in `packages/web/src/hooks/queries/index.ts`
> - Component usages: grep for `use{PascalName}Query` or `{PascalName}Document` across `packages/web/src/` and list ALL matching files
>
> Request state API (only if mutation):
>
> - Event routing: grep in `services/request-state-api/src/event-routing.ts`
> - Validation schemas: check `services/request-state-api/src/validation/`
>
> For existing artifacts, also note whether they already
> cover THIS specific query/mutation (e.g., a query
> config that already has the right columns and
> relations) or just exist for the entity in general.
>
> **Section 3b: Schedule State Side-Effects (mutations only)**
>
> Search the corresponding rest-api handler for
> schedule state refresh calls. Grep for
> `refreshRiskRatingScheduleState`,
> `refreshRiskImpactScheduleState`,
> `refreshRiskScheduleState`,
> `refreshControlScheduleState`,
> `refreshDocumentScheduleState`,
> `refreshObligationScheduleState`, or
> `refreshIndicatorScheduleState` in the rest-api
> handler that implements this mutation (search
> `packages/rest-api/src/handlers/` for the entity
> name).
>
> If ANY schedule state refresh call is found:
> - Note which function is called and on which entity
>   IDs (e.g., "calls refreshRiskRatingScheduleState
>   for each riskId after insert")
> - Note whether the call depends on feature flags
>   (e.g., impacts feature check)
> - Report this as: **SCHEDULE REFRESH REQUIRED: {function}
>   on {entityIds} after {operation}**
>
> The migrated tRPC service MUST replicate this
> schedule refresh using the `@risksmart-app/schedule-state`
> package (NOT direct DB calls, NOT GraphQL).
>
> **Section 4: Canonical Examples**
>
> Read these canonical reference files and summarize the
> naming patterns used:
>
> - `packages/trpc/src/queries/action.query.ts`
> - `packages/trpc/src/types/action.types.ts`
> - `packages/trpc/src/services/frontend/action.service.ts`
> - `packages/trpc/src/routers/frontend/action.router.ts`
> - `packages/trpc/src/clients/data-layer-api-client.ts` (just the getActionById method)
> - `services/data-layer/src/handlers/http/processors/actions/get-by-id.ts`
> - `services/data-layer/src/repositories/action-repository.ts` (just the getById method)
> - `packages/web/src/hooks/queries/action/useGetActionById.tsx`
>
> Return ALL findings in a clearly structured report
> with the four sections above. Include full file
> contents where relevant (GraphQL document, fragment
> definitions, Drizzle relations). This data will be
> used to build the migration plan.

If the Explore agent reports that no `.graphql` file was
found, STOP and tell the user the document could not be
located.

#### Step 2 — Derive naming conventions

Using the Explore agent's report and the canonical action
example patterns, determine all names needed by each
agent:

- **Query config name**: e.g., `getActionByIdQueryConfig`
  (pattern from `packages/trpc/src/queries/action.query.ts`)
- **Response type name**: e.g., `GetActionByIdResponseRow`
  (pattern from `packages/trpc/src/types/action.types.ts`)
- **Processor function name**: e.g.,
  `getActionByIdProcessor`
  (pattern from
  `services/data-layer/src/handlers/http/processors/actions/get-by-id.ts`)
- **Repository method name**: e.g., `getById`
  (pattern from
  `services/data-layer/src/repositories/action-repository.ts`)
- **Route path**: e.g., `GET /actions/{id}`
  (pattern from
  `services/data-layer/src/handlers/http/handler.ts`)
- **Service method name**: e.g., `getById`
  (pattern from
  `packages/trpc/src/services/frontend/action.service.ts`)
- **Router procedure name**: e.g., `actionById`
  (pattern from
  `packages/trpc/src/routers/frontend/action.router.ts`)
- **API client method name**: e.g., `getActionById`
  (pattern from
  `packages/trpc/src/clients/data-layer-api-client.ts`)
- **Hook name**: e.g., `useGetActionById`
  (pattern from
  `packages/web/src/hooks/queries/action/useGetActionById.tsx`)
- **tRPC router path**: e.g.,
  `trpc.frontend.action.actionById`
  (from the hook's `trpcQueryOptions` call)
- **GraphQL-to-tRPC map key**: e.g., `{ action: data }`
  (from the hook's `mapTrpcDataToGraphQL`)

For mutations, also determine:

- **Command type name**: e.g., `CREATE_ACTION_UPDATE`
- **Event type names**: e.g., `ActionUpdateCreated` /
  `ActionUpdateCreateFailed`
- **Request type interface name**: e.g.,
  `CreateActionUpdateRequest`

**Decision rule:** The data-layer is the required
architecture for all tRPC migrations. If data-layer
artifacts (processor, repository, route) do NOT exist for
the entity, they MUST be created — never skip the
data-layer because the existing tRPC service uses direct
Drizzle queries. Direct Drizzle queries in the tRPC service
layer are the OLD deprecated pattern being replaced. The
correct pattern is: data-layer HTTP route → tRPC service
calls `dataLayerApiClient` → frontend hook.
See `packages/trpc/src/services/frontend/action.service.ts`
for the canonical correct pattern.

An existing layer should only be marked as "EXISTS - SKIP"
when the specific artifact needed for THIS query/mutation
already exists in that layer (e.g., a query config that
already covers the needed columns and relations).

#### Step 3 — Build the migration plan

Compile a structured plan with five sections (one per
agent). For each section, list:

1. Which skills the agent will need to invoke
2. The specific file paths that will be created or modified
3. The exact names (types, functions, routes) to use
4. Any layers that already exist and should be skipped

Flag layers that already exist with "[EXISTS - SKIP]".

#### Step 4 — Present the plan for approval

Display the plan to the user in a clear table format.
Include:

- Operation type (query or mutation)
- Entity name and Drizzle table
- For each agent: files to create, names to use, skills to
  invoke
- Any layers being skipped because they already exist
- Whether the request-state-api agent will be dispatched
  (only for mutations)
  **Wait for explicit user approval before proceeding to
  Phase 2.** Do not dispatch any agents until the user
  confirms.

### Phase 2: Parallel Execution

#### Step 5 — Dispatch sub-agents

After the user approves the plan, dispatch agents using the
Task tool with `run_in_background: true` to run them in
parallel.

**Data-layer agent** (`subagent_type: "data-layer"`):

Construct a prompt that includes:

- Entity name and Drizzle table name
- Operation type (read for queries, create/update/delete
  for mutations)
- The relations and fragments from the GraphQL document
- Any query modifiers (`distinct_on`, `order_by`, `limit`,
  `_aggregate`) that the query config or read processor
  must handle
- The exact route path to register
- The query config name and column/relation selections
- The processor function name and file path
- The repository method name
- **Timestamp rule for UPDATE operations**: The repository
  MUST set `ModifiedAtTimestamp: sql\`statement_timestamp()\``
  explicitly on UPDATE operations (import `sql` from
  `drizzle-orm`). The DB column default only applies on
  INSERT — without this, the timestamp is never refreshed
  on updates. Never accept timestamps from the caller.
- Which skills to invoke and in what order (reference the
  dependency order in
  `.claude/agents/data-layer.md`)
- Any existing artifacts to skip

**tRPC agent** (`subagent_type: "trpc"`):

Construct a prompt that includes:

- Entity name
- The query config name and its expected file path in
  `packages/trpc/src/queries/`
- The response type name and file path
- The service class name and method name
- The router file and procedure name
- The data-layer API client method name and its route path
- Which skills to invoke and in what order (reference the
  dependency order in `.claude/agents/trpc.md`)
- Any existing artifacts to skip
- **Schedule state refresh** (if Section 3b reported
  SCHEDULE REFRESH REQUIRED): Tell the agent to add a
  post-mutation schedule refresh call in the tRPC service.

  The `@risksmart-app/schedule-state` package uses a
  **ports & adapters** pattern with curried factory
  functions. Each refresh function is created via a
  factory that accepts a `ScheduleDataAccess` adapter:

  Available factory functions:
  - `createRefreshRiskScheduleState(dataAccess)` returns
    `(ctx, riskId, { useImpacts }) => Promise<void>`
  - `createRefreshRiskRatingScheduleState(dataAccess)`
    returns `(ctx, riskId) => Promise<void>`
  - `createRefreshRiskImpactScheduleState(dataAccess)`
    returns `(ctx, riskId) => Promise<void>`
  - `createRefreshControlScheduleState(dataAccess)`
    returns `(ctx, controlId) => Promise<void>`
  - `createRefreshDocumentScheduleState(dataAccess)`
    returns `(ctx, documentId) => Promise<void>`
  - `createRefreshObligationScheduleState(dataAccess)`
    returns `(ctx, obligationId) => Promise<void>`
  - `createRefreshIndicatorScheduleState(dataAccess)`
    returns `(ctx, indicatorId) => Promise<void>`

  For tRPC services, use `createHttpScheduleDataAccess()`
  (also from `@risksmart-app/schedule-state`) to create
  the HTTP adapter that calls the data-layer API.

  The service must:
  1. Import the appropriate factory and the HTTP adapter
     from `@risksmart-app/schedule-state`
  2. Import `toApiContext` from `../../clients/client-utils`
  3. Create the bound refresh function and call it
     **after** the DB mutation succeeds (i.e., after
     `executeAsyncRequest()` returns). In the rest-api,
     schedule refresh is always called after the
     insert/update completes — never before or
     interleaved. Wrap in try/catch (non-fatal — the
     mutation already succeeded). Follow the exact
     pattern in
     `packages/trpc/src/services/frontend/risk-assessment-result.service.ts`
     which is the canonical example.
  4. For risk entities: the router must pass
     `req.ctx.user.features.includes('impacts')` as
     the `useImpacts` option to the service, and the
     service must forward it to the risk schedule
     refresh function
  5. Add `@risksmart-app/schedule-state` to the trpc
     package dependencies in `package.json` if not
     already present

  **Note on event-driven schedule refreshes:** Some
  rest-api schedule refreshes are triggered
  asynchronously by Hasura database events (e.g.,
  `ratingUpdateScheduleRecalculate.ts`,
  `assessmentResultParentChanged.ts`,
  `testResultChanged.ts`). These event handlers do NOT
  perform DB mutations — they react to changes and
  recalculate schedule state. When migrating a mutation
  that has BOTH a direct handler refresh AND an
  async event handler refresh, only replicate the
  direct handler refresh in the tRPC service. The
  event-driven refreshes will continue to work via
  the existing rest-api event handlers until those
  are separately migrated.

  **If the required refresh function does not yet exist
  in `@risksmart-app/schedule-state`:** The function must
  be created in the schedule-state package as part of
  this migration — do NOT leave schedule logic unmigrated
  or call the rest-api function directly. Follow the
  existing entity refresh functions in the package as
  the pattern (e.g., `refresh-control-schedule-state.ts`).
  This may also require:
  - Adding a new data-layer GET endpoint to fetch the
    entity's latest result date
  - Adding a corresponding method to the
    `ScheduleDataAccess` port interface
  - Implementing the method in both the HTTP adapter
    (`adapters/http-data-access.ts`) and the GraphQL
    adapter (`packages/rest-api/src/adapters/schedule-state-adapter.ts`)
  See `packages/schedule-state/src/` for the full set
  of existing patterns.

**Web agent** (`subagent_type: "web"`):

Construct a prompt that includes:

- The GraphQL document name (e.g.,
  `GetActionByIdDocument`)
- The generated GraphQL type name (e.g.,
  `GetActionByIdQuery`)
- The tRPC response type name (e.g.,
  `GetActionByIdResponseRow`)
- The hook name to create (e.g., `useGetActionById`)
- The tRPC router path (e.g.,
  `trpc.frontend.action.actionById`)
- The `mapTrpcDataToGraphQL` mapping (e.g.,
  `{ action: data }`)
- The GraphQL variable mapping (e.g.,
  `({ id }) => ({ _eq: id })`)
- All component files that import the old GraphQL document
  (from the Explore agent's report)
- Which skills to invoke and in what order (reference the
  dependency order in `.claude/agents/web.md`)
- Any existing artifacts to skip
- **Mutation hook input types — use GraphQL generated types
  directly.** Do NOT define custom input types with manual
  field lists. Do NOT use type casts (`as`) or object
  rebuilding (`{ ...variables, field: variables.field ?? [] }`).
  Instead:
  - Public hook (`use{Action}{Entity}.tsx`) input type:
    Use `InsertChild{Entity}Input` from
    `@risksmart-app/web-graphql-client/generated/graphql`
    directly as the `variables` parameter type. This passes
    straight through to the GraphQL mutation without
    transformation. For the tRPC path, destructure `schedule`
    and call `mapScheduleToTRPC`:
    ```typescript
    const { schedule, ...rest } = variables;
    return trpcMutation.insertFoo({ ...rest, ...mapScheduleToTRPC(schedule) });
    ```
  - tRPC hook (`use{Action}{Entity}TRPC.tsx`) input type:
    Derive from the GraphQL type:
    `type Input = Omit<InsertChild{Entity}Input, 'schedule'> & ScheduleTRPCInput`
    This swaps lowercase `schedule` for uppercase `Schedule`
    while inheriting all fields (including enum types) from
    the GraphQL generated type. No casting needed because
    domain enums use `as const` and are structurally identical
    to GraphQL generated enum types.
  - See `useInsertRisk.tsx` / `useInsertRiskTRPC.tsx` as the
    canonical example.
  - **IMPORTANT:** Domain enum types in
    `packages/domain/src/types/consts/` MUST use `as const`
    object + type alias (NOT TypeScript `enum`). This ensures
    structural compatibility with GraphQL codegen types.
    If you encounter a domain enum that still uses
    `export enum Foo { ... }`, convert it to:
    ```typescript
    export const Foo = { Bar: 'bar', Baz: 'baz' } as const;
    export type Foo = (typeof Foo)[keyof typeof Foo];
    ```

**Request-state-api agent** (`subagent_type:
"request-state-api"`) — mutations only:

Before dispatching this agent, ensure the `packages/events`
prerequisites exist. Read the three events package files and
create any that are missing **directly** (do not wait for the
agent to stop):

1. **Request type interface** —
   `packages/events/src/types/request-types.ts`:

   **Use the base interface + extends pattern.** When both
   create and update mutations exist for the same entity,
   extract shared fields into a private `{Entity}Fields`
   base interface, then extend it for each operation variant.
   This eliminates duplication and ensures field changes
   propagate to both create and update automatically.

   ```typescript
   // Base interface with shared entity fields (not exported)
   interface RiskFields {
     ParentRiskId?: string | null;
     Title: string;
     Tier: number;
     Description?: string | null;
     Treatment?: RiskTreatmentType | null;
     Status?: RiskStatusType | null;
     CustomAttributeData?: Record<string, unknown> | null;
     OwnerUserIds?: string[] | null;
     OwnerGroupIds?: string[] | null;
     ContributorUserIds?: string[] | null;
     ContributorGroupIds?: string[] | null;
     TagTypeIds?: string[] | null;
     DepartmentTypeIds?: string[] | null;
     Schedule?: ScheduleFields | null;
   }

   // Create adds parent ID and any create-only fields
   export interface CreateRiskRequest extends RiskFields {
     ScheduleState?: ScheduleStateFields | null;
   }

   // Update adds Id for identifying the record
   export interface UpdateRiskRequest extends RiskFields {
     Id: string;
   }
   ```

   If only a create mutation exists (no update yet), still
   create the entity fields as a standalone exported
   interface — it can be refactored into the base pattern
   later when the update mutation is migrated.

   Use shared types `ScheduleFields` and `ScheduleStateFields`
   (exported from the same file) for schedule-related fields
   instead of inlining the object shape.

   Use domain enum types (from `@risksmart-app/domain/src/types/consts/`)
   for typed fields like Treatment and Status — NOT `string`.
   Domain enums use `as const` and are structurally compatible
   with both GraphQL generated types and tRPC Zod schemas.

   **IMPORTANT**: Every optional field MUST use `| null`
   (not just `?`) because the request-state-api Zod
   schemas use `.nullish()` which produces
   `T | null | undefined`. If the interface only has
   `T | undefined`, the inferred Zod type won't be
   assignable and `tsc` will fail in the
   request-state-api package.

   **IMPORTANT**: If the GraphQL mutation accepts
   `ownerIds`, `ownerGroupIds`, `contributorIds`,
   `contributorGroupIds`, `tagTypeIds`, or
   `departmentTypeIds` variables, they MUST be included
   in the request type interface. Omitting them here
   causes a chain of silent failures across every
   downstream layer (request-state-api schema, data-layer
   schema, tRPC router schema, tRPC service
   `buildRequestBody`, web hook type).

   **IMPORTANT**: NOT NULL DB fields must be required in
   the base interface (not optional). Check
   `packages/drizzle/src/schema.ts` for `.notNull()`
   columns. The frontend always sends the full object on
   both create and update — no partial updates.

2. **CommandTypeNames entry** —
   `packages/events/src/types/command-types.ts`:
   Add `'CREATE_{ENTITY}'` to the `CommandTypeNames` union,
   keeping alphabetical order.

3. **No new EventType enum entries needed** for standard
   object CRUD — the request-state-api uses the generic
   `ObjectEvent.ObjectCreated` / `ObjectEvent.ObjectCreationFailed`
   which already exist. Only add new enum entries if the
   operation uses a domain-specific event (e.g., form
   configuration uses `FormEvent.FormConfigured`).

Once the events package prerequisites exist, construct the
agent prompt with:

- The command type name (e.g., `CREATE_ACTION_UPDATE`)
- The success and failure event type names
- The request type interface name and its fields (derived
  from the GraphQL mutation variables)
- Which skills to invoke and in what order (reference the
  dependency order in
  `.claude/agents/request-state-api.md`)
- Any existing artifacts to skip

For queries, do NOT dispatch the request-state-api agent.

**tRPC API integration tests agent**
(`subagent_type: "trpc-api-tests"`):

Dispatch this agent for ALL operations (both queries and
mutations). It creates integration tests at
`packages/trpc-api-tests/src/tests/frontend/{entity}.test.ts`.

Construct a prompt that includes:

- Entity name and tRPC router name
- The procedure name (e.g., `insert`, `register`,
  `controlById`)
- Operation type (`query` or `mutation`)
- The tRPC router path (e.g.,
  `trpcClient.frontend.control.insert.mutate(...)`)
- All input fields with their types and whether they are
  required or optional
- Any parent records that must be seeded first (e.g.,
  "insert a parent risk using `buildRisk`/`insertRisk`
  from `@risksmart-app/test-data` to use as `ParentId`")
- The expected response shape (e.g., `{ Id: string }`)
- Whether the entity supports relationship fields
  (owners, contributors, tags, departments) and if so,
  which `{entity}ById` query to use to read back and
  verify relationships
- Which test cases to include:
  - For mutations: happy path (required fields only),
    happy path (all optional fields), null optional
    fields, rejection cases (empty title, invalid UUID),
    top-level insert without parent (if ParentId is
    optional)
  - For mutations with relationship fields: ALL 8
    relationship persistence test cases are REQUIRED:
    1. Owner persistence (`OwnerUserIds: [userId]`)
    2. Owner group persistence (`OwnerGroupIds: [groupId]`
       — seed with `buildUserGroup`/`insertUserGroup`)
    3. Contributor persistence
       (`ContributorUserIds: [userId]`)
    4. Contributor group persistence
       (`ContributorGroupIds: [groupId]`)
    5. Tag persistence (`TagTypeIds: [tagTypeId]`
       — seed with `buildTagType`/`insertTagType`)
    6. Department persistence
       (`DepartmentTypeIds: [departmentTypeId]`
       — seed with `buildDepartmentType`/
       `insertDepartmentType`)
    7. Multiple owners and contributors together
    8. Empty relationship arrays (all six as `[]`)
    Each test must read back via `{entity}ById` query
    and assert on the nested relationship arrays (e.g.,
    `result[0]?.owners[0]?.UserId`). See
    `risk.test.ts` lines 378-488 for the canonical
    pattern.
  - For queries: happy path (returns data), empty result,
    data shape verification
- Tell the agent to read the existing
  `create-trpc-api-test` skill at
  `packages/trpc-api-tests/.claude/skills/create-trpc-api-test/SKILL.md`
  for patterns, BUT skip the Docker verification and test
  execution steps (Steps "Prerequisites" and 7) — just
  write the test file and verify it passes lint and tsc
- Tell the agent to use `risk.test.ts` as the canonical
  reference for mutation integration tests
- **CRITICAL: FK-constrained fields** — Tell the agent
  that fields referencing other DB tables (e.g.,
  `CompletedByUser` → `user.Id`, `OriginatingItemId` →
  `node.Id`) must use `context.userId` or a seeded
  record's ID. NEVER use hardcoded strings like
  `'user@example.com'`. Check `packages/drizzle/src/schema.ts`
  for `foreignKey()` definitions on the entity table.

**Important:** Each agent prompt must contain ALL the
pre-researched details from Phase 1. Agents should be able
to execute their skills without performing additional
research. Include file paths, type names, function names,
and route paths directly in the prompt.

#### Step 6 — Wait for all agents to complete

After dispatching all agents, wait for each background task
to finish. Check each result for success or failure and note
any errors for the verification phase.

### Phase 3: Verification

#### Step 7 — Verify created files

Glob and Read to confirm every file from the plan was
created or modified:

1. Check each file path listed in the plan exists
2. For modified files (barrel exports, route registrations,
   router index), verify the new entries are present
3. Report any missing files

#### Step 8 — Compare against GraphQL document

Re-read the original `.graphql` file from Step 1 and
compare it against the created artifacts to verify
completeness. This is the only place where GraphQL
awareness exists — the sub-agents' skills are
general-purpose and do not check against GraphQL.

For queries, verify:

1. **Column coverage** — every field selected in the
   GraphQL fragment has a corresponding column in the
   data-layer query config
2. **Relation coverage** — every nested relation in the
   GraphQL query (e.g., `tags`, `owners`, `files`) is
   included in the query config's `with` clause
3. **Modifier handling** — if the GraphQL query uses
   `distinct_on`, `order_by`, `limit`, or `_aggregate`,
   verify the data-layer read processor or query config
   handles them correctly
4. **Variable mapping** — every GraphQL variable is
   mapped to a corresponding input parameter in the
   tRPC router procedure and passed through to the
   data-layer

For mutations, verify:

1. **Input field coverage** — every GraphQL mutation
   variable is present in the data-layer schema and
   flows through the tRPC service's `buildRequestBody`
2. **Relationship field propagation** — if the GraphQL
   mutation accepts owner/contributor/tag/department IDs
   (e.g. `ownerIds`, `tagTypeIds`), verify all six layers
   contain these fields:
   - `packages/events/src/types/request-types.ts` —
     `Create{Entity}Request` interface has the arrays
   - `services/request-state-api/src/schemas/initiate-request.ts` —
     schema has the arrays (use `.nullish()`)
   - `services/data-layer/src/schemas/{entity}.ts` or
     processor inline schema — array fields with
     `.optional().default([])`
   - `services/data-layer/src/repositories/{entity}-repository.ts` —
     `insertWithRelationships` method exists and is
     used by the processor (all inserts in ONE `db()`
     transaction callback)
   - `packages/trpc/src/routers/frontend/{entity}.router.ts` —
     Zod input schema includes the array fields
   - `packages/trpc/src/services/frontend/{entity}.service.ts` —
     `buildRequestBody` sends the arrays with `?? []`
   - `packages/web/src/hooks/mutations/{entity}/use{Action}{Entity}TRPC.tsx` —
     `{Action}{Entity}Input` type includes the arrays
3. **Event type completeness** — success and failure
   events are registered in request-state-api
4. **Nullish consistency** — every optional field must use
   `| null` in BOTH places:
   - `packages/events/src/types/request-types.ts` —
     `Create{Entity}Request` interface: use `?: T | null`
     for scalar fields and `?: T[] | null` for arrays.
   - `services/request-state-api/src/schemas/initiate-request.ts` —
     Zod schema: use `.nullish()` (not `.optional()`).
     These must match because the Zod-inferred type is
     checked against `RequestTypes` (the union of all
     request interfaces). If the interface has `?: T`
     (no null) but the Zod schema uses `.nullish()`
     (producing `T | null | undefined`), `tsc` will fail
     in the request-state-api package.
5. **Cross-field validation** — if any field is
   conditionally required based on another (e.g.
   `ParentRiskId` required when `Tier > 1`), add a
   `.refine()` to the tRPC router input schema. Use
   `!= null` (not `!== undefined`) in the predicate.
6. **ReBAC permission check** — if the mutation
   payload has a parent ID field (e.g. `ParentId`,
   `ParentRiskId`), verify the data-layer processor's
   `.withPermissions()` includes an `rs_node` check
   with the parent's `objectId`. This triggers
   Permit.io's ReBAC evaluation for relationship-based
   access. If the parent ID is optional, the check
   must be conditional (only included when parent is
   provided). If required, always include it.
   ```typescript
   .withPermissions(({ payload }) =>
     payload.ParentId
       ? [
           { objectName: 'entity', action: 'insert' },
           { objectName: 'rs_node', objectId: payload.ParentId, action: 'insert' },
         ]
       : [{ objectName: 'entity', action: 'insert' }]
   )
   ```
   Without this, users get 403 even when the old
   Hasura action path (which used `role_access` table)
   allowed access.

If any field, relation, or modifier is missing, fix the
relevant file directly before proceeding.

#### Step 9 — Add tRPC router unit tests

For mutations, add a router unit test file at
`packages/trpc/src/routers/frontend/{entity}.router.test.ts`
if it does not already exist. The test must cover:

1. **Input validation** — one test per Zod rule, e.g. required
   fields, min/max, UUID format, and any `.refine()` cross-field
   constraints
2. **Mutation behaviour** — calls service with correct context
   and input, passes optional fields through, propagates
   `TRPCError` from service (403, 404), rejects unauthenticated
   requests

Required mocks (both must be present or tests fail at import):

```typescript
vi.mock('@sentry/node', () => ({
  trpcMiddleware: () => (opts: { next: () => unknown }) => opts.next(),
}));
vi.mock('@risksmart-app/permitio/src/permit', () => ({
  filter: vi.fn(),
  preFilter: vi.fn(),
}));
```

Use `createCallerFactory` from `../../init` (ensure it is
exported from `packages/trpc/src/init.ts`).

#### Step 10 — Verify tRPC API integration tests

Confirm that the `trpc-api-tests` agent (dispatched in
Step 5) created the integration test file at
`packages/trpc-api-tests/src/tests/frontend/{entity}.test.ts`.

Read the file and verify it covers:

- Happy path with required fields only
- Happy path with all optional fields
- Null values for optional fields
- Rejection cases (empty title, invalid UUID)
- Relationship persistence tests — if the mutation
  accepts relationship fields, ALL 8 test cases MUST
  be present:
  1. Owner persistence (`OwnerUserIds: [userId]`)
  2. Owner group persistence (`OwnerGroupIds: [groupId]`)
  3. Contributor persistence
     (`ContributorUserIds: [userId]`)
  4. Contributor group persistence
     (`ContributorGroupIds: [groupId]`)
  5. Tag persistence (`TagTypeIds: [tagTypeId]`)
  6. Department persistence
     (`DepartmentTypeIds: [departmentTypeId]`)
  7. Multiple owners and contributors together
  8. Empty relationship arrays (all six as `[]`)
  Each test reads back via `{entity}ById` query and
  asserts on nested relationship arrays. Tags and
  departments require seeding reference data via
  `buildTagType`/`insertTagType` and
  `buildDepartmentType`/`insertDepartmentType`.
  Owner/contributor groups require seeding via
  `buildUserGroup`/`insertUserGroup`.

If the file is missing or incomplete, create or fix it
directly.

#### Step 11 — Run scoped verification checks

Run these checks scoped to the affected packages only:

```bash
# Lint the affected packages
pnpm exec turbo lint --filter=@risksmart-app/web
pnpm exec turbo lint --filter=@risksmart-app/trpc
pnpm exec turbo lint --filter=@risksmart-app/data-layer

# Run unit tests for the web and trpc packages
pnpm exec turbo test:unit --filter=@risksmart-app/web
pnpm exec turbo test:unit --filter=@risksmart-app/trpc
```

If lint or tests fail, fix the issues and re-run.

#### Step 12 — Update the migration tracker

Once lint and tests pass, regenerate the migration tracker so it reflects
the newly completed operation:

```bash
pnpm run migration:tracker
```

This updates `docs/graphql-migration-tracker.md`. The migrated operation
should now appear as `✅ MIGRATED` in its entity section.

## Verification

Before reporting completion, confirm ALL of the following:

- [ ] Every file listed in the approved plan either exists
      or was correctly identified as already existing
- [ ] The data-layer query config includes all columns and
      relations from the original GraphQL document
- [ ] Any GraphQL query modifiers (`distinct_on`,
      `order_by`, `limit`, `_aggregate`) are handled by the
      data-layer
- [ ] The data-layer processor handles the correct
      route path and uses the correct repository method
- [ ] The tRPC response type is inferred from the correct
      query config via `InferQueryModel`
- [ ] The tRPC service calls the correct data-layer API
      client method
- [ ] The tRPC router exposes the correct procedure name
      with proper Zod input validation
- [ ] The web hook uses `createQueryHook` with the correct
      tRPC router path and GraphQL document
- [ ] The hook is re-exported from
      `packages/web/src/hooks/queries/index.ts`
- [ ] For mutations: request-state-api event types and
      validation schemas are registered
- [ ] For mutations: the tRPC service `buildRequestBody`
      sends ALL fields from the request type interface
- [ ] For mutations with relationship fields: all six
      arrays (`OwnerUserIds`, `OwnerGroupIds`,
      `ContributorUserIds`, `ContributorGroupIds`,
      `TagTypeIds`, `DepartmentTypeIds`) are present in
      the events request type, request-state-api schema,
      data-layer schema, tRPC router, tRPC service
      `buildRequestBody`, and web hook type. The repository
      uses `insertWithRelationships` (for inserts) or
      `updateWithRelationships` (for updates) with a single
      atomic `db()` transaction callback. For updates,
      relationships MUST use the diff-based sync pattern
      (delete only removed rows via `notInArray`, insert
      only new rows via `.onConflictDoNothing()`) — NOT
      delete-all/reinsert, which generates spurious audit
      entries
- [ ] For mutations: optional fields in the
      request-state-api request schema use `.nullish()`
- [ ] For mutations with a parent ID field: the
      data-layer processor's `.withPermissions()` includes
      an `rs_node` ReBAC check with the parent's `objectId`
      (conditional if parent is optional, unconditional if
      required)
- [ ] For mutations: a tRPC router unit test exists in
      `packages/trpc/src/routers/frontend/{entity}.router.test.ts`
      covering input validation (including cross-field rules)
      and mutation service call behaviour
- [ ] For mutations: integration tests exist in
      `packages/trpc-api-tests/src/tests/frontend/{entity}.test.ts`
      covering the happy path, optional fields, and rejection
      cases
- [ ] For mutations with relationship fields: integration
      tests include ALL 8 relationship persistence test cases
      (owner, owner group, contributor, contributor group,
      tag, department, multiple together, empty arrays) with
      read-back verification via `{entity}ById` query
- [ ] For integration tests: all FK-constrained fields
      (e.g., `CompletedByUser`, `OriginatingItemId`) use
      `context.userId` or seeded record IDs — NOT hardcoded
      strings like `'user@example.com'`
- [ ] Existing unit tests for migrated components have
      been updated (`defaultMocks`, `'trpc'` and `'features'`
      providers in `getWrapper`, async `findBy` queries)
- [ ] Lint passes for affected packages
- [ ] Unit tests pass for `@risksmart-app/web`
- [ ] `pnpm run migration:tracker` has been run and the
      migrated operation now shows `✅ MIGRATED` in
      `docs/graphql-migration-tracker.md`

If any check fails, fix the issue and re-verify before
reporting the migration as complete.

Once all verification checks pass, report the migration
as complete to the user.
