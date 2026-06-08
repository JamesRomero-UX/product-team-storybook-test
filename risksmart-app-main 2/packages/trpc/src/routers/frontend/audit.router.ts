import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createAuditService } from '../../services/frontend/audit.service';

export const auditRouter = router({
  getAcceptanceAuditById: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async (req) => {
      const auditService = createAuditService();

      return auditService.getAcceptanceAuditById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
  getActionAuditById: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async (req) => {
      const auditService = createAuditService();

      return auditService.getActionAuditById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
});
