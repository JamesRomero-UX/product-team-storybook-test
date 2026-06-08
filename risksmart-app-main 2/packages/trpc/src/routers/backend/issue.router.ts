import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import {
  createActionBackendService,
  createIssueBackendService,
} from '../../services/backend/index';
import {
  linkedListQueryBySeqIdSchema,
  linkedListQueryByUuidTsSchema,
  listQueryBySeqIdSchema,
} from './query.schema';

const issueService = createIssueBackendService();
const actionService = createActionBackendService();

export const issueRouter = router({
  issueList: backendProcedure.input(listQueryBySeqIdSchema).query((req) => {
    return issueService.getIssueList(
      {
        orgId: req.ctx.user.orgId,
        tenant: req.ctx.user.tenant,
      },
      req.input
    );
  }),
  issueById: backendProcedure
    .input(z.object({ issueId: z.string().uuid() }))
    .query((req) => {
      return issueService.getIssueById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.issueId
      );
    }),
  issueActionsList: backendProcedure
    .input(linkedListQueryBySeqIdSchema)
    .query(async (req) => {
      const queryInputs = {
        limit: req.input?.limit || null,
        beforeSequentialId: req.input.beforeSequentialId || null,
        afterSequentialId: req.input.afterSequentialId || null,
        linkId: req.input.linkId,
      };

      return actionService.getActionsByParent(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        queryInputs
      );
    }),
  issueAssessment: backendProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async (req) => {
      return issueService.getIssueAssessment(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.id
      );
    }),
  issueCauseById: backendProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query((req) => {
      return issueService.getIssueCauseById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.id
      );
    }),
  issueConsequenceById: backendProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query((req) => {
      return issueService.getIssueConsequenceById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.id
      );
    }),
  issueUpdateById: backendProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query((req) => {
      return issueService.getIssueUpdateById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.id
      );
    }),
  issueCausesList: backendProcedure
    .input(linkedListQueryByUuidTsSchema)
    .query(async (req) => {
      const queryInputs = {
        limit: req.input?.limit || null,
        beforeId: req.input.beforeId || null,
        beforeDateTime: req.input.beforeDateTime || null,
        afterId: req.input.afterId || null,
        afterDateTime: req.input.afterDateTime || null,
        linkId: req.input.linkId,
      };

      return issueService.getIssueCauses(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        queryInputs
      );
    }),
  issueConsequencesList: backendProcedure
    .input(linkedListQueryByUuidTsSchema)
    .query(async (req) => {
      const queryInputs = {
        limit: req.input?.limit || null,
        beforeId: req.input.beforeId || null,
        beforeDateTime: req.input.beforeDateTime || null,
        afterId: req.input.afterId || null,
        afterDateTime: req.input.afterDateTime || null,
        linkId: req.input.linkId,
      };

      return issueService.getIssueConsequences(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        queryInputs
      );
    }),
  issueUpdatesList: backendProcedure
    .input(linkedListQueryByUuidTsSchema)
    .query(async (req) => {
      const queryInputs = {
        limit: req.input?.limit || null,
        beforeId: req.input.beforeId || null,
        beforeDateTime: req.input.beforeDateTime || null,
        afterId: req.input.afterId || null,
        afterDateTime: req.input.afterDateTime || null,
        linkId: req.input.linkId,
      };

      return issueService.getIssueUpdates(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        queryInputs
      );
    }),
});
