import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createIndicatorBackendService } from '../../services/backend/index';
import {
  linkedListQueryByUuidTsSchema,
  listQueryBySeqIdSchema,
} from './query.schema';

const indicatorService = createIndicatorBackendService();

export const indicatorRouter = router({
  indicatorList: backendProcedure.input(listQueryBySeqIdSchema).query((req) => {
    return indicatorService.getIndicatorList(
      {
        orgId: req.ctx.user.orgId,
        tenant: req.ctx.user.tenant,
      },
      req.input
    );
  }),
  indicatorById: backendProcedure
    .input(z.object({ indicatorId: z.string().uuid() }))
    .query((req) => {
      return indicatorService.getIndicatorById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.indicatorId
      );
    }),
  indicatorResultList: backendProcedure
    .input(linkedListQueryByUuidTsSchema)
    .query((req) => {
      return indicatorService.getIndicatorResultList(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input
      );
    }),
  indicatorResultById: backendProcedure
    .input(z.object({ indicatorResultId: z.string().uuid() }))
    .query((req) => {
      return indicatorService.getIndicatorResultById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.indicatorResultId
      );
    }),
});
