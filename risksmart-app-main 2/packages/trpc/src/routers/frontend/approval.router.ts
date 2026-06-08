import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createApprovalService } from '../../services/frontend/index';

export const approvalRouter = router({
  globalApprovals: authedProcedure
    .input(
      z.object({
        isGlobal: z.boolean(),
        parentId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const approvalService = createApprovalService();

      return approvalService.getGlobalApprovals(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.isGlobal,
        req.input.parentId
      );
    }),
});
