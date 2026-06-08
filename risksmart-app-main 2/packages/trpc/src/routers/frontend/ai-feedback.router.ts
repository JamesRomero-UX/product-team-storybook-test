import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createAiFeedbackService } from '../../services/frontend';

export const aiFeedbackRouter = router({
  submitAiAssistantFeedback: authedProcedure
    .input(
      z.object({
        observabilityRunId: z.string(),
        feedbackType: z.enum(['thumbs_up', 'thumbs_down']),
        comment: z.string().optional(),
        userQuery: z.string().optional(),
        aiResponse: z.string().optional(),
        sessionId: z.string(),
        responseId: z.string(),
      })
    )
    .mutation(async (req) => {
      const feedbackService = createAiFeedbackService();

      await feedbackService.submitAiAssistantFeedback(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          observabilityRunId: req.input.observabilityRunId,
          feedbackType: req.input.feedbackType,
          comment: req.input.comment,
          userQuery: req.input.userQuery,
          aiResponse: req.input.aiResponse,
          sessionId: req.input.sessionId,
          responseId: req.input.responseId,
        }
      );
    }),
  submitWorkflowFeedback: authedProcedure
    .input(
      z.object({
        observabilityRunId: z.string(),
        feedbackType: z.enum(['thumbs_up', 'thumbs_down']),
        comment: z.string().optional(),
        workflowName: z.string(),
      })
    )
    .mutation(async (req): Promise<void> => {
      const feedbackService = createAiFeedbackService();

      await feedbackService.submitWorkflowFeedback(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          observabilityRunId: req.input.observabilityRunId,
          feedbackType: req.input.feedbackType,
          comment: req.input.comment,
          workflowName: req.input.workflowName,
        }
      );
    }),
});
