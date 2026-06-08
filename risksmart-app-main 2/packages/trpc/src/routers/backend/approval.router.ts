import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createApprovalBackendService } from '../../services/backend/index';

const approvalService = createApprovalBackendService();

export const approvalRouter = router({
  approvalById: backendProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query((req) => {
      return approvalService.getApprovalById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.id
      );
    }),
});
