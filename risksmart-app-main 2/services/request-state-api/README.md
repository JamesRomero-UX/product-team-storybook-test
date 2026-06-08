# Request State API Service

A comprehensive service for managing asynchronous request state tracking in the RiskSmart application. This service handles the complete lifecycle of async requests through EventBridge events, DynamoDB state management, and HTTP API endpoints for state retrieval.

## Overview

The Request State API provides:

- **Event Processing**: Handles EventBridge events for async request initiation and updates
- **State Management**: Maintains request state using event sourcing patterns with DynamoDB
- **HTTP API**: RESTful endpoint for retrieving request status by correlation ID
- **Stream Processing**: DynamoDB stream handler for real-time event propagation
- **Multi-tenant Support**: Tenant-specific data isolation and access control

## Documentation

- **[Async Request Tracking Guide](docs/async-request-tracking.md)** - Comprehensive guide to the end-to-end async request tracking flow from TRPC through data layer to request state API
- **[Adding Event Types](docs/async-request-tracking.md#adding-support-for-new-event-types)** - How to register new event types for tracking

## Service Architecture

### Core Components

#### 1. **Event Handlers** (`src/handlers/events/`)

- **`request-handler.ts`**: Main EventBridge event router that dispatches to specific processors
- **`initiate-async-request.processor.ts`**: Processes `INITIATE_ASYNC_REQUEST` events
- **`update-async-request.processor.ts`**: Processes `ACTION_UPDATE_CREATED` and `PERMISSIONS_UPDATED` events
- **`types.ts`**: Event processor types and configuration interfaces

**Supported Event Types:**

- `INITIATE_ASYNC_REQUEST` - Creates new async request tracking
- `ACTION_UPDATE_CREATED` - Updates request state for action updates
- `PERMISSIONS_UPDATED` - Updates request state for permission changes

#### 2. **HTTP API** (`src/handlers/http/`)

- **`request-state/get.ts`**: REST endpoint for retrieving request state by correlation ID
- **Path**: `GET /tenant/{tenant}/request/{correlationId}`
- **Domain**: `request-state.api.{stage}.risksmart.link` (non-local environments)
- **Authorization**: AWS IAM required

#### 3. **DynamoDB Stream Handler** (`src/handlers/dynamo/`)

- **`request-event-table-stream.ts`**: Processes DynamoDB table streams
- Converts DynamoDB records to EventBridge events for downstream processing
- Handles real-time propagation of state changes

#### 4. **Event Store** (`src/event-store/`)

- **Event Sourcing Pattern**: All state changes tracked as immutable events
- **Aggregator**: Computes current state from event history
- **Rules**: Business logic for processing different event types
- **Database Layer**: DynamoDB integration with proper faceting

#### 5. **State Management Types** (`src/event-store/aggregator/types.ts`)

```typescript
interface RequestState {
  correlationId: string;
  tenant: string;
  orgKey: string;
  userId: string;
  tasks: Record<string, RequestStateTask>;
  response?: string;
  error?: string;
}
```

### API Response Format

The HTTP GET endpoint returns computed status based on task states:

```json
{
  "correlationId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "PENDING" | "COMPLETE" | "FAILED",
  "response": "parsed JSON response (only when COMPLETE)",
  "error": "parsed JSON error (only when FAILED)"
}
```

**Status Computation Logic:**

- **COMPLETE**: All tasks have status `'COMPLETE'` - includes parsed `response` if available
- **FAILED**: Any task has status `'FAILED'` - includes parsed `error` if available
- **PENDING**: All other cases (tasks still pending, mixed states, no tasks)

### Environment Configuration

Required environment variables:

- `STAGE`: Deployment stage (e.g., 'dev', 'staging', 'prod')
- `APP_NAME`: Application name
- `TENANT_REQUEST_EVENT_TABLE_NAME`: Base table name for tenant-specific request events
- `AWS_REGION`: AWS region (defaults to eu-west-2)
- `IS_LOCAL`: Set to 'true' for local development
- `DYNAMODB_ENDPOINT`: Local DynamoDB endpoint (for local development)

**Table Naming Convention**: `{STAGE}-{APP_NAME}-{tenant}-{TENANT_REQUEST_EVENT_TABLE_NAME}`

## Development

### Prerequisites

```bash
# Install dependencies
pnpm install

# Ensure Docker is running for local DynamoDB
```

### Available Scripts

#### Testing

- **`pnpm test:unit`**: Execute unit tests
- **`pnpm test`**: Run tests in watch mode

#### Code Quality

- **`pnpm lint`**: Check code quality with ESLint
- **`pnpm lint:fix`**: Auto-fix linting issues
- **`pnpm tsc`**: TypeScript compilation check

#### Local Event Testing

- **`pnpm putEvent:initiateAsyncRequest`**: Send test event for async request initiation
- **`pnpm putEvent:actionUpdateCreated`**: Send test event for action update
- **`pnpm putEvent:permissionsUpdated`**: Send test event for permissions update

### Integration Points

This service integrates with:

- **`@risksmart-app/shared`**: Shared utilities, event types, and EventBridge helpers
- **EventBridge**: Receives events from `risksmart.app` source
- **DynamoDB**: Event store with tenant-specific tables
- **API Gateway**: REST API with custom domain and IAM auth
- **Sentry**: Error monitoring and alerting
- **AWS Lambda Powertools**: Structured logging, metrics, and tracing

### Development Workflow

1. **Local Setup**:

   ```bash
   # Start Docker services
   pnpm run api:v3  # Docker Compose with DynamoDB, Hasura, ElasticMQ, RustFS, etc.

   # Start local Lambda services (CDK synth + SAM + event routing)
   node scripts/dev.js
   ```

   `dev.js` handles CDK synth, SAM API Gateway + Lambda startup, EventBridge event routing, SQS polling, and tRPC container restart with discovered API URLs.

2. **dev.js Options**:

   ```bash
   node scripts/dev.js               # Full setup: CDK synth + SAM + event router + SQS poller
   node scripts/dev.js --skip-synth  # Skip CDK synth (use existing cdk.out/)
   node scripts/dev.js --no-watch    # Disable file watcher (used in CI)
   ```

3. **Monitoring**:
   - SAM Lambda logs are printed to the terminal
   - Event router logs prefixed with `[events]`
   - SQS poller logs prefixed with `[sqs-poller]`
   - Use Sentry for error tracking
   - Monitor DynamoDB for state changes

### Error Handling

- **400 Bad Request**: Invalid correlation ID format or missing parameters
- **404 Not Found**: Request state not found for correlation ID
- **500 Internal Server Error**: DynamoDB errors, event processing failures

All errors are logged with correlation IDs and sent to Sentry for monitoring.

## Deployment

The service is deployed using AWS CDK with two separate stacks for different resource scopes:

### 1. Request State API Stack (Non-tenant Resources)

Deploys shared infrastructure components via `RequestStateApiStack`:

```bash
cd cdk-stack

# Deploy to AWS environment
pnpm exec cdk deploy ${STAGE}-${APP_NAME}-RequestStateApiStack

# Local development uses SAM (via node scripts/dev.js) — no manual CDK deploy needed
```

**Deployed Resources:**

- **Lambda Functions**: Event handler (`request-handler.ts`) and HTTP API handler (`get.ts`)
- **API Gateway**: REST API with custom domain `request-state.api.{stage}.risksmart.link`
- **EventBridge Rules**: Route events from `risksmart.app` source to event handler
- **IAM Roles**: Execution roles with DynamoDB and EventBridge permissions
- **CloudWatch Log Groups**: Structured logging for all Lambda functions

### 2. Tenant Event Stack (Tenant-specific Resources)

Deploys tenant-specific resources via `TenantEventStack` in the tenant-deployer package:

```bash
cd packages/tenant-deployer

# Deploy tenant resources for development
node dev.js

# Deploy to specific environments
pnpm exec cdk deploy ${STAGE}-${APP_NAME}-${TENANT}-TenantEventStack
```

**Deployed Resources per Tenant:**

- **DynamoDB Table**: `{STAGE}-{APP_NAME}-{tenant}-RequestEventTable` with streams enabled
- **Lambda Function**: Stream handler (`request-event-table-stream.ts`) for real-time event propagation
- **Event Source Mapping**: Connects DynamoDB streams to Lambda function
- **IAM Roles**: Stream handler execution role with EventBridge and DynamoDB permissions

### Stack Dependencies

```
RequestStateApiStack (shared)
├── Event Handler Lambda
├── HTTP API Lambda
├── API Gateway + Custom Domain
└── EventBridge Rules

TenantEventStack (per tenant)
├── DynamoDB Table + Streams
├── Stream Handler Lambda
└── Event Source Mapping
```

### Environment-specific Deployment

```bash
# Development (local SAM)
node scripts/dev.js  # Handles CDK synth + SAM startup automatically

# Staging
cd cdk-stack && pnpm exec cdk deploy staging-risksmartApp-RequestStateApiStack
cd packages/tenant-deployer && pnpm exec cdk deploy staging-risksmartApp-{tenant}-TenantEventStack

# Production
cd cdk-stack && pnpm exec cdk deploy app-risksmartApp-RequestStateApiStack
cd packages/tenant-deployer && pnpm exec cdk deploy app-risksmartApp-{tenant}-TenantEventStack
```

### Infrastructure Components

**RequestStateApiStack (Shared Resources):**

- **Lambda Functions**: Event handlers, HTTP API handlers with VPC configuration for non-local environments
- **API Gateway**: REST API with IAM authorization and custom domain `request-state.api.{stage}.risksmart.link`
- **EventBridge Rules**: Route events from `risksmart.app` source to event handler
- **IAM Roles**: Least privilege access for Lambda functions with DynamoDB permissions
- **CloudWatch Log Groups**: 3-month retention for structured logging

**TenantEventStack (Per-tenant Resources):**

- **DynamoDB Tables**: Tenant-specific event stores with streams enabled (`NEW_AND_OLD_IMAGES`)
- **Stream Handler Lambda**: Real-time processing of DynamoDB stream events
- **Event Source Mappings**: Connect streams to Lambda with batch size 1 and retry configuration
- **IAM Roles**: Stream-specific execution roles with EventBridge publishing permissions

## Dependencies

All dependencies are managed through the pnpm workspace catalog system. Key dependencies include:

- **AWS SDK v3**: DynamoDB, EventBridge clients
- **Lambda Powertools**: Logging, metrics, tracing
- **Middy**: Lambda middleware framework
- **Zod**: Schema validation
- **Sentry**: Error monitoring
- **http-errors**: HTTP error handling
