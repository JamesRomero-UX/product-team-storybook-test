import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createObligationChangeService } from '../../services/frontend/index';

export const obligationChangeRouter = router({
  register: authedProcedure.query(async (req) => {
    const service = createObligationChangeService();

    return service.getObligationChangesRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
  getById: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async (req) => {
      const service = createObligationChangeService();

      return service.getObligationChangeById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
});
