import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createDepartmentTypeBackendService } from '../../services/backend/index';
import { listQueryByUuidTsWithIdFilterSchema } from './query.schema';

const departmentTypeService = createDepartmentTypeBackendService();

export const departmentTypeRouter = router({
  departmentTypeList: backendProcedure
    .input(listQueryByUuidTsWithIdFilterSchema)
    .query((req) => {
      return departmentTypeService.getDepartmentTypeList(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input,
        req.input?.filter
      );
    }),
  departmentTypeById: backendProcedure
    .input(z.object({ departmentTypeId: z.string().uuid() }))
    .query((req) => {
      return departmentTypeService.getDepartmentTypeById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.departmentTypeId
      );
    }),
});
