import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createInternalAuditService } from '../../services/frontend/index';
import { logger } from '../../utils/logger';

export const internalAuditResultRouter = router({
  internalAuditResultByParentId: authedProcedure
    .input(
      z.object({
        parentId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const internalAuditService = createInternalAuditService();
      logger.debug(
        {
          ...req.ctx.user,
          parentId: req.input.parentId,
        },
        'Fetching audit results by parent id'
      );

      return internalAuditService.getInternalAuditResultsByParentId(
        req.ctx.user,
        req.input.parentId
      );
    }),

  internalAuditResultById: authedProcedure
    .input(
      z.object({
        internalAuditResultId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const internalAuditService = createInternalAuditService();
      logger.debug(
        {
          ...req.ctx.user,
          reportId: req.input.internalAuditResultId,
        },
        'Fetching audit result by internal audit result id'
      );

      return internalAuditService.getInternalAuditResultById(
        req.ctx.user,
        req.input.internalAuditResultId
      );
    }),

  latestDocumentInternalAuditResultByDocumentId: authedProcedure
    .input(
      z.object({
        documentId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const internalAuditService = createInternalAuditService();
      logger.debug(
        {
          ...req.ctx.user,
          documentId: req.input.documentId,
        },
        'Fetching latest document internal audit result by document id'
      );

      return internalAuditService.getLatestDocumentInternalAuditResultByDocumentId(
        req.ctx.user,
        req.input.documentId
      );
    }),
});
