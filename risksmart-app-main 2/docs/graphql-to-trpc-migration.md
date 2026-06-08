# GraphQL to tRPC Migration - Complete Execution Flow

This document traces the complete migration from Apollo GraphQL to tRPC using `useGetActionById` as the canonical example. It covers every layer of the stack, from the React component down to the database query.

---

## Table of Contents

1. [Migration Timeline](#1-migration-timeline)
2. [Architecture Overview](#2-architecture-overview)
3. [Layer 1: React Component (Consumer)](#3-layer-1-react-component-consumer)
4. [Layer 2: Query Hook (`useGetActionById`)](#4-layer-2-query-hook-usegetactionbyid)
5. [Layer 3: `createQueryHook` Factory](#5-layer-3-createqueryhook-factory)
6. [Layer 4: Feature Flag (`trpc`)](#6-layer-4-feature-flag-trpc)
7. [Layer 5: tRPC Router](#7-layer-5-trpc-router)
8. [Layer 6: Service Layer](#8-layer-6-service-layer)
9. [Layer 7: Data Layer API Client](#9-layer-7-data-layer-api-client)
10. [Layer 8: Data Layer Lambda (Processor)](#10-layer-8-data-layer-lambda-processor)
11. [Layer 9: Repository (Drizzle ORM)](#11-layer-9-repository-drizzle-orm)
12. [Layer 10: Type System](#12-layer-10-type-system)
13. [GraphQL Path (Legacy)](#13-graphql-path-legacy)
14. [Complete Request Flow Diagrams](#14-complete-request-flow-diagrams)

---

## 1. Migration Timeline

The migration from GraphQL to tRPC happened across four phases:

| Phase | Date | What Changed |
|-------|------|-------------|
| **Original** | May 2023 | Direct Apollo codegen hook `useGetActionByIdQuery` from `@risksmart-app/web-graphql-client/generated/graphql` |
| **tRPC wrapper** | Jul 2025 | Hand-written dual hook with feature flag switching between Apollo and tRPC |
| **Import cleanup** | Jul 2025 | Re-exported hooks through barrel file at `@/hooks/queries` |
| **Factory refactor** | Jan 2026 | Replaced hand-written dual hooks (~100 lines each) with `createQueryHook` factory (~20 lines of config) |

---

## 2. Architecture Overview

Both paths coexist and are toggled by a per-organisation feature flag. The React hooks layer always renders both Apollo and TanStack Query hooks (React rules of hooks), but only one is enabled at runtime.

```
                              ┌─────────────────────────────┐
                              │  React Component (Page.tsx)  │
                              └──────────────┬──────────────┘
                                             │
                              ┌──────────────▼──────────────┐
                              │   useGetActionById (hook)    │
                              └──────────────┬──────────────┘
                                             │
                              ┌──────────────▼──────────────┐
                              │   createQueryHook (factory)  │
                              └──────┬───────────────┬──────┘
                                     │               │
                        feature flag │               │ feature flag
                        trpc=true    │               │ trpc=false
                                     │               │
                         ┌───────────▼──┐   ┌───────▼──────────┐
                         │ TanStack     │   │ Apollo useQuery   │
                         │ useQuery     │   │ (GraphQL)         │
                         └──────┬───────┘   └───────┬──────────┘
                                │                   │
                         ┌──────▼───────┐   ┌───────▼──────────┐
                         │ tRPC Client  │   │ Hasura GraphQL   │
                         └──────┬───────┘   └───────┬──────────┘
                                │                   │
                         ┌──────▼───────┐           │
                         │ tRPC Router  │           │
                         └──────┬───────┘           │
                                │                   │
                         ┌──────▼───────┐           │
                         │ Service      │           │
                         └──────┬───────┘           │
                                │                   │
                         ┌──────▼───────────┐       │
                         │ Data Layer Client │       │
                         └──────┬───────────┘       │
                                │                   │
                         ┌──────▼───────────┐       │
                         │ Lambda Processor │       │
                         └──────┬───────────┘       │
                                │                   │
                         ┌──────▼───────┐   ┌───────▼──────────┐
                         │ Drizzle ORM  │   │ PostgreSQL       │
                         │ (Repository) │   │ (via Hasura)     │
                         └──────┬───────┘   └──────────────────┘
                                │
                         ┌──────▼───────┐
                         │ PostgreSQL   │
                         └──────────────┘
```

---

## 3. Layer 1: React Component (Consumer)

**File:** `packages/web/src/pages/actions/update/Page.tsx`

The component consumes the hook with a simple interface:

```tsx
import { useGetActionById } from '@/hooks/queries';

const { data, error } = useGetActionById({ queryArgs: { id: actionId } });

const action = data?.action?.[0];
```

The component is unaware of whether data comes from GraphQL or tRPC. The hook returns a `data` object shaped like the original GraphQL response (`GetActionByIdQuery`), so all downstream code works identically regardless of the active path.

**Before migration**, the component used Apollo directly:

```tsx
import { useGetActionByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';

const { data } = useGetActionByIdQuery({
  variables: { _eq: actionId },
  fetchPolicy: 'no-cache',
});
```

---

## 4. Layer 2: Query Hook (`useGetActionById`)

**File:** `packages/web/src/hooks/queries/action/useGetActionById.tsx`
**Re-exported from:** `packages/web/src/hooks/queries/index.ts`

```tsx
import type { GetActionByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetActionByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetActionByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetActionByIdArgs = {
  id: string;
};

export const useGetActionById = createQueryHook<
  UseGetActionByIdArgs,            // TQueryArgs: what the consumer passes in
  GetActionByIdResponseRow[],       // TTRPCOutput: raw tRPC response shape
  GetActionByIdQuery               // TGraphQLData: the unified output shape
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.action.actionById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ action: data }),
  graphqlDocument: GetActionByIdDocument,
  graphqlVariables: ({ id }) => ({ _eq: id }),
});
```

This is the **bridge definition**. It declares:

- **`trpcQueryOptions`** - How to build the TanStack Query options via the tRPC client. `trpc.frontend.action.actionById` maps to the tRPC router path.
- **`mapTrpcDataToGraphQL`** - How to transform the tRPC response (`GetActionByIdResponseRow[]`) into the GraphQL response shape (`{ action: [...] }`). This is what allows downstream code to remain unchanged.
- **`graphqlDocument`** - The compiled GraphQL document used when the tRPC feature flag is off.
- **`graphqlVariables`** - Maps the hook's `{ id }` arg to the GraphQL variable format `{ _eq: id }` (Hasura's UUID comparison operator).

---

## 5. Layer 3: `createQueryHook` Factory

**File:** `packages/web/src/utils/hook-factories/createQueryHook.tsx`
**Types:** `packages/web/src/utils/hook-factories/types.ts`

The factory takes a config object and returns a React hook. It handles the dual-path execution:

### Config Type

```tsx
type QueryHookConfig<TQueryArgs, TTRPCOutput, TGraphQLData> = {
  trpcQueryOptions: (trpc: TRPCClient, args: TQueryArgs) => QueryOptionsResult;
  mapTrpcDataToGraphQL: (data: TTRPCOutput) => TGraphQLData;
  graphqlDocument: TypedDocumentNode<TGraphQLData, any>;
  graphqlVariables?: (args: TQueryArgs) => Record<string, unknown>;
  graphqlFetchPolicy?: 'no-cache' | 'cache-first' | 'network-only';  // default: 'no-cache'
  trpcStaleTime?: number;
  mapGraphQLData?: (data: TGraphQLData, args: TQueryArgs) => TGraphQLData;
};
```

### Return Type

```tsx
type QueryHookFactoryResult<TQueryArgs, TGraphQLData> = (args: {
  queryArgs: TQueryArgs;
  shouldSkip?: boolean;
}) => {
  loading: boolean;
  data: TGraphQLData | undefined;
  refetch: () => Promise<{ data: TGraphQLData | undefined; error: QueryHookError }>;
  error: QueryHookError;  // TRPCClientErrorLike | ApolloError | null | undefined
};
```

### Runtime Behaviour

The returned hook always calls **both** `useQuery` (TanStack) and `useApolloQuery` (Apollo). Only one is enabled at a time based on the feature flag:

```tsx
return ({ queryArgs, shouldSkip }) => {
  const trpcEnabled = useIsFeatureVisibleToOrg('trpc');

  // tRPC path - enabled when trpcEnabled=true
  const { data: trpcData, ... } = useQuery({
    ...trpcQueryOptions(trpc, queryArgs),
    enabled: trpcEnabled && !skip,
  });

  // GraphQL path - enabled when trpcEnabled=false
  const { data: graphqlData, ... } = useApolloQuery(graphqlDocument, {
    variables: graphqlVariables(queryArgs),
    skip: trpcEnabled || skip,
  });

  // Return whichever path is active
  if (trpcEnabled) {
    return { data: mapTrpcDataToGraphQL(trpcData), ... };
  }
  return { data: graphqlData, ... };
};
```

Both hooks always render (React rules of hooks forbid conditional hook calls), but `enabled: false` / `skip: true` prevents actual network requests on the inactive path.

---

## 6. Layer 4: Feature Flag (`trpc`)

**Flag definition:** `packages/web/src/utils/featureFlags.ts`

```tsx
trpc: {
  isEnabledBeforeModules: false,
  type: 'feature-flag',
},
```

**Feature type:** `packages/shared/src/organisation/Feature.ts` (includes `'trpc'` in the union type)

The `trpc` feature flag is a per-organisation flag. It can be enabled by:
1. The organisation's `features` array from the backend
2. Environment variable `REACT_APP_FEATURE_trpc=true`

Inside `createQueryHook`, the check is:

```tsx
const trpcEnabled = useIsFeatureVisibleToOrg('trpc');
```

This allows **gradual rollout** - organisations can be migrated to tRPC one at a time while others continue using GraphQL.

---

## 7. Layer 5: tRPC Router

**File:** `packages/trpc/src/routers/frontend/action.router.ts`

```tsx
export const actionRouter = router({
  actionById: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async (req) => {
      const actionService = createActionService();
      return actionService.getById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
});
```

The router is a thin layer that:
1. Validates input with Zod (`z.string().uuid()`)
2. Extracts auth context from `req.ctx.user` (populated by `authedProcedure` middleware)
3. Delegates to the service layer

The router path `trpc.frontend.action.actionById` maps to: `frontend` (namespace) -> `action` (entity router) -> `actionById` (procedure).

---

## 8. Layer 6: Service Layer

**File:** `packages/trpc/src/services/frontend/action.service.ts`

```tsx
export class ActionServiceImpl implements ActionService {
  async getById(ctx: ServiceContext, id: string) {
    const { data, status } = await dataLayerApiClient.getActionById(
      toApiContext(ctx),
      id
    );
    if (status >= 400) {
      throw mapHttpStatusToTRPCError(status, data, { 404: 'Action not found' });
    }
    return data;
  }
}
```

The service layer:
1. Calls the data layer API client (HTTP request to the data-layer Lambda)
2. Maps HTTP error status codes to tRPC errors via `mapHttpStatusToTRPCError`
3. Returns the raw data on success

---

## 9. Layer 7: Data Layer API Client

**File:** `packages/trpc/src/clients/data-layer-api-client.ts`

```tsx
async getActionById(
  context: ApiRequestContext,
  actionId: string
): Promise<{ data: GetActionByIdResponseRow[]; status: number }> {
  return this.request<GetActionByIdResponseRow[]>(context, {
    method: 'GET',
    path: `/actions/${actionId}`,
    isResponseWrapped: true,
    isSingleItem: true,
  });
}
```

This is a typed HTTP client that makes `GET /actions/{actionId}` to the data-layer Lambda. The `ApiRequestContext` carries `orgId`, `tenant`, and `userId` for auth/tenancy.

---

## 10. Layer 8: Data Layer Lambda (Processor)

**File:** `services/data-layer/src/handlers/http/processors/actions/get-by-id.ts`

```tsx
export const getActionByIdProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
) => {
  return createHttpReadHandler<
    typeof pathParamsSchema,
    undefined,
    GetActionByIdResponseRow
  >()
    .withPathParamsSchema(z.object({ id: z.string().min(1) }))
    .withObjectName('Action')
    .withPermissionFilter({
      resourceType: 'rs_node',
      idExtractor: (object) => object.Id,
    })
    .withHandler(async ({ pathParams, serviceContext }) => {
      const db = await getDatabaseConnection({ tenant, orgKey });
      const actionRepository = createActionRepository(db);
      return actionRepository.getById(pathParams.id);
    })
    .forSingleItem()
    .execute(event, context);
};
```

The processor uses a builder pattern (`createHttpReadHandler`) that:
1. Validates path params with Zod
2. Applies **Permit.io permission filtering** (`resourceType: 'rs_node'`) - only returns data the user has access to
3. Calls the repository
4. `.forSingleItem()` wraps the response for single-item queries

---

## 11. Layer 9: Repository (Drizzle ORM)

**File:** `services/data-layer/src/repositories/action-repository.ts`

```tsx
getById: async (actionId: string): Promise<GetActionByIdResponseRow | null> => {
  const data = await db(async (tx) => {
    return tx.query.action.findMany({
      where: { Id: actionId },
      ...getActionByIdQueryConfig,
    });
  });
  if (data.length === 0) return null;
  return data[0]!;
}
```

Uses Drizzle ORM's relational query API with `getActionByIdQueryConfig` to load the action and all its relations in a single query.

---

## 12. Layer 10: Type System

### Query Config (Drizzle)

**File:** `packages/trpc/src/queries/action.query.ts`

```tsx
export const getActionByIdQueryConfig = {
  ...action,                        // base action columns
  with: {
    ...ownersAndContributors,       // owners, contributors, ownerGroups, contributorGroups
    ...tagsAndDepartments,          // tags, departments
    ...ancestorContributors,        // ancestorContributors
    ...relationFiles,               // files
  },
} as const satisfies QueryConfig<'action'>;
```

This config mirrors the GraphQL query's structure exactly - the same relations that were requested via GraphQL fragments are loaded via Drizzle's `with` clause.

### Response Type (Inferred from Drizzle)

**File:** `packages/trpc/src/types/action.types.ts`

```tsx
export type GetActionByIdResponseRow = InferQueryModel<
  'action',
  typeof getActionByIdQueryConfig
>;
```

`InferQueryModel` derives the TypeScript type from the Drizzle query config. This means the type is always in sync with what the database actually returns - no manual type definitions needed.

### Type Flow

```
Drizzle Query Config (action.query.ts)
    │
    ├── InferQueryModel → GetActionByIdResponseRow (action.types.ts)
    │       │
    │       ├── Used by: Repository return type
    │       ├── Used by: Data layer API client return type
    │       ├── Used by: tRPC router inferred return type
    │       └── Used by: createQueryHook TTRPCOutput generic
    │
    └── at runtime → Drizzle executes the query with these relations
```

### The GraphQL-to-tRPC Type Bridge

In the hook definition, the mapping `(data) => ({ action: data })` converts:

```
GetActionByIdResponseRow[]  →  { action: GetActionByIdResponseRow[] }
                                 ↑ matches GetActionByIdQuery shape
```

This works because `GetActionByIdResponseRow` from Drizzle has the same fields as the GraphQL `ActionParts` fragment plus nested relations. The only structural difference is the wrapping `{ action: [...] }` object, which `mapTrpcDataToGraphQL` adds.

---

## 13. GraphQL Path (Legacy)

When the `trpc` feature flag is **off**, the GraphQL path is active.

### GraphQL Document

**File:** `packages/web-graphql-client/graphql/action/getActionById.graphql`

```graphql
query getActionById($_eq: uuid!) {
  action(where: { Id: { _eq: $_eq } }) {
    ...ActionParts
    tags { ...TagParts }
    departments { ...DepartmentParts }
    files { ...RelationFileParts }
    owners { ...OwnerParts }
    contributors { ...ContributorParts }
    ownerGroups { ...OwnerGroupParts }
    contributorGroups { ...ContributorGroupParts }
    ancestorContributors { ...AncestorContributorParts }
  }
}
```

### GraphQL Execution Path

```
Apollo useQuery(GetActionByIdDocument, { variables: { _eq: id } })
    → Apollo Client HTTP link
        → Hasura GraphQL Engine (localhost:8080 / AWS endpoint)
            → PostgreSQL (auto-generated SQL from GraphQL)
```

The variable mapping in the hook config handles the difference:

```tsx
graphqlVariables: ({ id }) => ({ _eq: id })
```

This converts the hook's `{ id: "uuid" }` to Hasura's expected `{ _eq: "uuid" }` format.

---

## 14. Complete Request Flow Diagrams

### tRPC Path (feature flag ON)

```
Page.tsx
    │  useGetActionById({ queryArgs: { id: actionId } })
    │
    ▼
createQueryHook (factory)
    │  useIsFeatureVisibleToOrg('trpc') → true
    │  TanStack useQuery({ enabled: true })
    │
    ▼
tRPC Client
    │  HTTP POST to tRPC endpoint
    │  Payload: { id: "action-uuid" }
    │
    ▼
action.router.ts → actionById procedure
    │  Zod validates: z.object({ id: z.string().uuid() })
    │  Extracts: orgId, tenant, userId from auth context
    │
    ▼
action.service.ts → ActionServiceImpl.getById()
    │  Passes ServiceContext + id
    │
    ▼
data-layer-api-client.ts → getActionById()
    │  HTTP GET /actions/{id}
    │  Headers: orgId, tenant, userId
    │
    ▼
get-by-id.ts → getActionByIdProcessor (Lambda)
    │  Zod validates path params
    │  Permit.io filters by rs_node permissions
    │
    ▼
action-repository.ts → getById()
    │  tx.query.action.findMany({ where: { Id }, ...getActionByIdQueryConfig })
    │
    ▼
PostgreSQL → returns action + relations
    │
    ▼ (response bubbles back up)
    │
createQueryHook
    │  mapTrpcDataToGraphQL: (data) => ({ action: data })
    │  Returns: { data: { action: [...] }, loading, error, refetch }
    │
    ▼
Page.tsx
    │  data?.action?.[0] → action object (same shape as GraphQL)
```

### GraphQL Path (feature flag OFF)

```
Page.tsx
    │  useGetActionById({ queryArgs: { id: actionId } })
    │
    ▼
createQueryHook (factory)
    │  useIsFeatureVisibleToOrg('trpc') → false
    │  Apollo useQuery({ skip: false })
    │  variables: { _eq: id }
    │
    ▼
Apollo Client
    │  HTTP POST to Hasura GraphQL endpoint
    │  Query: GetActionByIdDocument
    │
    ▼
Hasura GraphQL Engine
    │  Auto-generates SQL from GraphQL + fragments
    │  Applies Hasura permissions (row-level security)
    │
    ▼
PostgreSQL → returns action + relations
    │
    ▼ (response shaped by GraphQL)
    │
createQueryHook
    │  Returns: { data: { action: [...] }, loading, error, refetch }
    │  (data already in GetActionByIdQuery shape)
    │
    ▼
Page.tsx
    │  data?.action?.[0] → action object
```

---

## Summary

The migration replaces the data-fetching backend while preserving the component interface:

| Concern | GraphQL (Legacy) | tRPC (New) |
|---------|------------------|------------|
| **Client library** | Apollo Client | TanStack Query via tRPC |
| **Schema** | GraphQL `.graphql` files + codegen | Zod schemas + Drizzle query configs |
| **Type generation** | GraphQL codegen (`generated/graphql.ts`) | `InferQueryModel` from Drizzle configs |
| **Server** | Hasura auto-generated resolvers | tRPC routers -> services -> data-layer Lambda |
| **Database access** | Hasura's SQL generation | Drizzle ORM relational queries |
| **Permissions** | Hasura row-level permissions | Permit.io ABAC filtering at data-layer |
| **Network hops** | 1 (client -> Hasura -> PG) | 3 (client -> tRPC -> data-layer Lambda -> PG) |
| **Feature toggle** | `useIsFeatureVisibleToOrg('trpc') === false` | `useIsFeatureVisibleToOrg('trpc') === true` |
