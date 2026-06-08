import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createObligationImpactService } from '../../services/frontend/index';

export const obligationImpactRouter = router({
  getByParentId: authedProcedure
    .input(z.object({ parentId: z.string().uuid() }))
    .query(async (req) => {
      const obligationImpactService = createObligationImpactService();

      return obligationImpactService.getObligationImpactsByParentId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.parentId
      );
    }),

  insert: authedProcedure
    .input(
      z.object({
        ParentObligationId: z.string().uuid(),
        Description: z.string().min(1),
        ImpactRating: z.number(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
      })
    )
    .mutation(async (req) => {
      const obligationImpactService = createObligationImpactService();

      return obligationImpactService.insertObligationImpact(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          ParentObligationId: req.input.ParentObligationId,
          Description: req.input.Description,
          ImpactRating: req.input.ImpactRating,
          CustomAttributeData: req.input.CustomAttributeData ?? null,
        }
      );
    }),

  delete: authedProcedure
    .input(
      z.object({
        ids: z
          .array(z.string().uuid())
          .min(1, 'At least one ID is required')
          .max(200, 'Maximum 200 IDs allowed per request'),
      })
    )
    .mutation(async (req) => {
      const obligationImpactService = createObligationImpactService();

      return obligationImpactService.deleteObligationImpacts(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.ids
      );
    }),
});
