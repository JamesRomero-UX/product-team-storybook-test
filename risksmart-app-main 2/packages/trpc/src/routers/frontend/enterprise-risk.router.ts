import z from 'zod';

import { authedProcedure, router } from '../../init';
import { createEnterpriseRiskService } from '../../services/frontend/index';
export const enterpriseRiskRouter = router({
  register: authedProcedure.query(async (req) => {
    const enterpriseRiskService = createEnterpriseRiskService();

    return enterpriseRiskService.getEnterpriseRisksRegister({
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
      const enterpriseRiskService = createEnterpriseRiskService();

      return enterpriseRiskService.getEnterpriseRiskById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),

  getByTier: authedProcedure
    .input(
      z.object({
        tier: z.number().min(1),
      })
    )
    .query(async (req) => {
      const enterpriseRiskService = createEnterpriseRiskService();

      return enterpriseRiskService.getEnterpriseRiskByTier(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.tier
      );
    }),
});
