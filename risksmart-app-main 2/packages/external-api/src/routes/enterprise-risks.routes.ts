import express from 'express';
import createHttpError from 'http-errors';

import { need } from '../auth/scopes.auth';
import type { QueryItemRequests } from '../http/request/item.request';
import type { QueryListRequests } from '../http/request/list.request';
import { createSchemaRouteHandler } from '../http/routes/schema-route';
import { createListRequestQueryMiddleware } from '../middleware/list-request-query.middleware';
import type { ResourceServices } from '../services/index';
import type { EnterpriseRisksTransformers } from '../transformers/index';
import { createAsyncAuthedHandler } from '../utils/createHandler';

interface EnterpriseRisksRouterProps extends EnterpriseRisksTransformers {
  enterpriseRisksService: ResourceServices['enterpriseRisksService'];
  schemaService: ResourceServices['schemaService'];
  queryListRequests: QueryListRequests;
  queryItemRequests: QueryItemRequests;
}

export const enterpriseRisksRouter = ({
  enterpriseRisksService,
  schemaService,
  queryListRequests,
  queryItemRequests,
  transformEnterpriseRiskItem,
  transformEnterpriseRiskList,
  transformRiskList,
}: EnterpriseRisksRouterProps) => {
  const router = express.Router();

  router.get(
    '/',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(
      need.list('enterprise-risks'),
      async (req, res) => {
        const queryResult = await queryListRequests.listQueryFetch(
          enterpriseRisksService.getEnterpriseRisks,
          transformEnterpriseRiskList,
          req
        );
        res.json(queryResult);
      }
    )
  );

  router.get(
    '/schema',
    createSchemaRouteHandler(
      'enterprise_risk',
      need.anyReadWrite('enterprise-risks'),
      schemaService
    )
  );

  router.get(
    '/:id',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('enterprise-risks'),
      async (req, res, next) => {
        const result = await queryItemRequests.itemByIdFetch(
          enterpriseRisksService.getEnterpriseRiskById,
          transformEnterpriseRiskItem,
          req
        );
        if (!result) {
          return next(createHttpError(404, 'Enterprise risk not found'));
        }
        res.json(result);
      }
    )
  );

  router.get(
    '/:id/risks',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('enterprise-risks.risks'),
      async (req, res, next) => {
        const queryFetch = await queryListRequests.linkedListQueryFetch(
          enterpriseRisksService.getEnterpriseRisksChildRisks,
          transformRiskList,
          req
        );
        if (!queryFetch) {
          return next(createHttpError(404, 'Enterprise risk not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  return router;
};
