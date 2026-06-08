import { authedProcedure, router } from '../../init';
import { createOrganisationModuleService } from '../../services/frontend/index';

export const organisationModuleRouter = router({
  getByOrgId: authedProcedure.query(async (req) => {
    const organisationModuleService = createOrganisationModuleService();

    return organisationModuleService.getByOrgId({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
});
