# tRPC Migration Implementation Guide

This guide provides Claude AI assistant with detailed context on implementing tRPC migrations in the RiskSmart application.

## Overview

The RiskSmart application is migrating from GraphQL to tRPC for improved type safety and developer experience. This migration is controlled by feature flags and implemented gradually to maintain backward compatibility.

## Migration Pattern

### 1. Feature Flag Integration

All tRPC migrations use the `trpc` feature flag:

```typescript
// Example wrapper hook pattern
export const useGetActionsByParentActionIdQuery = () => {
  const { data: featureFlags } = useGetFeatureFlags();
  const trpcEnabled = featureFlags?.trpc || false;

  // tRPC implementation
  const trpcResult = useGetActionsByParentActionIdTRPC({
    enabled: trpcEnabled,
  });

  // GraphQL implementation
  const graphqlResult = useGetActionsByParentActionIdGraphQL({
    enabled: !trpcEnabled,
  });

  return trpcEnabled ? trpcResult : graphqlResult;
};
```

### 2. Data Mapping Functions

Each tRPC hook includes a mapping function to transform tRPC data to GraphQL format:

```typescript
/**
 * Maps tRPC Action data to GraphQL GetActionsByParentActionIdQuery format
 */
export const mapTrpcActionsToGraphQL = (
  trpcData: Action[]
): GetActionsByParentActionIdQuery => {
  return {
    action: trpcData.map((action) => ({
      id: action.id,
      title: action.title || null,
      description: action.description || null,
      dueDate: action.dueDate || null,
      createdAt: action.createdAt,
      // ... other mappings
    })),
  };
};
```

### 3. Hook Structure

Standard tRPC hook structure:

```typescript
export const useGetActionsByParentActionIdTRPC = (options?: {
  enabled?: boolean;
}) => {
  const trpc = useTrpcContext();

  return useQuery({
    queryKey: ['actions', 'byParentId'],
    queryFn: async () => {
      const result = await trpc.action.getByParentId.query();
      return mapTrpcActionsToGraphQL(result);
    },
    enabled: options?.enabled ?? true,
    onError: (error) => {
      showNotification({
        type: 'error',
        header: 'Failed to load actions',
        content: error.message,
      });
    },
  });
};
```

## Implementation Steps

### Step 1: Create tRPC Hook

1. **Location**: `packages/web/src/hooks/trpc/`
2. **Naming**: `useGet[ObjectName]TRPC.tsx`
3. **Include**: Data mapping function with JSDoc

```typescript
// packages/web/src/hooks/trpc/useGetActionsTRPC.tsx
import { useQuery } from '@tanstack/react-query';
import { useTrpcContext } from '../../providers/TrpcProvider';
import { mapTrpcActionsToGraphQL } from './mappings';

export const useGetActionsTRPC = (options?: { enabled?: boolean }) => {
  // Implementation here
};
```

### Step 2: Create Mapping Function

1. **Purpose**: Transform tRPC data to match GraphQL structure
2. **Location**: Same file as tRPC hook or separate mappings file
3. **Documentation**: Include JSDoc with transformation details

```typescript
/**
 * Maps tRPC Action[] to GetActionsQuery format
 *
 * @param trpcData - Array of Action objects from tRPC
 * @returns GraphQL-compatible query result
 */
export const mapTrpcActionsToGraphQL = (
  trpcData: Action[]
): GetActionsQuery => {
  // Mapping implementation
};
```

### Step 3: Create Wrapper Hook

1. **Location**: `packages/web/src/hooks/queries/`
2. **Naming**: `useGet[ObjectName]Query.tsx`
3. **Purpose**: Feature flag switching between tRPC and GraphQL

```typescript
// packages/web/src/hooks/queries/useGetActionsQuery.tsx
import { useGetFeatureFlags } from '../useGetFeatureFlags';
import { useGetActionsTRPC } from '../trpc/useGetActionsTRPC';
import { useGetActionsGraphQL } from '../graphql/useGetActionsGraphQL';

export const useGetActionsQuery = () => {
  const { data: featureFlags } = useGetFeatureFlags();
  const trpcEnabled = featureFlags?.trpc || false;

  const trpcResult = useGetActionsTRPC({ enabled: trpcEnabled });
  const graphqlResult = useGetActionsGraphQL({ enabled: !trpcEnabled });

  return trpcEnabled ? trpcResult : graphqlResult;
};
```

### Step 4: Update Component

1. **Import**: Replace existing hook import
2. **Usage**: No changes to component logic
3. **Testing**: Verify both tRPC and GraphQL modes work

```typescript
// Before
import { useGetActionsByParentActionId } from '../hooks/useGetActionsByParentActionId';

// After
import { useGetActionsByParentActionIdQuery } from '../hooks/queries/useGetActionsByParentActionIdQuery';

// Component usage remains the same
const { data, loading, error } = useGetActionsByParentActionIdQuery();
```

## Data Mapping Guidelines

### Common Patterns

1. **Null vs Undefined**: GraphQL expects `null`, tRPC may return `undefined`

   ```typescript
   title: action.title || null,
   ```

2. **Date Formatting**: Ensure consistent date format

   ```typescript
   createdAt: action.createdAt?.toISOString() || null,
   ```

3. **Nested Objects**: Handle optional nested structures

   ```typescript
   createdByUser: action.createdByUser ? {
     id: action.createdByUser.id,
     FriendlyName: action.createdByUser.friendlyName,
   } : null,
   ```

4. **Arrays**: Handle optional arrays
   ```typescript
   files: action.files || [],
   ```

### Type Safety

1. **Import Types**: Use generated types from both systems

   ```typescript
   import type { Action } from '@risksmart-app/trpc/types';
   import type { GetActionsQuery } from '../../generated/graphql';
   ```

2. **Type Assertions**: Use careful type assertions when needed

   ```typescript
   operation: file.operation as ChangeRequestFileOperation,
   ```

3. **Optional Chaining**: Use optional chaining for nested properties
   ```typescript
   user: action.createdByUser?.id || null,
   ```

## Error Handling

### Standard Error Pattern

```typescript
onError: (error) => {
  showNotification({
    type: 'error',
    header: 'Failed to load data',
    content: error.message,
  });
},
```

### Error Context

Include specific context in error messages:

- Object type (actions, risks, controls)
- Operation type (fetch, create, update, delete)
- User-friendly description

## Testing Strategy

### Unit Tests

Test both tRPC and GraphQL modes:

```typescript
describe('useGetActionsQuery', () => {
  it('uses tRPC when feature flag is enabled', () => {
    // Test implementation
  });

  it('uses GraphQL when feature flag is disabled', () => {
    // Test implementation
  });
});
```

### Integration Tests

Verify data mapping accuracy:

```typescript
describe('mapTrpcActionsToGraphQL', () => {
  it('correctly maps all action properties', () => {
    // Test mapping function
  });
});
```

## Performance Considerations

### Query Optimization

1. **Selective Enabling**: Only enable queries when needed
2. **Caching**: Leverage React Query caching
3. **Deduplication**: Automatic request deduplication

### Memory Management

1. **Cleanup**: Proper cleanup of subscriptions
2. **Pagination**: Implement for large datasets
3. **Lazy Loading**: Load data on demand

## Common Issues and Solutions

### Type Mismatches

**Issue**: TypeScript errors in mapping functions
**Solution**: Check generated types and use proper type assertions

### Feature Flag Race Conditions

**Issue**: Feature flag not loaded when hook executes
**Solution**: Use `enabled` option to wait for feature flags

### Caching Conflicts

**Issue**: Cached data conflicts between tRPC and GraphQL
**Solution**: Use different cache keys for each implementation

## Migration Checklist

- [ ] Create tRPC hook with proper error handling
- [ ] Implement data mapping function with JSDoc
- [ ] Create wrapper hook with feature flag switching
- [ ] Update component imports
- [ ] Add unit tests for both modes
- [ ] Test data mapping accuracy
- [ ] Verify error handling works correctly
- [ ] Update documentation

## Benefits

1. **Type Safety**: End-to-end type safety from backend to frontend
2. **Performance**: Optimized queries and smaller payloads
3. **Developer Experience**: Better autocomplete and error detection
4. **Maintainability**: Simplified data fetching patterns
5. **Backward Compatibility**: Gradual migration without breaking changes

This migration pattern ensures a smooth transition while maintaining application stability and user experience.

## TRPC Mutations and Data Layer Integration

### Data Layer Event Strategy Pattern

The data layer uses a generic event strategy pattern for mutation operations that allows flexible event emission without modifying middleware:

#### Initial Event Strategies

1. **ObjectEventStrategy** - For object CRUD operations

   ```typescript
   const objectEventStrategy = new ObjectEventStrategy(
     'obligation_impact',
     'create',
     eventBridge,
     logger
   );
   ```

2. **FormEventStrategy** - For form configuration operations
   ```typescript
   const formEventStrategy = new FormEventStrategy(
     'create',
     eventBridge,
     logger
   );
   ```

#### Mutation Handler Pattern

Data layer processors use the builder pattern with event strategies:

```typescript
export const createFormFieldProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const formFieldRepository = createFormFieldRepository(db);
  const processor = createProcessor({ formFieldRepository });

  // Create event strategy
  const eventBridge = new EventBridgeClient({});
  const formEventStrategy = new FormEventStrategy(
    'create',
    eventBridge,
    logger
  );

  return createHttpMutationHandler()
    .withSchema(createFormFieldRequestSchema)
    .withObjectName('custom_attribute_schema')
    .withEventStrategy(formEventStrategy) // Inject strategy
    .withPermissions(() => [
      { objectName: 'custom_attribute_schema', action: 'update' },
    ])
    .withHandler(async (event, ctx) => {
      const result = await processor({
        payload: ctx.payload,
        context: ctx.serviceContext,
      });

      return {
        response: createdResponse({ event, object: result }),
        formFieldIds: [
          { fieldId: result.Id, parentType: ctx.payload.ParentType },
        ],
      };
    })
    .execute(event, context);
};
```

### TRPC Service Layer with Async Request Tracking

TRPC mutations use `executeAsyncRequest` for async operation tracking:

```typescript
// packages/trpc/src/services/frontend/form-configuration.service.ts
async createFormField(
  ctx: ServiceContext,
  input: CreateFormFieldRequest
): Promise<CreateFormFieldResponse> {
  return executeAsyncRequest(ctx, input, {
    requestType: 'CREATE_FORM_FIELD',
    buildRequestBody: (input) => ({
      ParentType: input.ParentType,
      Label: input.Label,
      Type: input.Type,
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

### Frontend Mutation Hooks

Frontend hooks integrate with TRPC mutations and React Query:

```typescript
// packages/web/src/hooks/mutations/form-field/useCreateFormFieldTRPC.tsx
export const useCreateFormFieldTRPC = () => {
  const trpcEnabled = useIsFeatureVisibleToOrg('trpc');
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const mutation = useMutation({
    ...trpc.frontend.formConfiguration.createFormField.mutationOptions({
      onSuccess: async () => {
        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({
          queryKey: trpc.frontend.formConfiguration.getByParentTypes.queryKey(),
        });
      },
    }),
    throwOnError: true,
  });

  // Handle TRPC errors
  useEffect(() => {
    if (trpcEnabled && mutation.error) {
      addNotification({
        type: 'error',
        content: mutation.error.message,
      });
    }
  }, [mutation.error, addNotification, trpcEnabled]);

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

### Mutation Migration Checklist

- [ ] Create event data schemas in `packages/events/src/types/orguser-events.ts`
- [ ] Create request types in `packages/events/src/types/request-types.ts`
- [ ] Add command types in `packages/events/src/types/command-types.ts`
- [ ] Create data layer processor with event strategy
- [ ] Create TRPC service method with `executeAsyncRequest`
- [ ] Add TRPC router procedure
- [ ] Create response types in `packages/trpc/src/types/`
- [ ] Create frontend mutation hook with React Query
- [ ] Add error handling and notifications
- [ ] Implement cache invalidation
- [ ] Test event emission (success and failure)
- [ ] Test async request tracking
