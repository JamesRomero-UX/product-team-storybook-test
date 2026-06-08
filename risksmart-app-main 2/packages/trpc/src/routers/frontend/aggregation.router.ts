import { authedProcedure, router } from '../../init';
import { createAggregationService } from '../../services/frontend/index';

export const aggregationRouter = router({
  getAggregationSettingsForOrg: authedProcedure.query(async (req) => {
    const AggregationService = createAggregationService();

    return AggregationService.getAggregationSettingsForOrg({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
});
