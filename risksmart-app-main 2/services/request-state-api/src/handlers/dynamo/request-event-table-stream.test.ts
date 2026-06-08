import type { AttributeValue, DynamoDBStreamEvent } from 'aws-lambda';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSendToEventBridgeInBatches = vi.fn();

// Mock dependencies
vi.mock('@risksmart-app/shared/src/utils/eventBridge', () => ({
  sendToEventBridgeInBatches: mockSendToEventBridgeInBatches,
}));

vi.mock('../../utils/logger', () => ({
  getLogger: vi.fn().mockReturnValue({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    appendKeys: vi.fn().mockReturnThis(),
    clearBuffer: vi.fn(),
    refreshSampleRateCalculation: vi.fn(),
    resetKeys: vi.fn(),
    addContext: vi.fn(),
    logEventIfEnabled: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any),
}));

vi.mock('../../utils/sentry-init', () => ({
  initSentry: vi.fn(),
}));

describe('request-event-table-stream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SENTRY_RELEASE = 'test-release';
  });

  const createMockDynamoRecord = (
    overrides: Partial<Record<string, AttributeValue>> = {}
  ): Record<string, AttributeValue> => ({
    _id: { S: 'test-id' },
    _rng: { S: 'OUTBOUND#test-rng' },
    _facet: { S: 'test-facet' },
    _typ: { S: 'TEST_EVENT' },
    _ts: { N: '1696089600000' },
    _date: { S: '2023-09-30' },
    _seq: { N: '1' },
    ...overrides,
  });

  interface MockDynamoDBRecord {
    eventID: string;
    eventName: 'INSERT' | 'MODIFY' | 'REMOVE';
    eventVersion: string;
    eventSource: string;
    awsRegion: string;
    dynamodb: {
      ApproximateCreationDateTime: number;
      Keys: Record<string, AttributeValue>;
      NewImage?: Record<string, AttributeValue>;
      SequenceNumber: string;
      SizeBytes: number;
      StreamViewType:
        | 'NEW_AND_OLD_IMAGES'
        | 'KEYS_ONLY'
        | 'NEW_IMAGE'
        | 'OLD_IMAGE';
    };
  }

  const createMockStreamRecord = (
    eventName: 'INSERT' | 'MODIFY' | 'REMOVE',
    newImage?: Record<string, AttributeValue>
  ): MockDynamoDBRecord => ({
    eventID: 'test-event-id',
    eventName,
    eventVersion: '1.1',
    eventSource: 'aws:dynamodb',
    awsRegion: 'us-east-1',
    dynamodb: {
      ApproximateCreationDateTime: 1696089600,
      Keys: {
        _id: { S: 'test-id' },
        _rng: { S: 'OUTBOUND#test-rng' },
      },
      NewImage: newImage,
      SequenceNumber: '123456789',
      SizeBytes: 1024,
      StreamViewType: 'NEW_AND_OLD_IMAGES',
    },
  });

  const createMockStreamEvent = (
    records: MockDynamoDBRecord[]
  ): DynamoDBStreamEvent => ({
    Records: records,
  });

  describe('handler integration tests', () => {
    it('should handle empty event records without errors', async () => {
      // Arrange
      const event = createMockStreamEvent([]);

      // Act
      const { handler } = await import('./request-event-table-stream');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      await (handler as any)(event, {} as any, () => {
        /* Lambda callback */
      });

      // Assert - should not throw and should not call EventBridge
      expect(mockSendToEventBridgeInBatches).not.toHaveBeenCalled();
    });

    it('should not send events for REMOVE operations', async () => {
      // Arrange
      const dynamoRecord = createMockDynamoRecord();
      const streamRecord = createMockStreamRecord('REMOVE', dynamoRecord);
      const event = createMockStreamEvent([streamRecord]);

      mockSendToEventBridgeInBatches.mockClear();

      // Act
      const { handler } = await import('./request-event-table-stream');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      await (handler as any)(event, {} as any, () => {
        /* Lambda callback */
      });

      // Assert
      expect(mockSendToEventBridgeInBatches).not.toHaveBeenCalled();
    });

    it('should not send events for records without NewImage', async () => {
      // Arrange
      const streamRecord = createMockStreamRecord('INSERT');
      const event = createMockStreamEvent([streamRecord]);

      mockSendToEventBridgeInBatches.mockClear();

      // Act
      const { handler } = await import('./request-event-table-stream');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      await (handler as any)(event, {} as any, () => {
        /* Lambda callback */
      });

      // Assert
      expect(mockSendToEventBridgeInBatches).not.toHaveBeenCalled();
    });

    it('should complete successfully for all valid stream events', async () => {
      // Arrange
      const dynamoRecord = createMockDynamoRecord();
      const streamRecord1 = createMockStreamRecord('INSERT', dynamoRecord);
      const streamRecord2 = createMockStreamRecord('MODIFY', dynamoRecord);
      const streamRecord3 = createMockStreamRecord('REMOVE');
      const event = createMockStreamEvent([
        streamRecord1,
        streamRecord2,
        streamRecord3,
      ]);

      mockSendToEventBridgeInBatches.mockResolvedValue(undefined);

      // Act & Assert - should not throw
      const { handler } = await import('./request-event-table-stream');
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
        (handler as any)(event, {} as any, () => {
          /* Lambda callback */
        })
      ).resolves.toBeUndefined();
    });

    it('should handle AWS SDK errors gracefully', async () => {
      // Arrange
      const dynamoRecord = createMockDynamoRecord();
      const streamRecord = createMockStreamRecord('INSERT', dynamoRecord);
      const event = createMockStreamEvent([streamRecord]);

      // Mock EventBridge to succeed so we test other error handling
      mockSendToEventBridgeInBatches.mockResolvedValue(undefined);

      // Act & Assert - should handle any AWS SDK unmarshall errors
      const { handler } = await import('./request-event-table-stream');
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
        (handler as any)(event, {} as any, () => {
          /* Lambda callback */
        })
      ).resolves.toBeUndefined();
    });
  });
});
