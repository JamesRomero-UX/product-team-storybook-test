import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createInternalAuditService } from '../../services/frontend/index';
import { logger } from '../../utils/logger';

export const internalAuditReportRouter = router({
  register: authedProcedure.query(async (req) => {
    const internalAuditService = createInternalAuditService();

    return internalAuditService.getInternalAuditReportsRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
  internalAuditReportsByOriginatingItemId: authedProcedure
    .input(
      z.object({
        originatingItemId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const internalAuditService = createInternalAuditService();
      logger.debug(
        {
          ...req.ctx.user,
          originatingItemId: req.input.originatingItemId,
        },
        'Fetching audit reports by originating item id'
      );

      return internalAuditService.getInternalAuditReportsByOriginatingItemId(
        req.ctx.user,
        req.input.originatingItemId
      );
    }),
  internalAuditReportById: authedProcedure
    .input(
      z.object({
        reportId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const internalAuditService = createInternalAuditService();
      logger.debug(
        {
          ...req.ctx.user,
          reportId: req.input.reportId,
        },
        'Fetching audit report by id'
      );

      return internalAuditService.getInternalAuditReportById(
        req.ctx.user,
        req.input.reportId
      );
    }),
});
