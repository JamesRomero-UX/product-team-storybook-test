# Org Event Handler

## Purpose

The org event handler is an AWS Lambda function that processes organisation-scoped domain events from EventBridge.

## Architecture

```text
EventBridge → handler.ts → router.ts → processors/
```

### `handler.ts`

**AWS Lambda Entry Point**
Receives EventBridge events and provides the infrastructure layer for event processing:

**Responsibilities:**

- Receives raw EventBridge events (AWS Lambda handler signature)
- Validates event structure using Zod schemas (`orgEventSchemas`)
- Logs event receipt with full context (detail-type, detail, id, source)
- Delegates to router for event-specific processing
- Throws errors for invalid event payloads

**Type Safety:** Uses discriminated unions for compile-time type checking of event types.

### `router.ts`

**Event Type Router**
Routes validated org events to their specific processor based on event type:

**Responsibilities:**

- Switch-based routing on `event.type` discriminator
- Maintains registry of event type → processor mappings
- Logs warnings for unhandled event types (fail-safe)
- No business logic—pure routing layer

**Current Routes:**

- `EventType.ExternalObligationsUpdated` → `processors/external-obligations-updated`

**Pattern:** Each event type has a dedicated processor in the `processors/` directory.

## Event Flow

1. **EventBridge** publishes org event (e.g., from S3 upload, API action, scheduled job)
2. **handler.ts** receives event, validates schema
3. **router.ts** routes to appropriate processor
4. **Processor** executes domain logic (see individual processor READMEs)
5. **Completion** logs and returns (success or throws)

## Adding New Processors

To add a new org event type:

1. Define event schema in `packages/events/src/types/org-events.ts`
2. Add event type to `EventType` enum
3. Create processor in `processors/<event-name>/`
4. Add route in `router.ts` switch statement
5. Export processor from `processors/<event-name>/index.ts`

## Error Handling

- **Validation Errors:** Logged and thrown immediately (bad event structure)
- **Processor Errors:** Propagated to Lambda runtime (triggers retry via EventBridge)
- **Unhandled Events:** Logged as warning, no error thrown (graceful degradation)
