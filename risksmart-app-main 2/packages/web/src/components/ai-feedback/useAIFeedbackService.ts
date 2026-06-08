import { useMutation } from '@tanstack/react-query';

import { useTRPC } from '@/utils/trpc';

type BaseFeedbackData = {
  observabilityRunId: string;
  isPositiveFeedback: boolean;
  comment: string | undefined;
};

export type WorkflowFeedbackData = {
  workflowName: string;
} & BaseFeedbackData;

export type AIAssistantFeedbackData = {
  userQuery?: string;
  aiResponse?: string;
  sessionId: string;
  responseId: string;
} & BaseFeedbackData;

export type FeedbackData = WorkflowFeedbackData | AIAssistantFeedbackData;

function isWorkflowFeedback(
  feedback: FeedbackData
): feedback is WorkflowFeedbackData {
  return (feedback as WorkflowFeedbackData).workflowName !== undefined;
}

function isAIAssistantFeedback(
  feedback: FeedbackData
): feedback is AIAssistantFeedbackData {
  return (feedback as AIAssistantFeedbackData).sessionId !== undefined;
}

function isPositiveToFeedbackType(
  isPositiveFeedback: boolean
): 'thumbs_up' | 'thumbs_down' {
  return isPositiveFeedback ? 'thumbs_up' : 'thumbs_down';
}

export function useAIFeedbackService() {
  const trpc = useTRPC();

  const aiAssistantMutation = useMutation({
    ...trpc.frontend.aiFeedback.submitAiAssistantFeedback.mutationOptions({}),
    throwOnError: false,
  });

  const workflowMutation = useMutation({
    ...trpc.frontend.aiFeedback.submitWorkflowFeedback.mutationOptions({}),
    throwOnError: false,
  });

  return {
    submitFeedback: async (feedback: FeedbackData): Promise<void> => {
      if (isWorkflowFeedback(feedback)) {
        await workflowMutation.mutateAsync({
          observabilityRunId: feedback.observabilityRunId,
          feedbackType: isPositiveToFeedbackType(feedback.isPositiveFeedback),
          comment: feedback.comment,
          workflowName: feedback.workflowName,
        });
      } else if (isAIAssistantFeedback(feedback)) {
        await aiAssistantMutation.mutateAsync({
          observabilityRunId: feedback.observabilityRunId,
          feedbackType: isPositiveToFeedbackType(feedback.isPositiveFeedback),
          comment: feedback.comment,
          userQuery: feedback.userQuery,
          aiResponse: feedback.aiResponse,
          sessionId: feedback.sessionId,
          responseId: feedback.responseId,
        });
      }
    },
    loading: aiAssistantMutation.isPending || workflowMutation.isPending,
    error: aiAssistantMutation.error || workflowMutation.error,
  };
}
