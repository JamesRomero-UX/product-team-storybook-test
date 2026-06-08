---
name: create-trpc-query-hook
description: Create a React hook that uses the createQueryHook factory to bridge tRPC and GraphQL queries with feature-flag switching. Use when adding a new data-fetching hook in packages/web/src/hooks/queries/.
argument-hint: <hookName> <trpcProcedurePath> <graphqlDocName>
allowed-tools: Read, Glob, Grep, Edit, Write
---

## Required Inputs

- **hookName**: The hook name in camelCase starting
  with `use` (e.g., `useGetActionById`,
  `useGetRisksRegister`). Determines the filename and
  export name.
- **trpcProcedurePath**: The dot-separated tRPC
  procedure path after `trpc.frontend.`
  (e.g., `action.actionById`, `risk.register`).
- **graphqlDocName**: The GraphQL document name
  without the `Document` suffix
  (e.g., `GetActionById`, `GetRisksFlat`). Used to derive
  the `*Document` and `*Query` type imports from the
  generated GraphQL client.

## Input Validation

1. Check that **hookName** is provided and starts with
   `use`. If missing or malformed, STOP and tell the user:
   "Please provide the hook name starting with 'use'
   (e.g., useGetActionById)."
2. Check that **trpcProcedurePath** is provided. If
   missing, STOP and tell the user: "Please provide the
   tRPC procedure path after trpc.frontend.
   (e.g., action.actionById)."
3. Check that **graphqlDocName** is provided. If
   missing, STOP and tell the user: "Please provide the
   GraphQL document name without the Document suffix
   (e.g., GetActionById)."

## Steps

### Step 1: Determine the entity subdirectory

Derive the entity subdirectory from the hookName. The
subdirectory is the kebab-case entity name. For example:

- `useGetActionById` belongs in `action/`
- `useGetRisksRegister` belongs in `risk/`
- `useGetThirdPartyById` belongs in `third-party/`

Check if the directory already exists under
`packages/web/src/hooks/queries/`. If it does not exist,
the file creation in a later step will create it
implicitly.

Check if a file with the same hookName already exists. If
it does, STOP and inform the user.

### Step 2: Identify the tRPC response type

Search for the response type that matches the entity and
query pattern in the tRPC types package. Use Grep to find
candidates:

- Path: `packages/trpc/src/types/`
- Pattern: the entity name combined with common suffixes
  like `ResponseRow`, `RegisterResponse`, `Response`

Read the matching type file to determine the exact type
name to import (e.g., `GetActionByIdResponseRow`,
`ActionRegisterResponse`). These types are exported from
`@risksmart-app/trpc/src/types`.

### Step 3: Identify the GraphQL types and document

Using the **graphqlDocName** input, the imports
will be:

- `{graphqlDocName}Document` - the typed document node
- `{graphqlDocName}Query` - the TypeScript type for the
  query result

Both are imported from
`@risksmart-app/web-graphql-client/generated/graphql`.

Verify these exports exist by searching with Grep in
`packages/web-graphql-client/` for the document name.
If they do not exist, STOP and tell the user the GraphQL
document may not have been generated yet (they should run
`pnpm run generate-graphql`).

### Step 4: Determine the hook variant

Ask the user (or infer from context) which variant of the
hook to create. Read the matching reference file for the
chosen variant:

**Variant A: No arguments (simplest)**
Reference:
`packages/web/src/hooks/queries/tag/useGetTags.tsx`

- `TQueryArgs` is `Record<string, never>`
- `trpcQueryOptions` takes only `trpc`, no args
- No `graphqlVariables` property needed
- `mapTrpcDataToGraphQL` is an inline arrow function

**Variant B: Simple arguments with static graphqlVariables**
Reference:
`packages/web/src/hooks/queries/action/useGetActionById.tsx`

- `TQueryArgs` is a custom type
  (e.g., `{ id: string }`)
- `trpcQueryOptions` destructures args
- `graphqlVariables` is a plain function receiving args
- `mapTrpcDataToGraphQL` is an inline arrow function

**Variant C: Register with hook-based graphqlVariables**
Reference:
`packages/web/src/hooks/queries/action/useGetActionsRegister.tsx`

- `TQueryArgs` has optional filter fields like
  `parentId?`, `tagTypeIds?`, `departmentTypeIds?`
- `graphqlVariables` is a **React hook** (starts with
  `use`) that calls `useEntityWhereFilter`
- The hook is defined as a separate function above the
  `createQueryHook` call
- `mapTrpcDataToGraphQL` may be exported as a named
  function for reuse

**Variant D: Complex mapping with transformation**
Reference:
`packages/web/src/hooks/queries/risk/useGetRiskRegister.tsx`

- `mapTrpcDataToGraphQL` is a separate exported function
  that performs non-trivial transformations (e.g.,
  computing aggregates, duplicating fields, reshaping
  nested data)
- Used when the GraphQL schema has fields not directly
  present in the tRPC response (like `_aggregate` counts)

**Variant E: Client-side GraphQL data filtering**
Reference:
`packages/web/src/hooks/queries/third-party/useGetThirdPartyContacts.tsx`

- Uses the optional `mapGraphQLData` config property
- Applies client-side filtering/transformation to GraphQL
  data that the GraphQL query cannot express
- Receives `queryArgs` for conditional logic

### Step 5: Create the hook file

Create the file at
`packages/web/src/hooks/queries/{entity}/{hookName}.tsx`.

Follow this structure, adapting based on the variant
chosen in Step 4:

**Import order** (follow exactly):

1. Type imports from `@risksmart-app/trpc/src/types`
2. Type imports from
   `@risksmart-app/web-graphql-client/generated/graphql`
3. Value imports from
   `@risksmart-app/web-graphql-client/generated/graphql`
4. `import { createQueryHook } from 'src/utils';`
5. Any local imports (e.g., `useEntityWhereFilter`)

**Type parameters for createQueryHook** (3 generics):

1. `TQueryArgs` - the hook's argument type
2. `TTRPCOutput` - the tRPC procedure's return type
3. `TGraphQLData` - the GraphQL query result type
   (`{graphqlDocName}Query`)

**Config object properties:**

- `trpcQueryOptions` - always required. Receives
  `(trpc, args)` or just `(trpc)` for no-arg hooks.
  Must call
  `trpc.frontend.{trpcProcedurePath}.queryOptions(...)`.
- `mapTrpcDataToGraphQL` - always required. Maps tRPC
  response shape to match the GraphQL query type. For
  simple cases, use an inline arrow. For complex
  reshaping, define a separate named function.
- `graphqlDocument` - always required. Set to
  `{graphqlDocName}Document`.
- `graphqlVariables` - optional. Either a plain function
  `(args) => ({...})` or a React hook function for
  dynamic variables. When it is a hook, define it as a
  separate `const use{Entity}GraphqlVariables` function.
- `graphqlFetchPolicy` - optional. Omit to use the
  default `'no-cache'`.
- `trpcStaleTime` - optional. Set only if caching is
  needed.
- `mapGraphQLData` - optional. Only for client-side
  post-processing of GraphQL data.

**Key rules:**

- The hook must be exported as a named `const` export
- No type casting (`as`, `!`) -- use type-safe patterns
- The `.tsx` extension is required (the factory returns
  JSX-compatible hooks)
- `createQueryHook` is imported from `'src/utils'`, NOT
  from the full factory path

### Step 6: Export from the barrel index

Read
`packages/web/src/hooks/queries/index.ts`
and add the new export in **alphabetical order** among the
existing exports. The export line follows this pattern:

```typescript
export { hookName } from './entity/hookName';
```

Insert it at the correct alphabetical position based on
the hook name, matching the existing sorting convention
in the file.

## Verification

1. **File exists**: The hook file was created at
   `packages/web/src/hooks/queries/{entity}/{hookName}.tsx`
2. **Barrel export**: The hook is exported from
   `packages/web/src/hooks/queries/index.ts` in
   alphabetical order
3. **Import correctness**: The file imports
   `createQueryHook` from `'src/utils'`, tRPC types as
   type-only imports from `@risksmart-app/trpc/src/types`,
   and GraphQL types/documents from
   `@risksmart-app/web-graphql-client/generated/graphql`
4. **No type casting**: The file contains no `as` type
   casts (except `as const` which is acceptable) and no
   `!` non-null assertions
5. **Three generic parameters**: The `createQueryHook`
   call specifies exactly three type parameters:
   `TQueryArgs`, `TTRPCOutput`, and `TGraphQLData`
6. **Config completeness**: The config object includes at
   minimum `trpcQueryOptions`, `mapTrpcDataToGraphQL`,
   and `graphqlDocument`
7. **tRPC path correctness**: The `trpcQueryOptions`
   callback calls `trpc.frontend.{trpcProcedurePath}`
   matching **trpcProcedurePath**
8. **GraphQL document**: The `graphqlDocument` property
   references `{graphqlDocName}Document` matching
   **graphqlDocName**
