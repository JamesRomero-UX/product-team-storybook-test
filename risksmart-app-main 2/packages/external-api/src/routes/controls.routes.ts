import express from 'express';
import createHttpError from 'http-errors';

import { need } from '../auth/scopes.auth';
import type { QueryItemRequests } from '../http/request/item.request';
import type { QueryListRequests } from '../http/request/list.request';
import { createSchemaRouteHandler } from '../http/routes/schema-route';
import { createListRequestQueryMiddleware } from '../middleware/list-request-query.middleware';
import type { ResourceServices } from '../services/index';
import type { ControlsTransformers } from '../transformers/index';
import { createAsyncAuthedHandler } from '../utils/createHandler';
import { versionResponse, versionResponseList } from '../utils/versions';

interface ControlRouterProps extends ControlsTransformers {
  controlsService: ResourceServices['controlsService'];
  linkedItemsService: ResourceServices['linkedItemsService'];
  schemaService: ResourceServices['schemaService'];
  queryListRequests: QueryListRequests;
  queryItemRequests: QueryItemRequests;
}

export const controlsRouter = ({
  controlsService,
  linkedItemsService,
  schemaService,
  queryListRequests,
  queryItemRequests,
  transformControlItem,
  transformControlList,
  transformLinkedItemList,
}: ControlRouterProps) => {
  const router = express.Router();

  router.get(
    '/',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(need.list('controls'), async (req, res) => {
      const queryFetch = await queryListRequests.listQueryFetch(
        controlsService.getControls,
        transformControlList,
        req
      );
      // Apply API versioning to the response data
      const versionedData = versionResponseList(
        'control-list',
        queryFetch.data,
        req.apiVersion,
        {
          basePath: req.baseUrl,
          requestId: req.requestId,
        }
      );
      res.json({
        ...queryFetch,
        data: versionedData,
      });
    })
  );

  router.get(
    '/schema',
    createSchemaRouteHandler(
      'control',
      need.anyReadWrite('controls'),
      schemaService
    )
  );

  router.get(
    '/:id',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('controls'),
      async (req, res, next) => {
        const result = await queryItemRequests.itemByIdFetch(
          controlsService.getControlById,
          transformControlItem,
          req
        );
        if (!result) {
          return next(createHttpError(404, 'Control not found'));
        }
        // Apply API versioning to the response data
        const versionedResult = versionResponse(
          'control',
          result,
          req.apiVersion,
          {
            basePath: req.baseUrl,
            requestId: req.requestId,
          }
        );
        res.json(versionedResult);
      }
    )
  );

  router.get(
    '/:id/linked-items',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('controls.linked-items'),
      async (req, res, next) => {
        const queryFetch =
          await queryListRequests.linkedListQueryFetchByIdDateTime(
            linkedItemsService.getLinkedItems,
            transformLinkedItemList,
            req
          );
        if (!queryFetch) {
          return next(createHttpError(404, 'Control not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  return router;
};
