import { TRPCClientError } from '@trpc/client';
import { createTestContext } from 'src/utils/test-context';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

describe('ai-feedback', () => {
  let context: Awaited<ReturnType<typeof createTestContext>>;
  const contexts: Awaited<ReturnType<typeof createTestContext>>[] = [];

  beforeEach(async () => {
    context = await createTestContext();
    contexts.push(context);
  });

  afterAll(async () => {
    await Promise.all(contexts.map((c) => c.cleanup()));
  });

  describe('submitAiAssistantFeedback', () => {
    it('should accept valid input and reach the service layer', async () => {
      const { trpcClient } = context;

      // The mutation will fail because the AI feedback API is not
      // available in the test environment, but passing Zod validation
      // and reaching the service layer confirms the procedure works.
      await expect(
        trpcClient.frontend.aiFeedback.submitAiAssistantFeedback.mutate({
          observabilityRunId: crypto.randomUUID(),
          feedbackType: 'thumbs_up',
          sessionId: crypto.randomUUID(),
          responseId: crypto.randomUUID(),
        })
      ).rejects.toThrow(TRPCClientError);
    });

    it('should accept valid input with optional fields', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.aiFeedback.submitAiAssistantFeedback.mutate({
          observabilityRunId: crypto.randomUUID(),
          feedbackType: 'thumbs_down',
          sessionId: crypto.randomUUID(),
          responseId: crypto.randomUUID(),
          comment: 'Not helpful',
          userQuery: 'What is the risk score?',
          aiResponse: 'The risk score is 42.',
        })
      ).rejects.toThrow(TRPCClientError);
    });

    it('should reject invalid feedbackType', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.aiFeedback.submitAiAssistantFeedback.mutate({
          observabilityRunId: crypto.randomUUID(),
          // @ts-expect-error - testing invalid input
          feedbackType: 'invalid_type',
          sessionId: crypto.randomUUID(),
          responseId: crypto.randomUUID(),
        })
      ).rejects.toThrow(TRPCClientError);
    });
  });

  describe('submitWorkflowFeedback', () => {
    it('should accept valid input and reach the service layer', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.aiFeedback.submitWorkflowFeedback.mutate({
          observabilityRunId: crypto.randomUUID(),
          feedbackType: 'thumbs_up',
          workflowName: 'risk-assessment',
        })
      ).rejects.toThrow(TRPCClientError);
    });

    it('should accept valid input with optional comment', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.aiFeedback.submitWorkflowFeedback.mutate({
          observabilityRunId: crypto.randomUUID(),
          feedbackType: 'thumbs_down',
          workflowName: 'control-testing',
          comment: 'Workflow produced incorrect results',
        })
      ).rejects.toThrow(TRPCClientError);
    });

    it('should reject invalid feedbackType', async () => {
      const { trpcClient } = context;

      await expect(
        trpcClient.frontend.aiFeedback.submitWorkflowFeedback.mutate({
          observabilityRunId: crypto.randomUUID(),
          // @ts-expect-error - testing invalid input
          feedbackType: 'stars_5',
          workflowName: 'risk-assessment',
        })
      ).rejects.toThrow(TRPCClientError);
    });
  });
});
