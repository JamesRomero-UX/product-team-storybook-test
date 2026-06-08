import { ParentTypes } from '@risksmart-app/domain/src/types/consts/index';
import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createPermissionService } from '../../services/frontend/index';
export const permissionRouter = router({
  bulkCheck: authedProcedure
    .input(
      z.array(
        z.object({
          resourceName: z.string(),
          resourceId: z.string().uuid().optional(),
          action: z.enum(['read', 'delete', 'insert', 'update']),
        })
      )
    )
    .query(async (req) => {
      const permissionService = createPermissionService();

      return permissionService.bulkCheck(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input
      );
    }),
  checkNavigationVisibility: authedProcedure
    .input(
      z.object({
        parentTypes: z.array(z.nativeEnum(ParentTypes)),
      })
    )
    .query(async (req) => {
      const permissionService = createPermissionService();

      return permissionService.checkNavigationVisibility(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.parentTypes
      );
    }),
});
