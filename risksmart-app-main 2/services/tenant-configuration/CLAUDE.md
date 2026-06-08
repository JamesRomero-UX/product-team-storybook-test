# services/tenant-configuration

EventBridge Lambda that propagates system events to regional tenant-specific event buses.

## Architecture

- `adaptors/database/` - DynamoDB tenant config queries
- `adaptors/event-bridge-adaptor.ts` - EventBridge publishing
- `domain/services/` - Propagation logic to regional tenants
- `handlers/propagate-event/` - EventBridge handler entry point

## Key Patterns

- Receives system events (no tenant context), replicates to each regional tenant with tenant-specific metadata.
- Factory pattern: `createPropagateToRegionalTenants()` with `getTenantConfigs` + `dispatchEvents` dependencies.
- **Causation tracking**: Each regional event copy gets a new `eventId` and sets `causationId` to the original event's ID.
- Validates events with `systemEventSchema` before processing.
