# packages/trpc-api-tests

Integration tests for the tRPC backend service.

## Commands

```bash
pnpm --filter @risksmart-app/trpc-api-tests run docker:compose:api-test:trpc # Start tRPC + stub PDP containers
pnpm --filter @risksmart-app/trpc-api-tests run docker:build                 # Build stub-pdp Docker image
```

## Architecture

- `tests/backend/` - Backend API tests (risks, actions, controls, etc.)
- `tests/frontend/` - Frontend data transformation tests
- `stub-pdp/` - Stub Permit.io PDP (Express server mocking permission decisions)
- `utils/` - Test context, auth token generation, logger

## Key Patterns

- Uses `httpBatchLink` with `superjson` transformer for tRPC client setup.
- `createTestContext` creates org, user, and database records before each test. Auth tokens generated via mock OIDC server.
- Stub PDP in `src/stub-pdp/` mocks Permit.io permission decisions. Rebuild Docker image after changes.

## Gotchas

- Requires `.env.test` with `AUTH_PROVIDER_URL` and `TRPC_TEST_URL`.
- **Foreign key constraints**: Many DB fields reference other tables (e.g., `CompletedByUser` → `user.Id`, `OriginatingItemId` → `node.Id`). Never use hardcoded strings like `'user@example.com'` for these fields — use `context.userId` or seed the referenced record first. Check `packages/drizzle/src/schema.ts` for `foreignKey()` definitions when in doubt.
