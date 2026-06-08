import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createAcceptanceBackendService } from '../../services/backend/index';

const acceptanceService = createAcceptanceBackendService();

export const acceptanceRouter = router({
  acceptanceById: backendProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query((req) => {
      return acceptanceService.getAcceptanceById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.id
      );
    }),
});
