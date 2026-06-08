import { useCallback } from 'react';

import type { AIWorkflowJobResult } from '@/components/ai-workflows/useAIWorkflowService.types';
import { useAIWorkflowFetch } from '@/utils/useAIWorkflowFetch';

export type JobServerStatus = 'processing' | 'completed' | 'failed' | 'queued';

export interface AIWorkflowJobResultWithStatus<
  T,
> extends AIWorkflowJobResult<T> {
  status: JobServerStatus;
}

export const useWorkflowRequest = <TState>() => {
  const { authedAIWorkflowFetch } = useAIWorkflowFetch();

  const invokeWorkflow: (
    apiEndpoint: string,
    requestBodyBuilder: () => unknown
  ) => Promise<AIWorkflowJobResultWithStatus<TState>> = useCallback(
    async (apiEndpoint: string, requestBodyBuilder: () => unknown) => {
      const body = requestBodyBuilder();

      const result = await authedAIWorkflowFetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Response-Case': 'camel',
        },
        body: JSON.stringify(body),
      });

      if (!result.ok) {
        throw new Error(
          `Encountered an error whilst trying to start the workflow. Error: ${await result.text()}`
        );
      }

      return await result.json();
    },
    [authedAIWorkflowFetch]
  );

  return {
    invokeWorkflow,
  };
};
