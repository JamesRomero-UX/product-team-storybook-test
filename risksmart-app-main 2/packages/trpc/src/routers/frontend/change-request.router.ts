import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createChangeRequestService } from '../../services/frontend/index';

export const changeRequestRouter = router({
  register: authedProcedure.query(async (req) => {
    const changeRequestService = createChangeRequestService();

    return changeRequestService.getChangeRequestsRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),

  pendingChangeRequests: authedProcedure
    .input(
      z.object({
        parentId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const changeRequestService = createChangeRequestService();

      return changeRequestService.getPendingChangeRequests(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.parentId
      );
    }),
});
