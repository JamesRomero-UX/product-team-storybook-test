import { backendProcedure, router } from '../../init';
import { createLinkedItemBackendService } from '../../services/backend/index';
import { linkedListQueryByUuidTsSchema } from './query.schema';

const linkedItemService = createLinkedItemBackendService();

export const linkedItemRouter = router({
  linkedItemList: backendProcedure
    .input(linkedListQueryByUuidTsSchema)
    .query(async (req) => {
      return linkedItemService.getLinkedItemList(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input
      );
    }),
});
