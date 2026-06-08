# packages/local-auth-provider

Local development OAuth2 mock server using `oauth2-mock-server`.

## Key Patterns

- Provides JWT tokens with customizable claims for local development. Port configurable via `MOCK_AUTH_PORT` (default 3232).
- Injects `x-hasura-*` JWT claims with default feature flags (notifications, reports, compliance, etc.).
- Drops Hasura claims when `source_service` is provided in request (for service-to-service auth).
- Development-only tool, no tests.
