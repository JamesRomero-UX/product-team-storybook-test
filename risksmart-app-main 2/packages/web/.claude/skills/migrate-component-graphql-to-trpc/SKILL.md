---
name: migrate-component-graphql-to-trpc
description: Migrates a React component from using Apollo useQuery with a GraphQL document to using a tRPC-wrapped hook from @/hooks/queries. Use when a component still calls useQuery from @apollo/client for a query that already has a createQueryHook wrapper available.
argument-hint: <GraphQLDocumentName-or-component-file-path>
allowed-tools: Read, Edit, Glob, Grep, Bash
---

## Required Inputs

- **target** - One of the following:
  - A GraphQL document name to migrate away from
    (e.g. `GetAppetitesGroupedByImpactDocument`), OR
  - A path to a specific component file to migrate.

## Input Validation

Check that **target** is provided. If it is missing, STOP
and tell the user:

> Please provide either the GraphQL document name
> (e.g. `GetAppetitesGroupedByImpactDocument`) or
> the path to the component file to migrate.

## Steps

### 1. Identify the GraphQL document and target files

If **target** is a file path, read the file and identify
all `useQuery` calls from `@apollo/client` that use
GraphQL document imports. Each distinct document is a
migration target.

If **target** is a GraphQL document name, search for all
component files that import and use it:

- Grep for the document name in `packages/web/src`
- Filter to `.tsx` and `.ts` files
- Exclude files under `hooks/queries/` (those are
  the hook definitions, not consumers)

### 2. Find the corresponding tRPC hook

For each GraphQL document identified in step 1,
derive the expected hook name. The naming convention
maps as follows:

- `GetDocumentFilesByDocumentIdDocument` maps to
  `useGetDocumentFilesByDocumentId`
- `GetAppetitesGroupedByImpactDocument` maps to
  `useGetAppetitesGroupedByImpact`
- Pattern: strip the trailing `Document`, prepend
  `useGet` (or `use` + the verb from the name)

Search for the hook in the hooks/queries barrel:

- Grep for the derived hook name in
  `packages/web/src/hooks/queries/index.ts`

If the hook is NOT exported from the barrel, check
whether a hook file exists:

- Glob for `packages/web/src/hooks/queries/**/*`
  matching the hook name

If no hook exists at all, STOP and tell the user:

> No tRPC hook found for `<DocumentName>`. The hook
> must be created first using the create-trpc-query-hook
> skill before the component can be migrated.

### 3. Read the tRPC hook definition

Read the hook file to understand:

- What `queryArgs` it expects (the `TQueryArgs` type)
- Whether it supports `shouldSkip`
- What shape the returned `data` has (the
  `mapTrpcDataToGraphQL` mapping reveals the GraphQL
  data shape it returns)

Reference a representative hook file for the pattern:

`packages/web/src/hooks/queries/document-file/useGetDocumentFilesByDocumentId.tsx`

All hooks created via `createQueryHook` return
`{ data, loading, refetch, error }` with the same
`data` shape as the original GraphQL query. This means
component code that accesses `data?.some_table` does
not need to change.

### 4. Read each target component file

Read the full component file. Identify and note:

- The `useQuery` import from `@apollo/client`
- The GraphQL document import from
  `@risksmart-app/web-graphql-client/generated/graphql`
- The `useQuery(DocumentName, { ... })` call site
- Whether it uses `variables` (maps to `queryArgs`)
- Whether it uses `skip` (maps to `shouldSkip`)
- Whether it uses `fetchPolicy` (handled by the hook
  factory, can be dropped)
- Whether it destructures `data`, `loading`, `refetch`,
  or `error`
- Whether `useMutation` or other Apollo imports remain
  (the `@apollo/client` import may still be needed)

### 5. Update imports

Apply these import changes to each target file:

**Remove or update the Apollo import:**

- If `useQuery` is the ONLY import from
  `@apollo/client`, remove the entire import line
- If other imports remain (e.g. `useMutation`), remove
  only `useQuery` from the named imports

**Remove the GraphQL document import:**

- Remove the document constant (e.g.
  `GetAppetitesGroupedByImpactDocument`) from the
  `@risksmart-app/web-graphql-client/generated/graphql`
  import
- If no other imports remain from that module, remove
  the entire import line
- If the Query type (e.g.
  `GetAppetitesGroupedByImpactQuery`) is used elsewhere
  in the file for typing, keep it

**Add the tRPC hook import:**

- If the file already imports from `@/hooks/queries`,
  add the new hook to the existing import
- Otherwise, add a new import line:
  `import { useHookName } from '@/hooks/queries';`

Reference the import patterns in these migrated files:

- `packages/web/src/pages/policy/update/tabs/files/Tab.tsx`
  -- shows hook import alongside remaining Apollo
  `useMutation` import
- `packages/web/src/pages/risks/update/tabs/acceptances/Tab.tsx`
  -- shows hook import from `@/hooks/queries` barrel
- `packages/web/src/pages/third-party/Page.tsx`
  -- shows clean migration with no remaining Apollo
  imports

### 6. Replace the useQuery call

Replace each `useQuery(DocumentName, options)` call
with the corresponding tRPC hook call. Apply these
mappings:

**Simple query (no variables, no skip):**

Before:

```text
const { data, loading } = useQuery(
  GetSomeDocument
);
```

After:

```text
const { data, loading } = useGetSome({
  queryArgs: {},
});
```

Reference:
`packages/web/src/pages/third-party/Page.tsx`
-- `useGetThirdPartyRegister({ queryArgs: {} })`

**Query with variables:**

Before:

```text
const { data, loading, refetch } = useQuery(
  GetSomeByIdDocument,
  { variables: { id: someId } }
);
```

After:

```text
const { data, loading, refetch } = useGetSomeById({
  queryArgs: { id: someId },
});
```

Reference:
`packages/web/src/pages/policy/update/tabs/files/Tab.tsx`
-- `useGetDocumentFilesByDocumentId({ queryArgs: { documentId } })`

**Query with skip condition:**

Before:

```text
const { data, loading } = useQuery(
  GetSomeByIdDocument,
  { variables: { id: someId! }, skip: !someId }
);
```

After:

```text
const { data, loading } = useGetSomeById({
  queryArgs: { id: someId },
  shouldSkip: !someId,
});
```

Note: when migrating `skip` to `shouldSkip`, remove
any non-null assertions (`!`) from variables that
were only needed because `skip` did not narrow the
type. The hook factory handles the skip internally.

Reference:
`packages/web/src/pages/policy/update/tabs/files/update/Page.tsx`
-- `useGetDocumentFileById({ queryArgs: { id: documentFileId }, shouldSkip: !documentFileId })`

**Query with refetch:**

The `refetch` function returned by `createQueryHook`
has the same usage pattern -- it returns a promise.
No changes needed to `refetch()` call sites. However,
the `refetch` return type is
`Promise<{ data, error }>` rather than Apollo's
`ApolloQueryResult`. If the component inspects the
refetch return value, update accordingly.

Reference:
`packages/web/src/pages/risks/update/tabs/acceptances/Tab.tsx`
-- shows `refetch` used in a delete handler

**Drop fetchPolicy:**

The `fetchPolicy` option is handled by the hook
factory (defaults to `'no-cache'`). Remove it from
the call site.

### 7. Check for variable name aliasing

If the original `useQuery` call aliased destructured
properties (e.g.
`{ data: impactData, loading: loadingImpacts }`),
keep the same aliases on the new hook call so
downstream code is unaffected.

### 8. Verify data access patterns are unchanged

The `createQueryHook` factory maps tRPC data back to
the GraphQL query structure via `mapTrpcDataToGraphQL`.
This means `data?.some_table` access patterns should
remain the same. Scan the component for all references
to the `data` variable and confirm they still match
the shape returned by the hook.

Read the hook definition file to check the
`mapTrpcDataToGraphQL` function. It shows which
top-level key is used (e.g.
`(data) => ({ document_file: data })` means
`data?.document_file` is the correct access pattern).

## Verification

Before reporting completion, confirm every item:

- [ ] No `useQuery` import from `@apollo/client`
  remains for the migrated query (other Apollo
  imports like `useMutation` may still be present)
- [ ] The GraphQL document constant import is removed
  (unless still used by other code in the file)
- [ ] The new tRPC hook is imported from
  `@/hooks/queries` (or the specific hook path)
- [ ] `queryArgs` contains all fields the hook expects
- [ ] `shouldSkip` replaces any `skip` option
- [ ] `fetchPolicy` is not passed to the new hook
- [ ] Data access patterns (`data?.table_name`) are
  unchanged and match the hook's
  `mapTrpcDataToGraphQL` mapping
- [ ] Destructuring aliases are preserved
- [ ] No non-null assertions were introduced
