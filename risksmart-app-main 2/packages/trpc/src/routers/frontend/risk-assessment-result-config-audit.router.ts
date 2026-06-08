import z from 'zod';

import { authedProcedure, router } from '../../init';
import { createRiskAssessmentResultConfigAuditService } from '../../services/frontend/index';

export const riskAssessmentResultConfigAuditRouter = router({
  getById: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const riskAssessmentResultConfigAuditService =
        createRiskAssessmentResultConfigAuditService();

      return riskAssessmentResultConfigAuditService.getRiskAssessmentResultConfigAuditById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
});
