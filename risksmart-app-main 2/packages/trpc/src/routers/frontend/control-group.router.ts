import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createControlService } from '../../services/frontend/index';
import { logger } from '../../utils/logger';

export const controlGroupRouter = router({
  register: authedProcedure.query(async (req) => {
    const controlService = createControlService();
    logger.debug(
      {
        userId: req.ctx.user.userId,
        orgId: req.ctx.user.orgId,
        tenant: req.ctx.user.tenant,
      },
      'Fetching control groups register'
    );

    return controlService.getControlGroupsRegister({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),

  controlGroupById: authedProcedure
    .input(
      z.object({
        controlGroupId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const controlService = createControlService();
      logger.debug(
        {
          userId: req.ctx.user.userId,
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        'Fetching control group by ID'
      );

      return controlService.getControlGroupById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.controlGroupId
      );
    }),

  controlGroupsByTitle: authedProcedure
    .input(
      z.object({
        title: z.string(),
      })
    )
    .query(async (req) => {
      const controlService = createControlService();
      logger.debug(
        {
          userId: req.ctx.user.userId,
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        'Fetching control groups by title'
      );

      return controlService.getControlGroupsByTitle(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.title
      );
    }),

  controlGroups: authedProcedure.query(async (req) => {
    const controlService = createControlService();
    logger.debug(
      {
        userId: req.ctx.user.userId,
        orgId: req.ctx.user.orgId,
        tenant: req.ctx.user.tenant,
      },
      'Fetching all control groups'
    );

    return controlService.getControlGroups({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),

  insert: authedProcedure
    .input(
      z.object({
        Title: z.string().min(1).max(255),
        Description: z.string(),
        Owner: z.string(),
        CustomAttributeData: z
          .record(z.string(), z.unknown())
          .nullable()
          .optional(),
      })
    )
    .mutation(async (req) => {
      const controlService = createControlService();

      return controlService.insertControlGroup(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        {
          Title: req.input.Title,
          Description: req.input.Description,
          Owner: req.input.Owner,
          CustomAttributeData: req.input.CustomAttributeData ?? null,
        }
      );
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string().uuid(), originalTimestamp: z.string() }))
    .mutation(async (req) => {
      const controlService = createControlService();

      return controlService.deleteControlGroup(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id,
        {
          OriginalTimestamp: req.input.originalTimestamp,
        }
      );
    }),
});
