# packages/trpc

tRPC 11 server with services, routers, and query configurations. Replacing Hasura GraphQL (`packages/rest-api`) as the backend for frontend. New features should use tRPC.

## Architecture

- `routers/frontend/` - tRPC router procedures (one file per entity, thin wrappers calling services)
- `services/frontend/` - Business logic with Drizzle queries + Permit.io permission filtering
- `queries/` - Drizzle query configs (relations, column selections)
- `types/` - Response types inferred from Drizzle query configs
- `middleware/` - Auth, logging, permission middleware
- `adapters/` - Port adapters (e.g., `schedule-data-access-adapter.ts` implements the schedule-state `ScheduleDataAccess` port using the tRPC data-layer client)

## Key Patterns

- **Service layer**: Services accept context with `db`, `user`, `permissions`. Always apply `preFilter` for permission scoping.
- **Query configs** define Drizzle `with` relations and column selections. Types are inferred from these configs.
- Use `createQueryConfig` and `createService` factories for consistency.
- **superjson** transformer for serializing Dates, BigInts, etc.
- **Subpath imports for workspace packages**: Always use subpath imports (e.g., `@risksmart-app/schedule-state/src/utils/schedule-utils`) not bare package imports (e.g., `@risksmart-app/schedule-state`). The tsup build post-processor appends `.js` to workspace imports for ESM resolution in Docker, which breaks bare package names.

## Adding a New Endpoint

1. Create query config in `src/queries/`
2. Create response types in `src/types/` (infer from query config)
3. Create service method in `src/services/frontend/`
4. Add router procedure in `src/routers/frontend/`
5. Create frontend hook in `packages/web/src/hooks/queries/`
