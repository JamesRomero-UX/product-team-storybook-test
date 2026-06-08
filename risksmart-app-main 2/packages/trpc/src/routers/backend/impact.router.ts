import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createImpactBackendService } from '../../services/backend/index';
import { listQueryBySeqIdSchema } from './query.schema';

const impactService = createImpactBackendService();

export const impactRouter = router({
  impactList: backendProcedure.input(listQueryBySeqIdSchema).query((req) => {
    const queryInputs = {
      limit: req.input?.limit || null,
      beforeSequentialId: req.input?.beforeSequentialId || null,
      afterSequentialId: req.input?.afterSequentialId || null,
    };

    return impactService.getImpactList(
      {
        orgId: req.ctx.user.orgId,
        tenant: req.ctx.user.tenant,
      },
      queryInputs
    );
  }),
  impactById: backendProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query((req) => {
      return impactService.getImpactById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.id
      );
    }),
});
