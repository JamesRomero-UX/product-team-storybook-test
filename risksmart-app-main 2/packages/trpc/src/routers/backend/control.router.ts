import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createControlBackendService } from '../../services/backend/index';
import { listQueryBySeqIdSchema } from './query.schema';

const controlService = createControlBackendService();

export const controlRouter = router({
  controlList: backendProcedure.input(listQueryBySeqIdSchema).query((req) => {
    const queryInputs = {
      limit: req.input?.limit || null,
      beforeSequentialId: req.input?.beforeSequentialId || null,
      afterSequentialId: req.input?.afterSequentialId || null,
    };

    return controlService.getControlList(
      {
        orgId: req.ctx.user.orgId,
        tenant: req.ctx.user.tenant,
      },
      queryInputs
    );
  }),
  controlById: backendProcedure
    .input(z.object({ controlId: z.string().uuid() }))
    .query((req) => {
      return controlService.getControlById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.controlId
      );
    }),
});
