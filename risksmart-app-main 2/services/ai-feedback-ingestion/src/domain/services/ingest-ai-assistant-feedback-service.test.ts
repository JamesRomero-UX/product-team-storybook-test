import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  AIAssistantFeedbackInput,
  FeedbackObservabilityPublisher,
  FeedbackStoragePublisher,
} from '../types';
import { createAIAssistantFeedbackService } from './ingest-ai-assistant-feedback-service';

describe('AIAssistantFeedbackService', () => {
  let mockFeedbackStoragePublisher: FeedbackStoragePublisher;
  let mockFeedbackObservabilityPublisher: FeedbackObservabilityPublisher;

  beforeEach(() => {
    mockFeedbackStoragePublisher = {
      publish: vi.fn().mockResolvedValue(undefined),
    };
    mockFeedbackObservabilityPublisher = {
      submitFeedback: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('should ingest feedback and write to both destinations', async () => {
    const service = createAIAssistantFeedbackService({
      feedbackStoragePublisher: mockFeedbackStoragePublisher,
      feedbackObservabilityPublisher: mockFeedbackObservabilityPublisher,
    });

    const input: AIAssistantFeedbackInput = {
      sessionId: 'session-123',
      responseId: 'response-456',
      observabilityRunId: 'run-789',
      feedbackType: 'thumbs_up',
      comment: 'Great response!',
    };

    const result = await service.ingest('tenant-abc', 'user-123', input);

    // Verify feedback record structure
    expect(result).toMatchObject({
      tenantId: 'tenant-abc',
      userId: 'user-123',
      workstream: 'ai-assistant',
      observabilityRunId: 'run-789',
      feedbackType: 'thumbs_up',
      comment: 'Great response!',
      values: {
        sessionId: 'session-123',
        responseId: 'response-456',
      },
    });
    expect(result.id).toBeDefined();
    expect(result.timestamp).toBeDefined();

    // Verify Firehose was called
    expect(mockFeedbackStoragePublisher.publish).toHaveBeenCalledWith(
      'tenant-abc',
      expect.objectContaining({
        workstream: 'ai-assistant',
        feedbackType: 'thumbs_up',
      })
    );

    // Verify LangSmith was called with correct score
    expect(
      mockFeedbackObservabilityPublisher.submitFeedback
    ).toHaveBeenCalledWith({
      runId: 'run-789',
      score: 1, // thumbs_up = 1
      comment: 'Great response!',
    });
  });

  it('should map thumbs_down to score 0', async () => {
    const service = createAIAssistantFeedbackService({
      feedbackStoragePublisher: mockFeedbackStoragePublisher,
      feedbackObservabilityPublisher: mockFeedbackObservabilityPublisher,
    });

    const input: AIAssistantFeedbackInput = {
      sessionId: 'session-123',
      responseId: 'response-456',
      observabilityRunId: 'run-789',
      feedbackType: 'thumbs_down',
    };

    await service.ingest('tenant-abc', 'user-123', input);

    expect(
      mockFeedbackObservabilityPublisher.submitFeedback
    ).toHaveBeenCalledWith({
      runId: 'run-789',
      score: 0, // thumbs_down = 0
      comment: undefined,
    });
  });

  it('should throw error if sessionId is missing', async () => {
    const service = createAIAssistantFeedbackService({
      feedbackStoragePublisher: mockFeedbackStoragePublisher,
      feedbackObservabilityPublisher: mockFeedbackObservabilityPublisher,
    });

    const input = {
      sessionId: '',
      responseId: 'response-456',
      observabilityRunId: 'run-789',
      feedbackType: 'thumbs_up',
    } as AIAssistantFeedbackInput;

    await expect(
      service.ingest('tenant-abc', 'user-123', input)
    ).rejects.toThrow('sessionId and responseId are required');
  });

  it('should throw error if responseId is missing', async () => {
    const service = createAIAssistantFeedbackService({
      feedbackStoragePublisher: mockFeedbackStoragePublisher,
      feedbackObservabilityPublisher: mockFeedbackObservabilityPublisher,
    });

    const input = {
      sessionId: 'session-123',
      responseId: '',
      observabilityRunId: 'run-789',
      feedbackType: 'thumbs_up',
    } as AIAssistantFeedbackInput;

    await expect(
      service.ingest('tenant-abc', 'user-123', input)
    ).rejects.toThrow('sessionId and responseId are required');
  });
});
