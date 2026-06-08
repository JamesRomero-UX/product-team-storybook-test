import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createUserGroupService } from '../../services/frontend/index';

export const userGroupRouter = router({
  userGroupById: authedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const userGroupService = createUserGroupService();

      return userGroupService.getById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),

  usersByGroupId: authedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
      })
    )
    .query(async (req) => {
      const userGroupService = createUserGroupService();

      return userGroupService.getUsersByGroupId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.groupId
      );
    }),

  userGroupsWithApprovers: authedProcedure.query(async (req) => {
    const userGroupService = createUserGroupService();

    return userGroupService.getUserGroupsWithApprovers({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
});
