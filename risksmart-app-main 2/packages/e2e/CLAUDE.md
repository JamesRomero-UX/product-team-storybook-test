# packages/e2e

Playwright end-to-end test suite.

## Commands

```bash
pnpm --filter @risksmart-app/e2e run test:e2e             # Run all E2E tests (excludes visual)
pnpm --filter @risksmart-app/e2e run test:e2e:ui          # Run with Playwright UI
pnpm --filter @risksmart-app/e2e run test:e2e:visual      # Run visual regression tests only
pnpm --filter @risksmart-app/e2e run test:e2e:update      # Update visual snapshots
```

## Architecture

- `base.ts` - Playwright test fixture setup with auth + API client
- `models/` - Page Object Models (App, LoginPage, etc.)
- `testData/` - Form value builders per domain entity
- `tests/` - Test specs

## Key Patterns

- Use the custom `test` export (not bare Playwright `test`) - it extends base with user role fixtures and app page models.
- Page Object Model pattern: encapsulate UI interactions in `models/`. Add new page models for new pages.
- **Organization pooling**: Pre-created test orgs reused via `organisationPool.ts`.
- **Auth state caching**: Storage state files cached in `.auth/` per role and worker.
- Each test fixture auto-deletes data and resets org features.

## Config

- 8 parallel workers, 2 retries in CI, 0 locally
- `fullyParallel: false` - tests within a file run sequentially
- Desktop Chrome only, video/screenshots retained on failure
