# packages/external-api

Production REST API service for external client access to RiskSmart data.

## Architecture

- `auth/` - Multi-issuer JWT validation
- `middleware/` - JWT auth, error handler, rate limiter, request logger, API versioning
- `routes/` - Express route handlers per entity
- `services/` - Business logic per entity
- `schemas/` - Zod validation + OpenAPI generation
- `schemas/versions/` - Schema version transformations for backwards compatibility
- `trpc/` - Internal tRPC client for data fetching
- `circuit-breaker/` - Resilience patterns (cockatiel)
- `transformers/` - Response transformers

## Key Patterns

- Express + Zod REST API. Fetches data internally via tRPC, exposes as REST.
- All tRPC service calls wrapped with cockatiel circuit breaker for resilience.
- **Schema versioning**: Date-based compatibility layer so older API clients still work. Add new versions in `schemas/versions/`.
- Supports multiple JWT token issuers for different clients.

## OpenAPI Type Generation

TypeScript types are auto-generated from the OpenAPI spec using `openapi-typescript`.
The generated file `src/generated/openapi.d.ts` is committed to git and acts as a
typed contract for API consumers (zapier-app, future MCP server, etc.).

```bash
# Regenerate types after changing schemas or versions
pnpm --filter=@risksmart-app/external-api run generate:api-types
```

**Files:**
- `scripts/generate-openapi-types.ts` — Generation script
- `src/generated/openapi.d.ts` — Generated types (committed)
- `src/types/openapi-helpers.ts` — Ergonomic helper types (`ApiResponse`, `ApiListItem`, etc.)

**Exported as** `@risksmart-app/external-api/api-types` for consumers.

**When to regenerate:** After modifying any Zod schema in `src/schemas/` or version
in `src/versions/`. The Turborepo task uses `inputs: ["src/schemas/**", "src/versions/**"]`
for caching.

## Verification, Testing, Type check commands to run:

```bash
# Run unit tests
pnpm --filter=@risksmart-app/external-api run test:unit

# Type check
pnpm --filter=@risksmart-app/external-api run tsc

# Lint fix
pnpm --filter=@risksmart-app/external-api run lint:fix

# Regenerate OpenAPI types after schema changes
pnpm --filter=@risksmart-app/external-api run generate:api-types
```
