import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createUserBackendService } from '../../services/backend/index';
import { listQueryByUuidTsWithIdFilterSchema } from './query.schema';

const userService = createUserBackendService();

export const userRouter = router({
  userList: backendProcedure
    .input(listQueryByUuidTsWithIdFilterSchema)
    .query((req) => {
      return userService.getUserList(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input,
        req.input?.filter
      );
    }),
  userById: backendProcedure
    .input(z.object({ userId: z.string() }))
    .query((req) => {
      return userService.getUserById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.userId
      );
    }),
});
