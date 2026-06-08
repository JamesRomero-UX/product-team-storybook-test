import z from 'zod';

import { authedProcedure, router } from '../../init';
import { createIssueUpdateService } from '../../services/frontend/index';

export const issueUpdateRouter = router({
  register: authedProcedure
    .input(
      z.object({
        parentIssueId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const issueUpdateService = createIssueUpdateService();

      return issueUpdateService.getIssueUpdatesByParentIssueId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.parentIssueId
      );
    }),
  getById: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const issueUpdateService = createIssueUpdateService();

      return issueUpdateService.getIssueUpdateById(
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
        Description: z.string(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
      })
    )
    .mutation(async (req) => {
      const issueUpdateService = createIssueUpdateService();

      return issueUpdateService.insertIssueUpdate(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          ParentIssueId: req.input.ParentIssueId,
          Title: req.input.Title,
          Description: req.input.Description,
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
      const issueUpdateService = createIssueUpdateService();

      return issueUpdateService.deleteIssueUpdates(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          Ids: req.input.ids,
        }
      );
    }),
});
