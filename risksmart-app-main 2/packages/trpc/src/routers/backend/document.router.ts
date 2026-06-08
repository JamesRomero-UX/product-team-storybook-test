import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import { createDocumentBackendService } from '../../services/backend/index';
import { listQueryBySeqIdSchema } from './query.schema';

const documentService = createDocumentBackendService();

export const documentRouter = router({
  documentList: backendProcedure.input(listQueryBySeqIdSchema).query((req) => {
    return documentService.getDocumentList(
      {
        orgId: req.ctx.user.orgId,
        tenant: req.ctx.user.tenant,
      },
      req.input
    );
  }),
  documentById: backendProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .query((req) => {
      return documentService.getDocumentById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.documentId
      );
    }),
});
