import z from 'zod';

import { authedProcedure, router } from '../../init';
import { createImpactService } from '../../services/frontend/index';

export const impactRouter = router({
  latestImpactRatingsForRatedImpactsByRatedItemId: authedProcedure
    .input(z.object({ ratedItemId: z.string().uuid() }))
    .query(async (req) => {
      const impactService = createImpactService();

      return impactService.getLatestImpactRatingsForRatedImpactsByRatedItemId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.ratedItemId
      );
    }),
});
