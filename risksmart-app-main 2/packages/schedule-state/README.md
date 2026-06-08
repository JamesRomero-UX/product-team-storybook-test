# @risksmart-app/schedule-state

Shared package for schedule state refresh logic. Recalculates DueDate, OverdueDate, and LatestDate for entities with recurring schedules (risks, controls, documents, obligations, indicators).

## Architecture

Uses a **ports & adapters** pattern so the same business logic can be consumed by different callers with different data access strategies:

```
Caller (tRPC / rest-api)
  |
  |-- creates adapter (HTTP or GraphQL)
  |-- creates refresh function via factory
  |-- calls refresh function with (ctx, entityId)
  |
  v
Factory: createRefreshXxxScheduleState(dataAccess)
  |
  |-- returns bound (ctx, entityId) => Promise<void>
  |
  v
Refresh function (business logic)
  |
  |-- calls dataAccess.getSchedule()
  |-- calls dataAccess.getLatestXxxResult()
  |-- calculates getDueDate() / getOverdueDate()
  |-- calls dataAccess.upsertScheduleState()
  |
  v
ScheduleDataAccess (port interface)
  |
  |-- HTTP adapter (data-layer Lambda API)  <-- tRPC path
  |-- GraphQL adapter (Hasura SDK)          <-- rest-api path
```

## Usage

### From tRPC (HTTP adapter)

```typescript
import {
  createHttpScheduleDataAccess,
  createRefreshRiskScheduleState,
} from '@risksmart-app/schedule-state';
import { toApiContext } from '../../clients/client-utils';

// Create bound refresh function (once per request)
const refreshRiskScheduleState = createRefreshRiskScheduleState(
  createHttpScheduleDataAccess()
);

// Call after mutation succeeds (non-fatal, wrapped in try/catch)
for (const riskId of input.RiskIds) {
  try {
    await refreshRiskScheduleState(toApiContext(ctx), riskId, {
      useImpacts: options.useImpacts,
    });
  } catch (error) {
    logger.warn({ riskId, error }, 'Failed to refresh schedule state');
  }
}
```

### From rest-api (GraphQL adapter)

```typescript
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';

// Helper creates all refresh functions with the GraphQL adapter
const { ctx, refreshControlScheduleState } = createScheduleRefresh(sessionData);
await refreshControlScheduleState(ctx, controlId);
```

## Exported API

### Factory Functions

| Factory | Returns | Entity |
|---|---|---|
| `createRefreshScheduleState(dataAccess)` | `(ctx, { entityId, latestDate }) => Promise<void>` | Generic (all entities) |
| `createRefreshRiskScheduleState(dataAccess)` | `(ctx, riskId, { useImpacts }) => Promise<void>` | Risk (routes to rating or impact) |
| `createRefreshRiskRatingScheduleState(dataAccess)` | `(ctx, riskId) => Promise<void>` | Risk (rating mode) |
| `createRefreshRiskImpactScheduleState(dataAccess)` | `(ctx, riskId) => Promise<void>` | Risk (impact mode) |
| `createRefreshControlScheduleState(dataAccess)` | `(ctx, controlId) => Promise<void>` | Control |
| `createRefreshDocumentScheduleState(dataAccess)` | `(ctx, documentId) => Promise<void>` | Document |
| `createRefreshObligationScheduleState(dataAccess)` | `(ctx, obligationId) => Promise<void>` | Obligation |
| `createRefreshIndicatorScheduleState(dataAccess)` | `(ctx, indicatorId) => Promise<void>` | Indicator |

### Adapters

| Export | Purpose |
|---|---|
| `createHttpScheduleDataAccess()` | HTTP adapter for tRPC (calls data-layer API) |

The GraphQL adapter lives in `packages/rest-api/src/adapters/schedule-state-adapter.ts`.

### Utilities

| Export | Purpose |
|---|---|
| `calculateInitialScheduleState(schedule)` | Calculate initial DueDate/OverdueDate for newly created entities (no test results yet) |

### Types

| Export | Purpose |
|---|---|
| `ScheduleDataAccess` | Port interface for data access adapters |
| `ApiRequestContext` | Context object (`{ tenant, orgKey, userId }`) |

## Adding a New Entity

1. Add a **data-layer GET endpoint** to fetch the entity's latest result date
2. Add the method to the **`ScheduleDataAccess` port** (`src/ports/schedule-data-access.ts`)
3. Implement in the **HTTP adapter** (`src/adapters/http-data-access.ts`)
4. Implement in the **GraphQL adapter** (`packages/rest-api/src/adapters/schedule-state-adapter.ts`)
5. Add the **client method** (`src/clients/data-layer-client.ts`) and **response type** (`src/types.ts`)
6. Create **`src/refresh-{entity}-schedule-state.ts`** following existing patterns
7. **Export** the factory from `src/index.ts`
8. Add **unit tests** in `src/refresh-{entity}-schedule-state.test.ts`
