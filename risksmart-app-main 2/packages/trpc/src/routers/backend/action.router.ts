import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createActionBackendService } from '../../services/backend/index';
import { listQueryBySeqIdSchema } from './query.schema';

const actionService = createActionBackendService();

export const actionRouter = router({
  actionList: backendProcedure.input(listQueryBySeqIdSchema).query((req) => {
    return actionService.getActionList(
      {
        orgId: req.ctx.user.orgId,
        tenant: req.ctx.user.tenant,
      },
      req.input
    );
  }),
  actionById: backendProcedure
    .input(z.object({ actionId: z.string().uuid() }))
    .query((req) => {
      return actionService.getActionById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.actionId
      );
    }),
});
