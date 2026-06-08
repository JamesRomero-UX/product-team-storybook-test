import { ConsequenceType } from '@risksmart-app/domain/src/types/consts/consequence-type';
import { CostType } from '@risksmart-app/domain/src/types/consts/cost-type';
import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createConsequenceService } from '../../services/frontend/index';

export const consequenceRouter = router({
  register: authedProcedure.query(async (req) => {
    const consequenceService = createConsequenceService();

    return consequenceService.getConsequencesRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),

  getByParentIssueId: authedProcedure
    .input(
      z.object({
        issueId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const consequenceService = createConsequenceService();

      return consequenceService.getConsequencesByParentIssueId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.issueId
      );
    }),

  consequenceById: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const consequenceService = createConsequenceService();

      return consequenceService.getConsequenceById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),

  getConsequenceAuditById: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const consequenceService = createConsequenceService();

      return consequenceService.getConsequenceAuditById(
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
        ParentIssueId: z.string().uuid(),
        Title: z.string().min(1),
        Description: z.string().nullish(),
        Criticality: z.number().int().nullable().optional(),
        CostType: z.nativeEnum(CostType),
        CostValue: z.number(),
        Type: z.nativeEnum(ConsequenceType).nullish(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
      })
    )
    .mutation(async (req) => {
      const consequenceService = createConsequenceService();

      return consequenceService.insertConsequence(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          ParentIssueId: req.input.ParentIssueId,
          Title: req.input.Title,
          Description: req.input.Description ?? '',
          Criticality: req.input.Criticality ?? null,
          CostType: req.input.CostType,
          CostValue: req.input.CostValue,
          Type: req.input.Type ?? null,
          CustomAttributeData: req.input.CustomAttributeData ?? null,
        }
      );
    }),
  update: authedProcedure
    .input(
      z.object({
        Id: z.string().uuid(),
        ParentIssueId: z.string().uuid(),
        Title: z.string().min(1),
        Description: z.string().nullish(),
        Criticality: z.number().int().nullable().optional(),
        CostType: z.nativeEnum(CostType),
        CostValue: z.number(),
        Type: z.nativeEnum(ConsequenceType).nullish(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
        OriginalTimestamp: z.string(),
      })
    )
    .mutation(async (req) => {
      const consequenceService = createConsequenceService();

      return consequenceService.updateConsequence(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.Id,
        {
          Id: req.input.Id,
          ParentIssueId: req.input.ParentIssueId,
          Title: req.input.Title,
          Description: req.input.Description ?? '',
          Criticality: req.input.Criticality ?? null,
          CostType: req.input.CostType,
          CostValue: req.input.CostValue,
          Type: req.input.Type ?? null,
          CustomAttributeData: req.input.CustomAttributeData ?? null,
          OriginalTimestamp: req.input.OriginalTimestamp,
        }
      );
    }),
  delete: authedProcedure
    .input(
      z.object({
        Ids: z
          .array(z.string().uuid())
          .min(1, 'At least one ID is required')
          .max(200, 'Maximum 200 IDs allowed per request'),
      })
    )
    .mutation(async (req) => {
      const consequenceService = createConsequenceService();

      return consequenceService.deleteConsequences(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.Ids
      );
    }),
});
