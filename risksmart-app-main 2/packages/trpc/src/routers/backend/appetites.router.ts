import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createAppetiteBackendService } from '../../services/backend/index';

const appetiteService = createAppetiteBackendService();

export const appetiteRouter = router({
  appetiteById: backendProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query((req) => {
      return appetiteService.getAppetiteById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.id
      );
    }),
});
