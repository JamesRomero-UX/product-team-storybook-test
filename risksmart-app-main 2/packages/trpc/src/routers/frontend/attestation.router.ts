import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createPolicyService } from '../../services/frontend/index';
import { logger } from '../../utils/logger';
export const attestationRouter = router({
  register: authedProcedure
    .input(z.object({ userId: z.string().optional() }).optional())
    .query(async (req) => {
      const policyService = createPolicyService();

      logger.debug(
        {
          userId: req.ctx.user.userId,
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          parentId: req.input?.userId,
        },
        'Fetching attestation register'
      );

      return policyService.getAttestationsRegister(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input?.userId
      );
    }),
  //Can't use uuid() validation on userId due to auth0 token format
  status: authedProcedure
    .input(z.object({ parentId: z.string().uuid(), userId: z.string() }))
    .query(async (req) => {
      const policyService = createPolicyService();

      logger.debug(
        {
          userId: req.ctx.user.userId,
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          parentId: req.input.parentId,
          inputUserId: req.input.userId,
        },
        'Fetching attestation status'
      );

      return policyService.getAttestationStatus(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.parentId,
        req.input.userId
      );
    }),
});
