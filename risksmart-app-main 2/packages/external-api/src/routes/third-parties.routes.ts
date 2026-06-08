import express from 'express';
import createHttpError from 'http-errors';

import { need } from '../auth/scopes.auth';
import type { QueryItemRequests } from '../http/request/item.request';
import type { QueryListRequests } from '../http/request/list.request';
import { createSchemaRouteHandler } from '../http/routes/schema-route';
import { createListRequestQueryMiddleware } from '../middleware/list-request-query.middleware';
import type { ResourceServices } from '../services/index';
import type { ThirdPartiesTransformers } from '../transformers/index';
import { createAsyncAuthedHandler } from '../utils/createHandler';

interface ThirdPartiesRouterProps extends ThirdPartiesTransformers {
  thirdPartiesService: ResourceServices['thirdPartiesService'];
  linkedItemsService: ResourceServices['linkedItemsService'];
  schemaService: ResourceServices['schemaService'];
  queryListRequests: QueryListRequests;
  queryItemRequests: QueryItemRequests;
}

export const thirdPartiesRouter = ({
  thirdPartiesService,
  linkedItemsService,
  schemaService,
  queryListRequests,
  queryItemRequests,
  transformThirdPartyItem,
  transformThirdPartyList,
  transformLinkedItemList,
}: ThirdPartiesRouterProps) => {
  const router = express.Router();

  router.get(
    '/',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(need.list('third-parties'), async (req, res) => {
      const queryResult = await queryListRequests.listQueryFetch(
        thirdPartiesService.getThirdParties,
        transformThirdPartyList,
        req
      );
      res.json(queryResult);
    })
  );

  router.get(
    '/schema',
    createSchemaRouteHandler(
      'third_party',
      need.anyReadWrite('third-parties'),
      schemaService
    )
  );

  router.get(
    '/:id',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('third-parties'),
      async (req, res, next) => {
        const result = await queryItemRequests.itemByIdFetch(
          thirdPartiesService.getThirdPartyById,
          transformThirdPartyItem,
          req
        );
        if (!result) {
          return next(createHttpError(404, 'Third party not found'));
        }
        res.json(result);
      }
    )
  );

  router.get(
    '/:id/linked-items',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('third-parties.linked-items'),
      async (req, res, next) => {
        const queryFetch =
          await queryListRequests.linkedListQueryFetchByIdDateTime(
            linkedItemsService.getLinkedItems,
            transformLinkedItemList,
            req
          );
        if (!queryFetch) {
          return next(createHttpError(404, 'Third party not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  return router;
};
