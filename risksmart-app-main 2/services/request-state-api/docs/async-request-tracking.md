# Async Request Tracking with TRPC and Request State API

## Overview

This document explains how async operations are tracked end-to-end from TRPC mutations through the data layer to the request state API, and how frontends poll for completion status.

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  1. User Action (e.g., Create Form Field)                        │  │
│  │     ↓                                                             │  │
│  │  2. TRPC Mutation (useMutation)                                  │  │
│  │     ↓                                                             │  │
│  │  3. Poll Request State API                                       │  │
│  │     ↓                                                             │  │
│  │  4. Show Progress/Complete/Error                                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────────────┘
                       │ HTTP/HTTPS
                       ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        TRPC Service Layer                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  1. Receive mutation request                                     │  │
│  │     ↓                                                             │  │
│  │  2. executeAsyncRequest wrapper                                  │  │
│  │     ├─ Generate correlationId                                    │  │
│  │     ├─ Emit InitiateAsyncRequest event                          │  │
│  │     ├─ Call Data Layer API                                       │  │
│  │     └─ Return correlationId                                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────────────┘
                       │ EventBridge
                       ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                     Request State API                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Receive: InitiateAsyncRequest                                   │  │
│  │     ↓                                                             │  │
│  │  Process: initiate-async-request.processor                       │  │
│  │     └─ Create DynamoDB record (status: PENDING)                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                       │ HTTP (from TRPC)
                       ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                       Data Layer API                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  1. Receive HTTP request                                         │  │
│  │     ↓                                                             │  │
│  │  2. Validation middleware (Zod)                                  │  │
│  │     ↓                                                             │  │
│  │  3. Permissions middleware (Permit)                              │  │
│  │     ↓                                                             │  │
│  │  4. Execute processor (business logic)                           │  │
│  │     ↓                                                             │  │
│  │  5. Event middleware (emit events)                               │  │
│  │     ├─ Success: ObjectCreated/FormConfigured                     │  │
│  │     └─ Failure: ObjectCreationFailed/FormConfigurationFailed     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────────────┘
                       │ EventBridge
                       ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                     Request State API                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Receive: ObjectCreated/FormConfigured (or *Failed)              │  │
│  │     ↓                                                             │  │
│  │  Process: update-async-request.processor                         │  │
│  │     └─ Update DynamoDB record (status: COMPLETE/FAILED)          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────────────────┘
                       │ HTTP Polling (from Frontend)
                       ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  GET /request/{correlationId}                                    │  │
│  │     ↓                                                             │  │
│  │  Response: { status: "COMPLETE", response: {...} }               │  │
│  │     ↓                                                             │  │
│  │  Update UI (show success/error)                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### 1. TRPC Service Layer

**File**: `packages/trpc/src/services/frontend/{domain}.service.ts`

**Responsibility**: Coordinate async operations and initiate tracking

**Key Function**: `executeAsyncRequest`

**CRITICAL**: `buildRequestBody` must send **ALL fields** from the RequestTypes interface, not a subset. The request state API validates the complete request payload for tracking and auditing purposes.

```typescript
async createFormField(
  ctx: ServiceContext,
  input: CreateFormFieldRequest
): Promise<CreateFormFieldResponse> {
  return executeAsyncRequest(ctx, input, {
    requestType: 'CREATE_FORM_FIELD',
    // IMPORTANT: Send ALL fields, not just a subset!
    buildRequestBody: (input) => ({
      IsCustomField: input.IsCustomField,
      ParentType: input.ParentType,
      Label: input.Label,
      AltLabel: input.AltLabel,
      Description: input.Description ?? null,
      Type: input.Type,
      Options: input.Options,
      Required: input.Required,
      Hidden: input.Hidden,
      ReadOnly: input.ReadOnly,
      DefaultValue: input.DefaultValue ?? null,
      Conditions: input.Conditions,
    }),
    apiCall: (ctx, input, correlationId) =>
      dataLayerApiClient.createFormField(
        toApiContext(ctx),
        input,
        correlationId
      ),
    errorMessages: {
      403: 'You do not have permission to create form fields',
      400: 'Invalid form field configuration',
    },
  });
}
```

**What it does:**

1. Generates unique `correlationId`
2. Emits `InitiateAsyncRequest` event to EventBridge
3. Calls data layer API with correlationId in header
4. Returns correlationId to frontend
5. Frontend uses correlationId to poll for status

### 2. Request State API - Initiation

**File**: `services/request-state-api/src/handlers/events/initiate-async-request.processor.ts`

**Responsibility**: Create tracking record when async operation starts

**Event**: `InitiateAsyncRequest`

**What it does:**

1. Receives InitiateAsyncRequest event from EventBridge
2. Extracts correlationId, tenant, userId from event metadata
3. Creates DynamoDB record with status PENDING
4. Stores request context for debugging

**DynamoDB Record:**

```json
{
  "correlationId": "uuid",
  "tenant": "tenant-name",
  "status": "PENDING",
  "tasks": {
    "CREATE_FORM_FIELD": {
      "status": "PENDING",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  }
}
```

### 3. Data Layer API

**File**: `services/data-layer/src/handlers/http/processors/{domain}/{operation}.ts`

**Responsibility**: Execute business logic and emit completion events

**Event Strategy Pattern**:

- Uses ObjectEventStrategy, FormEventStrategy, or custom strategies
- Emits success events: ObjectCreated, FormConfigured, etc.
- Emits failure events: ObjectCreationFailed, FormConfigurationFailed, etc.

**Key Components:**

```typescript
// Event strategy
const eventBridge = new EventBridgeClient({});
const formEventStrategy = new FormEventStrategy('create', eventBridge, logger);

// Handler with middleware
return createHttpMutationHandler()
  .withSchema(schema)
  .withObjectName('custom_attribute_schema')
  .withEventStrategy(formEventStrategy)
  .withPermissions(() => [permissions])
  .withHandler(async (event, ctx) => {
    const result = await processor({...});
    return {
      response: createdResponse({...}),
      formFieldIds: [{ fieldId: result.Id, parentType: ctx.payload.ParentType }],
    };
  })
  .execute(event, context);
```

**What it does:**

1. Validates request payload (Zod middleware)
2. Checks permissions (Permit middleware)
3. Executes business logic (processor function)
4. Emits success/failure events (event middleware)
5. Returns HTTP response to TRPC

### 4. Request State API - Completion

**File**: `services/request-state-api/src/handlers/events/update-async-request.processor.ts`

**Responsibility**: Update tracking record when async operation completes

**Events**: ObjectCreated, FormConfigured, \*Failed, etc.

**What it does:**

1. Receives completion event from EventBridge
2. Extracts correlationId from event metadata
3. Updates DynamoDB record with final status
4. Stores response or error details

**DynamoDB Record (Success):**

```json
{
  "correlationId": "uuid",
  "tenant": "tenant-name",
  "status": "COMPLETE",
  "response": "{\"Id\":\"field-123\"}",
  "tasks": {
    "CREATE_FORM_FIELD": {
      "status": "COMPLETE",
      "timestamp": "2024-01-01T00:00:01Z",
      "response": "{\"Id\":\"field-123\"}"
    }
  }
}
```

**DynamoDB Record (Failure):**

```json
{
  "correlationId": "uuid",
  "tenant": "tenant-name",
  "status": "FAILED",
  "error": "{\"message\":\"Validation failed\"}",
  "tasks": {
    "CREATE_FORM_FIELD": {
      "status": "FAILED",
      "timestamp": "2024-01-01T00:00:01Z",
      "error": "{\"message\":\"Validation failed\"}"
    }
  }
}
```

### 5. Request State API - HTTP Endpoint

**File**: `services/request-state-api/src/handlers/http/request-state/get.ts`

**Endpoint**: `GET /tenant/{tenant}/request/{correlationId}`

**Responsibility**: Provide request status to frontend

**What it does:**

1. Receives correlationId from frontend
2. Queries DynamoDB for request state
3. Computes overall status from task statuses
4. Returns status with response or error

**Response Format:**

```json
{
  "correlationId": "uuid",
  "status": "COMPLETE" | "FAILED" | "PENDING",
  "response": "parsed JSON (if COMPLETE)",
  "error": "parsed JSON (if FAILED)"
}
```

**Status Logic:**

- **COMPLETE**: All tasks have status 'COMPLETE'
- **FAILED**: Any task has status 'FAILED'
- **PENDING**: All other cases

### 6. Frontend Hooks

**File**: `packages/web/src/hooks/mutations/{domain}/use{Operation}TRPC.tsx`

**Responsibility**: Execute mutation and handle UI updates

**Pattern:**

```typescript
export const useCreateFormFieldTRPC = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.formConfiguration.createFormField.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.formConfiguration.getByParentTypes.queryKey(),
        });
      },
    }),
    throwOnError: true,
  });

  useEffect(() => {
    if (mutation.error) {
      addNotification({
        type: 'error',
        content: mutation.error.message,
      });
    }
  }, [mutation.error, addNotification]);

  return {
    createFormField: async (variables: CreateFormFieldInput) => {
      const result = await mutation.mutateAsync(variables);
      return result;
    },
    loading: mutation.isPending,
    error: mutation.error,
  };
};
```

**What it does:**

1. Calls TRPC mutation
2. Receives correlationId
3. Polls request state API (built into TRPC client)
4. Updates UI on completion
5. Invalidates React Query cache
6. Shows notifications

## Event Types and Registration

### Event Type Registration

For async operations to be tracked, their completion events must be registered in the request state API.

**File**: `services/request-state-api/src/handlers/events/request-handler.ts`

```typescript
const EVENT_ROUTING = {
  ...createEventProcessorMappings(
    [EventType.InitiateAsyncRequest],
    processInitiateAsyncRequestEvent
  ),

  ...createEventProcessorMappings(
    [
      // Object events
      EventType.ObjectCreated,
      EventType.ObjectCreationFailed,
      EventType.ObjectUpdated,
      EventType.ObjectUpdateFailed,
      EventType.ObjectDeleted,
      EventType.ObjectDeletionFailed,

      // Form events
      EventType.FormConfigured,
      EventType.FormConfigurationFailed,

      // Permission events
      EventType.PermissionsUpdated,
      EventType.PermissionsUpdateFailed,

      // Add new event types here...
    ],
    processUpdateAsyncRequestEvent
  ),
};
```

### Event Type Mapping

| Strategy            | Success Event                               | Failure Event                                                  |
| ------------------- | ------------------------------------------- | -------------------------------------------------------------- |
| ObjectEventStrategy | ObjectCreated, ObjectUpdated, ObjectDeleted | ObjectCreationFailed, ObjectUpdateFailed, ObjectDeletionFailed |
| FormEventStrategy   | FormConfigured                              | FormConfigurationFailed                                        |

## Adding Support for New Event Types

When migrating a new endpoint or adding a new domain:

### Step 1: Define Events

In `packages/events/src/types/orguser-events.ts`:

```typescript
export const myNewEventSchema = orgUserEventSchema.extend({
  type: z.literal(EventType.MyNewEvent),
  data: myNewEventDataSchema,
});

export const myNewEventFailedSchema = orgUserEventSchema.extend({
  type: z.literal(EventType.MyNewEventFailed),
  data: myNewEventFailedDataSchema,
});
```

### Step 2: Register in Request State API

In `services/request-state-api/src/handlers/events/request-handler.ts`:

```typescript
...createEventProcessorMappings(
  [
    // ... existing events ...
    EventType.MyNewEvent,
    EventType.MyNewEventFailed,
  ],
  processUpdateAsyncRequestEvent
),
```

### Step 3: Use in TRPC Service

In `packages/trpc/src/services/frontend/{domain}.service.ts`:

```typescript
return executeAsyncRequest(ctx, input, {
  requestType: 'MY_NEW_OPERATION',
  buildRequestBody: (input) => ({...}),
  apiCall: (ctx, input, correlationId) =>
    dataLayerApiClient.myNewOperation(toApiContext(ctx), input, correlationId),
  errorMessages: {...},
});
```

### Step 4: Create Frontend Hook

In `packages/web/src/hooks/mutations/{domain}/useMyOperationTRPC.tsx`:

```typescript
export const useMyOperationTRPC = () => {
  const mutation = useMutation({
    ...trpc.frontend.myDomain.myOperation.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({...});
      },
    }),
  });
  // ... rest of hook
};
```

## Debugging

### Check Request State

Query DynamoDB directly:

```bash
aws dynamodb get-item \
  --table-name ${STAGE}-${APP_NAME}-${TENANT}-RequestEventTable \
  --key '{"correlationId": {"S": "your-uuid"}}'
```

### Check EventBridge Events

View CloudWatch logs:

```bash
# Request state API event handler
aws logs tail /aws/lambda/${STAGE}-${APP_NAME}-request-handler --follow

# Data layer processor
aws logs tail /aws/lambda/${STAGE}-${APP_NAME}-data-layer-handler --follow
```

### Common Issues

| Issue                   | Cause                                  | Solution                                     |
| ----------------------- | -------------------------------------- | -------------------------------------------- |
| Status stuck on PENDING | Event not emitted by data layer        | Check data layer logs, verify event strategy |
| Event not processed     | Event type not registered              | Add event type to EVENT_ROUTING              |
| 404 on request state    | correlationId not found                | Check InitiateAsyncRequest was emitted       |
| Wrong status            | Multiple tasks with different statuses | Check task status logic                      |

## Testing

### Local Testing

1. Start Docker services:

   ```bash
   pnpm run api:v3
   ```

2. Start local Lambda services:

   ```bash
   node scripts/dev.js
   ```

   This handles CDK synth, SAM startup, and event routing automatically.

5. Check DynamoDB:
   ```bash
   aws dynamodb scan \
     --table-name tech-admin-risksmartApp-tech-admin-RequestEventTable \
     --endpoint-url http://localhost:4566
   ```

### Integration Testing

Test the full flow:

1. Call TRPC mutation from frontend
2. Verify InitiateAsyncRequest event emitted
3. Verify data layer processes request
4. Verify completion event emitted
5. Verify request state updated
6. Verify frontend receives status

## Common Errors and Solutions

### Error: "Invalid request body: request.{Field}: Required"

**Full Error Example:**

```
Invalid request body: request.IsCustomField: Invalid literal value, expected true,
request.Options: Required, request.Required: Required, request.Hidden: Required,
request.ReadOnly: Required
```

**Cause**: The `buildRequestBody` function in the TRPC service is not sending all required fields from the RequestTypes interface.

**Solution**: Update `buildRequestBody` to send **ALL fields**, not a subset.

**❌ Incorrect (partial payload):**

```typescript
buildRequestBody: (input) => ({
  ParentType: input.ParentType,
  Label: input.Label,
  Type: input.Type,
}),
```

**✅ Correct (complete payload):**

```typescript
buildRequestBody: (input) => ({
  IsCustomField: input.IsCustomField,
  ParentType: input.ParentType,
  Label: input.Label,
  AltLabel: input.AltLabel,
  Description: input.Description ?? null,
  Type: input.Type,
  Options: input.Options,
  Required: input.Required,
  Hidden: input.Hidden,
  ReadOnly: input.ReadOnly,
  DefaultValue: input.DefaultValue ?? null,
  Conditions: input.Conditions,
}),
```

**Prevention**:

- Always match the RequestTypes interface exactly
- Use `?? null` for nullable optional fields (e.g., `Description?: string | null`)
- Use `?? undefined` for non-nullable optional fields (e.g., `AltLabel?: string`) - will be removed by DynamoDB client
- Run unit tests in `services/request-state-api/src/schemas/initiate-request.test.ts` to catch schema mismatches

### Error: "Pass options.removeUndefinedValues=true to remove undefined values"

**Full Error Example:**

```
Error: Pass options.removeUndefinedValues=true to remove undefined values from map/array/set.
  at convertToAttr (/var/runtime/node_modules/@aws-sdk/util-dynamodb/dist-cjs/index.js:101:11)
```

**Cause**: DynamoDB doesn't accept `undefined` values. Optional fields in the request must be either:

1. Set to `null` (for nullable fields)
2. Omitted entirely (for non-nullable optional fields)

**Solution 1 (Infrastructure)**: Configure DynamoDB client with `removeUndefinedValues: true`:

```typescript
// services/request-state-api/src/utils/dynamo-client.ts
return DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
```

**Solution 2 (TRPC Service)**: Handle optional fields properly in `buildRequestBody`:

```typescript
buildRequestBody: (input) => ({
  RequiredField: input.RequiredField,
  OptionalNullableField: input.OptionalNullableField ?? null,  // For fields that can be null
  OptionalField: input.OptionalField ?? undefined,              // For optional fields (removed by DynamoDB)
}),
```

**Field Type Patterns:**

- `Field?: string | null` → Use `?? null`
- `Field?: string` → Use `?? undefined` (or omit if always undefined)
- `Field: string` → Send as-is

**This error was fixed in**:

- `services/request-state-api/src/utils/dynamo-client.ts` - Added `removeUndefinedValues: true`
- `packages/trpc/src/services/frontend/form-configuration.service.ts` - Properly handle optional fields

### Error: "duplicate key value violates unique constraint {table}\_audit_pkey"

**Full Error Example:**

```
duplicate key value violates unique constraint "custom_attribute_schema_audit_pkey"
Error: Failed query: insert into "risksmart"."custom_attribute_schema" ...
where: PL/pgSQL function risksmart.custom_attribute_schema_modified() line 25 at SQL statement
```

**Cause**: Audit tables use `(Id, ModifiedAtTimestamp)` as the primary key to allow multiple audit records. When doing an upsert (INSERT...ON CONFLICT DO UPDATE) in Drizzle without explicitly updating `ModifiedAtTimestamp`, the audit trigger tries to insert a record with the same `(Id, ModifiedAtTimestamp)` combination that already exists.

**Why This Happens**:

1. Audit trigger uses `NEW."ModifiedAtTimestamp"` for the audit record timestamp
2. Drizzle's `onConflictDoUpdate` only updates columns explicitly listed in `set`
3. If `ModifiedAtTimestamp` is not in `set`, it keeps the old timestamp
4. Audit trigger tries to insert with old timestamp → duplicate key error

**Solution**: Always include `ModifiedAtTimestamp` in the `set` clause when using `onConflictDoUpdate`:

**❌ Incorrect (causes audit duplicate key error):**

```typescript
.onConflictDoUpdate({
  target: table.Id,
  set: {
    Field1: value1,
    Field2: value2,
    ModifiedByUser: userId,
  },
})
```

**✅ Correct (updates timestamp, prevents duplicate):**

```typescript
.onConflictDoUpdate({
  target: table.Id,
  set: {
    Field1: value1,
    Field2: value2,
    ModifiedByUser: userId,
    ModifiedAtTimestamp: sql`statement_timestamp()`,  // CRITICAL: Always update timestamp
  },
})
```

**This affects any table with audit triggers**:

- `custom_attribute_schema`
- `form_configuration`
- `form_field_configuration`
- And others with `{table}_audit` tables

**Fixed in**: `services/data-layer/src/repositories/form-field-repository.ts`

### Error: 403 "Missing Authentication Token" from Data Layer API

**Full Error Example:**

```json
{
  "status": 403,
  "error": {
    "message": "Missing Authentication Token"
  },
  "parentType": "action",
  "fieldId": "...",
  "msg": "Failed: Updating form field via Data Layer API"
}
```

**Cause**: API Gateway doesn't have the HTTP method (e.g., PUT) registered on the proxy resource, even though the Lambda handler has the route configured.

**Symptoms**:

- Works for some methods (e.g., POST, DELETE) but not others (e.g., PUT)
- Error happens at API Gateway level, before reaching Lambda
- CloudWatch logs show no Lambda invocations for failed requests

**Solution**: Add the missing HTTP method to the API Gateway proxy resource in CDK:

**File**: `cdk-stack/lib/dataLayerStack.ts`

```typescript
// Find the client API proxy resource configuration
const proxyResource = clientApi.root.addResource('{proxy+}');
proxyResource.addMethod('GET', clientIntegration);
proxyResource.addMethod('POST', clientIntegration);
proxyResource.addMethod('PUT', clientIntegration); // ← Add missing method
proxyResource.addMethod('DELETE', clientIntegration);
```

**After fixing**:

1. Redeploy the CDK stack: `cd cdk-stack && pnpm exec cdk deploy`
2. Or for local development: restart `node scripts/dev.js`

**Prevention**: When adding routes with new HTTP methods, always verify the API Gateway configuration includes that method.

### Error: TRPC Treats 204 Response as Error

**Symptoms**:

- Data Layer logs show successful operation (e.g., "Successfully emitted FORM_CONFIGURED event")
- Data Layer returns 204 No Content
- TRPC logs show "API returned error status" with status 204
- Operation actually succeeds in database but client sees error

**Cause**: TRPC service `executeAsyncRequest` is configured with wrong `successStatus` for DELETE operations.

**DELETE operations return 204 No Content**, not 200 OK:

- 204 = Success, no content to return (standard for DELETE)
- 200 = Success with content in body

**Solution**: Set `successStatus: 204` for DELETE operations in TRPC services:

**❌ Incorrect (treats 204 as error):**

```typescript
async deleteFormField(ctx, input) {
  return executeAsyncRequest(ctx, input, {
    requestType: 'DELETE_FORM_FIELD',
    // ...
    successStatus: 200,  // ← Wrong! DELETE returns 204
  });
}
```

**✅ Correct (expects 204):**

```typescript
async deleteFormField(ctx, input) {
  return executeAsyncRequest(ctx, input, {
    requestType: 'DELETE_FORM_FIELD',
    // ...
    successStatus: 204,  // ← Correct for DELETE operations
  });
}
```

**HTTP Status Code Pattern**:

- **201 Created**: POST operations (default for `executeAsyncRequest`)
- **200 OK**: PUT/PATCH operations (explicit: `successStatus: 200`)
- **204 No Content**: DELETE operations (explicit: `successStatus: 204`)

**Fixed in**: `packages/trpc/src/services/frontend/form-configuration.service.ts`

### Error: "Invalid discriminator value. Expected 'CREATE\_...' | ..."

**Cause**: The request command type is not registered in the request state API's discriminated union.

**Solution**: Add the missing schemas to `services/request-state-api/src/schemas/initiate-request.ts`:

1. Create request schema (e.g., `createMyObjectRequestSchema`)
2. Create data schema (e.g., `createMyObjectDataSchema`)
3. Add to `initiateAsyncRequestDataSchema` discriminated union
4. Add to `simplifiedRequestBodySchema` discriminated union (if using HTTP endpoint)
5. Add unit tests to verify

**Reference**: See `.claude/agents/request-state-api-schemas.md` for detailed steps.

## Reference

- **Request State API README**: `services/request-state-api/README.md`
- **Event Types**: `packages/events/src/types/`
- **TRPC Services**: `packages/trpc/src/services/`
- **Data Layer Processors**: `services/data-layer/src/handlers/http/processors/`
- **Frontend Hooks**: `packages/web/src/hooks/mutations/`
