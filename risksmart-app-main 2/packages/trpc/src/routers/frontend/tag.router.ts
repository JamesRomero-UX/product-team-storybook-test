import { authedProcedure, router } from '../../init';
import { createTagService } from '../../services/frontend/index';

export const tagRouter = router({
  allTypes: authedProcedure.query(async (req) => {
    const tagService = createTagService();

    return tagService.getTags({
      orgId: req.ctx.user.orgId,
      tenant: req.ctx.user.tenant,
      userId: req.ctx.user.userId,
    });
  }),
});
