# V3 Architecture: CUD Operations Migration Guide

This guide provides step-by-step instructions for migrating Create, Update, and Delete (CUD) operations from the existing Hasura/GraphQL architecture to the V3 event-driven architecture.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Complete Request Flow](#complete-request-flow)
3. [Migration Steps](#migration-steps)
   - [Step 1: Events Package](#step-1-events-package)
   - [Step 2: Request State API](#step-2-request-state-api)
   - [Step 3: Data Layer Service](#step-3-data-layer-service)
   - [Step 4: tRPC Layer](#step-4-trpc-layer)
   - [Step 5: Frontend Hooks](#step-5-frontend-hooks)
4. [Operation-Specific Considerations](#operation-specific-considerations)
5. [Testing Strategy](#testing-strategy)
6. [Migration Checklist](#migration-checklist)

---

## Architecture Overview

The V3 architecture implements a fully event-driven pattern for mutations with async request tracking and permission synchronization.

### Key Services

| Service                 | Purpose                                                 | Location                      |
| ----------------------- | ------------------------------------------------------- | ----------------------------- |
| **tRPC Container**      | Backend-for-Frontend layer, orchestrates async requests | `packages/trpc/`              |
| **Request State API**   | Tracks async request lifecycle via event sourcing       | `services/request-state-api/` |
| **Data Layer Service**  | Performs database operations, emits object events       | `services/data-layer/`        |
| **Permissions Service** | Syncs permissions to Permit.io on object changes        | `services/permissions/`       |
| **Events Package**      | Shared event/command type definitions                   | `packages/events/`            |

### EventBridge Event Flow

```
┌─────────────────┐     ┌─────────────────────┐     ┌────────────────────┐
│  Data Layer     │────▶│    EventBridge      │────▶│  Permissions       │
│  OBJECT_CREATED │     │                     │     │  Service           │
└─────────────────┘     │                     │     └────────┬───────────┘
                        │                     │              │
                        │                     │◀─────────────┘
                        │                     │  PERMISSIONS_UPDATED
                        │                     │
                        └─────────┬───────────┘
                                  │
                                  ▼
                        ┌─────────────────────┐
                        │  Request State API  │
                        │  (aggregates state) │
                        └─────────────────────┘
```

---

## Complete Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                            │
│  useInsert[Object]() → trpc.frontend.[object].insert.mutateAsync()              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              tRPC LAYER                                          │
│  executeAsyncRequest():                                                          │
│  1. Generate correlationId (randomUUID)                                          │
│  2. POST /request → Request State API (initiate tracking)                        │
│  3. POST /[object] → Data Layer API (create/update/delete object)                │
│  4. Poll GET /request/{correlationId} until COMPLETE/FAILED                      │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                        ┌───────────────┴───────────────┐
                        ▼                               ▼
┌───────────────────────────────────┐   ┌─────────────────────────────────────────┐
│      REQUEST STATE API            │   │            DATA LAYER API                │
│                                   │   │                                          │
│  POST /request:                   │   │  POST /[object]:                         │
│  - Stores INITIATE_ASYNC_REQUEST  │   │  1. Validate request body                │
│  - Creates task checklist:        │   │  2. Check Permit.io permissions          │
│    • OBJECT_CREATED:[object]      │   │  3. Insert/Update/Delete in DB           │
│    • PERMISSIONS_UPDATED:[object] │   │  4. Emit OBJECT_CREATED event            │
│                                   │   │  5. Return 201 + object                  │
│  GET /request/{correlationId}:    │   │                                          │
│  - Returns aggregated state       │   └──────────────────┬──────────────────────┘
│  - Status: PENDING/COMPLETE/FAILED│                      │
└───────────────┬───────────────────┘                      │ EventBridge
                │                                          ▼
                │                       ┌──────────────────────────────────────────┐
                │ EventBridge           │           PERMISSIONS SERVICE             │
                │                       │  Trigger: OBJECT_CREATED/OBJECT_DELETED  │
                │                       │  1. Create/delete resource in Permit.io  │
                │                       │  2. Emit PERMISSIONS_UPDATED event       │
                │                       └──────────────────┬───────────────────────┘
                │                                          │
                │◀─────────────────────────────────────────┘
                │                         EventBridge
                ▼
┌───────────────────────────────────┐
│      REQUEST STATE API            │
│  (EventBridge Handler)            │
│  - Receives all events            │
│  - Updates task statuses          │
│  - When all tasks COMPLETE:       │
│    overall status = COMPLETE      │
└───────────────────────────────────┘
```

---

## Migration Steps

### Step 1: Events Package

Location: `packages/events/src/types/`

#### 1.1 Add Command Type

**File:** `command-types.ts`

Add your new command type to the `CommandTypeNames` union:

```typescript
// Before
export type CommandTypeNames = 'CREATE_ACTION_UPDATE';

// After
export type CommandTypeNames =
  | 'CREATE_ACTION_UPDATE'
  | 'CREATE_ACTION' // Add new Create command
  | 'UPDATE_ACTION' // Add new Update command (if needed)
  | 'DELETE_ACTION'; // Add new Delete command (if needed)
```

#### 1.2 Add Request Type

**File:** `request-types.ts`

Define the request payload interface and add to the union:

```typescript
// Add new request interface
export interface CreateActionRequest {
  Title: string;
  Description: string;
  DueDate: string | null;
  Priority: number | null;
  Status: number;
  // ... other required fields
  CustomAttributeData: string | null;
}

// For updates, include the object ID
export interface UpdateActionRequest {
  Id: string; // Required for updates
  Title?: string;
  Description?: string;
  // ... other optional fields
  OriginalTimestamp: string; // For optimistic locking
}

// For deletes
export interface DeleteActionRequest {
  Id: string;
  OriginalTimestamp: string;
}

// Add to the RequestTypes union
export type RequestTypes =
  | CreateActionUpdateRequest
  | CreateActionRequest
  | UpdateActionRequest
  | DeleteActionRequest;
```

**Note:** These request payloads can usually be defined to match the payloads sent to the equivalent hasura hooks.

#### 1.3 Update Event Types (if needed)

**File:** `event-types.ts`

The existing `OBJECT_CREATED`, `OBJECT_UPDATED`, and `OBJECT_DELETED` event types are generic and should work for most objects. No changes typically required.

**Testing note:** Run `pnpm exec turbo build --filter=@risksmart-app/events` to verify types compile correctly.

---

### Step 2: Request State API

Location: `services/request-state-api/`

#### 2.1 Update Task Configuration

**File:** `src/rules/task-utils.ts`

Add task definitions for your new command type. Tasks define which events must complete for the request to be considered successful.

```typescript
const TASK_MAP: { [K in CommandTypeNames]: TaskDefinition[] } = {
  CREATE_ACTION_UPDATE: [
    { eventType: EventType.ObjectCreated, objectType: 'action_update' },
    { eventType: EventType.PermissionsUpdated, objectType: 'action_update' },
  ],
  // Add new command type
  CREATE_ACTION: [
    { eventType: EventType.ObjectCreated, objectType: 'action' },
    { eventType: EventType.PermissionsUpdated, objectType: 'action' },
  ],
  UPDATE_ACTION: [
    { eventType: EventType.ObjectUpdated, objectType: 'action' },
    // Note: Updates may not need permissions sync unless ownership changes
  ],
  DELETE_ACTION: [
    { eventType: EventType.ObjectDeleted, objectType: 'action' },
    { eventType: EventType.PermissionsUpdated, objectType: 'action' },
  ],
};
```

**Testing note:** The Request State API has unit tests in `src/rules/__tests__/`. Add test cases for your new command type.

---

### Step 3: Data Layer Service

Location: `services/data-layer/`

#### 3.1 Create Repository (if not exists)

**File:** `src/repositories/[object].repository.ts`

```typescript
import type { DatabaseConnection } from '../database/connection';
import type { JSONB } from '../types/database.types';

export interface ActionInsertData {
  Title: string;
  Description: string;
  DueDate: string | null;
  Priority: number | null;
  Status: number;
  CreatedByUser: string;
  ModifiedByUser: string;
  OrgKey: string;
  CustomAttributeData: JSONB | null;
}

export interface ActionRepository {
  insert(data: ActionInsertData): Promise<{ Id: string }[]>;
  update(
    id: string,
    data: Partial<ActionInsertData>
  ): Promise<{ Id: string }[]>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<ActionRecord | null>;
}

export const createActionRepository = (
  db: DatabaseConnection
): ActionRepository => ({
  async insert(data) {
    return db.insertInto('action').values(data).returning(['Id']).execute();
  },

  async update(id, data) {
    return db
      .updateTable('action')
      .set({ ...data, ModifiedAtTimestamp: new Date().toISOString() })
      .where('Id', '=', id)
      .returning(['Id'])
      .execute();
  },

  async delete(id) {
    await db.deleteFrom('action').where('Id', '=', id).execute();
  },

  async findById(id) {
    return (
      db
        .selectFrom('action')
        .selectAll()
        .where('Id', '=', id)
        .executeTakeFirst() ?? null
    );
  },
});
```

#### 3.2 Create HTTP Processor

**File:** `src/handlers/http/processors/[object]/create.ts`

The new architecture uses a fluent builder pattern with middleware for validation, permissions, and event emission.

For CUD Operations use: (`createHttpMutationHandler`)
For Read Operations use: (`createHttpReadHandler`)

##### Key Concepts

- **`createHttpMutationHandler()`** - Fluent builder that chains middleware configuration
- **Processor function** - Pure business logic function with no HTTP/AWS concerns
- **Middleware chain** - Automatically handles validation → permissions → handler → events
- **Path parameters** - Available in both `withPermissions()` and `withHandler()` via `pathParams`

- **`createHttpReadHandler<TPathSchema, TQuerySchema, TData>()`** - Fluent builder with generics for type-safe path params, query params, and response data
- **Middleware chain** - Automatically handles service context → input validation → permission filtering → response formatting
- **Path/Query Validation** - Use `withPathParamsSchema()` and/or `withQueryParamsSchema()` with Zod schemas
- **Permission Filtering** - Use `withPermissionFilter({ resourceType, idExtractor })` to filter results via Permit.io
- **Response Modes** - Use `forSingleItem()` for single object responses, `withPagination()` for paginated lists
- **Object Name** - Required via `withObjectName()` for logging and error messages

Example operations

| Operation            | Implementation                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| create               | [issue-update](../services/data-layer/src/handlers/http/processors/issue-updates/create.ts)            |
| delete one with body | [control-group](../services/data-layer/src/handlers/http/processors/control-groups/delete.ts)          |
| delete many          | [obligation-impacts](../services/data-layer/src/handlers/http/processors/obligation-impacts/delete.ts) |
| read                 | [action-updates](../services/data-layer/src/handlers/http/processors/action-updates/get-by-id.ts)      |

##### Middleware Chain Execution Order

`createHttpMutationHandler`

1. **`payloadValidationMiddleware`** - Validates request body against Zod schema, extracts service context
2. **`permissionsMiddleware`** - Calls `withPermissions()` function, checks Permit.io
3. **Handler** - Your `withHandler()` function executes business logic
4. **`EventMiddleware`** - Automatically emits `OBJECT_CREATED/UPDATED/DELETED` events based on operation type

**Note:** Event emission happens automatically - you don't need to manually emit events like in the old pattern.

`createHttpReadHandler`

1. **`serviceContextMiddleware`** - Extracts service context (userId, orgKey, tenant) from the request
2. **`pathParamsMiddleware`** - Validates path parameters against Zod schema (if configured)
3. **`queryParamsMiddleware`** - Validates query parameters against Zod schema (if configured)
4. **`paginationMiddleware`** - Adds pagination context (if enabled via `withPagination()`)
5. **Handler** - Your `withHandler()` function fetches data, receives `{ pathParams, queryParams, serviceContext, pagination }`
6. **`permissionFilterMiddleware`** - Filters results via Permit.io based on `withPermissionFilter()` config (runs in after phase)
7. **`responseFormatterMiddleware`** - Formats response as `{ data: ... }` or `{ data: [...], pagination: {...} }` (runs last in after phase)

**Note:** The handler returns raw data; middleware automatically handles permission filtering and response formatting.

##### Internal Endpoints (get-all)

Some read endpoints intentionally omit permission filtering because they are **internal endpoints** used for service-to-service communication. These `get-all` processors return all records for a given object type within an organisation:

These endpoints are primarily consumed by the **Permissions Service** for synchronising object data to Permit.io. The Permissions Service authenticates using AWS IAM (SigV4 request signing) rather than user-based authentication, and requires access to all organisation data to maintain permission state.

**Future Architecture:** The processors will be split into **internal** and **external** categories, served by separate API Gateways:

- **External API Gateway** - Exposes endpoints to frontend clients via the tRPC layer; all endpoints require permission filtering via `.withPermissionFilter()`
- **Internal API Gateway** - Exposes endpoints only to trusted internal services (e.g., Permissions Service) authenticated via IAM; permission filtering is not required as these services need full data access

Until this separation is implemented, internal endpoints remain accessible via the same API Gateway but are protected by IAM authentication and should only be called by authorised internal services.

#### 3.3 Register Route with Middy HTTP Router

**File:** `src/handlers/http/handler.ts`

The Data Layer uses [`@middy/http-router`](https://middy.js.org/docs/routers/http-router) for request routing. API Gateway forwards all paths to the Lambda via a greedy `{proxy+}` route, and the http-router handles path matching internally.

Add your processor to the `routes` array:

```typescript
import { createActionProcessor } from './processors/actions/create';
import { updateActionProcessor } from './processors/actions/update';
import { deleteActionProcessor } from './processors/actions/delete';
import { getActionByIdProcessor } from './processors/actions/get-by-id';

const routes: Route<APIGatewayProxyEvent, APIGatewayProxyResult>[] = [
  // GET routes
  {
    method: 'GET',
    path: '/actions/register',
    handler: getActionsRegisterProcessor,
  },
  {
    method: 'GET',
    path: '/actions/{id}',
    handler: getActionByIdProcessor,
  },

  // POST routes
  {
    method: 'POST',
    path: '/actions',
    handler: createActionProcessor,
  },

  // PUT routes
  {
    method: 'PUT',
    path: '/actions/{id}',
    handler: updateActionProcessor,
  },

  // DELETE routes
  {
    method: 'DELETE',
    path: '/actions/{id}',
    handler: deleteActionProcessor,
  },
];
```

**Route syntax:**

- Paths must start with `/` (e.g., `/actions`, not `actions`)
- Path parameters use `{paramName}` syntax (e.g., `/actions/{id}`)
- The router automatically populates `event.pathParameters` with extracted values

**Common route patterns:**

```typescript
// Collection route (POST /objects)
{ method: 'POST', path: '/objects', handler: createObjectProcessor }

// Single object route (GET/PUT/DELETE /objects/{id})
{ method: 'GET', path: '/objects/{id}', handler: getObjectByIdProcessor }

// Nested resource route (GET /objects/by-parent/{parentId})
{ method: 'GET', path: '/objects/by-parent/{parentId}', handler: getByParentProcessor }
```

**Note:** Route order doesn't matter - the http-router handles specificity automatically (static segments take precedence over dynamic parameters).

**Testing note:** Data Layer processors should have unit tests. See `src/handlers/http/processors/action-updates/__tests__/` for examples using dependency injection pattern.

---

### Step 4: tRPC Layer

Location: `packages/trpc/`

#### 4.1 Import Types Directly from Events Package

**Important:** Import request types directly from the shared `@risksmart-app/events` package into the files that need them. Do NOT re-export or create local type aliases—this adds unnecessary indirection.

**Direct import pattern (preferred):**

```typescript
// In src/services/frontend/action.service.ts
import type { CreateActionRequest } from '@risksmart-app/events/src/types/request-types.js';

// In src/clients/data-layer-api-client.ts
import type { CreateActionRequest } from '@risksmart-app/events/src/types/request-types.js';

// In src/services/service.types.ts (for interface definitions)
import type { CreateActionRequest } from '@risksmart-app/events/src/types/request-types.js';
```

**Note:** Response types (e.g., `CreateActionUpdateResponse`) are still defined in tRPC's types files since they're derived from query configs specific to the tRPC layer.

#### 4.2 Add Data Layer Client Methods

**File:** `src/clients/data-layer-api-client.ts`

```typescript
import type { CreateActionRequest } from '@risksmart-app/events/src/types/request-types.js';

async createAction(
  ctx: ApiContext,
  input: CreateActionRequest,
  correlationId: string
) {
  return this.post<{ data: ActionRecord }>(
    ctx,
    '/actions',
    input,
    correlationId
  );
}

async updateAction(
  ctx: ApiContext,
  id: string,
  input: UpdateActionInput,
  correlationId: string
) {
  return this.put<{ data: ActionRecord }>(
    ctx,
    `/actions/${id}`,
    input,
    correlationId
  );
}

async deleteAction(
  ctx: ApiContext,
  id: string,
  correlationId: string
) {
  return this.delete<void>(
    ctx,
    `/actions/${id}`,
    correlationId
  );
}
```

#### 4.3 Add Service Methods

**File:** `src/services/frontend/action.service.ts`

```typescript
import { executeAsyncRequest } from '../../clients/async-request.js';
import { toApiContext } from '../../clients/client-utils.js';
import { dataLayerApiClient } from '../../clients/data-layer-api-client.js';
import type {
  CreateActionInput,
  UpdateActionInput,
} from '../../types/action.types.js';
import { mapHttpStatusToTRPCError } from '../../utils/error-mapping.js';
import type { ServiceContext } from '../service.types.js';

export class ActionServiceImpl {
  // ... existing methods (getById, etc.)

  async insertAction(ctx: ServiceContext, input: CreateActionInput) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'CREATE_ACTION',
      buildRequestBody: (input) => ({
        Title: input.Title,
        Description: input.Description,
        DueDate: input.DueDate ?? null,
        Priority: input.Priority ?? null,
        Status: input.Status ?? 1,
        CustomAttributeData: input.CustomAttributeData ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createAction(
          toApiContext(ctx),
          input,
          correlationId
        ),
      successStatus: 201,
      errorMessages: {
        403: 'You do not have permission to create actions',
      },
    });
  }

  async updateAction(ctx: ServiceContext, input: UpdateActionInput) {
    return executeAsyncRequest(ctx, input, {
      requestType: 'UPDATE_ACTION',
      buildRequestBody: (input) => ({
        Id: input.Id,
        Title: input.Title,
        Description: input.Description,
        // ... other fields
        OriginalTimestamp: input.OriginalTimestamp,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.updateAction(
          toApiContext(ctx),
          input.Id,
          input,
          correlationId
        ),
      successStatus: 200,
      errorMessages: {
        403: 'You do not have permission to update this action',
        404: 'Action not found',
        409: 'Action was modified by another user',
      },
    });
  }

  async deleteAction(ctx: ServiceContext, id: string) {
    return executeAsyncRequest(
      ctx,
      { id },
      {
        requestType: 'DELETE_ACTION',
        buildRequestBody: () => ({}),
        apiCall: (ctx, _, correlationId) =>
          dataLayerApiClient.deleteAction(toApiContext(ctx), id, correlationId),
        successStatus: 204,
        errorMessages: {
          403: 'You do not have permission to delete this action',
          404: 'Action not found',
        },
      }
    );
  }
}
```

#### 4.4 Add Router Endpoints

**File:** `src/routers/frontend/action.router.ts`

```typescript
import { z } from 'zod';
import { router } from '../trpc.js';
import { authedProcedure } from '../procedures/authed.js';
import { createActionService } from '../services/frontend/action.service.js';

export const actionRouter = router({
  // ... existing endpoints

  insert: authedProcedure
    .input(
      z.object({
        Title: z.string().min(1),
        Description: z.string(),
        DueDate: z.string().nullable().optional(),
        Priority: z.number().nullable().optional(),
        Status: z.number().optional(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const actionService = createActionService();
      return actionService.insertAction(ctx, input);
    }),

  update: authedProcedure
    .input(
      z.object({
        Id: z.string().uuid(),
        Title: z.string().optional(),
        Description: z.string().optional(),
        DueDate: z.string().nullable().optional(),
        Priority: z.number().nullable().optional(),
        Status: z.number().optional(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
        OriginalTimestamp: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const actionService = createActionService();
      return actionService.updateAction(ctx, input);
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const actionService = createActionService();
      return actionService.deleteAction(ctx, input.id);
    }),
});
```

---

### Step 5: Frontend Hooks

Location: `packages/web/src/hooks/mutations/`

#### 5.1 Create tRPC Hook

**File:** `action/useInsertActionTRPC.tsx`

```typescript
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { InsertActionMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { useCallback, useState } from 'react';

import { trpc } from '@/providers/TRPCProvider';

type InsertActionInput = {
  Title: string;
  Description: string;
  DueDate?: string | null;
  Priority?: number | null;
  Status?: number;
  CustomAttributeData?: Record<string, unknown> | null;
};

/**
 * Maps tRPC response to match GraphQL mutation shape for backward compatibility
 */
const mapToGraphQLResponse = (data: unknown): InsertActionMutation => {
  const typedData = data as { Id: string; [key: string]: unknown };
  return {
    insert_action_one: {
      __typename: 'action',
      Id: typedData.Id,
    },
  };
};

export const useInsertActionTRPC = () => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const insertMutation = trpc.frontend.action.insert.useMutation({
    onError: (err) => {
      setError(err);
      addNotification({
        type: 'error',
        content: err.message,
      });
    },
  });

  const insertAction = useCallback(
    async (variables: InsertActionInput): Promise<InsertActionMutation> => {
      setLoading(true);
      setError(null);
      try {
        const result = await insertMutation.mutateAsync(variables);
        return mapToGraphQLResponse(result);
      } finally {
        setLoading(false);
      }
    },
    [insertMutation]
  );

  return {
    insertAction,
    loading,
    error,
  };
};
```

#### 5.2 Create Wrapper Hook with Feature Flag

**File:** `action/useInsertAction.tsx`

```typescript
import { useMutation } from '@apollo/client';
import { useNotifications } from '@risksmart-app/components/src/notifications/useNotifications';
import type { InsertActionMutation } from '@risksmart-app/web-graphql-client/generated/graphql';
import { InsertActionDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useIsFeatureVisibleToOrg } from '@/utils/featureFlags';

import { useInsertActionTRPC } from './useInsertActionTRPC';

type InsertActionInput = {
  Title: string;
  Description: string;
  DueDate?: string | null;
  Priority?: number | null;
  Status?: number;
  CustomAttributeData?: Record<string, unknown> | null;
};

export const useInsertAction = () => {
  const trpcEnabled = useIsFeatureVisibleToOrg('trpc');
  const { addNotification } = useNotifications();

  // GraphQL mutation (existing implementation)
  const [insertActionGraphQL, graphqlState] = useMutation(
    InsertActionDocument,
    {
      onError: (error) => {
        if (!trpcEnabled) {
          addNotification({
            type: 'error',
            content: error.message,
          });
        }
      },
    }
  );

  // tRPC mutation (new implementation)
  const trpcMutation = useInsertActionTRPC();

  const insertAction = async (
    variables: InsertActionInput
  ): Promise<InsertActionMutation> => {
    if (trpcEnabled) {
      return trpcMutation.insertAction(variables);
    }

    const result = await insertActionGraphQL({ variables });
    if (!result.data) {
      throw new Error('Failed to insert action');
    }

    return result.data;
  };

  // Return appropriate state based on feature flag
  if (trpcEnabled) {
    return {
      insertAction,
      loading: trpcMutation.loading,
      error: trpcMutation.error,
    };
  }

  return {
    insertAction,
    loading: graphqlState.loading,
    error: graphqlState.error,
  };
};
```

#### 5.3 Export from Index

**File:** `action/index.ts` (or parent index)

```typescript
export { useInsertAction } from './useInsertAction';
export { useUpdateAction } from './useUpdateAction';
export { useDeleteAction } from './useDeleteAction';
```

---

## Operation-Specific Considerations

### Create Operations

- **Event type:** `OBJECT_CREATED`
- **Success status:** `201 Created`
- **Response:** Include `Location` header with object URL
- **Permissions:** Check `insert` permission on object type

### Update Operations

- **Event type:** `OBJECT_UPDATED`
- **Success status:** `200 OK`
- **Optimistic locking:** Include `OriginalTimestamp` to detect conflicts
- **Conflict response:** `409 Conflict` if object was modified
- **Permissions:** Check `update` permission, may need object-level check
- **Note:** May not require permissions sync unless ownership/access changes

### Delete Operations

- **Event type:** `OBJECT_DELETED`
- **Success status:** `204 No Content`
- **Soft delete:** Consider if object should be soft-deleted vs hard-deleted
- **Cascade:** Consider related object cleanup
- **Permissions:** Check `delete` permission on specific object instance

---

## Testing Strategy

### Unit Tests by Layer

| Layer             | Test Location                                  | Focus                                       |
| ----------------- | ---------------------------------------------- | ------------------------------------------- |
| Events Package    | `packages/events/src/__tests__/`               | Type validation                             |
| Request State API | `services/request-state-api/src/**/__tests__/` | Task configuration, state aggregation       |
| Data Layer        | `services/data-layer/src/**/__tests__/`        | Processor logic, validation, event emission |
| tRPC              | `packages/trpc/src/**/__tests__/`              | Service methods, error handling             |
| Frontend          | `packages/web/src/**/__tests__/`               | Hook behavior, feature flag switching       |

### Integration Tests

1. **End-to-end flow:** Test full request from tRPC through to permissions update
2. **Error scenarios:** Test failure handling at each stage
3. **Timeout handling:** Test polling timeout behavior

### Manual Testing

1. Enable `trpc` feature flag for your test organization
2. Perform CUD operation in UI
3. Verify object created/updated/deleted in database
4. Verify permissions synced in Permit.io
5. Disable feature flag and verify GraphQL path still works

---

## Migration Checklist

Use this checklist when migrating a new object's CUD operations:

### Events Package

- [ ] Add command type(s) to `CommandTypeNames` union in `command-types.ts`
- [ ] Add request interface(s) to `request-types.ts`
- [ ] Add request type(s) to `RequestTypes` union
- [ ] Build events package: `pnpm exec turbo build --filter=@risksmart-app/events`

### Request State API

- [ ] Add task definitions to `TASK_MAP` in `task-utils.ts`
- [ ] Add unit tests for new command type
- [ ] Run tests: `pnpm exec turbo test:unit --filter=request-state-api`

### Data Layer Service

- [ ] Create repository (if not exists)
- [ ] Create HTTP processor for Create operation
- [ ] Create HTTP processor for Update operation (if needed)
- [ ] Create HTTP processor for Delete operation (if needed)
- [ ] Register routes in `handler.ts`
- [ ] Add unit tests for processors
- [ ] Run tests: `pnpm exec turbo test:unit --filter=data-layer`

### tRPC Layer

- [ ] Import request types directly from `@risksmart-app/events` where needed (do NOT re-export)
- [ ] Add Data Layer API client methods using the events package types
- [ ] Add service methods using `executeAsyncRequest`
- [ ] Add router endpoints with Zod validation
- [ ] Add unit tests
- [ ] Run tests: `pnpm exec turbo test:unit --filter=@risksmart-app/trpc`

### Frontend

- [ ] Create tRPC hook (`use[Operation][Object]TRPC.tsx`)
- [ ] Create wrapper hook with feature flag (`use[Operation][Object].tsx`)
- [ ] Map tRPC response to GraphQL shape for compatibility
- [ ] Export hooks from index
- [ ] Add unit tests
- [ ] Run tests: `pnpm exec turbo test:unit --filter=@risksmart-app/web`

### Final Verification

- [ ] Run full test suite: `pnpm run test:unit`
- [ ] Run TypeScript compilation: `pnpm run tsc`
- [ ] Manual test with `trpc` feature flag enabled
- [ ] Manual test with `trpc` feature flag disabled (GraphQL fallback)

---

## Reference Files

### Action Update Implementation (Use as Template)

| Component                     | File Path                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------ |
| Events - Command Types        | `packages/events/src/types/command-types.ts`                                   |
| Events - Request Types        | `packages/events/src/types/request-types.ts`                                   |
| Request State - Task Config   | `services/request-state-api/src/rules/task-utils.ts`                           |
| Data Layer - Create Processor | `services/data-layer/src/handlers/http/processors/action-updates/create.ts`    |
| Data Layer - Router           | `services/data-layer/src/handlers/http/handler.ts`                             |
| tRPC - Types                  | `packages/trpc/src/types/action-update.types.ts`                               |
| tRPC - API Client             | `packages/trpc/src/clients/data-layer-api-client.ts`                           |
| tRPC - Async Request          | `packages/trpc/src/clients/async-request.ts`                                   |
| tRPC - Service                | `packages/trpc/src/services/frontend/action.service.ts`                        |
| tRPC - Router                 | `packages/trpc/src/routers/action.router.ts`                                   |
| Frontend - tRPC Hook          | `packages/web/src/hooks/mutations/action-update/useInsertActionUpdateTRPC.tsx` |
| Frontend - Wrapper Hook       | `packages/web/src/hooks/mutations/action-update/useInsertActionUpdate.tsx`     |
