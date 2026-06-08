import type { AIWorkflowJobResult } from '@/components/ai-workflows/useAIWorkflowService.types';
import { useJobMonitor } from '@/components/ai-workflows/useJobMonitor';
import type { AIWorkflowJobResultWithStatus } from '@/components/ai-workflows/useWorkflowRequest';
import { useWorkflowRequest } from '@/components/ai-workflows/useWorkflowRequest';

/**
 * Pulls together the functionality required to invoke a workflow and monitor the
 * resultant job for updates.
 * @param workflowApiEndpoint To call to invoke the workflow
 */
export const useAIWorkflowService = <TState>(workflowApiEndpoint: string) => {
  const { invokeWorkflow } = useWorkflowRequest<TState>();
  const { watchJob } = useJobMonitor<TState>(30_000);

  const monitorJobProgress = async (
    job: AIWorkflowJobResultWithStatus<TState> | null
  ): Promise<AIWorkflowJobResult<TState>> => {
    if (job) {
      if (job.status === 'failed') {
        throw new Error(
          `Encountered an error from the workflow invocation. Error: ${job.error}`
        );
      } else if (job.status === 'completed') {
        return job;
      } else {
        return await watchJob(job.streamLocation);
      }
    } else {
      throw new Error(
        'Encountered an error on the server when trying to invoke the workflow - no job was created'
      );
    }
  };

  /**
   * Invokes the workflow
   */
  const runWorkflow = async (
    workflowBodyBuilder: () => unknown
  ): Promise<AIWorkflowJobResult<TState>> => {
    const job = await invokeWorkflow(workflowApiEndpoint, workflowBodyBuilder);

    return await monitorJobProgress(job);
  };

  return {
    runWorkflow,
  };
};
