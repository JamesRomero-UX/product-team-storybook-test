import { IndicatorType } from '@risksmart-app/domain/src/types/consts/indicator-type';
import { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createIndicatorService } from '../../services/frontend/index';
export const indicatorRouter = router({
  register: authedProcedure.query(async (req) => {
    const indicatorService = createIndicatorService();

    return indicatorService.getIndicatorsRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),

  indicatorById: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const indicatorService = createIndicatorService();

      return indicatorService.getIndicatorById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),

  indicatorResultsByIndicatorId: authedProcedure
    .input(
      z.object({
        indicatorId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const indicatorService = createIndicatorService();

      return indicatorService.getIndicatorResultsByIndicatorId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.indicatorId
      );
    }),

  indicatorsByParentId: authedProcedure
    .input(
      z.object({
        parentId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const indicatorService = createIndicatorService();

      return indicatorService.getIndicatorsByParentId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.parentId
      );
    }),

  insertResult: authedProcedure
    .input(
      z
        .object({
          Description: z.string().nullable().optional(),
          IndicatorId: z.string().uuid(),
          ResultDate: z.string().datetime(),
          TargetValueNum: z.number().nullable().optional(),
          TargetValueTxt: z.string().nullable().optional(),
          CustomAttributeData: z
            .record(z.string(), z.unknown())
            .nullable()
            .optional(),
        })
        .refine(
          (data) => {
            const hasNum =
              data.TargetValueNum !== null && data.TargetValueNum !== undefined;
            const hasTxt =
              data.TargetValueTxt !== null && data.TargetValueTxt !== undefined;

            return (hasNum && !hasTxt) || (!hasNum && hasTxt);
          },
          {
            message:
              'Exactly one of TargetValueNum or TargetValueTxt must be provided',
          }
        )
    )
    .mutation(async (req) => {
      const indicatorService = createIndicatorService();

      return indicatorService.insertIndicatorResult(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          Description: req.input.Description,
          IndicatorId: req.input.IndicatorId,
          ResultDate: req.input.ResultDate,
          TargetValueNum: req.input.TargetValueNum,
          TargetValueTxt: req.input.TargetValueTxt,
          CustomAttributeData: req.input.CustomAttributeData ?? null,
        }
      );
    }),

  updateResult: authedProcedure
    .input(
      z.object({
        Id: z.string().uuid(),
        Description: z.string().nullable().optional(),
        ResultDate: z.string().datetime(),
        TargetValueNum: z.number().nullable().optional(),
        TargetValueTxt: z.string().nullable().optional(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
      })
    )
    .mutation(async (req) => {
      const indicatorService = createIndicatorService();

      return indicatorService.updateIndicatorResult(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input
      );
    }),

  delete: authedProcedure
    .input(
      z.object({
        ids: z
          .array(z.string().uuid())
          .min(1, 'At least one ID is required')
          .max(200, 'Maximum 200 IDs allowed per request'),
      })
    )
    .mutation(async (req) => {
      const indicatorService = createIndicatorService();

      return indicatorService.deleteIndicators(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.ids
      );
    }),

  deleteResults: authedProcedure
    .input(
      z.object({
        ids: z
          .array(z.string().uuid())
          .min(1, 'At least one ID is required')
          .max(200, 'Maximum 200 IDs allowed per request'),
      })
    )
    .mutation(async (req) => {
      const indicatorService = createIndicatorService();

      return indicatorService.deleteIndicatorResults(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.ids
      );
    }),

  update: authedProcedure
    .input(
      z.object({
        Id: z.string().uuid(),
        Title: z.string().min(1),
        Type: z.nativeEnum(IndicatorType),
        Description: z.string().nullable().optional(),
        Unit: z.string().nullable().optional(),
        UpperToleranceNum: z.number().nullable().optional(),
        LowerToleranceNum: z.number().nullable().optional(),
        TargetValueTxt: z.string().nullable().optional(),
        UpperAppetiteNum: z.number().nullable().optional(),
        LowerAppetiteNum: z.number().nullable().optional(),
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
      const indicatorService = createIndicatorService();

      return indicatorService.updateIndicator(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input
      );
    }),
});
