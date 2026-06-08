import { RiskAssessmentResultControlType } from '@risksmart-app/domain/src/types/consts/risk-assessment-result-control-type';
import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createRiskAssessmentResultService } from '../../services/frontend/index';

export const riskAssessmentResultRouter = router({
  insert: authedProcedure
    .input(
      z.object({
        RiskIds: z.array(z.string().uuid()).min(1),
        ControlType: z.nativeEnum(RiskAssessmentResultControlType),
        Rating: z.number().int().nullable().optional(),
        Likelihood: z.number().int().nullable().optional(),
        Impact: z.number().int().nullable().optional(),
        AssessmentId: z.string().uuid().nullable().optional(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
        TestDate: z.string().nullable().optional(),
        Rationale: z.string().nullable().optional(),
      })
    )
    .mutation(async (req) => {
      const service = createRiskAssessmentResultService();

      return service.insertRiskAssessmentResult(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          RiskIds: req.input.RiskIds,
          ControlType: req.input.ControlType,
          Rating: req.input.Rating,
          Likelihood: req.input.Likelihood,
          Impact: req.input.Impact,
          AssessmentId: req.input.AssessmentId,
          CustomAttributeData: req.input.CustomAttributeData ?? null,
          TestDate: req.input.TestDate,
          Rationale: req.input.Rationale,
        },
        { useImpacts: req.ctx.user.features.includes('impacts') }
      );
    }),
});
