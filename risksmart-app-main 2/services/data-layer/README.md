# Data Layer Service

Handles request-state-api commands and performs DB mutations with a clean V3 architecture.

## Architecture Overview

The data layer uses a modern, extensible architecture with:

- **Factory Pattern with DI** - Processors receive dependencies via factory functions
- **Builder Pattern** - `createHttpMutationHandler()` with fluent API
- **Middleware Chain** - Validation → Permissions → Events
- **Repository Pattern** - Typed repositories with factory functions
- **Event Strategy Pattern** - Generic, extensible event handling for any event type
- **TRPC Integration** - Type-safe API layer with async request tracking

## Event Strategy Pattern

The event system uses a strategy pattern that allows flexible event emission without modifying middleware:

### Initial Event Strategies

1. **ObjectEventStrategy** - For object CRUD operations
   - Emits: `ObjectCreated`, `ObjectUpdated`, `ObjectDeleted`
   - Failure: `ObjectCreationFailed`, `ObjectUpdateFailed`, `ObjectDeletionFailed`

2. **FormEventStrategy** - For form configuration operations
   - Emits: `FormConfigured`
   - Failure: `FormConfigurationFailed`

### Delete Operations - Critical Requirements

Delete processors must validate which objects were actually deleted to prevent silent failures and maintain accurate audit trails.

**See:** [Delete Processor Pattern](./docs/delete-processor-pattern.md) for complete implementation guide.

**Key Requirements:**
- Repository `deleteMany()` must return array of actually deleted IDs
- Processor must throw `NotFound` when zero rows deleted
- Handler must set `strategyData.objectIds` to only deleted IDs
- Events emitted only for successfully deleted objects

### Example: Using Event Strategies in Processors

```typescript
// Object event example (obligation-impacts)
const eventBridge = new EventBridgeClient({});
const objectEventStrategy = new ObjectEventStrategy(
  'obligation_impact',
  'create',
  eventBridge,
  logger
);

return createHttpMutationHandler().withEventStrategy(objectEventStrategy);
// ... rest of configuration

// Form event example (form-fields)
const formEventStrategy = new FormEventStrategy('create', eventBridge, logger);

return createHttpMutationHandler().withEventStrategy(formEventStrategy);
// ... rest of configuration
```

### Running the Service via local stack

1. If not set, add correct variables in the the `cdk-stack` `.env` file. You can copy from `.env.example`:

```
TENANT_CONFIG_TABLE
LOCAL_DATABASE_CONNECTION_STRING
DYNAMODB_ENDPOINT
```

2. If not on, start the relevant containers from the root of the project:

- `docker-compose --profile v3 up --build -d --wait` to set up all the containers needed for local development.

3. If not set, add the following env variables in your terminal:

```
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=eu-west-2
```

4. Deploy tenant stack(only if not already deployed or changes made):

```
cd packages/tenant-deployer
pnpm run dev
```

5. Make sure request-api is deployed:

```
cd cdk-stack
pnpm run dev:request-api
```

6. Deploy the data layer stack:

```
pnpm run dev:data-layer
```

7. Start local Lambda services:

```
node scripts/dev.js
```

Events are routed automatically via the local event router.
