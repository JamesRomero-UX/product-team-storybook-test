import { authedProcedure, router } from '../../init';
import { createDepartmentService } from '../../services/frontend/index';

export const departmentRouter = router({
  allTypes: authedProcedure.query(async (req) => {
    const departmentService = createDepartmentService();

    return departmentService.getDepartments({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
});
