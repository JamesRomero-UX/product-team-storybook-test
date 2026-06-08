# Events package

Source of truth for domain event types, Zod schemas, and async request command types.

## Event scopes

Events are scoped by the context in which they are emitted. Each scope has a corresponding metadata schema that enforces which fields are required.

| Scope   | tenant   | orgKey   | userId        | Notes |
| ------- | -------- | -------- | ------------- | ----- |
| System  | never    | never    | `'SYSTEM'`    | Regional/infrastructure-level events, no tenant context |
| Org     | required | required | `'SYSTEM'`    | Org-level system events (e.g. rulebook ingestion) |
| Tenant  | required | never    | system actor  | Tenant-level events; userId is `'SYSTEM'`, `'SCIM'`, or `'AUTH0'` |
| OrgUser | required | required | real user ID  | Narrowest scope; a specific user acting within an org |

### System events (`system-events.ts`)

No tenant or org context. Emitted by services running at a regional level (e.g. rulebook ingestion). Consumed and hydrated with tenant information by the event-propagation service.

### Org events (`org-events.ts`)

Have tenant and org context but are triggered by the system, not a user. Current events:
- `ExternalObligationsUpdated` — rulebook obligations synced for an org

### Tenant events (`tenant-events.ts`)

Have tenant context but no org or user context. Triggered by system actors (SCIM, Auth0). Current events:
- `UserCreated` / `UserCreationFailed`
- `UserDeleted` / `UserDeletionFailed`
- `TenantPermissionsUpdated` / `TenantPermissionsUpdateFailed` — emitted by the permissions service after syncing a user to Permit.io

### OrgUser events (`orguser-events.ts`)

Require all of tenant, org, and user context. Emitted when objects are mutated within the RiskSmart system. Current events:

**Object events** (any entity with a corresponding node — risk, control, action, etc.):
- `ObjectCreated` / `ObjectCreationFailed`
- `ObjectUpdated` / `ObjectUpdateFailed`
- `ObjectDeleted` / `ObjectDeletionFailed`

**Linked item events** (relationships between nodes):
- `LinkedItemCreated` / `LinkedItemCreationFailed`
- `LinkedItemDeleted` / `LinkedItemDeletionFailed`

**Form events:**
- `FormConfigured` / `FormConfigurationFailed`

**Permissions events** (emitted by the permissions service after syncing to Permit.io):
- `OrgUserPermissionsUpdated` / `OrgUserPermissionsUpdateFailed` — data is either object data `{ objectType, objectId }` or linked-item data `{ linkedItemId, relationshipType, sourceId, targetId }`

## Other types

### `command-types.ts`

Wrappers for async request tracking:
- `InitiateAsyncRequest<TRequest>` — emitted to start tracking an async operation
- `UpdateAsyncRequest<TRequest, TMetadata>` — emitted to update the state of a tracked operation

### `request-types.ts`

Request DTO types used as the payload of `InitiateAsyncRequest` commands.

## Conventions

- Scoped event schemas (`orgUserEventSchema`, `tenantEventSchema`, etc.) act as base schemas; specific events extend them with a literal `type` and concrete `data` schema.
- All event metadata extends `baseEventMetadataSchema` (`eventId`, `version`, `timestamp`, `domain`, `service`, `correlationId`, optional `causationId`).
