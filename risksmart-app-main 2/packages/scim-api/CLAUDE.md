# packages/scim-api

SCIM 2.0 API for user provisioning and identity synchronization (Lambda-based).

## Commands

```bash
pnpm --filter @risksmart-app/scim-api run peggy:scim-filter    # Regenerate SCIM filter parser (run after grammar changes)
pnpm --filter @risksmart-app/scim-api run peggy:scim-patch     # Regenerate SCIM patch parser (run after grammar changes)
```

## Architecture

- `handlers/auth/` - Bearer token authorizer
- `handlers/http/` - REST endpoints (users CRUD, resource-types, schemas)
- `handlers/internal/` - Domain/token management, config
- `services/hasura/` - User/org GraphQL operations
- `services/ssm/` - AWS Secrets Manager
- `services/dynamo/` - Token config storage
- `scim/` - SCIM types, mappings, schemas, response types
- `parsers/` - Peggy-generated parsers (filter, patch)
- `testing/mocks/` - MSW handlers for GraphQL mocking

## Key Patterns

- **Peggy parsers**: SCIM filter and PATCH operations parsed by generated recursive descent parsers from `.peggy` grammar files. Regenerate after grammar changes.
- Separate handler file per HTTP method (POST, PATCH, PUT, DELETE).
- `createScimUserMapper` creates attribute-aware user transformers.

## Gotchas

- Email domain validation is case-insensitive but stored as-is.
- User existence checked in current org first, then other orgs.
- GraphQL codegen requires admin secret for schema introspection.
