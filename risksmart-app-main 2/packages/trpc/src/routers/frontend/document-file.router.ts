import { VersionStatus } from '@risksmart-app/domain/src/types/consts/version-status';
import { z } from 'zod';

import { authedProcedure, router } from '../../init';
import { createPolicyService } from '../../services/frontend/index';
import { logger } from '../../utils/logger';

export const documentFileRouter = router({
  latestPublicDocumentFileByDocumentId: authedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .query(async (req) => {
      const policyService = createPolicyService();
      logger.debug(
        { documentId: req.input.documentId },
        'Fetching document by id'
      );

      return policyService.getLatestPublicDocumentFileByDocumentId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.documentId
      );
    }),

  documentFileById: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async (req) => {
      const policyService = createPolicyService();
      logger.debug(
        { documentFileId: req.input.id },
        'Fetching document file by id'
      );

      return policyService.getDocumentFileById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.id
      );
    }),

  documentFilesByDocumentId: authedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .query(async (req) => {
      const policyService = createPolicyService();
      logger.debug(
        { documentId: req.input.documentId },
        'Fetching document files by document id'
      );

      return policyService.getDocumentFilesByDocumentId(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.documentId
      );
    }),

  //Can't use .uuid() validation due to auth0 token format
  publicDocumentFiles: authedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async (req) => {
      const policyService = createPolicyService();
      const userId = req.input.userId;
      logger.debug(
        {
          requestingUserId: req.ctx.user.userId,
          userId,
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        'Fetching public document files'
      );

      return policyService.getPublicDocumentFiles(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        userId
      );
    }),

  latestDocumentFile: authedProcedure
    .input(
      z.object({
        parentDocumentId: z.string().uuid(),
        fileId: z.string().optional(),
        status: z.nativeEnum(VersionStatus).optional(),
      })
    )
    .query(async (req) => {
      const policyService = createPolicyService();
      logger.debug(
        {
          userId: req.ctx.user.userId,
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          parentDocumentId: req.input.parentDocumentId,
          fileId: req.input.fileId,
          status: req.input.status,
        },
        'Fetching latest document file'
      );

      return policyService.getLatestDocumentFile(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
          userId: req.ctx.user.userId,
        },
        req.input.parentDocumentId,
        req.input.fileId,
        req.input.status
      );
    }),
});
