# packages/test-data

Shared test data builders and database clients for consistent test setup.

## Key Patterns

- **Builder pattern**: `buildRisk({ orgKey, userId, overrides? })` returns insert-ready models with defaults and random UUIDs. 45+ entity builders available.
- **Client pattern**: `insertRisk(builderResult)` executes Drizzle insert with admin access (bypasses RLS). 45+ entity clients available.
- **Singleton DB**: `getSharedDb()` creates one Drizzle client for all operations.

## Import Paths

```typescript
import { buildRisk } from '@risksmart-app/test-data'           // main export
import { buildRisk } from '@risksmart-app/test-data/builders'  // subpath
import { insertRisk } from '@risksmart-app/test-data/clients'  // subpath
```

No tests - test support library consumed by api-tests, trpc-api-tests, and external-api-tests.
