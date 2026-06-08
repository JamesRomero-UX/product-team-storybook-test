# packages/events

Event type definitions and Zod schemas for the domain event system. Types and schemas only, no tests.

## Key Patterns

- **EventType enum**: ObjectCreated, ObjectUpdated, ObjectDeleted, PermissionsUpdated, and 20+ more.
- **Event categories**: System events (no tenant), tenant events, org-user events, org events.
- **Common metadata**: All events share `eventId`, `version`, `timestamp`, `domain`, `service`, `correlationId`, `causationId`, `userId`, `tenant`, `orgKey`.
- `systemEventSchema` validates system events have NO tenant/orgKey. Use this when handling system-level events.
