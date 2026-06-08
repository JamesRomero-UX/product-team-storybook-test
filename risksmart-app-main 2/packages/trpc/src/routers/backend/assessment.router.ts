import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createAssessmentBackendService } from '../../services/backend/index';
import { listQueryBySeqIdSchema } from './query.schema';

const assessmentService = createAssessmentBackendService();

export const assessmentRouter = router({
  riskAssessmentResultById: backendProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query((req) => {
      return assessmentService.getRiskAssessmentResultById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.id
      );
    }),
  assessmentList: backendProcedure
    .input(listQueryBySeqIdSchema)
    .query((req) => {
      return assessmentService.getAssessmentList(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input
      );
    }),
  assessmentById: backendProcedure
    .input(z.object({ assessmentId: z.string().uuid() }))
    .query((req) => {
      return assessmentService.getAssessmentById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.assessmentId
      );
    }),
});
