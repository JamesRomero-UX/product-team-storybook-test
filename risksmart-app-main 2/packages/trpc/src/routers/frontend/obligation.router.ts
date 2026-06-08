import { ObligationType } from '@risksmart-app/domain/src/types/consts/obligation-type';
import { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createObligationService } from '../../services/frontend/index';

export const obligationRouter = router({
  register: authedProcedure.query(async (req) => {
    const obligationService = createObligationService();

    return obligationService.getObligationsRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
  getById: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async (req) => {
      const obligationService = createObligationService();

      return obligationService.getObligationById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
  insert: authedProcedure
    .input(
      z.object({
        ParentId: z.string().uuid().nullable().optional(),
        Title: z.string().min(1),
        Adherence: z.string().min(1),
        Type: z.nativeEnum(ObligationType),
        Description: z.string().nullable().optional(),
        Interpretation: z.string().nullable().optional(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
        OwnerUserIds: z.array(z.string()).optional(),
        OwnerGroupIds: z.array(z.string().uuid()).optional(),
        ContributorUserIds: z.array(z.string()).optional(),
        ContributorGroupIds: z.array(z.string().uuid()).optional(),
        TagTypeIds: z.array(z.string().uuid()).optional(),
        DepartmentTypeIds: z.array(z.string().uuid()).optional(),
        Schedule: z
          .object({
            Frequency: z.nativeEnum(TestFrequency).nullable().optional(),
            ManualDueDate: z.string().nullable().optional(),
            StartDate: z.string().nullable().optional(),
            TimeToCompleteUnit: z.nativeEnum(UnitOfTime).nullable().optional(),
            TimeToCompleteValue: z.number().int().nullable().optional(),
          })
          .nullable()
          .optional(),
      })
    )
    .mutation(async (req) => {
      const obligationService = createObligationService();

      return obligationService.insertObligation(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          ParentId: req.input.ParentId,
          Title: req.input.Title,
          Adherence: req.input.Adherence,
          Type: req.input.Type,
          Description: req.input.Description,
          Interpretation: req.input.Interpretation,
          CustomAttributeData: req.input.CustomAttributeData ?? null,
          OwnerUserIds: req.input.OwnerUserIds,
          OwnerGroupIds: req.input.OwnerGroupIds,
          ContributorUserIds: req.input.ContributorUserIds,
          ContributorGroupIds: req.input.ContributorGroupIds,
          TagTypeIds: req.input.TagTypeIds,
          DepartmentTypeIds: req.input.DepartmentTypeIds,
          Schedule: req.input.Schedule,
        }
      );
    }),
});
