# Delete Processor Pattern - Critical Requirements

## Overview

Delete processors in the data layer must validate which objects were actually deleted from the database to ensure accurate audit trails and prevent silent failures.

## The Problem

Without validation, delete processors can:
- Return HTTP 204 success even when no rows were deleted
- Emit audit events for objects that weren't actually deleted
- Hide errors from clients when invalid IDs are sent
- Create misleading event streams for downstream consumers

## The Solution

### 1. Repository Pattern

Delete repositories **MUST** return the IDs that were actually deleted:

```typescript
/**
 * Delete multiple objects by IDs
 * Returns the IDs that were actually deleted
 */
deleteMany: async (ids: string[]): Promise<string[]> => {
  try {
    logger.info('Deleting multiple objects', {
      ids,
      count: ids.length,
    });

    const result = await db(async (tx) => {
      return tx
        .delete(table)
        .where(inArray(table.Id, ids))
        .returning({ Id: table.Id });
    });

    const deletedIds = result.map(r => r.Id);

    logger.info('Deleted objects', {
      requestedIds: ids,
      deletedIds,
      affectedRows: result.length,
    });

    return deletedIds;
  } catch (error) {
    logger.error('Failed to delete objects', {
      error,
      ids,
    });
    throw error;
  }
}
```

### 2. Processor Pattern

Processors must validate the returned IDs and handle three scenarios:

```typescript
import { NotFound } from 'http-errors';

export const createProcessor =
  ({ repository }: ProcessorDependencies) =>
  async ({
    payload,
    context,
  }: {
    payload: { ids: string[] };
    context: ServiceContext;
  }): Promise<string[]> => {
    logger.info('Processing batch delete', {
      userId: context.userId,
      requestedIds: payload.ids,
      count: payload.ids.length,
    });

    // Repository returns array of actually deleted IDs
    const deletedIds = await repository.deleteMany(payload.ids);

    // CRITICAL: Throw NotFound if zero rows were deleted
    if (deletedIds.length === 0) {
      throw new NotFound('None of the specified objects were found');
    }

    // Log warning if some IDs were not found (partial success)
    const missingIds = payload.ids.filter(id => !deletedIds.includes(id));
    if (missingIds.length > 0) {
      logger.warn('Some objects were not found', {
        requestedIds: payload.ids,
        deletedIds,
        missingIds,
      });
    }

    logger.info('Successfully deleted objects', {
      requestedIds: payload.ids,
      deletedIds,
      deletedCount: deletedIds.length,
    });

    // Return only actually deleted IDs
    return deletedIds;
  };
```

### 3. Handler Pattern

The handler must pass only actually deleted IDs to the event strategy:

```typescript
export const deleteObjectsProcessor = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  const { tenant, orgKey } = extractServiceContext(event);
  const db = await getDatabaseConnection({ tenant, orgKey });
  const repository = createRepository(db);

  const processor = createProcessor({ repository });

  const eventBridge = new EventBridgeClient({});
  const objectEventStrategy = new ObjectEventStrategy(
    'object_type',
    'delete',
    eventBridge,
    logger
  );

  return createHttpMutationHandler<typeof deleteSchema>()
    .withSchema(deleteSchema)
    .withObjectName('object_type')
    .withEventStrategy(objectEventStrategy)
    .withPermissions(({ payload }) => {
      const result: PermissionCheck[][] = [];
      for (const id of payload.ids) {
        result.push([
          { objectName: 'object_type', action: 'delete' },
          { objectName: 'rs_node', action: 'delete', objectId: id },
        ]);
      }
      return result;
    })
    .withHandler(async (event, context) => {
      // Processor returns only actually deleted IDs
      const deletedIds = await processor({
        payload: context.payload,
        context: context.serviceContext,
      });

      return {
        response: deletedResponse({ event, objectType: 'object-type' }),
        strategyData: {
          // CRITICAL: Only IDs that were actually deleted
          objectIds: deletedIds,
        },
      };
    })
    .execute(event, context);
};
```

## Three Scenarios

### Scenario 1: Total Success (All IDs Deleted)

**Input:** `{ ids: ['id-1', 'id-2', 'id-3'] }`

**Repository returns:** `['id-1', 'id-2', 'id-3']`

**Processor behavior:**
- Returns all IDs
- Logs success
- No warnings

**HTTP Response:** `204 No Content`

**Events Emitted:** 3 `ObjectDeleted` events (one per ID)

### Scenario 2: Total Failure (No IDs Found)

**Input:** `{ ids: ['invalid-1', 'invalid-2'] }`

**Repository returns:** `[]`

**Processor behavior:**
- Throws `NotFound` error
- Error message: "None of the specified objects were found"

**HTTP Response:** `404 Not Found`

**Events Emitted:** No success events (middleware handles failure events)

### Scenario 3: Partial Success (Some IDs Deleted)

**Input:** `{ ids: ['id-1', 'invalid-2', 'id-3'] }`

**Repository returns:** `['id-1', 'id-3']`

**Processor behavior:**
- Returns `['id-1', 'id-3']`
- Logs warning about missing IDs: `['invalid-2']`

**HTTP Response:** `204 No Content`

**Events Emitted:** 2 `ObjectDeleted` events (only for `id-1` and `id-3`)

**Why partial success doesn't fail:**
- Allows bulk operations to partially succeed
- Client can track which IDs were deleted via events
- Matches Drizzle's behavior (delete non-existent rows = no-op)

## Alternative Pattern: All-or-Nothing

Some use cases require atomic deletes (all IDs must exist):

```typescript
deleteMany: async (ids: string[]): Promise<void> => {
  await db(async (tx) => {
    const result = await tx
      .delete(table)
      .where(inArray(table.Id, ids))
      .returning({ Id: table.Id });

    // Rollback if not all IDs were deleted
    if (result.length !== ids.length) {
      logger.warn('Mismatch in deleted count, rolling back', {
        expectedCount: ids.length,
        actualCount: result.length,
      });
      tx.rollback();
    }
  });
}
```

**When to use:**
- Transactional integrity required (e.g., deleting parent+children)
- Business rules require all-or-nothing semantics
- Client explicitly requested atomic behavior

**Trade-offs:**
- Fails entire operation if one ID is invalid
- Less forgiving for bulk operations
- May be more intuitive for some use cases

## Testing Pattern

Tests must cover all three scenarios:

```typescript
describe('DELETE /objects (batch)', () => {
  it('should delete all objects when all IDs exist', async () => {
    const ids = ['id-1', 'id-2'];
    mockDeleteMany.mockResolvedValue(ids);

    const result = await processor({ payload: { ids }, context });

    expect(result).toEqual(ids);
  });

  it('should throw NotFound when no IDs were deleted', async () => {
    const ids = ['invalid-1'];
    mockDeleteMany.mockResolvedValue([]);

    await expect(
      processor({ payload: { ids }, context })
    ).rejects.toThrow(NotFound);
    await expect(
      processor({ payload: { ids }, context })
    ).rejects.toThrow('None of the specified objects were found');
  });

  it('should succeed with partial deletion', async () => {
    const ids = ['id-1', 'id-2', 'id-3'];
    mockDeleteMany.mockResolvedValue(['id-1', 'id-3']); // id-2 not found

    const result = await processor({ payload: { ids }, context });

    expect(result).toEqual(['id-1', 'id-3']);
  });

  it('should throw error when database fails', async () => {
    const ids = ['id-1'];
    mockDeleteMany.mockRejectedValue(new Error('Database error'));

    await expect(
      processor({ payload: { ids }, context })
    ).rejects.toThrow('Database error');
  });
});
```

## Benefits

✅ **Accurate Audit Trail** - Events reflect actual database state
✅ **Clear Feedback** - Clients know which IDs were deleted
✅ **No Silent Failures** - Errors thrown when nothing was deleted
✅ **Partial Success Support** - Bulk operations can partially succeed
✅ **Downstream Integrity** - Event consumers see accurate data
✅ **Better Debugging** - Logs show exactly what happened

## Migration Checklist

When updating an existing delete processor:

- [ ] Repository `deleteMany` returns `string[]` (deleted IDs)
- [ ] Processor validates `deletedIds.length > 0`
- [ ] Processor throws `NotFound` when zero deleted
- [ ] Processor logs warning for partial success
- [ ] Processor returns `deletedIds` (not requested IDs)
- [ ] Handler sets `strategyData.objectIds = deletedIds`
- [ ] Tests cover all three scenarios (success, failure, partial)
- [ ] Logger statements include both requested and deleted IDs

## Reference Implementation

See: `services/data-layer/src/handlers/http/processors/action-updates/delete.ts`

This processor demonstrates the complete pattern with validation, logging, and proper event emission.
