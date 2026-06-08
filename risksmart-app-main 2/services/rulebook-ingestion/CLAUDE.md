# services/rulebook-ingestion

Step Functions state machine for batch ingesting external rulesets (Ascent API) into RiskSmart. Split into multiple Lambda steps to avoid timeout issues.

## Architecture

- `adaptors/ascent/` - Ascent API client, prefetch storage, and data transformations
- `adaptors/database/` - DynamoDB queries (per-regulator access patterns)
- `adaptors/s3-adaptor.ts` - Task storage + per-regulator change export + manifest
- `adaptors/event-bridge-adaptor.ts` - Event publishing
- `domain/services/ascent/` - Ascent-specific ingestion services
- `domain/services/rule-change-detection-service.ts` - Per-regulator change detection
- `domain/types/` - Domain models organized by concern (ingestion-run, obligation, change-detection, etc.)
- `use-cases/` - High-level workflow orchestration per step
- `handlers/` - Lambda handlers (Step Functions tasks) with dependency wiring

## State Machine Flow

**6-Step Pipeline**: `initialise → prefetch → ingest → ingest-obligation-changes → detect-changes → conclude`

1. **Initialise Ingestion** - Create run, fetch regulators list
2. **Prefetch** - Bulk-fetch all tasks and obligation changes, store in S3 by regulator (Ascent-specific)
3. **Ingest Regulators** - Sequential per-regulator ingestion (Map state, maxConcurrency: 1)
4. **Ingest Obligation Changes** - Sequential per-regulator obligation change ingestion from S3 (Map state, maxConcurrency: 1)
5. **Detect Changes** - Sequential per-regulator change detection (Map state, maxConcurrency: 1)
6. **Conclude Ingestion** - Compose manifest, emit EventBridge event, mark run complete

**Why sequential?**

- Ingestion: Respects Ascent API rate limits (200 req/min)
- Change detection: Avoids race conditions when updating ingestion run

## Clean Architecture

**IMPORTANT**: This service follows clean architecture principles. The domain layer must not depend on infrastructure concerns.

### Layer Boundaries

- **Domain layer** (`domain/types/`, `domain/services/`) - Core business logic, should have ZERO infrastructure dependencies
- **Use cases** (`use-cases/`) - Application orchestration, depends on domain interfaces (not implementations)
- **Adaptors** (`adaptors/`) - Infrastructure implementations (S3, DynamoDB, API clients)
- **Handlers** (`handlers/`) - Composition root, wires up dependencies

### Naming Rules

**Bad**: Domain layer references infrastructure

```typescript
// DON'T: Domain service mentioning S3
export interface Dependencies {
  saveToS3: (data: Task[]) => Promise<void>;
}
```

**Good**: Domain layer uses abstract names

```typescript
// DO: Generic persistence interface
export interface Dependencies {
  persistTasksByRegulator: (tasks: Map<RegulatorId, Task[]>) => Promise<void>;
}

// Infrastructure layer provides implementation
const prefetchStorageAdaptor = {
  persistTasksByRegulator: async (tasks) => {
    // S3 implementation details here
  },
};
```

### Dependency Direction

```text
handlers/ → use-cases/ → domain/services/ → domain/types/
   ↓            ↓              ↓
adaptors/ ←──────────────────────────── NO DEPENDENCIES
```

Domain should define interfaces; adaptors implement them.

## Key Patterns

- **Phase-based state tracking**: Discriminated union phases (`initialised`, `prefetching`, `prefetch_complete`, `ingesting`, `change_detection`, `completed`, `failed`) replace simple status enum
- **Regulator-centric processing**: Group by regulator → process sequentially
- **S3 intermediate storage**: Prefetched tasks stored at `tasks/{runId}/{regulatorId}.json` with 24h TTL
- **Per-regulator progress**: `IngestionRun.regulatorProgress[]` tracks metrics per regulator
- **Efficient DynamoDB queries**: `REGULATOR#{id}#OBLIGATION#{id}` sort key enables `begins_with` queries
- **Step Functions result aggregation**: Map states collect `ManifestRegulatorEntry[]` for final composition
- **Dependency injection**: Use cases receive services via factory functions
- Lambdas fetch Ascent API credentials from SSM at startup
