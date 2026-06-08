# packages/api-tests

Integration tests for GraphQL/Hasura APIs and PostgreSQL database layer.

## Key Patterns

- Tests interact directly with Hasura GraphQL APIs using Apollo Client with admin role.
- **Global setup** (`vitest-globalSetup.ts`) warms Lambda functions and sends EventBridge messages before tests run.
- **FK constraint ordering**: Deletion must respect foreign key constraints - delete dependent records first.
- Environment config loaded from `.env` and `.env.test`.
