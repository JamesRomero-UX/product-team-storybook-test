# DynamoDB Access Patterns

## Table Structure

**Table Name**: `RulebookIngestion`

- **Partition Key (PK)**: STRING
- **Sort Key (SK)**: STRING

## Item Types

### Run Metadata (Dual Storage Pattern)

**Provider Index Item** (for querying all runs by provider):

```typescript
{
  pk: "RUN#{provider}",           // e.g., "RUN#ascent"
  sk: "RUN#{uuidv7}",               // e.g., "RUN#01JEZA9K3XQR7MTC8P6A9NF2VH"
  phaseType: string,              // "initialised", "prefetching", "prefetch_complete", "ingesting", "change_detection", "completed", "failed"
}
```

**ID Lookup Item** (for direct access by ID):

```typescript
{
  pk: "RUN#{uuidv7}",               // e.g., "RUN#01JEZA9K3XQR7MTC8P6A9NF2VH"
  sk: "RUN#{uuidv7}",               // Same as PK
  id: string,                     // uuidv7 (same as PK/SK suffix)
  providerName: string,           // "ascent"
  phase: {                        // Discriminated union with phase-specific metadata
    type: string,                 // "initialised" | "prefetching" | "prefetch_complete" | "ingesting" | "change_detection" | "completed" | "failed"
    enteredAt: string,            // ISO timestamp when phase entered
    // Phase-specific fields:
    totalTaskCount?: number,      // Only in "prefetch_complete"
    manifestLocation?: string,    // Only in "completed"
    errorMessage?: string,        // Only in "failed"
  },
  startedAtTimestamp: string,     // ISO timestamp
  completedAtTimestamp?: string,  // ISO timestamp (set when phase becomes "completed")
  previousRunId?: string,         // ID of previous successful run (for change detection)
  regulatorProgress: [{           // Per-regulator metrics
    regulatorId: string,
    regulatorName: string,
    batchesProcessed: number,
    recordsProcessed: number,
    standardsCreated: number,
    chaptersCreated: number,
    rulesCreated: number,
    tasksCreated: number,
    changes: {                    // Set during change detection
      obligations: { added: number, updated: number, removed: number },
      obligationChanges: { added: number, updated: number, removed: number },
    },
  }],
}
```

**Note**: Both items are created/updated atomically using `TransactWriteCommand`.

### Transformed Obligations

Obligation data in a risksmart compatible shape, partitioned by regulator for efficient queries:

```typescript
{
  pk: "RUN#{runId}",                                    // e.g., "RUN#01JEZA9K3XQR7MTC8P6A9NF2VH"
  sk: "REGULATOR#{regulatorId}#OBLIGATION#{externalId}", // e.g., "REGULATOR#reg-123#OBLIGATION#ascent-1234"
  externalId: string,                                   // Provider's ID (e.g., "ascent-1234") - primary identifier
  externalRegulatorId: string,                          // Regulator's external ID
  externalParentId: string | null,                      // Parent obligation's externalId
  contentHash: string,                                  // SHA-256 hash for change detection
  tags: string[],                                       // Provider-supplied tags (empty array for rules, populated for tasks)
  ...rest
}
```

**Note**: The `REGULATOR#{id}#OBLIGATION#{id}` sort key pattern enables efficient per-regulator queries using `begins_with(sk, 'REGULATOR#{regulatorId}#OBLIGATION#')`.

### Transformed Obligation Changes

Obligation change (task version) data partitioned by regulator, stored separately from obligations:

```typescript
{
  pk: "RUN#{runId}",                                                  // e.g., "RUN#01JEZA9K3XQR7MTC8P6A9NF2VH"
  sk: "REGULATOR#{regulatorId}#OBLIGATION_CHANGE#{externalId}",       // e.g., "REGULATOR#reg-123#OBLIGATION_CHANGE#tv-5678"
  externalId: string,                                                 // Provider's ID for this task version
  externalParentId: string,                                           // Parent task's externalId
  contentHash: string,                                                // SHA-256 hash for change detection
  description: {                                                      // Diff content for side-by-side comparison
    before: string,                                                   // Obligation text before this change (diff.previous)
    after: string,                                                    // Obligation text after this change (diff.this)
  },
  effectiveDate?: string,                                             // ISO date string (optional)
  rationale?: string,                                                 // Human-readable summary of the change (optional)
  sourceUrl?: string,                                                 // Link to source document (optional)
  regulatorId: string,                                                // Resolved from parent task's regulator
}
```

**Note**: The `REGULATOR#{id}#OBLIGATION_CHANGE#{id}` sort key pattern enables efficient per-regulator queries using `begins_with(sk, 'REGULATOR#{regulatorId}#OBLIGATION_CHANGE#')`.

## Access Patterns

### 1. Get Latest Successful Run for Provider

**Use Case**: Find previous run for change detection

```typescript
Query (Provider Index):
  KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)"
  FilterExpression: "#phaseType = :phaseType"
  ExpressionAttributeNames: { "#phaseType": "phaseType" }
  ExpressionAttributeValues: {
    ":pk": "RUN#ascent",
    ":sk": "RUN#",
    ":phaseType": "completed"
  }
  ScanIndexForward: false

Get (ID Lookup):
  Key: {
    pk: "RUN#{runId}",  // Extract from sk of query result
    sk: "RUN#{runId}"
  }

Returns: Full run metadata from ID lookup item
Cost: ~1-2 RCU (query + get)
```

### 2. Get All Runs for Provider

**Use Case**: Admin UI, analytics, audit trail

```typescript
Query:
  KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)"
  ExpressionAttributeValues: {
    ":pk": "RUN#ascent",
    ":sk": "RUN#"
  }
  ScanIndexForward: false  // Newest first

Returns: All run metadata for this provider
Cost: ~1 RCU per 4KB of data
```

### 3. Get Obligation Hashes for Regulator (Change Detection)

**Use Case**: Build per-regulator comparison map without fetching full obligation data

```typescript
Query:
  KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)"
  ProjectionExpression: "externalId, contentHash"
  ExpressionAttributeValues: {
    ":pk": "RUN#01JEZA9K3XQR7MTC8P6A9NF2VH",
    ":sk": "REGULATOR#reg-123#OBLIGATION#"
  }

Returns: Just IDs and hashes for this regulator (paginated)
Cost: ~0.5 RCU per 4KB (reduced by projection)

Usage:
  const hashMap = new Map(
    items.map(item => [item.externalId, item.contentHash])
  );
```

### 4. Get Obligation Change Hashes for Regulator (Change Detection)

**Use Case**: Build per-regulator comparison map for obligation changes without fetching full records

```typescript
Query:
  KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)"
  ProjectionExpression: "externalId, contentHash"
  ExpressionAttributeValues: {
    ":pk": "RUN#01JEZA9K3XQR7MTC8P6A9NF2VH",
    ":sk": "REGULATOR#reg-123#OBLIGATION_CHANGE#"
  }

Returns: Just IDs and hashes for this regulator's obligation changes (paginated)
Cost: ~0.5 RCU per 4KB (reduced by projection)
```

### 5. Get Full Obligations for Regulator by External IDs

**Use Case**: Fetch changed obligations for S3 export

```typescript
BatchGetItem (chunked, 100 per request):
  RequestItems: {
    [tableName]: {
      Keys: externalIds.map(id => ({
        pk: "RUN#01JEZA9K3XQR7MTC8P6A9NF2VH",
        sk: "REGULATOR#reg-123#OBLIGATION#{id}"
      }))
    }
  }

Returns: Full obligation records for export
Cost: ~1 RCU per 4KB per item
```

### 6. Update Run Phase (Upsert)

**Use Case**: Transition run phase (e.g., ingesting → change_detection → completed)

```typescript
TransactWriteCommand (atomic dual write):
  TransactItems: [
    {
      Put: {
        Item: {
          pk: "RUN#ascent",
          sk: "RUN#01JEZA9K3XQR7MTC8P6A9NF2VH",
          phaseType: "completed"
        }
      }
    },
    {
      Put: {
        Item: {
          pk: "RUN#01JEZA9K3XQR7MTC8P6A9NF2VH",
          sk: "RUN#01JEZA9K3XQR7MTC8P6A9NF2VH",
          id: "01JEZA9K3XQR7MTC8P6A9NF2VH",
          providerName: "ascent",
          phase: {
            type: "completed",
            enteredAt: "2025-01-15T10:30:00.000Z",
            manifestLocation: "s3://bucket/runId/manifest.json"
          },
          ...fullMetadata
        }
      }
    }
  ]

Cost: 2 WCU (one per item)
Note: Both items updated atomically to maintain consistency
```

## Design Decisions

### Why Dual Storage Pattern for Ingestion Runs?

Each ingestion run is stored **twice** (atomically via `TransactWriteCommand`):

1. **Provider Index Item** (`PK: RUN#{provider}, SK: RUN#{uuidv7}`):
   - Enables efficient queries for all runs by provider
   - Supports chronological ordering with `ScanIndexForward: false`
   - Contains minimal data (status only) to reduce storage/query costs

2. **ID Lookup Item** (`PK: RUN#{uuidv7}, SK: RUN#{uuidv7}`):
   - Enables O(1) direct access by run ID
   - Contains full metadata (timestamps, counts, error messages)
   - Used after finding latest run from provider index

**Trade-off**: 2x storage cost for ingestion run metadata (negligible) vs. requiring a GSI or scan for ID lookups

### Why Two PK Patterns for Data?

**Metadata**: `RUN#{provider}` enables querying all runs for a provider without scanning entire table

**Data**: `RUN#{runId}` isolates obligations by specific run for efficient retrieval

### Why uuidv7 for Sort Keys?

- **Lexicographically sortable** - newer runs naturally sort after older ones
- **Guaranteed unique** - no collision risk (includes random component)
- **No clock sync required** - timestamp is for ordering, not uniqueness
- **Simpler updates** - ID serves as both identifier and sort key

### Why Per-Regulator Sort Key Pattern?

The `REGULATOR#{id}#OBLIGATION#{id}` sort key pattern enables:

- **Efficient per-regulator queries** - `begins_with(sk, 'REGULATOR#{regulatorId}#OBLIGATION#')` returns only obligations for that regulator
- **Parallel change detection** - Each regulator can be processed independently
- **Reduced scan costs** - No need to filter obligations post-query
