import { ActionStatus } from '@risksmart-app/domain/src/types/consts/action-status';
import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createActionService } from '../../services/frontend/index';

export const actionRouter = router({
  register: authedProcedure
    .input(
      z.object({
        parentId: z.string().uuid().optional(),
        tagTypeIds: z.array(z.string().uuid()).optional(),
        departmentTypeIds: z.array(z.string().uuid()).optional(),
      })
    )
    .query(async (req) => {
      const actionService = createActionService();

      return actionService.getActionsRegister(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.parentId,
        req.input.departmentTypeIds,
        req.input.tagTypeIds
      );
    }),
  actionById: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const actionService = createActionService();

      return actionService.getById(
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
        DateDue: z.string().min(1),
        DateRaised: z.string().min(1),
        Status: z.nativeEnum(ActionStatus),
        Priority: z.number().int().nullable().optional(),
        Description: z.string().nullable().optional(),
        ClosedDate: z.string().nullable().optional(),
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
      })
    )
    .mutation(async (req) => {
      const actionService = createActionService();

      return actionService.insertAction(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          ParentId: req.input.ParentId ?? null,
          Title: req.input.Title,
          DateDue: req.input.DateDue,
          DateRaised: req.input.DateRaised,
          Status: req.input.Status,
          Priority: req.input.Priority ?? null,
          Description: req.input.Description ?? null,
          ClosedDate: req.input.ClosedDate ?? null,
          CustomAttributeData: req.input.CustomAttributeData ?? null,
          OwnerUserIds: req.input.OwnerUserIds ?? [],
          OwnerGroupIds: req.input.OwnerGroupIds ?? [],
          ContributorUserIds: req.input.ContributorUserIds ?? [],
          ContributorGroupIds: req.input.ContributorGroupIds ?? [],
          TagTypeIds: req.input.TagTypeIds ?? [],
          DepartmentTypeIds: req.input.DepartmentTypeIds ?? [],
        }
      );
    }),
  updates: {
    getActionUpdatesByParentActionId: authedProcedure
      .input(z.object({ ParentActionId: z.string().uuid() }))
      .query(async (req) => {
        const actionService = createActionService();

        return actionService.getActionUpdatesByParentActionId(
          {
            orgId: req.ctx.user.orgId,
            tenant: req.ctx.user.tenant,
            userId: req.ctx.user.userId,
          },
          req.input.ParentActionId
        );
      }),
    getActionUpdateById: authedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async (req) => {
        const actionService = createActionService();

        return actionService.getActionUpdateById(
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
          ParentActionId: z.string().uuid(),
          Title: z.string().min(1),
          Description: z.string(),
          CustomAttributeData: z
            .record(z.string(), z.unknown())
            .nullable()
            .optional(),
        })
      )
      .mutation(async (req) => {
        const actionService = createActionService();

        return actionService.insertActionUpdate(
          {
            orgId: req.ctx.user.orgId,
            tenant: req.ctx.user.tenant,
            userId: req.ctx.user.userId,
          },
          {
            ParentActionId: req.input.ParentActionId,
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
        const actionService = createActionService();

        return actionService.deleteActionUpdates(
          {
            orgId: req.ctx.user.orgId,
            tenant: req.ctx.user.tenant,
            userId: req.ctx.user.userId,
          },
          req.input.ids
        );
      }),
  },
});
