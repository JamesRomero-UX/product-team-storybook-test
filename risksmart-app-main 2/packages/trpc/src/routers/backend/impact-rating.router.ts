import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createImpactRatingBackendService } from '../../services/backend/index';

const impactRatingService = createImpactRatingBackendService();

export const impactRatingRouter = router({
  impactRatingById: backendProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async (req) => {
      return impactRatingService.getImpactRatingById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.id
      );
    }),
});
