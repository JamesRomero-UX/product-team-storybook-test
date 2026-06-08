import { RiskStatusType } from '@risksmart-app/domain/src/types/consts/risk-status-type';
import { RiskTreatmentType } from '@risksmart-app/domain/src/types/consts/risk-treatment-type';
import { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';
import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createRiskService } from '../../services/frontend/index';
export const riskRouter = router({
  register: authedProcedure.query(async (req) => {
    const riskService = createRiskService();

    return riskService.getRisksRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
  riskById: authedProcedure
    .input(z.object({ riskId: z.string().uuid() }))
    .query(async (req) => {
      const riskService = createRiskService();

      return riskService.getRiskById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.riskId
      );
    }),
  scores: authedProcedure.query(async (req) => {
    const riskService = createRiskService();

    return riskService.getRiskScores({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
  riskListOnlyOptimized: authedProcedure.query(async (req) => {
    const riskService = createRiskService();

    return riskService.getRiskListOnlyOptimized({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
  riskListOnlyWithEntitiesOptimized: authedProcedure.query(async (req) => {
    const riskService = createRiskService();

    return riskService.getRiskListOnlyWithEntitiesOptimized({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
  riskScoresByRiskId: authedProcedure
    .input(z.object({ riskId: z.string().uuid() }))
    .query(async (req) => {
      const riskService = createRiskService();

      return riskService.getRiskScoresByRiskId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.riskId
      );
    }),
  insert: authedProcedure
    .input(
      z
        .object({
          ParentRiskId: z.string().uuid().nullable().optional(),
          Title: z.string().min(1),
          Tier: z.number().int(),
          Description: z.string().nullable().optional(),
          Treatment: z.nativeEnum(RiskTreatmentType).nullable().optional(),
          Status: z.nativeEnum(RiskStatusType).nullable().optional(),
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
              TimeToCompleteUnit: z
                .nativeEnum(UnitOfTime)
                .nullable()
                .optional(),
              TimeToCompleteValue: z.number().int().nullable().optional(),
            })
            .nullable()
            .optional(),
        })
        .refine((data) => data.Tier <= 1 || data.ParentRiskId != null, {
          message: 'ParentRiskId is required when Tier is greater than 1',
        })
    )
    .mutation(async (req) => {
      const riskService = createRiskService();

      return riskService.insertRisk(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          ParentRiskId: req.input.ParentRiskId,
          Title: req.input.Title,
          Tier: req.input.Tier,
          Description: req.input.Description,
          Treatment: req.input.Treatment,
          Status: req.input.Status,
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
  update: authedProcedure
    .input(
      z
        .object({
          Id: z.string().uuid(),
          ParentRiskId: z.string().uuid().nullable().optional(),
          Title: z.string().min(1),
          Tier: z.number().int(),
          Description: z.string().nullable().optional(),
          Treatment: z.nativeEnum(RiskTreatmentType).nullable().optional(),
          Status: z.nativeEnum(RiskStatusType).nullable().optional(),
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
              TimeToCompleteUnit: z
                .nativeEnum(UnitOfTime)
                .nullable()
                .optional(),
              TimeToCompleteValue: z.number().int().nullable().optional(),
            })
            .nullable()
            .optional(),
        })
        .refine((data) => data.Tier <= 1 || data.ParentRiskId != null, {
          message: 'ParentRiskId is required when Tier is greater than 1',
        })
    )
    .mutation(async (req) => {
      const riskService = createRiskService();

      return riskService.updateRisk(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          Id: req.input.Id,
          ParentRiskId: req.input.ParentRiskId,
          Title: req.input.Title,
          Tier: req.input.Tier,
          Description: req.input.Description,
          Treatment: req.input.Treatment,
          Status: req.input.Status,
          CustomAttributeData: req.input.CustomAttributeData ?? null,
          OwnerUserIds: req.input.OwnerUserIds,
          OwnerGroupIds: req.input.OwnerGroupIds,
          ContributorUserIds: req.input.ContributorUserIds,
          ContributorGroupIds: req.input.ContributorGroupIds,
          TagTypeIds: req.input.TagTypeIds,
          DepartmentTypeIds: req.input.DepartmentTypeIds,
          Schedule: req.input.Schedule,
        },
        { useImpacts: req.ctx.user.features.includes('impacts') }
      );
    }),
  delete: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async (req) => {
      const riskService = createRiskService();

      return riskService.deleteRisk(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),
});
