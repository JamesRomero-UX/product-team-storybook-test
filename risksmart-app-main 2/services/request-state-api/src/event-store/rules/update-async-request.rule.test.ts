import type { UpdateAsyncRequest } from '@risksmart-app/events/src/types/command-types';
import {
  AsyncRequestEvent,
  ObjectEvent,
  PermissionsEvent,
} from '@risksmart-app/events/src/types/common';
import type {
  ObjectCreated,
  ObjectDeleted,
  ObjectDeletionFailed,
  OrgUserEventMetadata,
  OrgUserEventTypes,
  OrgUserPermissionsUpdated,
} from '@risksmart-app/events/src/types/orguser-events';
import type { StateUpdaterInput } from 'src/event-store/db/processor';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { InputEventTypes } from '../aggregator/inputs';
import type { OutputEventTypes } from '../aggregator/outputs';
import type { RequestState, RequestStateTask } from '../aggregator/types';
import { RequestStateTaskStatus } from '../aggregator/types';
import { updateAsyncRequestRule } from './update-async-request.rule';

// Mock console.log to avoid noise in tests
vi.mock('console', () => ({
  log: vi.fn(),
}));

describe('updateAsyncRequestRule', () => {
  const mockPublish = vi.fn();

  const mockMetadata = {
    eventId: 'test-event-id',
    version: '1.0',
    timestamp: '2025-09-24T10:00:00Z',
    domain: 'test',
    service: 'test-service',
    correlationId: 'test-correlation-id',
    userId: 'test-user-id',
    tenant: 'test-tenant',
    orgKey: 'test-org',
  };

  const createMockOrgUserInput = (
    state: RequestState,
    request: OrgUserEventTypes
  ): StateUpdaterInput<
    RequestState,
    InputEventTypes,
    OutputEventTypes,
    UpdateAsyncRequest<OrgUserEventTypes, OrgUserEventMetadata>
  > => ({
    state,
    current: {
      type: AsyncRequestEvent.UpdateAsyncRequest,
      data: { request },
      metadata: mockMetadata,
    },
    pastInboundEvents: [],
    newInboundEvents: [],
    all: [],
    currentIndex: 0,
    stateIndex: 0,
    publish: mockPublish,
  });

  const createMockPermissionsInput = (
    state: RequestState,
    request: OrgUserEventTypes
  ): StateUpdaterInput<
    RequestState,
    InputEventTypes,
    OutputEventTypes,
    UpdateAsyncRequest<OrgUserEventTypes, OrgUserEventMetadata>
  > => ({
    state,
    current: {
      type: AsyncRequestEvent.UpdateAsyncRequest,
      data: { request },
      metadata: mockMetadata,
    },
    pastInboundEvents: [],
    newInboundEvents: [],
    all: [],
    currentIndex: 0,
    stateIndex: 0,
    publish: mockPublish,
  });

  const createMockState = (
    tasks: Record<string, RequestStateTask> = {}
  ): RequestState => ({
    correlationId: 'test-correlation-id',
    tenant: 'test-tenant',
    orgKey: 'test-org',
    userId: 'test-user-id',
    tasks,
    response: undefined,
    error: undefined,
  });

  const createObjectCreatedEvent = (
    objectType = 'action_update'
  ): ObjectCreated => ({
    type: ObjectEvent.ObjectCreated,
    data: {
      objectType,
      objectId: 'object-123',
    },
    metadata: {
      eventId: 'test-event-id',
      version: '1.0',
      timestamp: '2025-09-24T10:00:00Z',
      domain: 'test',
      service: 'test-service',
      correlationId: 'test-correlation-id',
      userId: 'test-user-id',
      tenant: 'test-tenant',
      orgKey: 'test-org',
    },
  });

  const createOrgUserPermissionsUpdatedEvent = (
    objectType = 'action_update',
    objectId = 'object-123'
  ): OrgUserPermissionsUpdated => ({
    type: PermissionsEvent.PermissionsUpdated,
    data: {
      objectType,
      objectId,
    },
    metadata: {
      eventId: 'test-event-id',
      version: '1.0',
      timestamp: '2025-09-24T10:00:00Z',
      domain: 'test',
      service: 'test-service',
      correlationId: 'test-correlation-id',
      userId: 'test-user-id',
      tenant: 'test-tenant',
      orgKey: 'test-org',
    },
  });

  const createObjectDeletedEvent = (
    objectType = 'action_update',
    objectId = 'object-123'
  ): ObjectDeleted => ({
    type: ObjectEvent.ObjectDeleted,
    data: {
      objectType,
      objectId,
    },
    metadata: {
      eventId: 'test-event-id',
      version: '1.0',
      timestamp: '2025-09-24T10:00:00Z',
      domain: 'test',
      service: 'test-service',
      correlationId: 'test-correlation-id',
      userId: 'test-user-id',
      tenant: 'test-tenant',
      orgKey: 'test-org',
    },
  });

  const createObjectDeletionFailedEvent = (
    objectType = 'action_update',
    objectId = 'object-123',
    error = 'Deletion failed'
  ): ObjectDeletionFailed => ({
    type: ObjectEvent.ObjectDeletionFailed,
    data: {
      objectType,
      objectId,
      error,
    },
    metadata: {
      eventId: 'test-event-id',
      version: '1.0',
      timestamp: '2025-09-24T10:00:00Z',
      domain: 'test',
      service: 'test-service',
      correlationId: 'test-correlation-id',
      userId: 'test-user-id',
      tenant: 'test-tenant',
      orgKey: 'test-org',
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when task exists in state', () => {
    it('should mark existing task as COMPLETE', () => {
      // Arrange
      const initialState = createMockState({
        'OBJECT_CREATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectCreated,
          objectType: 'action_update',
        },
        'PERMISSIONS_UPDATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: PermissionsEvent.PermissionsUpdated,
          objectType: 'action_update',
        },
      });
      const input = createMockOrgUserInput(
        initialState,
        createObjectCreatedEvent('action_update')
      );

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert
      expect(result.tasks['OBJECT_CREATED:action_update']?.status).toBe(
        'COMPLETE'
      );
      expect(result.tasks['PERMISSIONS_UPDATED:action_update']?.status).toBe(
        'PENDING'
      ); // unchanged
      expect(result.tasks['OBJECT_CREATED:action_update']?.objectId).toBe(
        'object-123'
      );
    });

    it('should preserve other task properties when updating status', () => {
      // Arrange
      const initialState = createMockState({
        'OBJECT_CREATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectCreated,
          objectType: 'action_update',
          customProperty: 'test-value',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });
      const input = createMockOrgUserInput(
        initialState,
        createObjectCreatedEvent('action_update')
      );

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert
      expect(result.tasks['OBJECT_CREATED:action_update']).toEqual({
        status: RequestStateTaskStatus.COMPLETE,
        eventType: ObjectEvent.ObjectCreated,
        objectType: 'action_update',
        objectId: 'object-123',
        customProperty: 'test-value',
      });
    });

    it('should not update task when objectType does not match', () => {
      // Arrange
      const payload = createObjectCreatedEvent('action'); // Different object type
      const initialState = createMockState({
        'OBJECT_CREATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectCreated,
          objectType: 'action_update',
        },
      });
      const input = createMockOrgUserInput(initialState, payload);

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert
      expect(result.tasks['OBJECT_CREATED:action_update']?.status).toBe(
        'PENDING'
      ); // Still pending
      expect(result.response).toBeUndefined();
    });

    it('should update task when objectType matches', () => {
      // Arrange
      const payload = createObjectCreatedEvent('action_update');
      const initialState = createMockState({
        'OBJECT_CREATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectCreated,
          objectType: 'action_update',
        },
      });
      const input = createMockOrgUserInput(initialState, payload);

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert
      expect(result.tasks['OBJECT_CREATED:action_update']?.status).toBe(
        'COMPLETE'
      );
    });
  });

  describe('when no task matches the event type', () => {
    it('should not modify tasks when no task eventType matches', () => {
      // Arrange - task monitors PERMISSIONS_UPDATED, but incoming event is OBJECT_CREATED
      const initialState = createMockState({
        'PERMISSIONS_UPDATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: PermissionsEvent.PermissionsUpdated,
          objectType: 'action_update',
        },
      });
      const input = createMockOrgUserInput(
        initialState,
        createObjectCreatedEvent()
      );

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toEqual({
        'PERMISSIONS_UPDATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: PermissionsEvent.PermissionsUpdated,
          objectType: 'action_update',
        },
      });
      expect(result.response).toBeUndefined();
    });

    it('should not create new tasks', () => {
      // Arrange - empty state, incoming OBJECT_CREATED has nothing to match
      const initialState = createMockState({});
      const input = createMockOrgUserInput(
        initialState,
        createObjectCreatedEvent()
      );

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toEqual({});
      expect(result.response).toBeUndefined();
    });
  });

  describe('when state.tasks is undefined', () => {
    it('should handle undefined state.tasks gracefully', () => {
      // Arrange
      const initialState = createMockState();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialState.tasks = undefined as any;
      const input = createMockOrgUserInput(
        initialState,
        createObjectCreatedEvent()
      );

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert
      expect(result.tasks).toBeUndefined();
      expect(result.response).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle different EventTypes payloads', () => {
      // Arrange
      const initialState = createMockState({
        'PERMISSIONS_UPDATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: PermissionsEvent.PermissionsUpdated,
          objectType: 'action_update',
        },
      });
      const input = createMockPermissionsInput(
        initialState,
        createOrgUserPermissionsUpdatedEvent()
      );

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert
      expect(result.tasks['PERMISSIONS_UPDATED:action_update']?.status).toBe(
        'COMPLETE'
      );
    });

    it('should return the same state reference', () => {
      // Arrange
      const initialState = createMockState({
        'OBJECT_CREATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectCreated,
          objectType: 'action_update',
        },
      });
      const input = createMockOrgUserInput(
        initialState,
        createObjectCreatedEvent('action_update')
      );

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert
      expect(result).toBe(initialState); // Same reference
      expect(result.tasks['OBJECT_CREATED:action_update']?.status).toBe(
        'COMPLETE'
      );
    });

    it('should handle multiple tasks with same event type but different object types', () => {
      // Arrange
      const initialState = createMockState({
        'OBJECT_CREATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectCreated,
          objectType: 'action_update',
        },
        'OBJECT_CREATED:action': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectCreated,
          objectType: 'action',
        },
      });
      const input = createMockOrgUserInput(
        initialState,
        createObjectCreatedEvent('action_update')
      );

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert
      expect(result.tasks['OBJECT_CREATED:action_update']?.status).toBe(
        'COMPLETE'
      );
      expect(result.tasks['OBJECT_CREATED:action']?.status).toBe(
        RequestStateTaskStatus.PENDING
      ); // unchanged
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workflow: multiple tasks', () => {
      // Arrange
      const initialState = createMockState({
        'OBJECT_CREATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectCreated,
          objectType: 'action_update',
        },
        'PERMISSIONS_UPDATED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: PermissionsEvent.PermissionsUpdated,
          objectType: 'action_update',
        },
        'OBJECT_UPDATED:other_type': {
          status: RequestStateTaskStatus.COMPLETE,
          eventType: ObjectEvent.ObjectUpdated,
          objectType: 'other_type',
        },
      });

      // Act 1: Update OBJECT_CREATED
      let input: Parameters<typeof updateAsyncRequestRule>[0] =
        createMockOrgUserInput(
          initialState,
          createObjectCreatedEvent('action_update')
        );
      let result = updateAsyncRequestRule(input);

      // Assert 1
      expect(result.tasks['OBJECT_CREATED:action_update']?.status).toBe(
        'COMPLETE'
      );
      expect(result.tasks['PERMISSIONS_UPDATED:action_update']?.status).toBe(
        'PENDING'
      );

      // Act 2: Update PERMISSIONS_UPDATED
      input = createMockPermissionsInput(
        result,
        createOrgUserPermissionsUpdatedEvent()
      );
      result = updateAsyncRequestRule(input);

      // Assert 2
      expect(result.tasks['OBJECT_CREATED:action_update']?.status).toBe(
        'COMPLETE'
      );
      expect(result.tasks['PERMISSIONS_UPDATED:action_update']?.status).toBe(
        'COMPLETE'
      );
      expect(result.tasks['OBJECT_UPDATED:other_type']?.status).toBe(
        RequestStateTaskStatus.COMPLETE
      );
    });
  });

  describe('objectId-aware task matching (batch operations)', () => {
    it('should match task with objectId when event has matching objectId', () => {
      // Arrange - Task with specific objectId (batch delete scenario)
      const initialState = createMockState({
        'OBJECT_DELETED:action_update:object-123': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
          objectType: 'action_update',
          objectId: 'object-123',
        },
        'OBJECT_DELETED:action_update:object-456': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
          objectType: 'action_update',
          objectId: 'object-456',
        },
      });
      const input = createMockOrgUserInput(
        initialState,
        createObjectDeletedEvent('action_update', 'object-123')
      );

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert - Only matching objectId task is completed
      expect(
        result.tasks['OBJECT_DELETED:action_update:object-123']?.status
      ).toBe('COMPLETE');
      expect(
        result.tasks['OBJECT_DELETED:action_update:object-456']?.status
      ).toBe('PENDING');
    });

    it('should not match task with objectId when event has different objectId', () => {
      // Arrange
      const initialState = createMockState({
        'OBJECT_DELETED:action_update:object-123': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
          objectType: 'action_update',
          objectId: 'object-123',
        },
      });
      const input = createMockOrgUserInput(
        initialState,
        createObjectDeletedEvent('action_update', 'different-object')
      );

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert - Task should remain pending
      expect(
        result.tasks['OBJECT_DELETED:action_update:object-123']?.status
      ).toBe('PENDING');
    });

    it('should match task without objectId for backward compatibility', () => {
      // Arrange - Task without objectId (legacy behavior)
      const initialState = createMockState({
        'OBJECT_DELETED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
          objectType: 'action_update',
          // No objectId - matches any event with same eventType/objectType
        },
      });
      const input = createMockOrgUserInput(
        initialState,
        createObjectDeletedEvent('action_update', 'any-object')
      );

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert - Task without objectId should match
      expect(result.tasks['OBJECT_DELETED:action_update']?.status).toBe(
        'COMPLETE'
      );
      expect(result.tasks['OBJECT_DELETED:action_update']?.objectId).toBe(
        'any-object'
      );
    });

    it('should prefer exact objectId match over loose match', () => {
      // Arrange - Mix of tasks with and without objectId
      const initialState = createMockState({
        'OBJECT_DELETED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
          objectType: 'action_update',
          // No objectId - loose match
        },
        'OBJECT_DELETED:action_update:object-123': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
          objectType: 'action_update',
          objectId: 'object-123', // Exact match
        },
      });
      const input = createMockOrgUserInput(
        initialState,
        createObjectDeletedEvent('action_update', 'object-123')
      );

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert - Only exact match is updated, loose match remains pending
      expect(
        result.tasks['OBJECT_DELETED:action_update:object-123']?.status
      ).toBe('COMPLETE');
      expect(result.tasks['OBJECT_DELETED:action_update']?.status).toBe(
        'PENDING'
      );
    });

    it('should fall back to loose match when no exact objectId match exists', () => {
      // Arrange
      const initialState = createMockState({
        'OBJECT_DELETED:action_update': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
          objectType: 'action_update',
          // No objectId - loose match available
        },
        'OBJECT_DELETED:action_update:object-456': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
          objectType: 'action_update',
          objectId: 'object-456', // Different objectId
        },
      });
      const input = createMockOrgUserInput(
        initialState,
        createObjectDeletedEvent('action_update', 'object-123')
      );

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert - Falls back to loose match (task without objectId)
      expect(result.tasks['OBJECT_DELETED:action_update']?.status).toBe(
        'COMPLETE'
      );
      expect(
        result.tasks['OBJECT_DELETED:action_update:object-456']?.status
      ).toBe('PENDING');
    });

    it('should handle batch delete with multiple per-object tasks completing individually', () => {
      // Arrange - Multiple tasks for batch delete
      const initialState = createMockState({
        'OBJECT_DELETED:action_update:object-1': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
          objectType: 'action_update',
          objectId: 'object-1',
        },
        'OBJECT_DELETED:action_update:object-2': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
          objectType: 'action_update',
          objectId: 'object-2',
        },
        'OBJECT_DELETED:action_update:object-3': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
          objectType: 'action_update',
          objectId: 'object-3',
        },
      });

      // Act 1: First object deleted
      let input = createMockOrgUserInput(
        initialState,
        createObjectDeletedEvent('action_update', 'object-1')
      );
      let result = updateAsyncRequestRule(input);

      // Assert 1
      expect(
        result.tasks['OBJECT_DELETED:action_update:object-1']?.status
      ).toBe('COMPLETE');
      expect(
        result.tasks['OBJECT_DELETED:action_update:object-2']?.status
      ).toBe('PENDING');
      expect(
        result.tasks['OBJECT_DELETED:action_update:object-3']?.status
      ).toBe('PENDING');

      // Act 2: Second object deleted
      input = createMockOrgUserInput(
        result,
        createObjectDeletedEvent('action_update', 'object-2')
      );
      result = updateAsyncRequestRule(input);

      // Assert 2
      expect(
        result.tasks['OBJECT_DELETED:action_update:object-1']?.status
      ).toBe('COMPLETE');
      expect(
        result.tasks['OBJECT_DELETED:action_update:object-2']?.status
      ).toBe('COMPLETE');
      expect(
        result.tasks['OBJECT_DELETED:action_update:object-3']?.status
      ).toBe('PENDING');

      // Act 3: Third object deleted
      input = createMockOrgUserInput(
        result,
        createObjectDeletedEvent('action_update', 'object-3')
      );
      result = updateAsyncRequestRule(input);

      // Assert 3 - All complete
      expect(
        result.tasks['OBJECT_DELETED:action_update:object-1']?.status
      ).toBe('COMPLETE');
      expect(
        result.tasks['OBJECT_DELETED:action_update:object-2']?.status
      ).toBe('COMPLETE');
      expect(
        result.tasks['OBJECT_DELETED:action_update:object-3']?.status
      ).toBe('COMPLETE');
    });

    it('should handle failure event with objectId for batch operations', () => {
      // Arrange
      const initialState = createMockState({
        'OBJECT_DELETED:action_update:object-1': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
          objectType: 'action_update',
          objectId: 'object-1',
        },
        'OBJECT_DELETED:action_update:object-2': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
          objectType: 'action_update',
          objectId: 'object-2',
        },
      });
      const input = createMockOrgUserInput(
        initialState,
        createObjectDeletionFailedEvent(
          'action_update',
          'object-1',
          'Permission denied'
        )
      );

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert - Only the failed object's task is marked as failed
      expect(
        result.tasks['OBJECT_DELETED:action_update:object-1']?.status
      ).toBe('FAILED');
      expect(
        result.tasks['OBJECT_DELETED:action_update:object-2']?.status
      ).toBe('PENDING');
      expect(result.error).toContain('Permission denied');
    });

    it('should not match task when objectType does not match even if objectId matches', () => {
      // Arrange
      const initialState = createMockState({
        'OBJECT_DELETED:action:object-123': {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
          objectType: 'action', // Different objectType
          objectId: 'object-123',
        },
      });
      const input = createMockOrgUserInput(
        initialState,
        createObjectDeletedEvent('action_update', 'object-123')
      );

      // Act
      const result = updateAsyncRequestRule(input);

      // Assert
      expect(result.tasks['OBJECT_DELETED:action:object-123']?.status).toBe(
        'PENDING'
      );
    });
  });
});
