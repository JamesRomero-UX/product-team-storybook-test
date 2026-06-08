import express from 'express';
import createHttpError from 'http-errors';

import { need } from '../auth/scopes.auth';
import type { QueryItemRequests } from '../http/request/item.request';
import type { QueryListRequests } from '../http/request/list.request';
import { createListRequestQueryMiddleware } from '../middleware/list-request-query.middleware';
import type { ResourceServices } from '../services/index';
import type { TagsTransformers } from '../transformers/index';
import { createAsyncAuthedHandler } from '../utils/createHandler';

interface TagsRouterProps extends TagsTransformers {
  tagsService: ResourceServices['tagsService'];
  queryListRequests: QueryListRequests;
  queryItemRequests: QueryItemRequests;
}

export const tagsRouter = ({
  tagsService,
  queryListRequests,
  queryItemRequests,
  transformTagItem,
  transformTagList,
}: TagsRouterProps) => {
  const router = express.Router();

  router.get(
    '/',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(need.list('tags'), async (req, res) => {
      const queryResult = await queryListRequests.listQueryFetchByIdDateTime(
        tagsService.getTags,
        transformTagList,
        req
      );
      res.json(queryResult);
    })
  );

  router.get(
    '/:id',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('tags'),
      async (req, res, next) => {
        const result = await queryItemRequests.itemByIdFetch(
          tagsService.getTagById,
          transformTagItem,
          req
        );
        if (!result) {
          return next(createHttpError(404, 'Tag not found'));
        }
        res.json(result);
      }
    )
  );

  return router;
};
