# Event Strategy Pattern

## Overview

The data layer uses a **Strategy Pattern** for event handling that provides a flexible, extensible way to emit events for any operation type without modifying the core middleware infrastructure.

## Problem It Solves

Previously, the data layer had separate `EventMiddleware` and `FormEventMiddleware` implementations, each hardcoded for specific event types. Adding new event types required:

1. Creating new middleware functions
2. Modifying the builder pattern
3. Updating the handler to choose the right middleware

This approach didn't scale and violated the Open/Closed Principle.

## Solution: Strategy Pattern

The strategy pattern separates event handling logic into pluggable strategies that can be injected into a generic middleware.

### Architecture

```
┌─────────────────────────────────────────┐
│   Generic EventMiddleware               │
│   - validateContext()                   │
│   - extractEventData()                  │
│   - emitSuccessEvent()                  │
│   - emitFailureEvent()                  │
└──────────────┬──────────────────────────┘
               │ uses
               ▼
┌─────────────────────────────────────────┐
│   EventStrategy (interface)             │
│   - validateContext()                   │
│   - extractEventData()                  │
│   - emitSuccessEvent()                  │
│   - emitFailureEvent()                  │
└──────────────┬──────────────────────────┘
               │ implemented by
               ▼
   ┌───────────┴───────────┬──────────────────┐
   │                       │                  │
   ▼                       ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Object      │  │  Form        │  │  Custom      │
│  Strategy    │  │  Strategy    │  │  Strategy    │
└──────────────┘  └──────────────┘  └──────────────┘
```

## EventStrategy Interface

```typescript
export interface EventStrategy {
  /**
   * Validates that the context has the required data for this event type
   * @throws Error if required data is missing
   */
  validateContext(context: ValidatedLambdaContext<unknown>): void;

  /**
   * Extracts event data from the handler context
   * Returns array since handlers can operate on multiple items (batch operations)
   */
  extractEventData(context: ValidatedLambdaContext<unknown>): EventData[];

  /**
   * Emits success event(s) for the operation
   */
  emitSuccessEvent(
    metadata: OrgUserEventMetadata,
    data: EventData
  ): Promise<void>;

  /**
   * Emits failure event(s) for the operation
   */
  emitFailureEvent(
    metadata: OrgUserEventMetadata,
    data: EventData,
    error: string
  ): Promise<void>;
}
```

## Built-in Strategies

### 1. ObjectEventStrategy (Default - Use This First)

For object CUD operations (create, update, delete). This is the default strategy for most of data layer operations.

**Events Emitted:**

- Success: `ObjectCreated`, `ObjectUpdated`, `ObjectDeleted`
- Failure: `ObjectCreationFailed`, `ObjectUpdateFailed`, `ObjectDeletionFailed`

**Example:**

```typescript
const objectEventStrategy = new ObjectEventStrategy(
  'obligation_impact', // Object type
  'create', // Operation type
  eventBridge, // EventBridge client
  logger // Logger instance
);
```

**Context Requirements:**

- Must have `context.strategyData.objectIds` array (string[])

**Use Cases:**

- Standard database objects (risks, controls, actions, etc.)
- Determine if an ObjectEventStrategy should be used, if the object type exists in `packages/domain/src/types/consts/object-type.ts`
- Any CRUD operation on a primary table which populates the node table
- Most business domain objects

**Delete Operations - Critical Requirements:**

Delete processors using ObjectEventStrategy **MUST**:

1. Return the list of actually deleted IDs from the processor
2. Validate that at least one ID was deleted (throw NotFound if zero)
3. Set `strategyData.objectIds` to only the actually deleted IDs
4. Log warnings for partial successes (some IDs not found)

Example:

```typescript
// Processor returns deleted IDs
const deletedIds = await repository.deleteMany(payload.ids);

if (deletedIds.length === 0) {
  throw new NotFound('None of the specified objects were found');
}

// Emit events only for actually deleted IDs
return {
  response: deletedResponse({ event, objectType: 'object-type' }),
  strategyData: {
    objectIds: deletedIds, // NOT payload.ids
  },
};
```

This prevents:
- Silent failures when invalid IDs are sent
- Misleading audit events for objects that weren't deleted
- Incorrect HTTP 204 responses when nothing was deleted

### 2. FormEventStrategy (Form Configuration Only)

For form field configuration operations (create, update, delete fields). Use ONLY for form-related operations.

**Events Emitted:**

- Success: `FormConfigured`
- Failure: `FormConfigurationFailed`

**Example:**

```typescript
const formEventStrategy = new FormEventStrategy(
  'create', // Operation type
  eventBridge, // EventBridge client
  logger // Logger instance
);
```

**Context Requirements:**

- Must have `context.strategyData.formFieldIds` array with `{ fieldId: string; parentType: string }[]`

**Use Cases:**

- Custom attribute field creation
- Form field configuration changes
- Form schema modifications

### 3. Domain-Specific Strategies (Preferred for New Domains)

**IMPORTANT:** For new event domains (user, user_group, custom_data_source, etc.), create a new strategy class.

**Benefits:**

- Better type safety with domain-specific validation
- Easier to test and maintain
- Clear separation of event domains
- Follows Open/Closed Principle
- Provides a reusable pattern for that domain

**Example: UserEventStrategy**

```typescript
/**
 * Strategy for user domain events (UserCreated, UserUpdated, UserDeleted)
 */
export class UserEventStrategy implements EventStrategy {
  private emitters: ReturnType<typeof createUserEventEmitters>;

  constructor(
    private operationType: OperationType,
    eventBridge: EventBridgeClient,
    logger: Logger
  ) {
    this.emitters = createUserEventEmitters(eventBridge, logger);
  }

  validateContext(context: ValidatedLambdaContext<unknown>): void {
    const userIds = context.strategyData?.userIds as string[] | undefined;
    if (!userIds || userIds.length === 0) {
      throw new Error('Missing user IDs in context for user event');
    }
  }

  extractEventData(context: ValidatedLambdaContext<unknown>): EventData[] {
    const userIds = (context.strategyData?.userIds as string[]) || [];
    return userIds.map((userId) => ({
      userId,
    }));
  }

  async emitSuccessEvent(
    metadata: OrgUserEventMetadata,
    data: EventData
  ): Promise<void> {
    const { userId } = data;
    if (!userId) {
      throw new Error('Missing userId in event data');
    }

    switch (this.operationType) {
      case 'create':
        return this.emitters.emitUserCreatedEvent(metadata, { userId });
      case 'update':
        return this.emitters.emitUserUpdatedEvent(metadata, { userId });
      case 'delete':
        return this.emitters.emitUserDeletedEvent(metadata, { userId });
    }
  }

  async emitFailureEvent(
    metadata: OrgUserEventMetadata,
    data: EventData,
    error: string
  ): Promise<void> {
    const { userId } = data;

    switch (this.operationType) {
      case 'create':
        return this.emitters.emitUserCreationFailedEvent(metadata, {
          error,
        });
      case 'update':
        if (!userId) throw new Error('Missing userId for update failure');
        return this.emitters.emitUserUpdateFailedEvent(metadata, {
          userId,
          error,
        });
      case 'delete':
        if (!userId) throw new Error('Missing userId for delete failure');
        return this.emitters.emitUserDeletionFailedEvent(metadata, {
          userId,
          error,
        });
    }
  }
}
```

**When to Create a Domain-Specific Strategy:**

- New event domain (user, user_group, custom_data_source, etc.)
- Multiple operations in the same domain
- Domain-specific validation requirements
- Will be used more than once

**Naming Convention:**

- Pattern: `{Domain}EventStrategy`
- Examples: `UserEventStrategy`, `UserGroupEventStrategy`, `CustomDataSourceEventStrategy`
- Location: `services/data-layer/src/handlers/http/utils/event-strategies.ts`

## Using Event Strategies in Processors

### Step 1: Create the Strategy

```typescript
// At the top of your processor function
const eventBridge = new EventBridgeClient({});
const eventStrategy = new FormEventStrategy('create', eventBridge, logger);
```

### Step 2: Inject into Handler Builder

```typescript
return createHttpMutationHandler()
  .withSchema(myRequestSchema)
  .withObjectName('my_object')
  .withEventStrategy(eventStrategy)  // ← Inject strategy here
  .withPermissions(() => [...])
  .withHandler(async (event, ctx) => {
    const result = await processor({...});

    return {
      response: createdResponse({...}),
      // Set strategy data that the event strategy will use
      strategyData: {
        formFieldIds: [{ fieldId: result.Id, parentType: ctx.payload.ParentType }],
        // or for object strategies:
        // objectIds: [result.Id],
      },
    };
  })
  .execute(event, context);
```

### Step 3: Return Strategy Data

The handler must return a `strategyData` object containing the fields that the strategy expects e.g:

- **ObjectEventStrategy** expects `strategyData: { objectIds: string[] }`
- **FormEventStrategy** expects `strategyData: { formFieldIds: { fieldId: string; parentType: string }[] }`

## Adding a New Event Type

Follow this pattern to add support for a new event type:

### 1. Define Event Schemas

In `packages/events/src/types/orguser-events.ts`:

```typescript
export const myNewEventDataSchema = z.object({
  myId: z.string(),
  additionalData: z.string().optional(),
});

export type MyNewEventData = z.infer<typeof myNewEventDataSchema>;

export const myNewEventSchema = orgUserEventSchema.extend({
  type: z.literal(EventType.MyNewEvent),
  data: myNewEventDataSchema,
});

export type MyNewEvent = z.infer<typeof myNewEventSchema>;
```

### 2. Create Event Emitters

In `services/data-layer/src/events/producers/data-event-producers.ts`:

```typescript
export const createMyNewEvent = (
  originalMetadata: OrgUserEventMetadata,
  changeData: MyNewEventData
): MyNewEvent => ({
  type: EventType.MyNewEvent,
  data: {
    myId: changeData.myId,
    additionalData: changeData.additionalData,
  },
  metadata: createEventMetadata(originalMetadata),
});

export const emitMyNewEvent = async (
  eventBridge: EventBridgeClient,
  logger: Logger,
  originalMetadata: OrgUserEventMetadata,
  data: MyNewEventData
) => {
  const event = createMyNewEvent(originalMetadata, data);
  // Emit to EventBridge
};
```

### 3. Create Strategy Instance

In your processor:

```typescript
const myEventStrategy = new FormEventStrategy({
  validateContext: (context) => {
    if (!context.myIds) throw new Error('Missing IDs');
  },
  extractEventData: (context) => context.myIds.map((id) => ({ myId: id })),
  emitSuccessEvent: async (metadata, data) => {
    await emitMyNewEvent(eventBridge, logger, metadata, data);
  },
  emitFailureEvent: async (metadata, data, error) => {
    await emitMyNewFailedEvent(eventBridge, logger, metadata, data, error);
  },
});
```

### 4. Use Generic Strategy Data

No need to extend context types! The `strategyData` property is already generic and can hold any data:

```typescript
// In your handler, return strategy data
return {
  response: createdResponse({...}),
  strategyData: {
    myIds: [result.Id], // Any custom data your strategy needs
    additionalData: { /* ... */ },
  },
};

// In your strategy, read from strategyData
validateContext(context: ValidatedLambdaContext<unknown>): void {
  const myIds = context.strategyData?.myIds as string[] | undefined;
  if (!myIds || myIds.length === 0) {
    throw new Error('Missing IDs in context');
  }
}
```

## Creating a Domain-Specific Strategy (Recommended Approach)

For new event domains (user, user_group, report, etc.), create a domain-specific strategy class.

### Step-by-Step Guide

**Step 1: Define Event Schemas**

In `packages/events/src/types/orguser-events.ts`:

```typescript
// Success events
export const userCreatedEventDataSchema = z.object({
  userId: z.string(),
});

export const userCreatedEventSchema = orgUserEventSchema.extend({
  type: z.literal(EventType.UserCreated),
  data: userCreatedEventDataSchema,
});

export type UserCreated = z.infer<typeof userCreatedEventSchema>;

// Failure events
export const userCreationFailedEventDataSchema = z.object({
  error: z.string(),
});

// Repeat for Updated, Deleted, etc.
```

**Step 2: Create Event Emitters**

In `services/data-layer/src/events/producers/data-event-producers.ts`:

```typescript
export const createUserEventEmitters = (
  eventBridge: EventBridgeClient,
  logger: Logger
) => {
  const emitEvent = async <T extends { type: EventType }>(
    event: T,
    logContext: Record<string, unknown>
  ) => {
    // Standard emit logic
  };

  return {
    emitUserCreatedEvent: async (metadata, data) => { ... },
    emitUserCreationFailedEvent: async (metadata, data) => { ... },
    emitUserUpdatedEvent: async (metadata, data) => { ... },
    emitUserUpdateFailedEvent: async (metadata, data) => { ... },
    emitUserDeletedEvent: async (metadata, data) => { ... },
    emitUserDeletionFailedEvent: async (metadata, data) => { ... },
  };
};
```

**Step 3: Create Strategy Class**

In `services/data-layer/src/handlers/http/utils/event-strategies.ts`:

```typescript
/**
 * Strategy for user domain events
 */
export class UserEventStrategy implements EventStrategy {
  private emitters: ReturnType<typeof createUserEventEmitters>;

  constructor(
    private operationType: OperationType,
    eventBridge: EventBridgeClient,
    logger: Logger
  ) {
    this.emitters = createUserEventEmitters(eventBridge, logger);
  }

  validateContext(context: ValidatedLambdaContext<unknown>): void {
    const userIds = context.strategyData?.userIds as string[] | undefined;
    if (!userIds || userIds.length === 0) {
      throw new Error('Missing user IDs in context');
    }
  }

  extractEventData(context: ValidatedLambdaContext<unknown>): EventData[] {
    const userIds = (context.strategyData?.userIds as string[]) || [];
    return userIds.map((userId) => ({ userId }));
  }

  async emitSuccessEvent(
    metadata: OrgUserEventMetadata,
    data: EventData
  ): Promise<void> {
    const { userId } = data;
    if (!userId) throw new Error('Missing userId');

    switch (this.operationType) {
      case 'create':
        return this.emitters.emitUserCreatedEvent(metadata, { userId });
      case 'update':
        return this.emitters.emitUserUpdatedEvent(metadata, { userId });
      case 'delete':
        return this.emitters.emitUserDeletedEvent(metadata, { userId });
    }
  }

  async emitFailureEvent(
    metadata: OrgUserEventMetadata,
    data: EventData,
    error: string
  ): Promise<void> {
    // Similar pattern for failure events
  }
}
```

**Step 4: Use in Processor**

```typescript
const eventBridge = new EventBridgeClient({});
const userEventStrategy = new UserEventStrategy('create', eventBridge, logger);

return createHttpMutationHandler()
  .withEventStrategy(userEventStrategy)
  .withHandler(async (event, ctx) => {
    const result = await processor({...});
    return {
      response: createdResponse({...}),
      strategyData: {
        userIds: [result.Id],
      },
    };
  })
  .execute(event, context);
```

### Why This Approach is Better

✅ **Type Safety** - Compile-time validation of event data
✅ **Testability** - Isolated unit tests for domain logic
✅ **Reusability** - Used across multiple processors in the same domain
✅ **Maintainability** - Domain logic is centralized
✅ **Documentation** - Self-documenting through class structure
✅ **Evolution** - Easy to extend with domain-specific logic

## Benefits

1. **Extensibility** - Add new event types without modifying middleware
2. **Type Safety** - Each strategy validates its own event data
3. **Testability** - Strategies can be unit tested in isolation
4. **Reusability** - Single middleware implementation for all event types
5. **Separation of Concerns** - Event logic is separate from handler logic
6. **Maintainability** - Changes to one event type don't affect others
7. **Domain-Driven Design** - Strategy classes align with business domains

## Testing Strategies

### Unit Testing a Strategy

```typescript
describe('FormEventStrategy', () => {
  let strategy: FormEventStrategy;
  let mockEventBridge: jest.Mocked<EventBridgeClient>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockEventBridge = createMockEventBridge();
    mockLogger = createMockLogger();
    strategy = new FormEventStrategy('create', mockEventBridge, mockLogger);
  });

  it('validates context has formFieldIds', () => {
    const context = { strategyData: { formFieldIds: [] } };
    expect(() => strategy.validateContext(context)).toThrow(
      'Missing form field IDs'
    );
  });

  it('extracts event data correctly', () => {
    const context = {
      strategyData: {
        formFieldIds: [
          { fieldId: 'field-1', parentType: 'risk' },
          { fieldId: 'field-2', parentType: 'control' },
        ],
      },
    };

    const eventData = strategy.extractEventData(context);

    expect(eventData).toHaveLength(2);
    expect(eventData[0]).toEqual({
      fieldId: 'field-1',
      parentType: 'risk',
      operation: 'create',
    });
  });

  it('emits success event', async () => {
    const metadata = createTestMetadata();
    const data = {
      fieldId: 'field-1',
      parentType: 'risk',
      operation: 'create',
    };

    await strategy.emitSuccessEvent(metadata, data);

    expect(mockEventBridge.putEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        Entries: expect.arrayContaining([
          expect.objectContaining({
            DetailType: 'FormConfigured',
          }),
        ]),
      })
    );
  });
});
```

## Reference Files

- **Strategy Interface**: `services/data-layer/src/handlers/http/utils/event-strategies.ts`
- **Generic Middleware**: `services/data-layer/src/handlers/http/utils/mutation-middleware.ts`
- **Builder Pattern**: `services/data-layer/src/handlers/http/utils/create-http-mutation-handler.ts`
- **Object Strategy Example**: `services/data-layer/src/handlers/http/processors/obligation-impacts/create.ts`
- **Form Strategy Example**: `services/data-layer/src/handlers/http/processors/form-fields/create.ts`
