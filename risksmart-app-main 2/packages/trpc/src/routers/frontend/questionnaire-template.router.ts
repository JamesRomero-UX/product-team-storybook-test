import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createQuestionnaireTemplateService } from '../../services/frontend/index';

export const questionnaireTemplateRouter = router({
  register: authedProcedure.query(async (req) => {
    const questionnaireTemplateService = createQuestionnaireTemplateService();

    return questionnaireTemplateService.getQuestionnaireTemplatesRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),

  getById: authedProcedure
    .input(z.object({ id: z.string() }))
    .query(async (req) => {
      const questionnaireTemplateService = createQuestionnaireTemplateService();

      return questionnaireTemplateService.getQuestionnaireTemplateById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
});
