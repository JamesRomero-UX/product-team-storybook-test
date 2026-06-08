import type { FeedbackType } from '../clients/ai-feedback-api-client';

interface BaseFeedbackRequest {
  observabilityRunId: string;
  feedbackType: FeedbackType;
  comment?: string | null;
}

export interface AiAssistantFeedbackRequest extends BaseFeedbackRequest {
  sessionId: string;
  responseId: string;
  userQuery?: string | null;
  aiResponse?: string | null;
}

export interface WorkflowFeedbackRequest extends BaseFeedbackRequest {
  workflowName: string;
}
