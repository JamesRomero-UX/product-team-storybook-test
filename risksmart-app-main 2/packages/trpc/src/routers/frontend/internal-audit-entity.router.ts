import z from 'zod';

import { authedProcedure, router } from '../../init';
import { createInternalAuditService } from '../../services/frontend/index';
import { logger } from '../../utils/logger';

export const internalAuditEntityRouter = router({
  register: authedProcedure.query(async (req) => {
    const internalAuditService = createInternalAuditService();

    return internalAuditService.getInternalAuditEntitiesRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
  internalAuditById: authedProcedure
    .input(
      z.object({
        internalAuditId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const internalAuditService = createInternalAuditService();
      logger.debug(
        {
          ...req.ctx.user,
          internalAuditId: req.input.internalAuditId,
        },
        'Fetching internal audit by id'
      );

      return internalAuditService.getInternalAuditById(
        req.ctx.user,
        req.input.internalAuditId
      );
    }),
});
