import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createPolicyService } from '../../services/frontend/index';
import { logger } from '../../utils/logger';

export const documentRouter = router({
  register: authedProcedure.query(async (req) => {
    const policyService = createPolicyService();

    return policyService.getDocumentsRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
  list: authedProcedure.query(async (req) => {
    const policyService = createPolicyService();

    return policyService.getDocumentListSimple({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
  documentById: authedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .query(async (req) => {
      const policyService = createPolicyService();
      logger.debug(
        { documentId: req.input.documentId },
        'Fetching document by id'
      );

      return policyService.getDocumentById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.documentId
      );
    }),
});
