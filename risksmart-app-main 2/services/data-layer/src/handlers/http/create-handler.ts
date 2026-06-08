import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import middy, { type MiddlewareObj } from '@middy/core';
import httpRouterHandler, { type Route } from '@middy/http-router';
import { wrapHandler } from '@sentry/aws-serverless';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { formatErrorResponse } from '../../utils/error-handler';
import { getLogger } from '../../utils/logger';
import { initSentry } from '../../utils/sentry-init';

/**
 * Middy error handler middleware for REST API Gateway v1.
 * Catches errors and formats them into proper API Gateway responses.
 * Logging is handled by formatErrorResponse.
 */
const errorHandlerMiddleware = (): MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => ({
  onError: (request): void => {
    request.response = formatErrorResponse(request.error);
  },
});

/**
 * Factory function to create a Lambda handler with standard middleware stack.
 *
 * Sets up:
 * - Sentry error tracking
 * - Lambda Powertools logger context injection
 * - Error handling middleware
 * - HTTP routing via middy http-router
 *
 * @param routes - Array of route definitions for middy http-router
 * @returns Wrapped Lambda handler function
 */
export const createHandler = (
  routes: Route<APIGatewayProxyEvent, APIGatewayProxyResult>[]
) => {
  initSentry();
  const logger = getLogger();

  return wrapHandler(
    middy(httpRouterHandler(routes))
      .use(injectLambdaContext(logger, { resetKeys: true }))
      .use(errorHandlerMiddleware())
  );
};
