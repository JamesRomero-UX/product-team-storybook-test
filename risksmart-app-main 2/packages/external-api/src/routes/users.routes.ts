import express from 'express';
import createHttpError from 'http-errors';

import { need } from '../auth/scopes.auth';
import type { QueryItemRequests } from '../http/request/item.request';
import type { QueryListRequests } from '../http/request/list.request';
import { createListRequestQueryMiddleware } from '../middleware/list-request-query.middleware';
import type { ResourceServices } from '../services/index';
import type { UsersTransformers } from '../transformers/index';
import { createAsyncAuthedHandler } from '../utils/createHandler';

interface UsersRouterProps extends UsersTransformers {
  usersService: ResourceServices['usersService'];
  queryItemRequests: QueryItemRequests;
  queryListRequests: QueryListRequests;
}

export const usersRouter = ({
  usersService,
  queryItemRequests,
  queryListRequests,
  transformUserItem,
  transformUserList,
}: UsersRouterProps) => {
  const router = express.Router();

  router.get(
    '/',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(need.list('users'), async (req, res) => {
      const queryResult = await queryListRequests.listQueryFetchByIdDateTime(
        usersService.getUsers,
        transformUserList,
        req
      );
      res.json(queryResult);
    })
  );

  router.get(
    '/:id',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('users'),
      async (req, res, next) => {
        const result = await queryItemRequests.itemByIdFetch(
          usersService.getUserById,
          transformUserItem,
          req
        );
        if (!result) {
          return next(createHttpError(404, 'User not found'));
        }
        res.json(result);
      }
    )
  );

  return router;
};
