import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createMyItemsService } from '../../services/frontend/index';

const ownershipFilterSchema = z.object({
  owner: z.boolean(),
  contributor: z.boolean(),
  groupOwner: z.boolean(),
  groupContributor: z.boolean(),
  inheritedOwner: z.boolean(),
  inheritedContributor: z.boolean(),
  inheritedGroupOwner: z.boolean(),
  inheritedGroupContributor: z.boolean(),
});

export type OwnershipFilter = z.infer<typeof ownershipFilterSchema>;

export const myItemsRouter = router({
  dueItems: authedProcedure
    .input(
      z.object({
        date: z.string().datetime(),
        userId: z.string(),
        ownershipFilter: ownershipFilterSchema,
      })
    )
    .query(async (req) => {
      const myItemsService = createMyItemsService();

      return myItemsService.getMyDueItems(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.date,
        req.input.userId,
        req.input.ownershipFilter
      );
    }),
});
