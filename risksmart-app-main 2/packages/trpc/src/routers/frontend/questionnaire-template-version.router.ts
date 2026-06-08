import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createQuestionnaireTemplateVersionService } from '../../services/frontend/index';

export const questionnaireTemplateVersionRouter = router({
  getById: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const questionnaireTemplateVersionService =
        createQuestionnaireTemplateVersionService();

      return questionnaireTemplateVersionService.getQuestionnaireTemplateVersionById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),

  getLatest: authedProcedure
    .input(
      z.object({
        parentId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const questionnaireTemplateVersionService =
        createQuestionnaireTemplateVersionService();

      return questionnaireTemplateVersionService.getLatestQuestionnaireTemplateVersionByParentId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.parentId
      );
    }),

  getByParentId: authedProcedure
    .input(
      z.object({
        parentId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const questionnaireTemplateVersionService =
        createQuestionnaireTemplateVersionService();

      return questionnaireTemplateVersionService.getQuestionnaireTemplateVersionsByParentId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.parentId
      );
    }),
});
