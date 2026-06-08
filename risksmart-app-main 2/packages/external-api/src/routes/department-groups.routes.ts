import express from 'express';
import createHttpError from 'http-errors';

import { need } from '../auth/scopes.auth';
import type { QueryItemRequests } from '../http/request/item.request';
import type { QueryListRequests } from '../http/request/list.request';
import { createListRequestQueryMiddleware } from '../middleware/list-request-query.middleware';
import type { ResourceServices } from '../services/index';
import type { DepartmentGroupsTransformers } from '../transformers/index';
import { createAsyncAuthedHandler } from '../utils/createHandler';

interface DepartmentGroupsRouterProps extends DepartmentGroupsTransformers {
  departmentGroupsService: ResourceServices['departmentGroupsService'];
  queryListRequests: QueryListRequests;
  queryItemRequests: QueryItemRequests;
}

export const departmentGroupsRouter = ({
  departmentGroupsService,
  queryListRequests,
  queryItemRequests,
  transformDepartmentGroupItem,
  transformDepartmentGroupList,
}: DepartmentGroupsRouterProps) => {
  const router = express.Router();

  router.get(
    '/',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(need.list('department-groups'), async (req, res) => {
      const queryResult = await queryListRequests.listQueryFetchByIdDateTime(
        departmentGroupsService.getDepartmentGroups,
        transformDepartmentGroupList,
        req
      );
      res.json(queryResult);
    })
  );

  router.get(
    '/:id',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('department-groups'),
      async (req, res, next) => {
        const result = await queryItemRequests.itemByIdFetch(
          departmentGroupsService.getDepartmentGroupById,
          transformDepartmentGroupItem,
          req
        );
        if (!result) {
          return next(createHttpError(404, 'Department group not found'));
        }
        res.json(result);
      }
    )
  );

  return router;
};
