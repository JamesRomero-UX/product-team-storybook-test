import z from 'zod';

import { authedProcedure, router } from '../../init';
import { createRiskAssessmentResultImpactAuditService } from '../../services/frontend/index';

export const riskAssessmentResultImpactAuditRouter = router({
  getById: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const riskAssessmentResultImpactAuditService =
        createRiskAssessmentResultImpactAuditService();

      return riskAssessmentResultImpactAuditService.getRiskAssessmentResultImpactAuditById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
});
