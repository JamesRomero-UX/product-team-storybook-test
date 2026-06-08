import { ExternalServiceError } from '../errors';
import {
  createWorkflowFeedback,
  type FeedbackObservabilityPublisher,
  type FeedbackStoragePublisher,
  type WorkflowFeedback,
  type WorkflowFeedbackInput,
} from '../types';
import {
  handleIngestionResults,
  toIngestionResult,
} from './handle-ingestion-results';

export interface WorkflowFeedbackServiceDeps {
  feedbackStoragePublisher: FeedbackStoragePublisher;
  feedbackObservabilityPublisher: FeedbackObservabilityPublisher;
}

export interface WorkflowFeedbackService {
  ingest: (
    tenantId: string,
    userId: string,
    input: WorkflowFeedbackInput
  ) => Promise<WorkflowFeedback>;
}

export const createWorkflowFeedbackService = (
  deps: WorkflowFeedbackServiceDeps
): WorkflowFeedbackService => {
  const ingest = async (
    tenantId: string,
    userId: string,
    input: WorkflowFeedbackInput
  ): Promise<WorkflowFeedback> => {
    // Create validated feedback object via factory
    const feedback = createWorkflowFeedback({ tenantId, userId, input });

    // Write to both destinations with individual error handling
    const [storageResult, feedbackResult] = await Promise.allSettled([
      deps.feedbackStoragePublisher
        .publish(tenantId, feedback)
        .catch((error) => {
          throw new ExternalServiceError(
            'Failed to publish feedback to storage',
            'storage',
            {
              feedbackId: feedback.id,
              tenantId,
              error: error instanceof Error ? error.message : String(error),
            }
          );
        }),
      deps.feedbackObservabilityPublisher
        .submitFeedback({
          runId: input.observabilityRunId,
          score: input.feedbackType === 'thumbs_up' ? 1 : 0,
          comment: input.comment,
        })
        .catch((error) => {
          throw new ExternalServiceError(
            'Failed to submit feedback to observability platform',
            'observability',
            {
              feedbackId: feedback.id,
              runId: input.observabilityRunId,
              error: error instanceof Error ? error.message : String(error),
            }
          );
        }),
    ]);

    // Handle any failures (throws if any destination failed)
    handleIngestionResults(
      [
        toIngestionResult('storage', storageResult),
        toIngestionResult('observability', feedbackResult),
      ],
      feedback.id
    );

    return feedback;
  };

  return { ingest };
};
