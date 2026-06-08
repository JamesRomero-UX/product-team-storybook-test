import express from 'express';
import createHttpError from 'http-errors';

import { need } from '../auth/scopes.auth';
import type { QueryItemRequests } from '../http/request/item.request';
import type { QueryListRequests } from '../http/request/list.request';
import { getServiceContext } from '../http/request/service-context';
import { createSchemaRouteHandler } from '../http/routes/schema-route';
import { createListRequestQueryMiddleware } from '../middleware/list-request-query.middleware';
import { validateRequest } from '../middleware/validate-request.middleware';
import type { CreateActionRequest } from '../schemas/actions/action-mutate-request.schema';
import { createActionForParentRequestSchema } from '../schemas/actions/action-mutate-request.schema';
import type {
  CreateIssueAssessmentRequest,
  UpdateIssueAssessmentRequest,
} from '../schemas/issues/issue-assessment-mutate-request.schema';
import {
  createIssueAssessmentRequestSchema,
  updateIssueAssessmentRequestSchema,
} from '../schemas/issues/issue-assessment-mutate-request.schema';
import type {
  CreateIssueRequest,
  UpdateIssueRequest,
} from '../schemas/issues/issue-mutate-request.schema';
import {
  createIssueRequestSchema,
  updateIssueRequestSchema,
} from '../schemas/issues/issue-mutate-request.schema';
import type { MutationServices } from '../services/index';
import type { ResourceServices } from '../services/index';
import type { IssuesTransformers } from '../transformers/index';
import { createAsyncAuthedHandler } from '../utils/createHandler';
import { idParamSchema } from '../utils/schemas';

interface IssuesRouterProps extends IssuesTransformers {
  issuesService: ResourceServices['issuesService'];
  linkedItemsService: ResourceServices['linkedItemsService'];
  issueMutationService: MutationServices['issueMutationService'];
  actionMutationService: MutationServices['actionMutationService'];
  schemaService: ResourceServices['schemaService'];
  queryListRequests: QueryListRequests;
  queryItemRequests: QueryItemRequests;
}

export const issuesRouter = ({
  issuesService,
  linkedItemsService,
  issueMutationService,
  actionMutationService,
  schemaService,
  queryListRequests,
  queryItemRequests,
  transformIssueItem,
  transformIssueList,
  transformLinkedItemList,
  transformCauseItem,
  transformCauseList,
  transformConsequenceItem,
  transformConsequenceList,
  transformIssueUpdateItem,
  transformIssueUpdateList,
  transformActionList,
  transformIssueAssessmentItem,
}: IssuesRouterProps) => {
  const router = express.Router();

  router.post(
    '/',
    validateRequest({ body: createIssueRequestSchema }),
    createAsyncAuthedHandler<Record<string, never>, CreateIssueRequest>(
      need.create('issues'),
      async (req, res) => {
        const result = await issueMutationService.createIssue({
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
      body: updateIssueRequestSchema,
      params: idParamSchema,
    }),
    createAsyncAuthedHandler<{ id: string }, UpdateIssueRequest>(
      need.update('issues'),
      async (req, res) => {
        const result = await issueMutationService.updateIssue({
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
      need.delete('issues'),
      async (req, res) => {
        const result = await issueMutationService.deleteIssue({
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
    createAsyncAuthedHandler(need.list('issues'), async (req, res) => {
      const queryResult = await queryListRequests.listQueryFetch(
        issuesService.getIssues,
        transformIssueList,
        req
      );
      res.json(queryResult);
    })
  );

  router.get(
    '/schema',
    createSchemaRouteHandler(
      'issue',
      need.anyReadWrite('issues'),
      schemaService
    )
  );

  router.get(
    '/causes/schema',
    createSchemaRouteHandler(
      'cause',
      need.anyReadWrite('issues.causes'),
      schemaService
    )
  );

  router.get(
    '/consequences/schema',
    createSchemaRouteHandler(
      'consequence',
      need.anyReadWrite('issues.consequences'),
      schemaService
    )
  );

  router.get(
    '/updates/schema',
    createSchemaRouteHandler(
      'issue_update',
      need.anyReadWrite('issues.updates'),
      schemaService
    )
  );

  router.get(
    '/assessment/schema',
    createSchemaRouteHandler(
      'issue_assessment',
      need.get('issues.assessment'),
      schemaService
    )
  );

  router.get(
    '/:id',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('issues'),
      async (req, res, next) => {
        const result = await queryItemRequests.itemByIdFetch(
          issuesService.getIssueById,
          transformIssueItem,
          req
        );
        if (!result) {
          return next(createHttpError(404, 'Issue not found'));
        }
        res.json(result);
      }
    )
  );

  router.get(
    '/:id/linked-items',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('issues.linked-items'),
      async (req, res, next) => {
        const queryFetch =
          await queryListRequests.linkedListQueryFetchByIdDateTime(
            linkedItemsService.getLinkedItems,
            transformLinkedItemList,
            req
          );
        if (!queryFetch) {
          return next(createHttpError(404, 'Issue not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  router.get(
    '/:id/causes',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('issues.causes'),
      async (req, res, next) => {
        const queryFetch =
          await queryListRequests.linkedListQueryFetchByIdDateTime(
            issuesService.getIssueCauses,
            transformCauseList,
            req
          );
        if (!queryFetch) {
          return next(createHttpError(404, 'Issue not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  router.get(
    '/:id/causes/:causeId',
    createAsyncAuthedHandler<{ id: string; causeId: string }>(
      need.get('issues.causes'),
      async (req, res, next) => {
        const result = await queryItemRequests.linkedItemByIdFetch(
          issuesService.getIssueCauseById,
          transformCauseItem,
          req,
          { linkKeys: ['id', 'causeId'] }
        );
        if (!result) {
          return next(createHttpError(404, 'Cause not found'));
        }
        res.json(result);
      }
    )
  );

  router.get(
    '/:id/consequences',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('issues.consequences'),
      async (req, res, next) => {
        const queryFetch =
          await queryListRequests.linkedListQueryFetchByIdDateTime(
            issuesService.getIssueConsequences,
            transformConsequenceList,
            req
          );
        if (!queryFetch) {
          return next(createHttpError(404, 'Issue not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  router.get(
    '/:id/consequences/:consequenceId',
    createAsyncAuthedHandler<{ id: string; consequenceId: string }>(
      need.get('issues.consequences'),
      async (req, res, next) => {
        const result = await queryItemRequests.linkedItemByIdFetch(
          issuesService.getIssueConsequenceById,
          transformConsequenceItem,
          req,
          { linkKeys: ['id', 'consequenceId'] }
        );
        if (!result) {
          return next(createHttpError(404, 'Consequence not found'));
        }
        res.json(result);
      }
    )
  );

  router.get(
    '/:id/updates',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('issues.updates'),
      async (req, res, next) => {
        const queryFetch =
          await queryListRequests.linkedListQueryFetchByIdDateTime(
            issuesService.getIssueUpdates,
            transformIssueUpdateList,
            req
          );
        if (!queryFetch) {
          return next(createHttpError(404, 'Issue not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  router.get(
    '/:id/updates/:updateId',
    createAsyncAuthedHandler<{ id: string; updateId: string }>(
      need.get('issues.updates'),
      async (req, res, next) => {
        const result = await queryItemRequests.linkedItemByIdFetch(
          issuesService.getIssueUpdateById,
          transformIssueUpdateItem,
          req,
          { linkKeys: ['id', 'updateId'] }
        );
        if (!result) {
          return next(createHttpError(404, 'Issue update not found'));
        }
        res.json(result);
      }
    )
  );

  router.post(
    '/:id/actions',
    validateRequest({
      body: createActionForParentRequestSchema,
      params: idParamSchema,
    }),
    createAsyncAuthedHandler<{ id: string }, CreateActionRequest>(
      need.create('issues.actions'),
      async (req, res) => {
        const result = await actionMutationService.createAction({
          item: { ...req.body, parentId: req.params.id },
          ctx: getServiceContext(req),
        });
        res.status(201).json(result.data);
      }
    )
  );

  router.get(
    '/:id/actions',
    createListRequestQueryMiddleware(),
    createAsyncAuthedHandler<{ id: string }>(
      need.list('issues.actions'),
      async (req, res, next) => {
        const queryFetch = await queryListRequests.linkedListQueryFetch(
          issuesService.getIssueActions,
          transformActionList,
          req
        );
        if (!queryFetch) {
          return next(createHttpError(404, 'Issue not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  router.get(
    '/:id/assessment',
    createAsyncAuthedHandler<{ id: string }>(
      need.get('issues.assessment'),
      async (req, res, next) => {
        const queryFetch = await queryItemRequests.itemByIdFetch(
          issuesService.getIssueAssessment,
          transformIssueAssessmentItem,
          req
        );
        if (!queryFetch) {
          return next(createHttpError(404, 'Issue assessment not found'));
        }
        res.json(queryFetch);
      }
    )
  );

  router.post(
    '/:id/assessment',
    validateRequest({
      body: createIssueAssessmentRequestSchema,
      params: idParamSchema,
    }),
    createAsyncAuthedHandler<{ id: string }, CreateIssueAssessmentRequest>(
      need.create('issues.assessment'),
      async (req, res) => {
        const result = await issueMutationService.createIssueAssessment({
          item: req.body,
          issueId: req.params.id,
          ctx: getServiceContext(req),
        });
        res.status(201).json(result.data);
      }
    )
  );

  router.put(
    '/:id/assessment',
    validateRequest({
      body: updateIssueAssessmentRequestSchema,
      params: idParamSchema,
    }),
    createAsyncAuthedHandler<{ id: string }, UpdateIssueAssessmentRequest>(
      need.update('issues.assessment'),
      async (req, res) => {
        const result = await issueMutationService.updateIssueAssessment({
          item: req.body,
          issueId: req.params.id,
          ctx: getServiceContext(req),
        });
        res.status(200).json(result.data);
      }
    )
  );

  return router;
};
