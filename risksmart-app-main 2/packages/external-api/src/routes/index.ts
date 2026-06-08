import {
  createQueryItemListRequestHandler,
  createQueryItemRequestHandler,
} from '../http/request/index';
import type { DynamoRateLimiter } from '../rate-limiter/dynamo.rate-limiter';
import type { AppClientsService } from '../services/app-clients/app-clients.service';
import type { DocumentationService } from '../services/documentation/documentation.service';
import type { MutationServices, ResourceServices } from '../services/index';
import {
  actionsTransformers,
  appClientTransformers,
  assessmentsTransformers,
  controlsTransformers,
  departmentGroupsTransformers,
  departmentsTransformers,
  enterpriseRisksTransformers,
  impactsTransformers,
  indicatorsTransformers,
  issuesTransformers,
  obligationsTransformers,
  policiesTransformers,
  risksTransformers,
  tagsTransformers,
  thirdPartiesTransformers,
  userGroupsTransformers,
  usersTransformers,
} from '../transformers/index';
import { accountRouter } from './account.routes';
import { actionsRouter } from './actions.routes';
import { assessmentsRouter } from './assessments.routes';
import { authRouter } from './auth.routes';
import { controlsRouter } from './controls.routes';
import { departmentGroupsRouter } from './department-groups.routes';
import { departmentsRouter } from './departments.routes';
import { docsRouter } from './docs.routes';
import { enterpriseRisksRouter } from './enterprise-risks.routes';
import { impactsRouter } from './impacts.routes';
import { indicatorsRouter } from './indicators.routes';
import { issuesRouter } from './issues.routes';
import { obligationsRouter } from './obligations.routes';
import { policiesRouter } from './policies.routes';
import { risksRouter } from './risks.routes';
import { tagsRouter } from './tags.routes';
import { thirdPartiesRouter } from './third-parties.routes';
import { userGroupsRouter } from './user-groups.routes';
import { usersRouter } from './users.routes';

interface ResourceRoutersConfig {
  basePath: string;
  defaultPageLimit: number;
  cursorDelimiter: string;
  rateLimiter: DynamoRateLimiter | null;
}

export interface AuthRouterConfig {
  basePath: string;
  allowedUserRoles: string[];
}

// factory for resource routes.
export const createResourceRouters = (
  {
    basePath,
    defaultPageLimit,
    cursorDelimiter,
    rateLimiter,
  }: ResourceRoutersConfig,
  {
    actionsService,
    assessmentsService,
    departmentGroupsService,
    departmentsService,
    enterpriseRisksService,
    impactsService,
    indicatorsService,
    issuesService,
    linkedItemsService,
    obligationsService,
    policiesService,
    risksService,
    schemaService,
    tagsService,
    thirdPartiesService,
    usersService,
    controlsService,
    userGroupsService,
  }: ResourceServices,
  docsService: DocumentationService,
  mutationServices: MutationServices
) => {
  const queryItemRequests = createQueryItemRequestHandler({ basePath });
  const queryListRequests = createQueryItemListRequestHandler({
    basePath,
    defaultPageLimit,
    cursorDelimiter,
  });

  const defaultProps = {
    queryItemRequests,
    queryListRequests,
    schemaService,
  };

  return {
    accountRouter: accountRouter({
      docsService,
      rateLimiter,
    }),
    actionsRouter: actionsRouter({
      ...defaultProps,
      actionsService,
      linkedItemsService,
      actionMutationService: mutationServices.actionMutationService,
      ...actionsTransformers,
    }),
    assessmentsRouter: assessmentsRouter({
      ...defaultProps,
      assessmentsService,
      ...assessmentsTransformers,
    }),
    controlsRouter: controlsRouter({
      ...defaultProps,
      linkedItemsService,
      controlsService,
      ...controlsTransformers,
    }),
    docsRouter: docsRouter({
      docsService: docsService,
    }),
    enterpriseRisksRouter: enterpriseRisksRouter({
      ...defaultProps,
      enterpriseRisksService,
      ...enterpriseRisksTransformers,
    }),
    impactsRouter: impactsRouter({
      ...defaultProps,
      impactsService,
      ...impactsTransformers,
    }),
    indicatorsRouter: indicatorsRouter({
      ...defaultProps,
      indicatorsService,
      linkedItemsService,
      indicatorMutationService: mutationServices.indicatorMutationService,
      ...indicatorsTransformers,
    }),
    issuesRouter: issuesRouter({
      ...defaultProps,
      issuesService,
      linkedItemsService,
      issueMutationService: mutationServices.issueMutationService,
      actionMutationService: mutationServices.actionMutationService,
      ...issuesTransformers,
    }),
    obligationsRouter: obligationsRouter({
      ...defaultProps,
      obligationsService,
      linkedItemsService,
      ...obligationsTransformers,
    }),
    policiesRouter: policiesRouter({
      ...defaultProps,
      policiesService,
      linkedItemsService,
      ...policiesTransformers,
    }),
    risksRouter: risksRouter({
      ...defaultProps,
      risksService,
      linkedItemsService,
      riskMutationService: mutationServices.riskMutationService,
      indicatorMutationService: mutationServices.indicatorMutationService,
      ...risksTransformers,
    }),
    thirdPartiesRouter: thirdPartiesRouter({
      ...defaultProps,
      thirdPartiesService,
      linkedItemsService,
      ...thirdPartiesTransformers,
    }),
    usersRouter: usersRouter({
      ...defaultProps,
      usersService,
      ...usersTransformers,
    }),
    userGroupsRouter: userGroupsRouter({
      ...defaultProps,
      userGroupsService,
      ...userGroupsTransformers,
    }),
    departmentsRouter: departmentsRouter({
      ...defaultProps,
      departmentsService,
      ...departmentsTransformers,
    }),
    departmentGroupsRouter: departmentGroupsRouter({
      ...defaultProps,
      departmentGroupsService,
      ...departmentGroupsTransformers,
    }),
    tagsRouter: tagsRouter({
      ...defaultProps,
      tagsService,
      ...tagsTransformers,
    }),
  };
};

export const createAuthRouter = (
  config: AuthRouterConfig,
  appClientsService: AppClientsService
) => {
  return {
    authRouter: authRouter({
      ...appClientTransformers,
      appClientService: appClientsService,
      config,
    }),
  };
};

export type ResourceRouters = ReturnType<typeof createResourceRouters>;
