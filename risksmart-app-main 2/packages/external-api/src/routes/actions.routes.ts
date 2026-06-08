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
  CreateActionRequest,
  UpdateActionRequest,
} from '../schemas/actions/action-mutate-request.schema';
import {
  createActionRequestSchema,
  updateActionRequestSchema,
} from '../schemas/actions/action-mutate-request.schema';
import type { MutationServices, ResourceServices } from '../services/index';
import type { ActionsTransformers } from '../transformers/index';
import { createAsyncAuthedHandler } from '../utils/createHandler';
import { idParamSchema } from '../utils/schemas';

interface ActionsRouterProps extends ActionsTransformers {
  actionsService: ResourceServices['actionsService'];
  linkedItemsService: ResourceServices['linkedItemsService'];
  actionMutationService: MutationServices['actionMutationService'];
  schemaService: ResourceServices['schemaService'];
  queryListRequests: QueryListRequests;
  queryItemRequests: QueryItemRequests;
}

export const actionsRouter = ({
  actionsService,
  linkedItemsService,
  actionMutationService,
  schemaService,
  queryItemRequests,
  queryListRequests,
  transformActionItem,
  transformActionList,
  transformLinkedItemList,
}: ActionsRouterProps) => {
  const router = express.Router();

  router.post(
    '/',
    validateRequest({ body: createActionRequestSchema }),
    createAsyncAuthedHandler<Record<string, never>, CreateActionRequest>(
      need.create('actions'),
      async (req, res) => {
        const result = await actionMutationService.createAction({
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
      body: updateActionRequestSchema,
      params: idParamSchema,
    }),
    createAsyncAuthedHandler<{ id: string }, UpdateActionRequest>(
      need.update('actions'),
      async (req, res) => {
        const result = await actionMutationService.updateAction({
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
      need.delete('actions'),
      async (req, res) => {
        const result = await actionMutationService.deleteAction({
          id: req.params.id,
          ctx: getServiceContext(req),
        });
        res.status(200).json(result.data);
      }
    )
  );

  router.get(
    '/',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(need.list('actions'), async (req, res) => {
      const queryResult = await queryListRequests.listQueryFetch(
        actionsService.getActions,
        transformActionList,
        req
      );
      res.json(queryResult);
    })
  );

  router.get(
    '/schema',
    createSchemaRouteHandler(
      'action',
      need.anyReadWrite('actions'),
      schemaService
    )
  );

  router.get(
    '/:id',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('actions'),
      async (req, res, next) => {
        const result = await queryItemRequests.itemByIdFetch(
          actionsService.getActionById,
          transformActionItem,
          req
        );
        if (!result) {
          return next(createHttpError(404, 'Action not found'));
        }
        res.json(result);
      }
    )
  );

  router.get(
    '/:id/linked-items',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('actions.linked-items'),
      async (req, res, next) => {
        const queryFetch =
          await queryListRequests.linkedListQueryFetchByIdDateTime(
            linkedItemsService.getLinkedItems,
            transformLinkedItemList,
            req
          );
        if (!queryFetch) {
          return next(createHttpError(404, 'Action not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  return router;
};
