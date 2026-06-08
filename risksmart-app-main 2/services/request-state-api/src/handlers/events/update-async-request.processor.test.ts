import type { UpdateAsyncRequest } from '@risksmart-app/events/src/types/command-types';
import {
  AsyncRequestEvent,
  ObjectEvent,
  PermissionsEvent,
} from '@risksmart-app/events/src/types/common';
import type {
  OrgUserEventMetadata,
  OrgUserEventTypes,
} from '@risksmart-app/events/src/types/orguser-events';
import type { EventBridgeEvent } from 'aws-lambda';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies - must mock dynamo-client before facets since facets imports it
vi.mock('src/utils/dynamo-client', () => ({
  dynamoClient: {},
  getTableName: vi.fn().mockReturnValue('mock-table'),
}));
vi.mock('src/event-store/aggregator/facets');
vi.mock('src/utils/logger');

describe('processUpdateAsyncRequestEvent', () => {
  const mockAppendToRequest = vi.fn();
  const mockLogger = {
    appendKeys: vi.fn().mockReturnThis(),
    info: vi.fn(),
    error: vi.fn(),
  };

  let processUpdateAsyncRequestEvent: (
    event: EventBridgeEvent<string, OrgUserEventTypes>
  ) => Promise<void>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Set up mocks within beforeEach
    const { appendToRequest } =
      await import('src/event-store/aggregator/facets');
    vi.mocked(appendToRequest).mockImplementation(mockAppendToRequest);

    const { getLogger } = await import('src/utils/logger');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    vi.mocked(getLogger).mockReturnValue(mockLogger as any);

    // Import the function being tested after mocks are set up
    const processor = await import('./update-async-request.processor');
    processUpdateAsyncRequestEvent = processor.processUpdateAsyncRequestEvent;
  });

  const createMockObjectCreatedEvent = (
    objectType = 'action_update',
    overrides: Partial<EventBridgeEvent<string, OrgUserEventTypes>> = {}
  ): EventBridgeEvent<string, OrgUserEventTypes> => ({
    version: '0',
    id: 'test-event-id',
    'detail-type': ObjectEvent.ObjectCreated,
    source: 'test.source',
    account: '123456789',
    time: '2025-09-30T10:00:00Z',
    region: 'us-east-1',
    resources: [],
    detail: {
      type: ObjectEvent.ObjectCreated,
      data: {
        objectType,
        objectId: 'object-123',
      },
      metadata: {
        eventId: 'test-event-id',
        version: '1.0',
        timestamp: '2025-09-30T10:00:00Z',
        domain: 'test',
        service: 'test-service',
        correlationId: 'test-correlation-id',
        userId: 'test-user-id',
        tenant: 'test-tenant',
        orgKey: 'test-org',
      },
    },
    ...overrides,
  });

  const createMockPermissionsUpdatedEvent = (
    objectType = 'action_update',
    objectId = 'object-123',
    overrides: Partial<EventBridgeEvent<string, OrgUserEventTypes>> = {}
  ): EventBridgeEvent<string, OrgUserEventTypes> => ({
    version: '0',
    id: 'test-event-id',
    'detail-type': PermissionsEvent.PermissionsUpdated,
    source: 'test.source',
    account: '123456789',
    time: '2025-09-30T10:00:00Z',
    region: 'us-east-1',
    resources: [],
    detail: {
      type: PermissionsEvent.PermissionsUpdated,
      data: {
        objectType,
        objectId,
      },
      metadata: {
        eventId: 'test-event-id',
        version: '1.0',
        timestamp: '2025-09-30T10:00:00Z',
        domain: 'test',
        service: 'test-service',
        correlationId: 'test-correlation-id',
        userId: 'test-user-id',
        tenant: 'test-tenant',
        orgKey: 'test-org',
      },
    },
    ...overrides,
  });

  describe('successful processing', () => {
    it('should process OBJECT_CREATED event successfully', async () => {
      // Arrange
      const event = createMockObjectCreatedEvent('action_update');
      mockAppendToRequest.mockResolvedValue(undefined);

      // Act
      await processUpdateAsyncRequestEvent(event);

      // Assert
      expect(mockLogger.appendKeys).toHaveBeenCalledWith({
        tenant: 'test-tenant',
        orgKey: 'test-org',
        userId: 'test-user-id',
        correlationId: 'test-correlation-id',
        type: ObjectEvent.ObjectCreated,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing UpdateAsyncRequest event',
        { event }
      );

      const expectedInputEvent: UpdateAsyncRequest<
        OrgUserEventTypes,
        OrgUserEventMetadata
      > = {
        type: AsyncRequestEvent.UpdateAsyncRequest,
        data: {
          request: event.detail,
        },
        metadata: event.detail.metadata,
      };

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Constructed UpdateAsyncRequest event:',
        JSON.stringify(expectedInputEvent, null, 2)
      );

      expect(mockAppendToRequest).toHaveBeenCalledWith(
        'test-correlation-id',
        'test-tenant',
        {
          eventName: AsyncRequestEvent.UpdateAsyncRequest,
          event: expectedInputEvent,
        }
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'UpdateAsyncRequest processing completed successfully'
      );
    });

    it('should process PERMISSIONS_UPDATED event successfully', async () => {
      // Arrange
      const event = createMockPermissionsUpdatedEvent();
      mockAppendToRequest.mockResolvedValue(undefined);

      // Act
      await processUpdateAsyncRequestEvent(event);

      // Assert
      expect(mockLogger.appendKeys).toHaveBeenCalledWith({
        tenant: 'test-tenant',
        orgKey: 'test-org',
        userId: 'test-user-id',
        correlationId: 'test-correlation-id',
        type: PermissionsEvent.PermissionsUpdated,
      });

      const expectedInputEvent: UpdateAsyncRequest<
        OrgUserEventTypes,
        OrgUserEventMetadata
      > = {
        type: AsyncRequestEvent.UpdateAsyncRequest,
        data: {
          request: event.detail,
        },
        metadata: event.detail.metadata,
      };

      expect(mockAppendToRequest).toHaveBeenCalledWith(
        'test-correlation-id',
        'test-tenant',
        {
          eventName: AsyncRequestEvent.UpdateAsyncRequest,
          event: expectedInputEvent,
        }
      );
    });

    it('should handle different metadata values correctly', async () => {
      // Arrange
      const event = createMockObjectCreatedEvent('action_update');
      event.detail.metadata = {
        ...event.detail.metadata,
        tenant: 'different-tenant',
        orgKey: 'different-org',
        userId: 'different-user',
        correlationId: 'different-correlation',
      };
      mockAppendToRequest.mockResolvedValue(undefined);

      // Act
      await processUpdateAsyncRequestEvent(event);

      // Assert
      expect(mockLogger.appendKeys).toHaveBeenCalledWith({
        tenant: 'different-tenant',
        orgKey: 'different-org',
        userId: 'different-user',
        correlationId: 'different-correlation',
        type: ObjectEvent.ObjectCreated,
      });

      expect(mockAppendToRequest).toHaveBeenCalledWith(
        'different-correlation',
        'different-tenant',
        expect.objectContaining({
          eventName: AsyncRequestEvent.UpdateAsyncRequest,
        })
      );
    });

    it('should construct UpdateAsyncRequest event correctly', async () => {
      // Arrange
      const event = createMockObjectCreatedEvent('action_update');
      mockAppendToRequest.mockResolvedValue(undefined);

      // Act
      await processUpdateAsyncRequestEvent(event);

      // Assert
      const expectedInputEvent: UpdateAsyncRequest<
        OrgUserEventTypes,
        OrgUserEventMetadata
      > = {
        type: AsyncRequestEvent.UpdateAsyncRequest,
        data: {
          request: event.detail,
        },
        metadata: event.detail.metadata,
      };

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Constructed UpdateAsyncRequest event:',
        JSON.stringify(expectedInputEvent, null, 2)
      );

      expect(mockAppendToRequest).toHaveBeenCalledWith(
        'test-correlation-id',
        'test-tenant',
        {
          eventName: AsyncRequestEvent.UpdateAsyncRequest,
          event: expectedInputEvent,
        }
      );
    });
  });

  describe('error handling', () => {
    it('should handle appendToRequest errors correctly', async () => {
      // Arrange
      const event = createMockObjectCreatedEvent('action_update');
      const error = new Error('Failed to append to request');
      mockAppendToRequest.mockRejectedValue(error);

      // Act & Assert
      await expect(processUpdateAsyncRequestEvent(event)).rejects.toThrow(
        'Failed to append to request'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error processing UpdateAsyncRequest event',
        error
      );
    });

    it('should handle different error types correctly', async () => {
      // Arrange
      const event = createMockObjectCreatedEvent('action_update');
      const errors = [
        new Error('Network error'),
        new TypeError('Type error'),
        new ReferenceError('Reference error'),
        { message: 'Custom error object' },
      ];

      for (const error of errors) {
        mockAppendToRequest.mockRejectedValue(error);

        // Act & Assert
        await expect(processUpdateAsyncRequestEvent(event)).rejects.toThrow();

        expect(mockLogger.error).toHaveBeenCalledWith(
          'Error processing UpdateAsyncRequest event',
          error
        );
      }
    });

    it('should still set logger keys even when appendToRequest fails', async () => {
      // Arrange
      const event = createMockObjectCreatedEvent('action_update');
      const error = new Error('Failed to append');
      mockAppendToRequest.mockRejectedValue(error);

      // Act
      try {
        await processUpdateAsyncRequestEvent(event);
      } catch {
        // Expected to throw
      }

      // Assert
      expect(mockLogger.appendKeys).toHaveBeenCalledWith({
        tenant: 'test-tenant',
        orgKey: 'test-org',
        userId: 'test-user-id',
        correlationId: 'test-correlation-id',
        type: ObjectEvent.ObjectCreated,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing UpdateAsyncRequest event',
        { event }
      );
    });

    it('should still log constructed event even when appendToRequest fails', async () => {
      // Arrange
      const event = createMockObjectCreatedEvent('action_update');
      const error = new Error('Failed to append');
      mockAppendToRequest.mockRejectedValue(error);

      // Act
      try {
        await processUpdateAsyncRequestEvent(event);
      } catch {
        // Expected to throw
      }

      // Assert
      const expectedInputEvent: UpdateAsyncRequest<
        OrgUserEventTypes,
        OrgUserEventMetadata
      > = {
        type: AsyncRequestEvent.UpdateAsyncRequest,
        data: {
          request: event.detail,
        },
        metadata: event.detail.metadata,
      };

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Constructed UpdateAsyncRequest event:',
        JSON.stringify(expectedInputEvent, null, 2)
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex event data correctly', async () => {
      // Arrange
      const event = createMockObjectCreatedEvent('action_update');
      // Modify event data to simulate complex scenario
      event.detail.data = {
        objectType: 'action_update',
        objectId: 'complex-action-id-789',
      };
      mockAppendToRequest.mockResolvedValue(undefined);

      // Act
      await processUpdateAsyncRequestEvent(event);

      // Assert
      const expectedInputEvent: UpdateAsyncRequest<
        OrgUserEventTypes,
        OrgUserEventMetadata
      > = {
        type: AsyncRequestEvent.UpdateAsyncRequest,
        data: {
          request: event.detail,
        },
        metadata: event.detail.metadata,
      };

      expect(mockAppendToRequest).toHaveBeenCalledWith(
        'test-correlation-id',
        'test-tenant',
        {
          eventName: AsyncRequestEvent.UpdateAsyncRequest,
          event: expectedInputEvent,
        }
      );
    });

    it('should handle minimal event data correctly', async () => {
      // Arrange
      const event = createMockPermissionsUpdatedEvent();
      mockAppendToRequest.mockResolvedValue(undefined);

      // Act
      await processUpdateAsyncRequestEvent(event);

      // Assert
      const expectedInputEvent: UpdateAsyncRequest<
        OrgUserEventTypes,
        OrgUserEventMetadata
      > = {
        type: AsyncRequestEvent.UpdateAsyncRequest,
        data: {
          request: event.detail,
        },
        metadata: event.detail.metadata,
      };

      expect(mockAppendToRequest).toHaveBeenCalledWith(
        'test-correlation-id',
        'test-tenant',
        {
          eventName: AsyncRequestEvent.UpdateAsyncRequest,
          event: expectedInputEvent,
        }
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'UpdateAsyncRequest processing completed successfully'
      );
    });

    it('should maintain proper call order', async () => {
      // Arrange
      const event = createMockObjectCreatedEvent('action_update');
      mockAppendToRequest.mockResolvedValue(undefined);

      // Act
      await processUpdateAsyncRequestEvent(event);

      // Assert - Verify all functions were called correctly
      expect(mockLogger.appendKeys).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledTimes(3); // Processing start, constructed event, completion
      expect(mockAppendToRequest).toHaveBeenCalledTimes(1);

      // Verify specific calls
      expect(mockLogger.appendKeys).toHaveBeenCalledWith({
        tenant: 'test-tenant',
        orgKey: 'test-org',
        userId: 'test-user-id',
        correlationId: 'test-correlation-id',
        type: ObjectEvent.ObjectCreated,
      });

      expect(mockLogger.info).toHaveBeenNthCalledWith(
        1,
        'Processing UpdateAsyncRequest event',
        expect.any(Object)
      );
      expect(mockLogger.info).toHaveBeenNthCalledWith(
        2,
        'Constructed UpdateAsyncRequest event:',
        expect.any(String)
      );
      expect(mockLogger.info).toHaveBeenNthCalledWith(
        3,
        'UpdateAsyncRequest processing completed successfully'
      );
    });

    it('should handle different EventTypes consistently', async () => {
      // Arrange
      const events = [
        createMockObjectCreatedEvent('action_update'),
        createMockPermissionsUpdatedEvent(),
      ];

      mockAppendToRequest.mockResolvedValue(undefined);

      // Act & Assert
      for (const event of events) {
        await processUpdateAsyncRequestEvent(event);

        expect(mockLogger.appendKeys).toHaveBeenCalledWith(
          expect.objectContaining({
            correlationId: 'test-correlation-id',
            tenant: 'test-tenant',
            type: event.detail.type,
          })
        );

        expect(mockAppendToRequest).toHaveBeenCalledWith(
          'test-correlation-id',
          'test-tenant',
          expect.objectContaining({
            eventName: AsyncRequestEvent.UpdateAsyncRequest,
            event: expect.objectContaining({
              type: AsyncRequestEvent.UpdateAsyncRequest,
              data: expect.objectContaining({
                request: event.detail,
              }),
            }),
          })
        );
      }
    });
  });
});
