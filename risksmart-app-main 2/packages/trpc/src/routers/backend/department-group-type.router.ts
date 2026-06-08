import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createDepartmentGroupTypeBackendService } from '../../services/backend/index';
import { listQueryByUuidTsWithIdFilterSchema } from './query.schema';

const departmentGroupTypeService = createDepartmentGroupTypeBackendService();

export const departmentGroupTypeRouter = router({
  departmentGroupTypeList: backendProcedure
    .input(listQueryByUuidTsWithIdFilterSchema)
    .query((req) => {
      return departmentGroupTypeService.getDepartmentGroupTypeList(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input,
        req.input?.filter
      );
    }),
  departmentGroupTypeById: backendProcedure
    .input(z.object({ departmentGroupTypeId: z.string().uuid() }))
    .query((req) => {
      return departmentGroupTypeService.getDepartmentGroupTypeById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.departmentGroupTypeId
      );
    }),
});
