import express from 'express';
import createHttpError from 'http-errors';

import { need } from '../auth/scopes.auth';
import type { QueryItemRequests } from '../http/request/item.request';
import type { QueryListRequests } from '../http/request/list.request';
import { getServiceContext } from '../http/request/service-context';
import { createSchemaRouteHandler } from '../http/routes/schema-route';
import { createListRequestQueryMiddleware } from '../middleware/list-request-query.middleware';
import { validateRequest } from '../middleware/validate-request.middleware';
import type {
  CreateIndicatorRequest,
  UpdateIndicatorRequest,
} from '../schemas/indicators/indicator-mutate-request.schema';
import {
  createIndicatorRequestSchema,
  updateIndicatorRequestSchema,
} from '../schemas/indicators/indicator-mutate-request.schema';
import type {
  CreateIndicatorResultRequest,
  UpdateIndicatorResultRequest,
} from '../schemas/indicators/indicator-result-mutate-request.schema';
import {
  createIndicatorResultRequestSchema,
  updateIndicatorResultRequestSchema,
} from '../schemas/indicators/indicator-result-mutate-request.schema';
import { z } from '../schemas/openapi.zod';
import type { MutationServices, ResourceServices } from '../services/index';
import type { IndicatorsTransformers } from '../transformers/index';
import { createAsyncAuthedHandler } from '../utils/createHandler';
import { idParamSchema } from '../utils/schemas';

const resultParamsSchema = z.object({
  id: z.string().uuid(),
  resultId: z.string().uuid(),
});

interface IndicatorsRouterProps extends IndicatorsTransformers {
  indicatorsService: ResourceServices['indicatorsService'];
  linkedItemsService: ResourceServices['linkedItemsService'];
  indicatorMutationService: MutationServices['indicatorMutationService'];
  schemaService: ResourceServices['schemaService'];
  queryListRequests: QueryListRequests;
  queryItemRequests: QueryItemRequests;
}

export const indicatorsRouter = ({
  indicatorsService,
  linkedItemsService,
  indicatorMutationService,
  schemaService,
  queryListRequests,
  queryItemRequests,
  transformIndicatorItem,
  transformIndicatorList,
  transformLinkedItemList,
  transformIndicatorResultItem,
  transformIndicatorResultList,
}: IndicatorsRouterProps) => {
  const router = express.Router();

  router.post(
    '/',
    validateRequest({ body: createIndicatorRequestSchema }),
    createAsyncAuthedHandler<Record<string, never>, CreateIndicatorRequest>(
      need.create('indicators'),
      async (req, res) => {
        const result = await indicatorMutationService.createIndicator({
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
      body: updateIndicatorRequestSchema,
      params: idParamSchema,
    }),
    createAsyncAuthedHandler<{ id: string }, UpdateIndicatorRequest>(
      need.update('indicators'),
      async (req, res) => {
        const result = await indicatorMutationService.updateIndicator({
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
      need.delete('indicators'),
      async (req, res) => {
        const result = await indicatorMutationService.deleteIndicator({
          id: req.params.id,
          ctx: getServiceContext(req),
        });
        res.status(200).json(result.data);
      }
    )
  );

  router.post(
    '/:id/results',
    validateRequest({
      body: createIndicatorResultRequestSchema,
      params: idParamSchema,
    }),
    createAsyncAuthedHandler<{ id: string }, CreateIndicatorResultRequest>(
      need.create('indicators.results'),
      async (req, res) => {
        const result = await indicatorMutationService.createIndicatorResult({
          item: req.body,
          ctx: getServiceContext(req),
          indicatorId: req.params.id,
        });
        res.status(201).json(result.data);
      }
    )
  );

  router.put(
    '/:id/results/:resultId',
    validateRequest({
      body: updateIndicatorResultRequestSchema,
      params: resultParamsSchema,
    }),
    createAsyncAuthedHandler<
      { id: string; resultId: string },
      UpdateIndicatorResultRequest
    >(need.update('indicators.results'), async (req, res) => {
      const result = await indicatorMutationService.updateIndicatorResult({
        item: req.body,
        ctx: getServiceContext(req),
        itemIds: {
          indicatorId: req.params.id,
          resultId: req.params.resultId,
        },
      });
      res.status(200).json(result.data);
    })
  );

  router.delete(
    '/:id/results/:resultId',
    validateRequest({ params: resultParamsSchema }),
    createAsyncAuthedHandler<{ id: string; resultId: string }>(
      need.delete('indicators.results'),
      async (req, res) => {
        const result = await indicatorMutationService.deleteIndicatorResult({
          indicatorId: req.params.id,
          resultId: req.params.resultId,
          ctx: getServiceContext(req),
        });
        res.status(200).json(result.data);
      }
    )
  );

  router.get(
    '/',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(need.list('indicators'), async (req, res) => {
      const queryResult = await queryListRequests.listQueryFetch(
        indicatorsService.getIndicators,
        transformIndicatorList,
        req
      );
      res.json(queryResult);
    })
  );

  router.get(
    '/schema',
    createSchemaRouteHandler(
      'indicator',
      need.anyReadWrite('indicators'),
      schemaService
    )
  );

  router.get(
    '/results/schema',
    createSchemaRouteHandler(
      'indicator_result',
      need.anyReadWrite('indicators.results'),
      schemaService
    )
  );

  router.get(
    '/:id',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('indicators'),
      async (req, res, next) => {
        const result = await queryItemRequests.itemByIdFetch(
          indicatorsService.getIndicatorById,
          transformIndicatorItem,
          req
        );
        if (!result) {
          return next(createHttpError(404, 'Indicator not found'));
        }
        res.json(result);
      }
    )
  );

  router.get(
    '/:id/linked-items',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('indicators.linked-items'),
      async (req, res, next) => {
        const queryFetch =
          await queryListRequests.linkedListQueryFetchByIdDateTime(
            linkedItemsService.getLinkedItems,
            transformLinkedItemList,
            req
          );
        if (!queryFetch) {
          return next(createHttpError(404, 'Indicator not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  router.get(
    '/:id/results',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('indicators.results'),
      async (req, res, next) => {
        const queryFetch =
          await queryListRequests.linkedListQueryFetchByIdDateTime(
            indicatorsService.getIndicatorResults,
            transformIndicatorResultList,
            req
          );
        if (!queryFetch) {
          return next(createHttpError(404, 'Indicator not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  router.get(
    '/:id/results/:resultId',
    createAsyncAuthedHandler<{ id: string; resultId: string }>(
      need.get('indicators.results'),
      async (req, res, next) => {
        const result = await queryItemRequests.linkedItemByIdFetch(
          indicatorsService.getIndicatorResultById,
          transformIndicatorResultItem,
          req,
          { linkKeys: ['id', 'resultId'] }
        );
        if (!result) {
          return next(createHttpError(404, 'Indicator result not found'));
        }
        res.json(result);
      }
    )
  );

  return router;
};
