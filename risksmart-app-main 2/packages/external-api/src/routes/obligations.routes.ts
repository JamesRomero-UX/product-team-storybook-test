import express from 'express';
import createHttpError from 'http-errors';

import { need } from '../auth/scopes.auth';
import type { QueryItemRequests } from '../http/request/item.request';
import type { QueryListRequests } from '../http/request/list.request';
import { createSchemaRouteHandler } from '../http/routes/schema-route';
import { createListRequestQueryMiddleware } from '../middleware/list-request-query.middleware';
import type { ResourceServices } from '../services/index';
import type { ObligationsTransformers } from '../transformers/index';
import { createAsyncAuthedHandler } from '../utils/createHandler';

interface ObligationsRouterProps extends ObligationsTransformers {
  obligationsService: ResourceServices['obligationsService'];
  linkedItemsService: ResourceServices['linkedItemsService'];
  schemaService: ResourceServices['schemaService'];
  queryListRequests: QueryListRequests;
  queryItemRequests: QueryItemRequests;
}

export const obligationsRouter = ({
  obligationsService,
  linkedItemsService,
  schemaService,
  queryListRequests,
  queryItemRequests,
  transformObligationItem,
  transformObligationList,
  transformLinkedItemList,
}: ObligationsRouterProps) => {
  const router = express.Router();

  router.get(
    '/',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(need.list('obligations'), async (req, res) => {
      const queryResult = await queryListRequests.listQueryFetch(
        obligationsService.getObligations,
        transformObligationList,
        req
      );
      res.json(queryResult);
    })
  );

  router.get(
    '/schema',
    createSchemaRouteHandler(
      'obligation',
      need.anyReadWrite('obligations'),
      schemaService
    )
  );

  router.get(
    '/:id',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('obligations'),
      async (req, res, next) => {
        const result = await queryItemRequests.itemByIdFetch(
          obligationsService.getObligationById,
          transformObligationItem,
          req
        );
        if (!result) {
          return next(createHttpError(404, 'Obligation not found'));
        }
        res.json(result);
      }
    )
  );

  router.get(
    '/:id/linked-items',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('obligations.linked-items'),
      async (req, res, next) => {
        const queryFetch =
          await queryListRequests.linkedListQueryFetchByIdDateTime(
            linkedItemsService.getLinkedItems,
            transformLinkedItemList,
            req
          );
        if (!queryFetch) {
          return next(createHttpError(404, 'Obligation not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  return router;
};
