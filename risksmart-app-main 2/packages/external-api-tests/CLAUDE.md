# packages/external-api-tests

End-to-end tests for the external REST API service.

## Commands

```bash
pnpm --filter @risksmart-app/external-api-tests run docker:compose:api-test:external-api   # Start services
```

## Key Patterns

- `createTestContext` creates isolated orgs/users with an `HttpClient` wrapper.
- Tests organized by resource with `-list.test.ts` and `-detail.test.ts` naming.
- `waitForDbPropagation()` handles eventual consistency delays.
- Test tokens include `source_service: 'external-api'` claim.
