import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { createMultiIssuerJWTParams } from './auth/client-jwt.auth';
import CircuitBreaker from './circuit-breaker/breaker-policies';
import {
  createAuthClient,
  createDataClient,
  createMutationClient,
} from './clients/client.factory';
import {
  generateAppAuthConfig,
  generateAppConfig,
  generateGraphqlMutationConfig,
} from './config/app.config';
import { generateRedocConfig } from './config/redoc.config';
import { apiVersionMiddleware } from './middleware/api-version.middleware';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/error-handler.middleware';
import { createJWTMiddleware } from './middleware/jwt-auth.middleware';
import { rateLimitMiddleware } from './middleware/rate-limiter.middleware';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware';
import type { DynamoRateLimiter } from './rate-limiter/dynamo.rate-limiter';
import { createRateLimiter } from './rate-limiter/index';
import { createAuthRouter, createResourceRouters } from './routes/index';
import { appClientsService } from './services/app-clients/app-clients.service';
import {
  createAuthService,
  createDocumentationService,
  createMutationServices,
  createResourceServices,
} from './services/index';
import { COMPOUND_CURSOR_DELIMITER } from './transformers/common/page-info.transformer';

// init configs
const appDataConfig = generateAppConfig();
const { breakerPolicy: dataBreakerPolicyConfig, ...dataConfig } = appDataConfig;
const { breakerPolicy: authBreakerPolicyConfig, ...authConfig } =
  generateAppAuthConfig();
const redocConfig = generateRedocConfig();

// application route base path.
const withBasePath = (path: string) =>
  `/${dataConfig.basePath}/${path}`.replace(/\/+/g, '/');

// setup circuit breakers
const dataBreaker = new CircuitBreaker(dataBreakerPolicyConfig);
const authBreaker = new CircuitBreaker(authBreakerPolicyConfig);

// Setup data clients
const dataClient = createDataClient(dataConfig);
const mutationClientConfig = generateGraphqlMutationConfig();
const mutationClient = createMutationClient(
  mutationClientConfig,
  dataBreaker.policy
);
const jwtClientParams = createMultiIssuerJWTParams(authConfig);
const authProviderClient = createAuthClient(authConfig);

// create resource services
const resourceServices = createResourceServices({
  policy: dataBreaker.policy,
  client: dataClient,
  config: { basePath: dataConfig.basePath },
});

// create mutation services
const mutationServices = createMutationServices({
  mutationClient,
  risksService: resourceServices.risksService,
  controlsService: resourceServices.controlsService,
  indicatorsService: resourceServices.indicatorsService,
  issuesService: resourceServices.issuesService,
  usersService: resourceServices.usersService,
  actionsService: resourceServices.actionsService,
  schemaService: resourceServices.schemaService,
});

// api documentation service.
const documentationService = createDocumentationService({
  docsExpiryHrs: authConfig.docsExpiryHrs,
  docsSigningKey: authConfig.docsSigningKey,
  basePath: dataConfig.basePath,
  redocDefaultTheme: redocConfig.defaultTheme,
  appDomain: dataConfig.appDomain,
});

const appClientService = createAuthService(
  authBreaker.policy,
  appClientsService,
  { authClient: authProviderClient, documentationService, dataClient },
  {
    basePath: dataConfig.basePath,
    clientLimit: authConfig.orgClientLimit,
  }
);

// create rate limiter instance (used by both the middleware and the account router).
const rateLimiter: DynamoRateLimiter | null = appDataConfig.rateLimiterEnabled
  ? createRateLimiter({
      tableName: dataConfig.rateLimitTableName,
      dynamoDBEndpoint: dataConfig.dynamoDBEndpoint,
      basePath: dataConfig.basePath,
    })
  : null;

// create resource routers
const resourceRouters = createResourceRouters(
  {
    basePath: dataConfig.basePath,
    defaultPageLimit: dataConfig.requestPageLimit,
    cursorDelimiter: COMPOUND_CURSOR_DELIMITER,
    rateLimiter,
  },
  resourceServices,
  documentationService,
  mutationServices
);
const authRouters = createAuthRouter(
  {
    basePath: dataConfig.basePath,
    allowedUserRoles: authConfig.allowedRSUserRoles,
  },
  appClientService
);

// Create express app.
const app = express();

if (appDataConfig.trustProxyEnabled) {
  // Trust proxy so forwarded headers from LB are not ignored.
  app.set('trust proxy', 1);
}

// Middlewares
app.use(helmet());
app.use(cors());
app.use(compression({ level: dataConfig.responseCompressionLevel }));
app.use(requestLoggerMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(apiVersionMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(
  createJWTMiddleware(jwtClientParams, {
    // add public (no auth) routes.
    excludePaths: [
      '/healthz',
      withBasePath('auth/token'),
      withBasePath('docs'),
    ],
  })
);
// setup rate limiter middleware (only when rate limiting is enabled).
if (rateLimiter) {
  app.use(rateLimitMiddleware({ rateLimiter, excludePaths: ['/healthz'] }));
}

// Mount app resource routes
app.use(withBasePath('docs'), resourceRouters.docsRouter);
app.use(withBasePath('risks'), resourceRouters.risksRouter);
app.use(withBasePath('actions'), resourceRouters.actionsRouter);
app.use(withBasePath('assessments'), resourceRouters.assessmentsRouter);
app.use(withBasePath('issues'), resourceRouters.issuesRouter);
app.use(withBasePath('policies'), resourceRouters.policiesRouter);
app.use(withBasePath('indicators'), resourceRouters.indicatorsRouter);
app.use(withBasePath('third-parties'), resourceRouters.thirdPartiesRouter);
app.use(withBasePath('users'), resourceRouters.usersRouter);
app.use(withBasePath('user-groups'), resourceRouters.userGroupsRouter);
app.use(withBasePath('departments'), resourceRouters.departmentsRouter);
app.use(withBasePath('department-groups'), resourceRouters.departmentGroupsRouter);
app.use(withBasePath('tags'), resourceRouters.tagsRouter);
app.use(withBasePath('controls'), resourceRouters.controlsRouter);
app.use(withBasePath('impacts'), resourceRouters.impactsRouter);
app.use(
  withBasePath('compliance/obligations'),
  resourceRouters.obligationsRouter
);
app.use(
  withBasePath('enterprise-risks'),
  resourceRouters.enterpriseRisksRouter
);

// mount auth routes
app.use(withBasePath('auth'), authRouters.authRouter);

// mount account route
app.use(withBasePath('account'), resourceRouters.accountRouter);

// mount utility routes
app.get('/healthz', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: `v${dataConfig.version}`,
  });
});

// Error handling middleware (must be applied last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
