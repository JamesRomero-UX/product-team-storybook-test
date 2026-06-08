# services/permissions

EventBridge-driven Lambda that syncs permission changes between RiskSmart and Permit.io.

## Commands

```bash
# Events are routed automatically via the local event router (scripts/local-event-router/)
# Manual permission sync can be triggered via:
bash packages/permitio/sync-permit.sh    # Invoke tenant-sync-poller via SAM
```

## Architecture

- `handlers/event-router.ts` - Routes ObjectCreated/Updated/Deleted events (exhaustive switch)
- `handlers/insert/update/delete-permissions/` - Handler factories per event type
- `handlers/sync/` - Full Permit sync engine (resources, users, groups, relationships, ownership)
- `adaptors/permit/` - Permit.io API client and transformations
- `adaptors/database/` - DynamoDB and Data Layer API client
- `utils/` - AWS SigV4 request signing, batching utilities

## Key Patterns

- **Event router**: Exhaustive switch on `EventType` with factory pattern. When adding new event types, add a case here.
- **Mono-Lambda handler**: Custom wrapper combining Middy + Lambda Powertools + Sentry.
- **AWS SigV4 signing**: Data Layer API requests signed with SigV4 in production (disabled locally via `IS_LOCAL`).

## Gotchas

- Pagination required for data layer sync (10k+ item sets).
- SSM parameter clients lazily initialized on first use.
- **Root object types**: The sync creates root resource instances for each type in `rootObjectTypes` (`packages/permitio/src/types.ts`). If a resource type is referenced by a role (in `roles.tf`) but missing from `rootObjectTypes`, the sync will delete and recreate its root instance and role assignments every run. Any new root-level resource type must be added to that array.
- **Resource instance deletion filter**: The sync's resource instance deletion filter (`permit-resource-instance-sync.ts`) must exclude all non-`rs_node` instance types (`user_group`, `owner_group`, `contributor_group`) to avoid incorrectly deleting group instances that are managed by the user group sync.
