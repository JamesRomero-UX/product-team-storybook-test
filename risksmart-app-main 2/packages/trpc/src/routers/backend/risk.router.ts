import { z } from 'zod';

import { backendProcedure, router } from '../../init';
import {
  createActionBackendService,
  createRiskBackendService,
} from '../../services/backend/index';
import {
  linkedListQueryBySeqIdSchema,
  linkedListQueryByUuidTsSchema,
  listQueryBySeqIdSchema,
} from './query.schema';

const riskService = createRiskBackendService();
const actionService = createActionBackendService();

export const riskRouter = router({
  riskAcceptancesList: backendProcedure
    .input(linkedListQueryBySeqIdSchema)
    .query(async (req) => {
      const queryInputs = {
        limit: req.input?.limit || null,
        beforeSequentialId: req.input.beforeSequentialId || null,
        afterSequentialId: req.input.afterSequentialId || null,
        linkId: req.input.linkId,
      };

      return riskService.getRiskAcceptances(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        queryInputs
      );
    }),
  riskApprovalsList: backendProcedure
    .input(linkedListQueryByUuidTsSchema)
    .query(async (req) => {
      return riskService.getRiskApprovals(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input
      );
    }),
  riskAssessmentResultsList: backendProcedure
    .input(linkedListQueryByUuidTsSchema)
    .query(async (req) => {
      return riskService.getRiskAssessmentResults(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input
      );
    }),
  riskImpactRatingsList: backendProcedure
    .input(linkedListQueryBySeqIdSchema)
    .query(async (req) => {
      const queryInputs = {
        limit: req.input?.limit || null,
        beforeSequentialId: req.input.beforeSequentialId || null,
        afterSequentialId: req.input.afterSequentialId || null,
        linkId: req.input.linkId,
      };

      return riskService.getRiskImpactRatings(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        queryInputs
      );
    }),
  riskActionsList: backendProcedure
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
  riskControlsList: backendProcedure
    .input(linkedListQueryBySeqIdSchema)
    .query(async (req) => {
      const queryInputs = {
        limit: req.input?.limit || null,
        beforeSequentialId: req.input.beforeSequentialId || null,
        afterSequentialId: req.input.afterSequentialId || null,
        linkId: req.input.linkId,
      };

      return riskService.getRiskControls(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        queryInputs
      );
    }),
  riskIndicatorsList: backendProcedure
    .input(linkedListQueryBySeqIdSchema)
    .query(async (req) => {
      const queryInputs = {
        limit: req.input?.limit || null,
        beforeSequentialId: req.input.beforeSequentialId || null,
        afterSequentialId: req.input.afterSequentialId || null,
        linkId: req.input.linkId,
      };

      return riskService.getRiskIndicators(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        queryInputs
      );
    }),
  riskAppetitesList: backendProcedure
    .input(linkedListQueryBySeqIdSchema)
    .query(async (req) => {
      const queryInputs = {
        limit: req.input?.limit || null,
        beforeSequentialId: req.input.beforeSequentialId || null,
        afterSequentialId: req.input.afterSequentialId || null,
        linkId: req.input.linkId,
      };

      return riskService.getRiskAppetites(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        queryInputs
      );
    }),
  riskList: backendProcedure
    .input(listQueryBySeqIdSchema)
    .query(async (req) => {
      const queryInputs = {
        limit: req.input?.limit || null,
        beforeSequentialId: req.input?.beforeSequentialId || null,
        afterSequentialId: req.input?.afterSequentialId || null,
      };

      return riskService.getRiskList(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        queryInputs
      );
    }),
  riskById: backendProcedure
    .input(z.object({ riskId: z.string().uuid() }))
    .query(async (req) => {
      return riskService.getRiskById(
        {
          orgId: req.ctx.user.orgId,
          tenant: req.ctx.user.tenant,
        },
        req.input.riskId
      );
    }),
});
