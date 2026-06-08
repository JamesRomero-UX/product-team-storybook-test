import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createEntityService } from '../../services/frontend/index';

export const entityRouter = router({
  register: authedProcedure.query(async (req) => {
    const entityService = createEntityService();

    return entityService.getEntityRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),

  getById: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const entityService = createEntityService();

      return entityService.getEntityById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
});
