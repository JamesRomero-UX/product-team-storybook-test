import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createCauseService } from '../../services/frontend/index';

export const causeRouter = router({
  register: authedProcedure.query(async (req) => {
    const causeService = createCauseService();

    return causeService.getCausesRegister({
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
      const causeService = createCauseService();

      return causeService.getCausesByParentIssueId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.issueId
      );
    }),
  getById: authedProcedure
    .input(z.object({ causeId: z.string().uuid() }))
    .query(async (req) => {
      const causeService = createCauseService();

      return causeService.getCauseById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.causeId
      );
    }),
  insert: authedProcedure
    .input(
      z.object({
        ParentIssueId: z.string().uuid(),
        Title: z.string().min(1),
        Description: z.string().nullish(),
        Significance: z.number().int().min(1).max(5).nullable().optional(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
      })
    )
    .mutation(async (req) => {
      const causeService = createCauseService();

      return causeService.insertCause(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          ParentIssueId: req.input.ParentIssueId,
          Title: req.input.Title,
          Description: req.input.Description ?? '',
          Significance: req.input.Significance ?? null,
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
        Significance: z.number().int().min(1).max(5).nullable().optional(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
        OriginalTimestamp: z.string(),
      })
    )
    .mutation(async (req) => {
      const causeService = createCauseService();

      return causeService.updateCause(
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
          Significance: req.input.Significance ?? null,
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
      const causeService = createCauseService();

      return causeService.deleteCauses(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.Ids
      );
    }),
});
