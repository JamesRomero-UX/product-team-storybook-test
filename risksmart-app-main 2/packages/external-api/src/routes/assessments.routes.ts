import express from 'express';
import createHttpError from 'http-errors';

import { need } from '../auth/scopes.auth';
import type { QueryItemRequests } from '../http/request/item.request';
import type { QueryListRequests } from '../http/request/list.request';
import { createSchemaRouteHandler } from '../http/routes/schema-route';
import { createListRequestQueryMiddleware } from '../middleware/list-request-query.middleware';
import type { ResourceServices } from '../services/index';
import type { AssessmentsTransformers } from '../transformers/index';
import { createAsyncAuthedHandler } from '../utils/createHandler';

interface AssessmentsRouterProps extends AssessmentsTransformers {
  assessmentsService: ResourceServices['assessmentsService'];
  schemaService: ResourceServices['schemaService'];
  queryListRequests: QueryListRequests;
  queryItemRequests: QueryItemRequests;
}

export const assessmentsRouter = ({
  assessmentsService,
  schemaService,
  queryListRequests,
  queryItemRequests,
  transformAssessmentItem,
  transformAssessmentList,
}: AssessmentsRouterProps) => {
  const router = express.Router();

  router.get(
    '/',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler(need.list('assessments'), async (req, res) => {
      const queryResult = await queryListRequests.listQueryFetch(
        assessmentsService.getAssessments,
        transformAssessmentList,
        req
      );
      res.json(queryResult);
    })
  );

  router.get(
    '/schema',
    createSchemaRouteHandler(
      'assessment',
      need.anyReadWrite('assessments'),
      schemaService
    )
  );

  router.get(
    '/:id',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('assessments'),
      async (req, res, next) => {
        const result = await queryItemRequests.itemByIdFetch(
          assessmentsService.getAssessmentById,
          transformAssessmentItem,
          req
        );
        if (!result) {
          return next(createHttpError(404, 'Assessment not found'));
        }
        res.json(result);
      }
    )
  );

  return router;
};
