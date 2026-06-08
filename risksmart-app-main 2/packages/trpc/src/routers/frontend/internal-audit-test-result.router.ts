import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createInternalAuditService } from '../../services/frontend/index';
import { logger } from '../../utils/logger';

export const internalAuditTestResultRouter = router({
  internalAuditTestResultById: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const internalAuditService = createInternalAuditService();
      logger.debug(
        {
          ...req.ctx.user,
          reportId: req.input.id,
        },
        'Fetching audit test results by id'
      );

      return internalAuditService.getInternalAuditTestResultById(
        req.ctx.user,
        req.input.id
      );
    }),
});
