import {
  type AIAssistantFeedback,
  type AIAssistantFeedbackInput,
  createAIAssistantFeedback,
  type FeedbackObservabilityPublisher,
  type FeedbackStoragePublisher,
} from '../types';
import {
  handleIngestionResults,
  toIngestionResult,
} from './handle-ingestion-results';

export interface AIAssistantFeedbackServiceDeps {
  feedbackStoragePublisher: FeedbackStoragePublisher;
  feedbackObservabilityPublisher: FeedbackObservabilityPublisher;
}

export interface AIAssistantFeedbackService {
  ingest: (
    tenantId: string,
    userId: string,
    input: AIAssistantFeedbackInput
  ) => Promise<AIAssistantFeedback>;
}

export const createAIAssistantFeedbackService = (
  deps: AIAssistantFeedbackServiceDeps
): AIAssistantFeedbackService => {
  const ingest = async (
    tenantId: string,
    userId: string,
    input: AIAssistantFeedbackInput
  ): Promise<AIAssistantFeedback> => {
    // Create validated feedback object via factory
    const feedback = createAIAssistantFeedback({ tenantId, userId, input });

    // Write to both destinations - Promise.allSettled captures successes and failures
    const [storageResult, feedbackResult] = await Promise.allSettled([
      deps.feedbackStoragePublisher.publish(tenantId, feedback),
      deps.feedbackObservabilityPublisher.submitFeedback({
        runId: input.observabilityRunId,
        score: input.feedbackType === 'thumbs_up' ? 1 : 0,
        comment: input.comment,
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
