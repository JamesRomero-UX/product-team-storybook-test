# packages/rest-api

Legacy REST API layer with repositories and Hasura GraphQL integration. Being replaced by `packages/trpc`. Avoid adding new features here.

## Architecture

- `src/repositories/` - Data access per entity (action, risk, control, etc.) via GraphQL mutations to Hasura
- `src/comparators/` - Field comparison logic for change detection
- `graphql/` - GraphQL query/mutation definitions

## Key Patterns

- One repository directory per entity under `src/repositories/`. Add new entities here following existing patterns.
- `openapi.yaml` at package root defines the API contract.
- Path aliases configured for `src/*`, `@risksmart-app/shared/*`, and `@risksmart-app/permitio/*`.
