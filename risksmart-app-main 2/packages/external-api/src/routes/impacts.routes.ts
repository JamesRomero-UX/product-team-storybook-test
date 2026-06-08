import express from 'express';
import createHttpError from 'http-errors';

import { need } from '../auth/scopes.auth';
import type { QueryItemRequests } from '../http/request/item.request';
import type { QueryListRequests } from '../http/request/list.request';
import { createSchemaRouteHandler } from '../http/routes/schema-route';
import { createListRequestQueryMiddleware } from '../middleware/list-request-query.middleware';
import type { ResourceServices } from '../services/index';
import type { ImpactsTransformers } from '../transformers/index';
import { createAsyncAuthedHandler } from '../utils/createHandler';

interface ImpactsRouterProps extends ImpactsTransformers {
  impactsService: ResourceServices['impactsService'];
  schemaService: ResourceServices['schemaService'];
  queryListRequests: QueryListRequests;
  queryItemRequests: QueryItemRequests;
}

export const impactsRouter = ({
  impactsService,
  schemaService,
  queryListRequests,
  queryItemRequests,
  transformImpactItem,
  transformImpactList,
}: ImpactsRouterProps) => {
  const router = express.Router();

  router.get(
    '/',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(need.list('impacts'), async (req, res) => {
      const queryResult = await queryListRequests.listQueryFetch(
        impactsService.getImpacts,
        transformImpactList,
        req
      );
      res.json(queryResult);
    })
  );

  router.get(
    '/schema',
    createSchemaRouteHandler(
      'impact',
      need.anyReadWrite('impacts'),
      schemaService
    )
  );

  router.get(
    '/:id',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('impacts'),
      async (req, res, next) => {
        const result = await queryItemRequests.itemByIdFetch(
          impactsService.getImpactById,
          transformImpactItem,
          req
        );
        if (!result) {
          return next(createHttpError(404, 'Impact not found'));
        }
        res.json(result);
      }
    )
  );

  return router;
};
