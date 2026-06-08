import z from 'zod';

import { authedProcedure, router } from '../../init';
import { createPolicyService } from '../../services/frontend/index';
import { logger } from '../../utils/logger';
export const attestationCycleRouter = router({
  register: authedProcedure.query(async (req) => {
    const policyService = createPolicyService();

    logger.debug(
      {
        userId: req.ctx.user.userId,
        orgId: req.ctx.user.orgId,
        tenant: req.ctx.user.tenant,
      },
      'Fetching attestation register'
    );

    return policyService.getAttestationCyclesRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),

  byDocumentId: authedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .query(async (req) => {
      const policyService = createPolicyService();

      logger.debug(
        {
          userId: req.ctx.user.userId,
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          documentId: req.input.documentId,
        },
        'Fetching attestation cycles by document ID'
      );

      return policyService.getAttestationCyclesByDocumentId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.documentId
      );
    }),
});
