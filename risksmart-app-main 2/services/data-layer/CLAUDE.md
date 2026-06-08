# services/data-layer

HTTP API gateway Lambda for GRC data operations. Handles CRUD for actions, nodes, user groups, form configurations, etc.

## Architecture

- `handlers/http/create-handler.ts` - Shared factory: creates a Middy router handler with Sentry, error handling, and Lambda Powertools middleware
- `handlers/http/client/handler.ts` - Client API entry point: routes for frontend/tRPC (CRUD operations)
- `handlers/http/client/processors/` - Entity-specific GET/POST/PUT/DELETE processors for client API (one dir per entity)
- `handlers/http/internal/handler.ts` - Internal API entry point: read-only routes for backend services (permissions sync)
- `handlers/http/internal/processors/` - Read-only processors for internal API (nodes, users, user-groups, etc.)
- `handlers/http/utils/` - Middleware, error handling, response formatting
- `handlers/http/events/` - Event publishing strategies (form vs object events)
- `handlers/http/test-utils.ts` - Shared test factories (`createMockEvent`, `createMockLambdaContext`, `createMockServiceContext`)
- `handlers/org-event/` - EventBridge event handlers
- `repositories/` - Drizzle ORM data access layer
- `schemas/` - Zod request validation schemas
- `events/` - EventBridge event publishers
- `adaptors/` - External service integrations (Permit, Secrets Manager)
- `clients/` - AWS service clients

## Key Patterns

- **Middy HTTP Router** with middleware chain: Sentry -> error handler -> Lambda Powertools context injection.
- **Two Lambda functions**: client API (frontend/tRPC) and internal API (permissions service). Both use `createHandler` from `create-handler.ts`.
- Dependencies created per request for fresh state.
- **Event strategies** in `events/event-strategies.ts` - use strategy pattern for form vs object events.

## Key Rules

- **Spread validated payload in processors**: Processors MUST spread the Zod-validated payload (`...payload`) into the repository call instead of manually mapping each field. The schema already validates types and required/optional fields, so re-listing them is redundant and error-prone. Only add overrides for computed fields (e.g., `ModifiedByUser: context.userId`, `CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null`).
  ```typescript
  // CORRECT — spread payload, override only computed fields
  await repository.update(id, {
    ...payload,
    ModifiedByUser: context.userId,
    CustomAttributeData: (payload.CustomAttributeData as JSONB) ?? null,
  }, context);

  // WRONG — manually mapping every field
  await repository.update(id, {
    Title: payload.Title,
    Details: payload.Details,
    Status: payload.Status,
    ModifiedByUser: context.userId,
    // ... easy to miss a field or add ?? null incorrectly
  }, context);
  ```
- **Timestamps are set internally**: Repositories MUST set `ModifiedAtTimestamp: sql\`statement_timestamp()\`` on UPDATE operations. The DB column default only applies on INSERT. Never accept timestamps from the caller — always set them in the repository layer using `sql` from `drizzle-orm`.

## Adding a New Endpoint

1. Create Zod schema in `src/schemas/`
2. Create repository in `src/repositories/`
3. Create processor in `src/handlers/http/client/processors/{entity}/` (or `internal/processors/` for backend-only reads)
4. Register route in `src/handlers/http/client/handler.ts` (or `internal/handler.ts`)
5. Add event strategy if mutation needs EventBridge publishing
