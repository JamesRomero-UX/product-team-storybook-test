# services/request-state-api

Event-sourced state machine Lambda for async request tracking.

## Commands

```bash
# Events are routed automatically via the local event router (scripts/local-event-router/)
# when running node scripts/dev.js
```

## Architecture

- `event-store/aggregator/engine.ts` - Event sourcing processor (core state machine)
- `event-store/aggregator/rules/` - State update rules (initiate, update)
- `event-store/db/` - DynamoDB persistence
- `handlers/http/` - REST GET/POST for request state
- `handlers/events/` - EventBridge processors
- `handlers/dynamo/` - DynamoDB stream handler
- `schemas/` - Zod validation
- `constants/` - Facet definitions for entity types

## Key Patterns

- **Event sourcing**: Rule-based state machine with `Processor` class. Rules map `EventType` to `StateUpdater` functions.
- **Two rules**: `initiateAsyncRequestRule` (creates) and `updateAsyncRequestRule` (updates). Add new rules for new event types.
- **Facet system**: Organized request state facets for different entity types in `constants/`.
