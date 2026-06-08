import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import middy from '@middy/core';
import { wrapHandler } from '@sentry/aws-serverless';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
  APIGatewayProxyStructuredResultV2,
  Context,
} from 'aws-lambda';

import {
  httpApiLambdaErrorHandler,
  restApiLambdaErrorHandler,
} from './error-handler';
import { getLogger } from './logger';
import { initSentry } from './sentry-init';

const SENTRY_FLUSH_TIMEOUT_MS = 500;
initSentry();
const logger = getLogger();

type RestApiLambdaHandler = (
  event: APIGatewayProxyEvent
) => Promise<APIGatewayProxyResult>;

type HttpApiLambdaHandler = (
  event: APIGatewayProxyEventV2,
  context: Context
) => Promise<APIGatewayProxyStructuredResultV2>;

/**
 * Wraps a Lambda handler for REST API Gateway v1 events with middleware for error handling, logging, and monitoring.
 * This is designed for CDK-deployed lambdas using REST API Gateway (not HTTP API Gateway).
 */
export const restApiLambdaHandler = (handler: RestApiLambdaHandler) =>
  wrapHandler(
    middy(restApiLambdaErrorHandler(handler))
      .use(injectLambdaContext(logger, { resetKeys: true }))
      .before((request) => {
        // Don't wait for event loop to be empty before returning response.
        // This prevents delays caused by open connections (e.g., DynamoDB client keep-alive).
        request.context.callbackWaitsForEmptyEventLoop = false;
      }),
    { flushTimeout: SENTRY_FLUSH_TIMEOUT_MS }
  );

/**
 * Wraps a Lambda handler for HTTP API Gateway v2 events with middleware for error handling, logging, and monitoring.
 * This is designed for CDK-deployed lambdas using HTTP API Gateway v2.
 * Note: HTTP API v2 has a different event/response structure than REST API v1.
 */
export const httpApiLambdaHandler = (handler: HttpApiLambdaHandler) =>
  wrapHandler(
    middy(httpApiLambdaErrorHandler(handler))
      .use(injectLambdaContext(logger, { resetKeys: true }))
      .before((request) => {
        // Don't wait for event loop to be empty before returning response.
        // This prevents delays caused by open connections (e.g., DynamoDB client keep-alive).
        request.context.callbackWaitsForEmptyEventLoop = false;
      }),
    { flushTimeout: SENTRY_FLUSH_TIMEOUT_MS }
  );
