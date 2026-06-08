# packages/web-graphql-client

Legacy GraphQL code generation library - being replaced by tRPC. No source code, only configuration and generated types.

## Commands

```bash
pnpm --filter @risksmart-app/web-graphql-client run generate-graphql     # Generate types (requires Hasura running on localhost:8080)
```

## Key Patterns

- **90+ GraphQL document directories** under `graphql/`, one per feature/entity.
- Generates single `generated/graphql.ts` with all types, hooks, and operations.
- Exports `namedOperations` object via `named-operations-object` plugin.

## Gotchas

- Codegen uses `x-hasura-role: CustomerSupport` header for introspection.
- `maybeValue: 'T | null | undefined'` means all nullable fields allow both null and undefined.
- `enumsAsConst: true` generates const-style enums.
- Plugin order matters: `typescript` -> `typescript-operations` -> `typed-document-node`.
- Scalar mappings: PostgreSQL types (float8, smallint, numeric, uuid, timestamptz) mapped to TypeScript equivalents.
