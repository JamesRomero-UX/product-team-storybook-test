import express from 'express';
import createHttpError from 'http-errors';

import { need } from '../auth/scopes.auth';
import type { QueryItemRequests } from '../http/request/item.request';
import type { QueryListRequests } from '../http/request/list.request';
import { createListRequestQueryMiddleware } from '../middleware/list-request-query.middleware';
import type { ResourceServices } from '../services/index';
import type { DepartmentsTransformers } from '../transformers/index';
import { createAsyncAuthedHandler } from '../utils/createHandler';

interface DepartmentsRouterProps extends DepartmentsTransformers {
  departmentsService: ResourceServices['departmentsService'];
  queryListRequests: QueryListRequests;
  queryItemRequests: QueryItemRequests;
}

export const departmentsRouter = ({
  departmentsService,
  queryListRequests,
  queryItemRequests,
  transformDepartmentItem,
  transformDepartmentList,
}: DepartmentsRouterProps) => {
  const router = express.Router();

  router.get(
    '/',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(need.list('departments'), async (req, res) => {
      const queryResult = await queryListRequests.listQueryFetchByIdDateTime(
        departmentsService.getDepartments,
        transformDepartmentList,
        req
      );
      res.json(queryResult);
    })
  );

  router.get(
    '/:id',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('departments'),
      async (req, res, next) => {
        const result = await queryItemRequests.itemByIdFetch(
          departmentsService.getDepartmentById,
          transformDepartmentItem,
          req
        );
        if (!result) {
          return next(createHttpError(404, 'Department not found'));
        }
        res.json(result);
      }
    )
  );

  return router;
};
