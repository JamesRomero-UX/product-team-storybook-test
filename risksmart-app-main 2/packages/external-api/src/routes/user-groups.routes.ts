import express from 'express';
import createHttpError from 'http-errors';

import { need } from '../auth/scopes.auth';
import type { QueryItemRequests } from '../http/request/item.request';
import type { QueryListRequests } from '../http/request/list.request';
import { createListRequestQueryMiddleware } from '../middleware/list-request-query.middleware';
import type { ResourceServices } from '../services/index';
import type { UserGroupsTransformers } from '../transformers/index';
import { createAsyncAuthedHandler } from '../utils/createHandler';

interface UserGroupsRouterProps extends UserGroupsTransformers {
  userGroupsService: ResourceServices['userGroupsService'];
  queryListRequests: QueryListRequests;
  queryItemRequests: QueryItemRequests;
}

export const userGroupsRouter = ({
  userGroupsService,
  queryListRequests,
  queryItemRequests,
  transformUserGroupItem,
  transformUserGroupList,
}: UserGroupsRouterProps) => {
  const router = express.Router();

  router.get(
    '/',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(need.list('user-groups'), async (req, res) => {
      const queryResult = await queryListRequests.listQueryFetchByIdDateTime(
        userGroupsService.getUserGroups,
        transformUserGroupList,
        req
      );
      res.json(queryResult);
    })
  );

  router.get(
    '/:id',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('user-groups'),
      async (req, res, next) => {
        const result = await queryItemRequests.itemByIdFetch(
          userGroupsService.getUserGroupById,
          transformUserGroupItem,
          req
        );
        if (!result) {
          return next(createHttpError(404, 'User group not found'));
        }
        res.json(result);
      }
    )
  );

  return router;
};
