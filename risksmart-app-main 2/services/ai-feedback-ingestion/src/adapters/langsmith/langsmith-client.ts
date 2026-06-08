import { Client } from 'langsmith';

import type { FeedbackObservabilityPublisher } from '../../domain/types';

export const createLangSmithAdaptor = (config: {
  apiKey: string;
  endpoint?: string;
  workspaceId?: string;
}): FeedbackObservabilityPublisher => {
  const client = new Client({
    apiKey: config.apiKey,
    apiUrl: config.endpoint,
    workspaceId: config.workspaceId,
  });

  const submitFeedback = async (params: {
    runId: string;
    score: number;
    comment?: string;
  }): Promise<void> => {
    try {
      await client.createFeedback(params.runId, 'user-feedback', {
        score: params.score,
        comment: params.comment,
      });
    } catch (error) {
      // Enhance error with context for debugging
      const enhancedError = new Error(
        `LangSmith feedback submission failed: ${error instanceof Error ? error.message : String(error)}`
      );
      // Preserve original error properties
      if (error instanceof Error) {
        // LangSmith SDK errors extend Error with extra properties; instanceof narrows to Error only.
        const { statusCode, response } = error as {
          statusCode?: number;
          response?: unknown;
        };
        Object.assign(enhancedError, {
          originalError: error,
          statusCode,
          response,
        });
      }
      throw enhancedError;
    }
  };

  return { submitFeedback };
};
