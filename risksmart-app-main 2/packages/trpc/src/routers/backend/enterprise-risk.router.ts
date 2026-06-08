import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createEnterpriseRiskBackendService } from '../../services/backend/index';
import {
  linkedListQueryBySeqIdSchema,
  listQueryBySeqIdSchema,
} from './query.schema';

const enterpriseRiskService = createEnterpriseRiskBackendService();

export const enterpriseRiskRouter = router({
  enterpriseRiskChildRiskList: backendProcedure
    .input(linkedListQueryBySeqIdSchema)
    .query((req) => {
      return enterpriseRiskService.getEnterpriseRiskChildRisks(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input
      );
    }),
  enterpriseRiskList: backendProcedure
    .input(listQueryBySeqIdSchema)
    .query((req) => {
      return enterpriseRiskService.getEnterpriseRiskList(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input
      );
    }),
  enterpriseRiskById: backendProcedure
    .input(z.object({ enterpriseRiskId: z.string().uuid() }))
    .query((req) => {
      return enterpriseRiskService.getEnterpriseRiskById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.enterpriseRiskId
      );
    }),
});
