import type { FeedbackRequest } from '../../clients/ai-feedback-api-client';
import { submitFeedback } from '../../clients/ai-feedback-api-client';
import { toApiContext } from '../../clients/client-utils';
import type {
  AiFeedbackService,
  ServiceContext,
} from '../../services/service.types';
import type {
  AiAssistantFeedbackRequest,
  WorkflowFeedbackRequest,
} from '../../types/ai-feedback.types';
import { mapHttpStatusToTRPCError } from '../../utils/error-mapping';

async function processSubmittingFeedback(
  ctx: ServiceContext,
  request: FeedbackRequest
) {
  const { data, status } = await submitFeedback(toApiContext(ctx), request);

  if (status >= 400) {
    throw mapHttpStatusToTRPCError(status, data);
  }
}

export class AiFeedbackServiceImpl implements AiFeedbackService {
  public async submitAiAssistantFeedback(
    ctx: ServiceContext,
    request: AiAssistantFeedbackRequest
  ): Promise<void> {
    await processSubmittingFeedback(ctx, {
      workstream: 'ai-assistant',
      feedback: {
        comment: request.comment,
        feedbackType: request.feedbackType,
        observabilityRunId: request.observabilityRunId,
        aiResponse: request.aiResponse,
        responseId: request.responseId,
        sessionId: request.sessionId,
        userQuery: request.userQuery,
      },
    });
  }
  public async submitWorkflowFeedback(
    ctx: ServiceContext,
    request: WorkflowFeedbackRequest
  ): Promise<void> {
    await processSubmittingFeedback(ctx, {
      workstream: 'workflow',
      feedback: {
        comment: request.comment,
        feedbackType: request.feedbackType,
        observabilityRunId: request.observabilityRunId,
        workflowName: request.workflowName,
      },
    });
  }
}
