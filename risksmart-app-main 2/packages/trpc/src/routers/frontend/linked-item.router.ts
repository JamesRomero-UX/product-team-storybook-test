import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createLinkedItemService } from '../../services/frontend/index';
export const linkedItemRouter = router({
  linkedItems: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const linkedItemService = createLinkedItemService();

      return linkedItemService.getLinkedItems(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),

  linkedRisksByInternalAuditId: authedProcedure
    .input(z.object({ internalAuditId: z.string().uuid() }))
    .query(async (req) => {
      const linkedItemService = createLinkedItemService();

      return linkedItemService.getLinkedRisksByInternalAuditId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.internalAuditId
      );
    }),
  linkedItemRisks: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const linkedItemService = createLinkedItemService();

      return linkedItemService.getLinkedItemRisks(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
});
