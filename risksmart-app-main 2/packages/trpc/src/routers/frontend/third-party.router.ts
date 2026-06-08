import z from 'zod';

import { authedProcedure, router } from '../../init';
import { createThirdPartyService } from '../../services/frontend/index';

export const thirdPartyRouter = router({
  register: authedProcedure.query(async (req) => {
    const thirdPartyService = createThirdPartyService();

    return thirdPartyService.getThirdPartiesRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),

  getById: authedProcedure
    .input(
      z.object({
        thirdPartyId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const thirdPartyService = createThirdPartyService();
      const thirdPartyId = req.input.thirdPartyId;

      return thirdPartyService.getThirdPartyById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        thirdPartyId
      );
    }),
});
