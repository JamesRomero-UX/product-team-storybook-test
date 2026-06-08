import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createTagTypeBackendService } from '../../services/backend/index';
import { listQueryByUuidTsWithIdFilterSchema } from './query.schema';

const tagTypeService = createTagTypeBackendService();

export const tagTypeRouter = router({
  tagTypeList: backendProcedure
    .input(listQueryByUuidTsWithIdFilterSchema)
    .query((req) => {
      return tagTypeService.getTagTypeList(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input,
        req.input?.filter
      );
    }),
  tagTypeById: backendProcedure
    .input(z.object({ tagTypeId: z.string().uuid() }))
    .query((req) => {
      return tagTypeService.getTagTypeById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.tagTypeId
      );
    }),
});
