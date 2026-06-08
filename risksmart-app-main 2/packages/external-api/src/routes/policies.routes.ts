import express from 'express';
import createHttpError from 'http-errors';

import { need } from '../auth/scopes.auth';
import type { QueryItemRequests } from '../http/request/item.request';
import type { QueryListRequests } from '../http/request/list.request';
import { createSchemaRouteHandler } from '../http/routes/schema-route';
import { createListRequestQueryMiddleware } from '../middleware/list-request-query.middleware';
import type { ResourceServices } from '../services/index';
import type { PoliciesTransformers } from '../transformers/index';
import { createAsyncAuthedHandler } from '../utils/createHandler';

interface PoliciesRouterProps extends PoliciesTransformers {
  policiesService: ResourceServices['policiesService'];
  linkedItemsService: ResourceServices['linkedItemsService'];
  schemaService: ResourceServices['schemaService'];
  queryListRequests: QueryListRequests;
  queryItemRequests: QueryItemRequests;
}

export const policiesRouter = ({
  policiesService,
  linkedItemsService,
  schemaService,
  queryListRequests,
  queryItemRequests,
  transformPolicyItem,
  transformPolicyList,
  transformLinkedItemList,
}: PoliciesRouterProps) => {
  const router = express.Router();

  router.get(
    '/',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(need.list('policies'), async (req, res) => {
      const queryResult = await queryListRequests.listQueryFetch(
        policiesService.getPolicies,
        transformPolicyList,
        req
      );
      res.json(queryResult);
    })
  );

  router.get(
    '/schema',
    createSchemaRouteHandler(
      'document',
      need.anyReadWrite('policies'),
      schemaService
    )
  );

  router.get(
    '/:id',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('policies'),
      async (req, res, next) => {
        const result = await queryItemRequests.itemByIdFetch(
          policiesService.getPolicyById,
          transformPolicyItem,
          req
        );
        if (!result) {
          return next(createHttpError(404, 'Policy not found'));
        }
        res.json(result);
      }
    )
  );

  router.get(
    '/:id/linked-items',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('policies.linked-items'),
      async (req, res, next) => {
        const queryFetch =
          await queryListRequests.linkedListQueryFetchByIdDateTime(
            linkedItemsService.getLinkedItems,
            transformLinkedItemList,
            req
          );
        if (!queryFetch) {
          return next(createHttpError(404, 'Policy not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  return router;
};
