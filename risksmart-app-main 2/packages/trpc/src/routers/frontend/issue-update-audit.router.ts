import z from 'zod';

import { authedProcedure, router } from '../../init';
import { createIssueUpdateAuditService } from '../../services/frontend/index';

export const issueUpdateAuditRouter = router({
  getById: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const issueUpdateAuditService = createIssueUpdateAuditService();

      return issueUpdateAuditService.getIssueUpdateAuditById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
});
