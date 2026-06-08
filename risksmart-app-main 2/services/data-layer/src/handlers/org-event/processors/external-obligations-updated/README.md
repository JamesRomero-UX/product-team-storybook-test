# External Obligations Updated Processor

This processor handles the `ExternalObligationsUpdated` event, which syncs regulatory obligations and obligation changes from external providers (e.g., S3 storage) into the RiskSmart database.

## Architecture Overview

```text
orchestrator.ts                        → Event handler (infrastructure layer)
    ↓
sync-external-obligations.ts           → Obligation sync logic (application layer)
sync-external-obligation-changes.ts    → Obligation change sync logic (application layer)
    ↓
obligation-repository.ts               → Obligation data access (adapter layer)
obligation-change-repository.ts        → Obligation change data access (adapter layer)
```

## Key Files

### `orchestrator.ts`

**Purpose:** Thin orchestration layer that wires dependencies and coordinates the sync flow.

**Responsibilities:**

- Extract event metadata (`orgKey`, `location`)
- Create consistent `externalSyncedAt` timestamp for the entire sync operation
- Process each regulator's changeset sequentially
- For each regulator: process obligation updates, then additions, then obligation change updates, then additions
- Log sync start/completion with counts

**Does NOT contain:** Business logic, data transformation, or database operations

### `sync-external-obligations.ts`

**Purpose:** Core business logic for syncing external obligations.

**Exports:**

- `createSyncExternalObligations(dependencies)` - Factory function that returns:
  - `processUpdates()` - Update existing obligations
  - `processAdditions()` - Add new obligations with hierarchy linking

**Key Behaviors:**

- **processUpdates:**
  - Looks up existing obligations by their `externalId`
  - Throws error if obligation doesn't exist
  - Hydrates with org context and system user
  - Passes to repository for upsert

- **processAdditions:**
  - Saves in hierarchical order: standards -> chapters -> rules -> tasks
  - Builds parent ID map for linking children to parents
  - Supports mixed scenarios (new hierarchy + linking to existing parents)
  - Validates standards with Zod schema
  - Uses `asChapter()`, `asRule()`, and `asTask()` helper functions for type safety

**Hydration:** Adds required fields to ingested obligations:

- `orgKey` - Organization identifier
- `createdByUser: 'SYSTEM'` - System-generated obligations
- `modifiedByUser: 'SYSTEM'`
- `adherence: 'advised'` - Default for external obligations
- `externalSyncedAt` - Timestamp of sync operation

### `sync-external-obligation-changes.ts`

**Purpose:** Business logic for syncing obligation changes (diffs between regulatory revisions).

**Exports:**

- `createSyncExternalObligationChanges(dependencies)` - Factory function that returns:
  - `processChanges()` - Resolve parent obligations and save obligation changes

**Key Behaviors:**

- Collects unique `externalParentId` values from all changes
- Looks up parent obligations by external ID, scoped to the regulatory source
- Skips changes whose parent obligation is not found (logs a warning)
- Hydrates each change with the resolved `obligationId`, org context, and system user

**Hydration:** Maps ingested fields to domain model:

- `description.before` / `description.after` -> `descriptionBefore` / `descriptionAfter`
- `rationale`, `effectiveDate`, `sourceUrl`, `contentHash` - passed through
- `orgKey`, `createdByUser: 'SYSTEM'`, `modifiedByUser: 'SYSTEM'` - added

### `types.ts`

**Type Definitions:**

```typescript
NewIngestedObligation
  - NewObligation minus org context fields
  - Requires: externalId, regulatorySourceId, contentHash

NewIngestedObligationChange
  - externalId, externalParentId, description { before, after }
  - contentHash, regulatorySourceId
  - Optional: rationale, effectiveDate, sourceUrl

ObligationChangeset
  - obligations: { added, updated }
  - obligationChanges: { added, updated }

ParentIdMap
  - Map<externalId, { obligationId, parentId }>
  - Used to link children to parent obligations
```

### `index.ts`

**Purpose:** Dependency injection container. Wires together:

- Obligation repository and adaptor
- Obligation change repository and adaptor
- Regulatory source repository and adaptor
- Application logic (sync obligations + sync obligation changes)
- Orchestrator
- S3 obligation provider

## Data Flow

```text
1. Event received -> orchestrator
   |
2. Fetch changeset from S3 (manifest + per-regulator files)
   |
3. Ensure regulatory sources exist (upsert)
   |
4. For each regulator changeset:
   |
   4a. Process obligation updates
       - Query existing obligations by externalId
       - Hydrate with org context
       - Upsert to database (only if contentHash changed)
   |
   4b. Process obligation additions
       - Save in hierarchical order: standards -> chapters -> rules -> tasks
       - Build parent ID map for linking children to parents
   |
   4c. Process obligation change updates
       - Resolve parent obligation by externalParentId + regulatorySourceId
       - Upsert to database (only if contentHash changed)
   |
   4d. Process obligation change additions
       - Resolve parent obligation by externalParentId + regulatorySourceId
       - Upsert to database (only if contentHash changed)
   |
5. Log completion with counts
```

## Idempotency & Change Detection

The processor is **fully idempotent** through content hash-based upsert:

### Obligations

- **Database Constraint:** Unique constraint on `(OrgKey, RegulatorySourceId, ExternalId)`
- **Conflict Resolution:** `ON CONFLICT DO UPDATE`
- **Conditional Update:** `WHERE obligation.ContentHash != EXCLUDED.ContentHash`

### Obligation Changes

- **Database Constraint:** Unique constraint on `(OrgKey, ExternalId, ObligationId)`
- **Conflict Resolution:** `ON CONFLICT DO UPDATE`
- **Conditional Update:** `WHERE obligation_change.ContentHash IS DISTINCT FROM EXCLUDED.ContentHash`

**Result:**

- New records are inserted
- Changed records are updated (when hash differs)
- Unchanged records are **skipped** (no database write)
- Safe to replay events without side effects

## Performance Optimizations

1. **Batch Processing:** Repositories batch upserts in groups of 100 to avoid call stack limits
2. **Single Parent Query:** Collects all parent IDs upfront, queries once (not per-record)
3. **Set-based Deduplication:** Uses `Set` to deduplicate parent IDs efficiently
4. **Progressive Parent Map:** Adds newly saved obligations to map for immediate linking

## Error Handling

**Hard Failures (throws):**

- Attempting to update non-existent obligation
- Chapter references non-existent parent standard
- Rule references non-existent parent chapter
- Task references non-existent parent rule
- Database errors during upsert

**Soft Failures (skipped with warning):**

- Obligation change references a parent obligation that doesn't exist

**Logging:**

- Event processing start (with full event)
- Event processing completion (with counts)
- Unknown obligation types (warning)
- Orphaned obligations (error before throw)
- Missing parent for obligation change (warning, skipped)

## Database Schema Changes

The `obligation_change` table uses the following columns for external ingestion:

- `DescriptionBefore` - Text of the obligation before the change
- `DescriptionAfter` - Text of the obligation after the change
- `Rationale` - Reason for the regulatory change
- `ContentHash` - Hash for idempotent upsert / change detection
- `SourceUrl` - Link to the source of the change
- `ExternalId` - Identifier from the external provider
- `ObligationId` - FK to the parent obligation (resolved from `externalParentId`)

An audit trigger (`obligation_change_modified`) logs all inserts, updates, and deletes to `obligation_change_audit`.

## Future Considerations

- `adherence` field will become optional (currently defaults to 'advised')
- Notification system integration point exists in orchestrator
- Consider adding metrics/telemetry for sync operations
- Obligation change removals are not yet implemented
