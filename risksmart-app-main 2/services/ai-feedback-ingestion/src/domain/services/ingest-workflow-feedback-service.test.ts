import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  FeedbackObservabilityPublisher,
  FeedbackStoragePublisher,
  WorkflowFeedbackInput,
} from '../types';
import { createWorkflowFeedbackService } from './ingest-workflow-feedback-service';

describe('WorkflowFeedbackService', () => {
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
    const service = createWorkflowFeedbackService({
      feedbackStoragePublisher: mockFeedbackStoragePublisher,
      feedbackObservabilityPublisher: mockFeedbackObservabilityPublisher,
    });

    const input: WorkflowFeedbackInput = {
      workflowName: 'Suggest controls',
      observabilityRunId: 'run-789',
      feedbackType: 'thumbs_up',
      comment: 'Accurate assessment!',
    };

    const result = await service.ingest('tenant-abc', 'user-123', input);

    // Verify feedback record structure
    expect(result).toMatchObject({
      tenantId: 'tenant-abc',
      userId: 'user-123',
      workstream: 'workflow',
      observabilityRunId: 'run-789',
      feedbackType: 'thumbs_up',
      comment: 'Accurate assessment!',
      values: {
        workflowName: 'Suggest controls',
      },
    });
    expect(result.id).toBeDefined();
    expect(result.timestamp).toBeDefined();

    // Verify Firehose was called
    expect(mockFeedbackStoragePublisher.publish).toHaveBeenCalledWith(
      'tenant-abc',
      expect.objectContaining({
        workstream: 'workflow',
        feedbackType: 'thumbs_up',
      })
    );

    // Verify LangSmith was called with correct score
    expect(
      mockFeedbackObservabilityPublisher.submitFeedback
    ).toHaveBeenCalledWith({
      runId: 'run-789',
      score: 1, // thumbs_up = 1
      comment: 'Accurate assessment!',
    });
  });

  it('should map thumbs_down to score 0', async () => {
    const service = createWorkflowFeedbackService({
      feedbackStoragePublisher: mockFeedbackStoragePublisher,
      feedbackObservabilityPublisher: mockFeedbackObservabilityPublisher,
    });

    const input: WorkflowFeedbackInput = {
      observabilityRunId: 'run-789',
      feedbackType: 'thumbs_down',
      workflowName: 'Suggest controls',
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

  it('should throw error if workflow name is missing', async () => {
    const service = createWorkflowFeedbackService({
      feedbackStoragePublisher: mockFeedbackStoragePublisher,
      feedbackObservabilityPublisher: mockFeedbackObservabilityPublisher,
    });

    const input = {
      workflowName: '',
      observabilityRunId: 'run-789',
      feedbackType: 'thumbs_up',
    } as WorkflowFeedbackInput;

    await expect(
      service.ingest('tenant-abc', 'user-123', input)
    ).rejects.toThrow('workflowName is required');
  });
});
