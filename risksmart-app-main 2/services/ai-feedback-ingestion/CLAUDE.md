# services/ai-feedback-ingestion

HTTP API Lambda for ingesting AI assistant feedback. Routes to LangSmith (observability) and Kinesis Firehose (storage).

## Architecture

- `adapters/langsmith/` - LangSmith observability client
- `adapters/firehose/` - Kinesis Firehose storage adapter
- `domain/services/` - AI Assistant and Workflow feedback services
- `handlers/ingest-ai-feedback/` - API Gateway V2 handler entry point
- `lib.ts` - Lazy dependency initialization (cached in module scope)

## Key Patterns

- **Dual publisher**: Fires to both storage and observability in parallel via `Promise.allSettled`.
- Factory pattern: `createAIAssistantFeedbackService()` with injected dependencies.
- **Feedback scoring**: `thumbs_up` maps to score 1, `thumbs_down` maps to score 0.
- Tenant/user IDs extracted from request headers.
- Direct Sentry wrapping without Middy (single endpoint, simpler setup).
