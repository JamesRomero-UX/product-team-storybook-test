# AI Feedback Ingestion Service

Collects user feedback on AI-generated content and stores it for analytics while syncing to LangSmith for LLM observability.

## Overview

This service provides a unified API for ingesting feedback across different AI workstreams:

- **AI Assistant** - Chat/conversation feedback (thumbs up/down on responses)
- **Controls** - Feedback on AI-generated control assessments

Feedback is dual-written to:

1. **AWS Firehose → S3** (Parquet) - For analytics/BI via Athena
2. **LangSmith** - For LLM observability and model improvement

## API

### Endpoint

```
POST /feedback
Authorization: Bearer <jwt>
Content-Type: application/json
```

### Request Body

The API uses a discriminated union based on `workstream`:

#### AI Assistant Feedback

```json
{
  "workstream": "ai-assistant",
  "feedback": {
    "sessionId": "session-uuid",
    "responseId": "response-uuid",
    "langsmithRunId": "langsmith-run-uuid",
    "feedbackType": "thumbs_up",
    "comment": "Optional comment",
    "userQuery": "Optional: the user's question",
    "aiResponse": "Optional: the AI's response"
  }
}
```

#### Controls Feedback

```json
{
  "workstream": "controls",
  "feedback": {
    "controlId": "control-uuid",
    "testResultId": "optional-test-result-uuid",
    "langsmithRunId": "langsmith-run-uuid",
    "feedbackType": "thumbs_down",
    "comment": "Optional comment"
  }
}
```

### Response

```json
{
  "success": true,
  "feedbackId": "01234567-89ab-cdef-0123-456789abcdef"
}
```

## Architecture

```
Handler → Use Case → Domain Service → Adapters (Firehose, LangSmith)
```

See [docs/architecture.md](docs/architecture.md) for detailed flow diagrams.

## Data Model

All feedback records share common fields with workflow-specific data in a `values` JSON object:

| Field            | Type     | Description                  |
| ---------------- | -------- | ---------------------------- |
| `id`             | UUID v7  | Unique feedback ID           |
| `tenantId`       | string   | Org ID from JWT              |
| `userId`         | string   | User ID from JWT             |
| `workstream`     | string   | `ai-assistant` or `controls` |
| `langsmithRunId` | string   | Links to LangSmith trace     |
| `feedbackType`   | enum     | `thumbs_up` or `thumbs_down` |
| `comment`        | string?  | Optional user comment        |
| `timestamp`      | ISO 8601 | When feedback was submitted  |
| `values`         | JSON     | Workflow-specific data       |

### Values by Workstream

**AI Assistant:**

```json
{
  "sessionId": "...",
  "responseId": "...",
  "userQuery": "...",
  "aiResponse": "..."
}
```

**Controls:**

```json
{ "controlId": "...", "testResultId": "..." }
```

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm run test:unit

# Type check
pnpm exec tsc --noEmit

# Lint
pnpm run lint
```

## Environment Variables

| Variable             | Required | Description               |
| -------------------- | -------- | ------------------------- |
| `LANGSMITH_API_KEY`  | Yes      | LangSmith API key         |
| `LANGSMITH_ENDPOINT` | No       | Custom LangSmith endpoint |

## Infrastructure

- **Lambda**: Handler deployed via SST
- **Firehose**: Per-tenant delivery streams (created by tenant-deployer CDK)
- **S3**: Per-tenant buckets with Parquet files
- **Glue**: Schema for Athena queries (created by Tofu/Terraform)

See [docs/infrastructure.md](docs/infrastructure.md) for CDK/Terraform details.

## Adding a New Workstream

1. Add input schema and values schema to `src/domain/types.ts`
2. Add feedback interface (e.g., `NewWorkstreamFeedback`)
3. Create domain service in `src/domain/services/`
4. Add to discriminated union in `types.ts`
5. Add routing case in `src/use-cases/ingest-ai-feedback.ts`
6. Initialize service in handler and pass to use case
7. Add tests

See [docs/adding-workstreams.md](docs/adding-workstreams.md) for a detailed guide.
