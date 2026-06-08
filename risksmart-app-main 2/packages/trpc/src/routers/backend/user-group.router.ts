import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createUserGroupBackendService } from '../../services/backend/index';
import { listQueryByUuidTsWithIdFilterSchema } from './query.schema';

const userGroupService = createUserGroupBackendService();

export const userGroupRouter = router({
  userGroupList: backendProcedure
    .input(listQueryByUuidTsWithIdFilterSchema)
    .query((req) => {
      return userGroupService.getUserGroupList(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input,
        req.input?.filter
      );
    }),
  userGroupById: backendProcedure
    .input(z.object({ userGroupId: z.string().uuid() }))
    .query((req) => {
      return userGroupService.getUserGroupById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.userGroupId
      );
    }),
});
