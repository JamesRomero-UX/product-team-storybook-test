import express from 'express';
import createHttpError from 'http-errors';

import { need } from '../auth/scopes.auth';
import type { QueryItemRequests } from '../http/request/item.request';
import type { QueryListRequests } from '../http/request/list.request';
import { getServiceContext } from '../http/request/service-context';
import { createSchemaRouteHandler } from '../http/routes/schema-route';
import { createListRequestQueryMiddleware } from '../middleware/list-request-query.middleware';
import { validateRequest } from '../middleware/validate-request.middleware';
import type { CreateIndicatorForParentRequest } from '../schemas/indicators/indicator-mutate-request.schema';
import { createIndicatorForParentRequestSchema } from '../schemas/indicators/indicator-mutate-request.schema';
import type {
  CreateRiskRequest,
  UpdateRiskRequest,
} from '../schemas/risks/risk-mutate-request.schema';
import {
  createRiskRequestSchema,
  updateRiskRequestSchema,
} from '../schemas/risks/risk-mutate-request.schema';
import type { MutationServices } from '../services/index';
import type { ResourceServices } from '../services/index';
import type { RisksTransformers } from '../transformers/index';
import { createAsyncAuthedHandler } from '../utils/createHandler';
import { idParamSchema } from '../utils/schemas';
interface RisksRouterProps extends RisksTransformers {
  risksService: ResourceServices['risksService'];
  linkedItemsService: ResourceServices['linkedItemsService'];
  riskMutationService: MutationServices['riskMutationService'];
  indicatorMutationService: MutationServices['indicatorMutationService'];
  schemaService: ResourceServices['schemaService'];
  queryListRequests: QueryListRequests;
  queryItemRequests: QueryItemRequests;
}

export const risksRouter = ({
  risksService,
  linkedItemsService,
  riskMutationService,
  indicatorMutationService,
  schemaService,
  queryItemRequests,
  queryListRequests,
  transformRiskItem,
  transformRiskList,
  transformRiskRatingItem,
  transformRiskRatingList,
  transformLinkedItemList,
  transformControlList,
  transformActionList,
  transformIndicatorList,
  transformAppetiteItem,
  transformAppetiteList,
  transformImpactList,
  transformRiskAcceptanceItem,
  transformRiskAcceptanceList,
  transformApprovalItem,
  transformApprovalList,
}: RisksRouterProps) => {
  const router = express.Router();

  router.post(
    '/',
    validateRequest({ body: createRiskRequestSchema }),
    createAsyncAuthedHandler<Record<string, never>, CreateRiskRequest>(
      need.create('risks'),
      async (req, res) => {
        const result = await riskMutationService.createRisk({
          item: req.body,
          ctx: getServiceContext(req),
        });
        res.status(201).json(result.data);
      }
    )
  );

  router.put(
    '/:id',
    validateRequest({
      body: updateRiskRequestSchema,
      params: idParamSchema,
    }),
    createAsyncAuthedHandler<{ id: string }, UpdateRiskRequest>(
      need.update('risks'),
      async (req, res) => {
        const result = await riskMutationService.updateRisk({
          item: req.body,
          ctx: getServiceContext(req),
          itemIds: { id: req.params.id },
        });
        res.status(200).json(result.data);
      }
    )
  );

  router.delete(
    '/:id',
    validateRequest({ params: idParamSchema }),
    createAsyncAuthedHandler<{ id: string }>(
      need.delete('risks'),
      async (req, res) => {
        const result = await riskMutationService.deleteRisk({
          id: req.params.id,
          ctx: getServiceContext(req),
        });
        res.status(200).json(result.data);
      }
    )
  );

  router.post(
    '/:id/indicators',
    validateRequest({
      body: createIndicatorForParentRequestSchema,
      params: idParamSchema,
    }),
    createAsyncAuthedHandler<{ id: string }, CreateIndicatorForParentRequest>(
      need.create('risks.indicators'),
      async (req, res) => {
        const item = {
          ...req.body,
          parentId: req.params.id,
        };
        const result = await indicatorMutationService.createIndicator({
          item,
          ctx: getServiceContext(req),
        });
        res.status(201).json(result.data);
      }
    )
  );

  router.get(
    '/',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(need.list('risks'), async (req, res) => {
      const queryFetch = await queryListRequests.listQueryFetch(
        risksService.getRisks,
        transformRiskList,
        req
      );

      res.json(queryFetch);
    })
  );

  router.get(
    '/schema',
    createSchemaRouteHandler('risk', need.anyReadWrite('risks'), schemaService)
  );

  router.get(
    '/appetites/schema',
    createSchemaRouteHandler(
      'appetite',
      need.anyReadWrite('risks.appetite'),
      schemaService
    )
  );

  router.get(
    '/ratings/schema',
    createSchemaRouteHandler(
      'impact_rating',
      need.anyReadWrite('risks.ratings'),
      schemaService
    )
  );

  router.get(
    '/acceptances/schema',
    createSchemaRouteHandler(
      'acceptance',
      need.anyReadWrite('risks.acceptances'),
      schemaService
    )
  );

  router.get(
    '/:id',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('risks'),
      async (req, res, next) => {
        const result = await queryItemRequests.itemByIdFetch(
          risksService.getRiskById,
          transformRiskItem,
          req
        );
        if (!result) {
          return next(createHttpError(404, 'Risk not found'));
        }
        res.json(result);
      }
    )
  );

  router.get(
    '/:id/controls',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(
      need.list('risks.controls'),
      async (req, res, next) => {
        const queryFetch = await queryListRequests.linkedListQueryFetch(
          risksService.getRiskControls,
          transformControlList,
          req
        );
        if (!queryFetch) {
          return next(createHttpError(404, 'Risk not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  router.get(
    '/:id/actions',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(
      need.list('risks.actions'),
      async (req, res, next) => {
        const queryFetch = await queryListRequests.linkedListQueryFetch(
          risksService.getRiskActions,
          transformActionList,
          req
        );
        if (!queryFetch) {
          return next(createHttpError(404, 'Risk not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  router.get(
    '/:id/indicators',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(
      need.list('risks.indicators'),
      async (req, res, next) => {
        const queryFetch = await queryListRequests.linkedListQueryFetch(
          risksService.getRiskIndicators,
          transformIndicatorList,
          req
        );
        if (!queryFetch) {
          return next(createHttpError(404, 'Risk not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  router.get(
    '/:id/appetites',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('risks.appetite'),
      async (req, res, next) => {
        const queryFetch = await queryListRequests.linkedListQueryFetch(
          risksService.getRiskAppetites,
          transformAppetiteList,
          req
        );
        if (!queryFetch) {
          return next(createHttpError(404, 'Risk not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  router.get(
    '/:id/appetites/:appetiteId',
    createAsyncAuthedHandler<{ id: string; appetiteId: string }>(
      need.get('risks.appetite'),
      async (req, res, next) => {
        const result = await queryItemRequests.linkedItemByIdFetch(
          risksService.getRiskAppetiteById,
          transformAppetiteItem,
          req,
          { linkKeys: ['id', 'appetiteId'] }
        );
        if (!result) {
          return next(createHttpError(404, 'Appetite not found'));
        }
        res.json(result);
      }
    )
  );

  router.get(
    '/:id/ratings',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('risks.ratings'),
      async (req, res, next) => {
        const queryFetch =
          await queryListRequests.linkedListQueryFetchByIdDateTime(
            risksService.getRiskRatings,
            transformRiskRatingList,
            req
          );
        if (!queryFetch) {
          return next(createHttpError(404, 'Risk not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  router.get(
    '/:id/ratings/:ratingId',
    createAsyncAuthedHandler<{ id: string; ratingId: string }>(
      need.get('risks.ratings'),
      async (req, res, next) => {
        const result = await queryItemRequests.linkedItemByIdFetch(
          risksService.getRiskRatingById,
          transformRiskRatingItem,
          req,
          { linkKeys: ['id', 'ratingId'] }
        );
        if (!result) {
          return next(createHttpError(404, 'Risk rating not found'));
        }
        res.json(result);
      }
    )
  );

  router.get(
    '/:id/impacts',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(need.list('risks.impacts'), async (req, res) => {
      const queryResult = await queryListRequests.listQueryFetch(
        risksService.getRiskImpacts,
        transformImpactList,
        req
      );
      res.json(queryResult);
    })
  );

  router.get(
    '/:id/acceptances',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('risks.acceptances'),
      async (req, res, next) => {
        const queryFetch = await queryListRequests.linkedListQueryFetch(
          risksService.getRiskAcceptances,
          transformRiskAcceptanceList,
          req
        );
        if (!queryFetch) {
          return next(createHttpError(404, 'Risk not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  router.get(
    '/:id/acceptances/:acceptanceId',
    createAsyncAuthedHandler<{ id: string; acceptanceId: string }>(
      need.get('risks.acceptances'),
      async (req, res, next) => {
        const result = await queryItemRequests.linkedItemByIdFetch(
          risksService.getRiskAcceptanceById,
          transformRiskAcceptanceItem,
          req,
          { linkKeys: ['id', 'acceptanceId'] }
        );
        if (!result) {
          return next(createHttpError(404, 'Risk acceptance not found'));
        }
        res.json(result);
      }
    )
  );

  router.get(
    '/:id/approvals',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('risks.approvals'),
      async (req, res, next) => {
        const queryFetch =
          await queryListRequests.linkedListQueryFetchByIdDateTime(
            risksService.getRiskApprovals,
            transformApprovalList,
            req
          );
        if (!queryFetch) {
          return next(createHttpError(404, 'Risk not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  router.get(
    '/:id/approvals/:approvalId',
    createAsyncAuthedHandler<{ id: string; approvalId: string }>(
      need.get('risks.approvals'),
      async (req, res, next) => {
        const result = await queryItemRequests.linkedItemByIdFetch(
          risksService.getRiskApprovalById,
          transformApprovalItem,
          req,
          { linkKeys: ['id', 'approvalId'] }
        );
        if (!result) {
          return next(createHttpError(404, 'Risk approval not found'));
        }
        res.json(result);
      }
    )
  );

  router.get(
    '/:id/linked-items',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('risks.linked-items'),
      async (req, res, next) => {
        const queryFetch =
          await queryListRequests.linkedListQueryFetchByIdDateTime(
            linkedItemsService.getLinkedItems,
            transformLinkedItemList,
            req
          );
        if (!queryFetch) {
          return next(createHttpError(404, 'Risk not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  return router;
};
