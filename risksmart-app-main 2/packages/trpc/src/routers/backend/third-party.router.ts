import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createThirdPartyBackendService } from '../../services/backend/index';
import { listQueryBySeqIdSchema } from './query.schema';

const thirdPartyService = createThirdPartyBackendService();

export const thirdPartyRouter = router({
  thirdPartyList: backendProcedure
    .input(listQueryBySeqIdSchema)
    .query((req) => {
      return thirdPartyService.getThirdPartyList(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input
      );
    }),
  thirdPartyById: backendProcedure
    .input(z.object({ thirdPartyId: z.string().uuid() }))
    .query((req) => {
      return thirdPartyService.getThirdPartyById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.thirdPartyId
      );
    }),
});
