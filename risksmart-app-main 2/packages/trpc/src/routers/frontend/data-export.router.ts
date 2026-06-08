import { authedProcedure, router } from '../../init';
import { createDataExportService } from '../../services/frontend/index';

export const dataExportRouter = router({
  getActiveSchedule: authedProcedure.query(async (req) => {
    const dataExportService = createDataExportService();

    return dataExportService.getActiveSchedule({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
  getScheduleExecutions: authedProcedure.query(async (req) => {
    const dataExportService = createDataExportService();

    return dataExportService.getScheduleExecutions({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
});
