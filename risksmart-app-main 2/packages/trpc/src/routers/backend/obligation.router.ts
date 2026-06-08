import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createObligationBackendService } from '../../services/backend/index';
import { listQueryBySeqIdSchema } from './query.schema';

const obligationService = createObligationBackendService();

export const obligationRouter = router({
  obligationList: backendProcedure
    .input(listQueryBySeqIdSchema)
    .query((req) => {
      return obligationService.getObligationList(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input
      );
    }),
  obligationById: backendProcedure
    .input(z.object({ obligationId: z.string().uuid() }))
    .query((req) => {
      return obligationService.getObligationById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.obligationId
      );
    }),
});
