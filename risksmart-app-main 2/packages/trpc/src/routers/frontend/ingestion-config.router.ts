import { authedProcedure, router } from '../../init';
import { createIngestionConfigService } from '../../services/frontend/index';

export const ingestionConfigRouter = router({
  getAll: authedProcedure.query(async (req) => {
    const service = createIngestionConfigService();

    return service.getAll({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
});
