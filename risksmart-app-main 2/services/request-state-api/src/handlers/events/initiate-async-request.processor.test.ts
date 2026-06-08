import type {
  CommandTypeNames,
  InitiateAsyncRequest,
} from '@risksmart-app/events/src/types/command-types';
import { AsyncRequestEvent } from '@risksmart-app/events/src/types/common';
import type { RequestTypes } from '@risksmart-app/events/src/types/request-types';
import type { EventBridgeEvent } from 'aws-lambda';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies - must mock dynamo-client before facets since facets imports it
vi.mock('src/utils/dynamo-client', () => ({
  dynamoClient: {},
  getTableName: vi.fn().mockReturnValue('mock-table'),
}));
vi.mock('src/event-store/aggregator/facets');
vi.mock('src/utils/logger');

describe('processInitiateAsyncRequestEvent', () => {
  const mockAppendToRequest = vi.fn();
  const mockLogger = {
    appendKeys: vi.fn().mockReturnThis(),
    info: vi.fn(),
    error: vi.fn(),
  };

  let processInitiateAsyncRequestEvent: (
    event: EventBridgeEvent<string, InitiateAsyncRequest<RequestTypes>>
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
    const processor = await import('./initiate-async-request.processor');
    processInitiateAsyncRequestEvent =
      processor.processInitiateAsyncRequestEvent;
  });

  const createMockEvent = (
    subType: CommandTypeNames = 'CREATE_ACTION_UPDATE',
    overrides: Partial<
      EventBridgeEvent<string, InitiateAsyncRequest<RequestTypes>>
    > = {}
  ): EventBridgeEvent<string, InitiateAsyncRequest<RequestTypes>> => ({
    version: '0',
    id: 'test-event-id',
    'detail-type': AsyncRequestEvent.InitiateAsyncRequest,
    source: 'test.source',
    account: '123456789',
    time: '2025-09-30T10:00:00Z',
    region: 'us-east-1',
    resources: [],
    detail: {
      type: AsyncRequestEvent.InitiateAsyncRequest,
      data: {
        subType,
        request: {
          Id: 'action-update-123',
          Description: 'Test action update description',
          ParentActionId: 'parent-action-456',
          Title: 'Test Action Update',
          CustomAttributeData: null,
        } as RequestTypes,
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
    it('should process InitiateAsyncRequest event successfully', async () => {
      // Arrange
      const event = createMockEvent();
      mockAppendToRequest.mockResolvedValue(undefined);

      // Act
      await processInitiateAsyncRequestEvent(event);

      // Assert
      expect(mockLogger.appendKeys).toHaveBeenCalledWith({
        tenant: 'test-tenant',
        orgKey: 'test-org',
        userId: 'test-user-id',
        correlationId: 'test-correlation-id',
        type: AsyncRequestEvent.InitiateAsyncRequest,
        subType: 'CREATE_ACTION_UPDATE',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing InitiateAsyncRequest event',
        { event }
      );

      expect(mockAppendToRequest).toHaveBeenCalledWith(
        'test-correlation-id',
        'test-tenant',
        {
          eventName: AsyncRequestEvent.InitiateAsyncRequest,
          event: event.detail,
        }
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'InitiateAsyncRequest processing completed successfully'
      );
    });

    it('should handle different subTypes correctly', async () => {
      // Arrange
      const testSubTypes = [
        'CREATE_ACTION_UPDATE',
        'CREATE_RISK_ASSESSMENT',
        'UPDATE_USER_PROFILE',
        'CUSTOM_WORKFLOW',
      ] as CommandTypeNames[];

      mockAppendToRequest.mockResolvedValue(undefined);

      for (const subType of testSubTypes) {
        // Act
        const event = createMockEvent(subType);
        await processInitiateAsyncRequestEvent(event);

        // Assert
        expect(mockLogger.appendKeys).toHaveBeenCalledWith(
          expect.objectContaining({
            subType,
            type: AsyncRequestEvent.InitiateAsyncRequest,
          })
        );

        expect(mockAppendToRequest).toHaveBeenCalledWith(
          'test-correlation-id',
          'test-tenant',
          {
            eventName: AsyncRequestEvent.InitiateAsyncRequest,
            event: event.detail,
          }
        );
      }
    });

    it('should handle different metadata values correctly', async () => {
      // Arrange
      const event = createMockEvent('CREATE_ACTION_UPDATE');
      event.detail.metadata = {
        ...event.detail.metadata,
        tenant: 'different-tenant',
        orgKey: 'different-org',
        userId: 'different-user',
        correlationId: 'different-correlation',
      };
      mockAppendToRequest.mockResolvedValue(undefined);

      // Act
      await processInitiateAsyncRequestEvent(event);

      // Assert
      expect(mockLogger.appendKeys).toHaveBeenCalledWith({
        tenant: 'different-tenant',
        orgKey: 'different-org',
        userId: 'different-user',
        correlationId: 'different-correlation',
        type: AsyncRequestEvent.InitiateAsyncRequest,
        subType: 'CREATE_ACTION_UPDATE',
      });

      expect(mockAppendToRequest).toHaveBeenCalledWith(
        'different-correlation',
        'different-tenant',
        {
          eventName: AsyncRequestEvent.InitiateAsyncRequest,
          event: event.detail,
        }
      );
    });

    it('should handle different detail-type values correctly', async () => {
      // Arrange
      const event = createMockEvent();
      event['detail-type'] = 'CUSTOM_DETAIL_TYPE';
      mockAppendToRequest.mockResolvedValue(undefined);

      // Act
      await processInitiateAsyncRequestEvent(event);

      // Assert
      expect(mockAppendToRequest).toHaveBeenCalledWith(
        'test-correlation-id',
        'test-tenant',
        {
          eventName: 'CUSTOM_DETAIL_TYPE',
          event: event.detail,
        }
      );
    });
  });

  describe('error handling', () => {
    it('should handle appendToRequest errors correctly', async () => {
      // Arrange
      const event = createMockEvent();
      const error = new Error('Failed to append to request');
      mockAppendToRequest.mockRejectedValue(error);

      // Act & Assert
      await expect(processInitiateAsyncRequestEvent(event)).rejects.toThrow(
        'Failed to append to request'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error processing InitiateAsyncRequest event',
        error
      );
    });

    it('should handle different error types correctly', async () => {
      // Arrange
      const event = createMockEvent();
      const errors = [
        new Error('Network error'),
        new TypeError('Type error'),
        new ReferenceError('Reference error'),
        { message: 'Custom error object' },
      ];

      for (const error of errors) {
        mockAppendToRequest.mockRejectedValue(error);

        // Act & Assert
        await expect(processInitiateAsyncRequestEvent(event)).rejects.toThrow();

        expect(mockLogger.error).toHaveBeenCalledWith(
          'Error processing InitiateAsyncRequest event',
          error
        );
      }
    });

    it('should still set logger keys even when appendToRequest fails', async () => {
      // Arrange
      const event = createMockEvent();
      const error = new Error('Failed to append');
      mockAppendToRequest.mockRejectedValue(error);

      // Act
      await expect(() =>
        processInitiateAsyncRequestEvent(event)
      ).rejects.toThrowError();

      // Assert
      expect(mockLogger.appendKeys).toHaveBeenCalledWith({
        tenant: 'test-tenant',
        orgKey: 'test-org',
        userId: 'test-user-id',
        correlationId: 'test-correlation-id',
        type: AsyncRequestEvent.InitiateAsyncRequest,
        subType: 'CREATE_ACTION_UPDATE',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing InitiateAsyncRequest event',
        { event }
      );
    });
  });

  describe('integration scenarios', () => {
    it('should ensure complex request data is passed in the event payload', async () => {
      // Arrange
      const event = createMockEvent();
      event.detail.data.request = {
        Id: 'complex-id-123',
        Description: 'Complex description with special chars: !@#$%^&*()',
        ParentActionId: 'parent-complex-456',
        Title: 'Complex Action Update Title',
        CustomAttributeData: {
          customField1: 'value1',
          customField2: 123,
          customField3: true,
        },
      } as RequestTypes;

      mockAppendToRequest.mockResolvedValue(undefined);

      // Act
      await processInitiateAsyncRequestEvent(event);

      // Assert
      expect(mockAppendToRequest).toHaveBeenCalledWith(
        'test-correlation-id',
        'test-tenant',
        {
          eventName: AsyncRequestEvent.InitiateAsyncRequest,
          event: event.detail,
        }
      );
    });

    it('should handle minimal event data correctly', async () => {
      // Arrange
      const event = createMockEvent();
      event.detail.data.request = {
        Id: 'minimal-id',
        Description: '',
        ParentActionId: '',
        Title: '',
        CustomAttributeData: null,
      } as RequestTypes;

      mockAppendToRequest.mockResolvedValue(undefined);

      // Act
      await processInitiateAsyncRequestEvent(event);

      // Assert
      expect(mockAppendToRequest).toHaveBeenCalledWith(
        'test-correlation-id',
        'test-tenant',
        {
          eventName: AsyncRequestEvent.InitiateAsyncRequest,
          event: event.detail,
        }
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'InitiateAsyncRequest processing completed successfully'
      );
    });

    it('should maintain proper call order', async () => {
      // Arrange
      const event = createMockEvent();
      mockAppendToRequest.mockResolvedValue(undefined);

      // Act
      await processInitiateAsyncRequestEvent(event);

      // Assert
      // Verify all functions were called
      expect(mockLogger.appendKeys).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledTimes(2); // Once for processing start, once for completion
      expect(mockAppendToRequest).toHaveBeenCalledTimes(1);

      // Verify specific calls
      expect(mockLogger.appendKeys).toHaveBeenCalledWith({
        tenant: 'test-tenant',
        orgKey: 'test-org',
        userId: 'test-user-id',
        correlationId: 'test-correlation-id',
        type: AsyncRequestEvent.InitiateAsyncRequest,
        subType: 'CREATE_ACTION_UPDATE',
      });

      expect(mockLogger.info).toHaveBeenNthCalledWith(
        1,
        'Processing InitiateAsyncRequest event',
        expect.any(Object)
      );
      expect(mockLogger.info).toHaveBeenNthCalledWith(
        2,
        'InitiateAsyncRequest processing completed successfully'
      );
    });
  });
});
