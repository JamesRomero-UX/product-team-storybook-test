# Architecture

## Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CLIENT REQUEST                                                              │
│  POST /feedback                                                              │
│  {                                                                           │
│    "workstream": "ai-assistant" | "workflow",                               │
│    "feedback": { ... }                                                       │
│  }                                                                           │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  HANDLER (handlers/ingest-ai-feedback/index.ts)                              │
│                                                                              │
│  1. Extract tenantId & userId from JWT claims (org_id, sub)                 │
│  2. Parse JSON body                                                          │
│  3. Validate with Zod discriminated union schema                            │
│  4. Call useCase.execute(tenantId, userId, request)                         │
│  5. Return { success: true, feedbackId }                                    │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  USE CASE (use-cases/ingest-ai-feedback.ts)                                  │
│                                                                              │
│  Routes to appropriate domain service based on workstream:                  │
│                                                                              │
│  switch (request.workstream) {                                              │
│    case 'ai-assistant': return aiAssistantService.ingest(...)              │
│    case 'workflow': return workflowService.ingest(...)                     │
│  }                                                                           │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  DOMAIN SERVICE (domain/services/ingest-*-feedback-service.ts)              │
│                                                                              │
│  1. Validate workstream-specific required fields                            │
│  2. Generate UUIDv7 for feedback ID                                         │
│  3. Build typed feedback object with values bucket                          │
│  4. Call adapters in parallel:                                               │
│     - feedbackStream.publish(tenantId, feedback)                            │
│     - langsmith.submitFeedback({ runId, score, comment })                   │
│  5. Return feedback record                                                   │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────────────────────┐
│  FIREHOSE ADAPTER            │ │  LANGSMITH ADAPTER                          │
│                              │ │                                             │
│  • Stream: ai-feedback-{tid} │ │  • Score: thumbs_up=1, thumbs_down=0       │
│  • Serialize values to JSON  │ │  • Links feedback to LangSmith run         │
│  • PutRecord to Firehose     │ │                                             │
└──────────────┬───────────────┘ └─────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AWS FIREHOSE → S3                                                           │
│                                                                              │
│  • Buffers records (1 min or 5MB threshold)                                 │
│  • Converts JSON → Parquet via Glue schema                                  │
│  • Dynamic partitioning by workstream                                        │
│  • Writes to: s3://{bucket}/ai-feedback/workstream={ws}/year=.../           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── handlers/
│   └── ingest-ai-feedback/
│       └── index.ts              # Lambda entry point
├── use-cases/
│   └── ingest-ai-feedback.ts     # Routing logic
├── domain/
│   ├── types.ts                  # Zod schemas & TypeScript types
│   └── services/
│       ├── ingest-ai-assistant-feedback-service.ts
│       └── ingest-workflow-feedback-service.ts
└── adapters/
    ├── firehose/
    │   └── feedback-stream.ts    # AWS Firehose client
    └── langsmith/
        └── langsmith-client.ts   # LangSmith SDK wrapper
```

## Type System

The service uses a **discriminated union** pattern for type-safe routing:

```typescript
// Request is discriminated by 'workstream'
const ingestFeedbackRequestSchema = z.discriminatedUnion('workstream', [
  z.object({
    workstream: z.literal('ai-assistant'),
    feedback: aiAssistantInputSchema,
  }),
  z.object({
    workstream: z.literal('workflow'),
    feedback: workflowInputSchema,
  }),
]);

// TypeScript narrows the type automatically in switch statements
switch (request.workstream) {
  case 'ai-assistant':
    // request.feedback is AIAssistantFeedbackInput
    break;
  case 'workflow':
    // request.feedback is WorkflowFeedbackInput
    break;
}
```

## Values Bucket Pattern

Workflow-specific data is stored in a `values` JSON object rather than flat fields:

**Benefits:**

- Common Glue schema across all workstreams
- Adding fields doesn't require schema migration
- Query with `JSON_EXTRACT_SCALAR(values, '$.fieldName')`
- Matches LangSmith's metadata pattern

**Trade-offs:**

- Slightly more complex queries
- No column-level type enforcement in Parquet for values

## Dual-Write Strategy

Feedback is written to both destinations in parallel:

```typescript
await Promise.all([
  deps.feedbackStream.publish(tenantId, feedback),
  deps.langsmith.submitFeedback({ runId, score, comment }),
]);
```

**Why both?**

- **Firehose/S3**: Long-term storage, BI queries, cross-tenant analytics
- **LangSmith**: LLM observability, prompt engineering, model evaluation

If one fails, the entire operation fails. Consider implementing:

- Retry logic with exponential backoff
- Dead letter queue for failed writes
- Eventual consistency via SQS if strict consistency isn't required
