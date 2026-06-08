import { AppetiteType } from '@risksmart-app/domain/src/types/consts/index';
import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createAppetiteService } from '../../services/frontend/index';
export const appetiteRouter = router({
  register: authedProcedure.query(async (req) => {
    const AppetiteService = createAppetiteService();

    return AppetiteService.getActiveAppetitesRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
  getById: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async (req) => {
      const AppetiteService = createAppetiteService();

      return AppetiteService.getAppetiteById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
  appetitesByRiskId: authedProcedure
    .input(z.object({ riskId: z.string().uuid() }))
    .query(async (req) => {
      const AppetiteService = createAppetiteService();

      return AppetiteService.getAppetitesByParentId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.riskId
      );
    }),
  activeAppetitesByParentId: authedProcedure
    .input(z.object({ parentId: z.string().uuid() }))
    .query(async (req) => {
      const AppetiteService = createAppetiteService();

      return AppetiteService.getActiveAppetitesByParentId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.parentId
      );
    }),

  getAppetitesGroupedByImpact: authedProcedure.query(async (req) => {
    const AppetiteService = createAppetiteService();

    return AppetiteService.getAppetitesGroupedByImpact({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),

  insert: authedProcedure
    .input(
      z
        .object({
          ParentIds: z.array(z.string().uuid()).min(1),
          Statement: z.string().nullish(),
          EffectiveDate: z.string().nullish(),
          CustomAttributeData: z.record(z.string(), z.unknown()).nullish(),
        })
        .and(
          z.discriminatedUnion('AppetiteType', [
            z.object({
              AppetiteType: z.literal(AppetiteType.Impact),
              ImpactAppetite: z.number().int(),
              ImpactId: z.string().uuid(),
            }),
            z.object({
              AppetiteType: z.literal(AppetiteType.Likelihood),
              LikelihoodAppetite: z.number().int().nullish(),
            }),
            z.object({
              AppetiteType: z.literal(AppetiteType.Risk),
              LowerAppetite: z.number().int().min(1).max(5).nullish(),
              UpperAppetite: z.number().int().min(1).max(5).nullish(),
            }),
          ])
        )
    )
    .mutation(async (req) => {
      const appetiteService = createAppetiteService();

      return appetiteService.insertAppetite(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          ParentIds: req.input.ParentIds,
          AppetiteType: req.input.AppetiteType,
          Statement: req.input.Statement ?? null,
          EffectiveDate: req.input.EffectiveDate ?? null,
          LowerAppetite:
            'LowerAppetite' in req.input
              ? (req.input.LowerAppetite ?? null)
              : null,
          UpperAppetite:
            'UpperAppetite' in req.input
              ? (req.input.UpperAppetite ?? null)
              : null,
          ImpactAppetite:
            'ImpactAppetite' in req.input
              ? (req.input.ImpactAppetite ?? null)
              : null,
          LikelihoodAppetite:
            'LikelihoodAppetite' in req.input
              ? (req.input.LikelihoodAppetite ?? null)
              : null,
          ImpactId:
            'ImpactId' in req.input ? (req.input.ImpactId ?? null) : null,
          CustomAttributeData: req.input.CustomAttributeData ?? null,
        }
      );
    }),

  update: authedProcedure
    .input(
      z.object({
        Id: z.string().uuid(),
        AppetiteType: z.nativeEnum(AppetiteType),
        Statement: z.string().nullable().optional(),
        EffectiveDate: z.string().nullable().optional(),
        LowerAppetite: z.number().int().nullable().optional(),
        UpperAppetite: z.number().int().nullable().optional(),
        ImpactAppetite: z.number().int().nullable().optional(),
        LikelihoodAppetite: z.number().int().nullable().optional(),
        ImpactId: z.string().uuid().nullable().optional(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
      })
    )
    .mutation(async (req) => {
      const appetiteService = createAppetiteService();

      return appetiteService.updateAppetite(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          Id: req.input.Id,
          AppetiteType: req.input.AppetiteType,
          Statement: req.input.Statement ?? null,
          EffectiveDate: req.input.EffectiveDate ?? null,
          LowerAppetite: req.input.LowerAppetite ?? null,
          UpperAppetite: req.input.UpperAppetite ?? null,
          ImpactAppetite: req.input.ImpactAppetite ?? null,
          LikelihoodAppetite: req.input.LikelihoodAppetite ?? null,
          ImpactId: req.input.ImpactId ?? null,
          CustomAttributeData: req.input.CustomAttributeData ?? null,
        }
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
      const appetiteService = createAppetiteService();

      return appetiteService.deleteAppetites(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.ids
      );
    }),
});
