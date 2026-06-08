# packages/schedule-state

Shared schedule state refresh logic using a ports & adapters pattern. Calculates and updates DueDate, OverdueDate, and LatestDate for entities with recurring schedules (risks, controls, documents, obligations, indicators). Consumed by both `packages/trpc` and `packages/rest-api`, each providing their own adapter.

## Architecture

- `src/ports/schedule-data-access.ts` - Port interface (`ScheduleDataAccess`) defining the data access contract
- `src/types.ts` - Domain type definitions (ApiRequestContext, response types). The port and all refresh files import from here.
- `src/refresh-schedule-state.ts` - Core generic refresh (fetch schedule, calculate dates, upsert state)
- `src/refresh-risk-rating-schedule-state.ts` - Risk rating: fetches latest assessment result, checks aggregation
- `src/refresh-risk-impact-schedule-state.ts` - Risk impact: fetches oldest active impact test date
- `src/refresh-risk-schedule-state.ts` - Risk router: delegates to rating or impact based on `useImpacts` flag
- `src/refresh-control-schedule-state.ts` - Control: fetches latest test result
- `src/refresh-document-schedule-state.ts` - Document: fetches latest document assessment result
- `src/refresh-obligation-schedule-state.ts` - Obligation: fetches latest obligation assessment result
- `src/refresh-indicator-schedule-state.ts` - Indicator: fetches latest indicator result (uses `ResultDate`)
- `src/utils/schedule-utils.ts` - Pure date calculation (`getDueDate`, `getOverdueDate`, `calculateInitialScheduleState`)
- `src/utils/logger.ts` - Pino logger

## Key Patterns

- **Ports & adapters**: Refresh functions accept a `ScheduleDataAccess` adapter (the port). Callers provide the concrete adapter (HTTP for tRPC, GraphQL for rest-api).
- **Narrowed factory types**: Each factory uses `BaseScheduleAccess & Pick<ScheduleDataAccess, ...>` to declare only the methods it needs. `BaseScheduleAccess` covers the 3 generic methods (`getSchedule`, `getScheduleState`, `upsertScheduleState`). This keeps tests minimal — mock only the methods the factory actually calls.
- **Curried factories**: Each refresh function is a factory `createRefreshXxx(dataAccess)` that returns the bound `(ctx, entityId) => Promise<void>` function. Create once per request, call for each entity.
- **Adapters live in the calling package**: The tRPC adapter lives in `packages/trpc/src/adapters/schedule-data-access-adapter.ts`. The GraphQL adapter lives in `packages/rest-api/src/adapters/schedule-state-adapter.ts`. This package contains only the port and refresh logic — no infrastructure code.
- **Non-fatal in callers**: Schedule refresh is always called after the DB mutation succeeds and wrapped in try/catch. A refresh failure should not fail the parent operation.
- **Subpath imports required in trpc**: The trpc tsup build post-processor appends `.js` to workspace imports. Bare imports like `@risksmart-app/schedule-state` become the invalid `@risksmart-app/schedule-state.js`. Always use subpath imports in trpc (e.g., `@risksmart-app/schedule-state/src/utils/schedule-utils`).

## Adding a New Entity Refresh

1. Add a data-layer GET endpoint to fetch the entity's latest result date (in `services/data-layer/`)
2. Add the corresponding method to the `ScheduleDataAccess` port interface in `src/ports/schedule-data-access.ts`
3. Add the response type in `src/types.ts`
4. Implement the method in the tRPC adapter (`packages/trpc/src/adapters/schedule-data-access-adapter.ts`) and add the client method to `packages/trpc/src/clients/data-layer-api-client.ts`
5. Implement the method in the GraphQL adapter (`packages/rest-api/src/adapters/schedule-state-adapter.ts`)
6. Create `src/refresh-{entity}-schedule-state.ts` following the existing entity patterns
7. Export the factory from `src/index.ts`
8. Add unit tests in `src/refresh-{entity}-schedule-state.test.ts`
