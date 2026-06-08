import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import middy from '@middy/core';
import { wrapHandler } from '@sentry/aws-serverless';
import type { EventBridgeHandler } from 'aws-lambda';

import { getLogger } from './logger';
import { initSentry } from './sentry-init';

initSentry();
const logger = getLogger();
const SENTRY_FLUSH_TIMEOUT_MS = 500;

const eventBridgeHandler =
  <TDetailType extends string, TDetail, TResult>(
    handler: EventBridgeHandler<TDetailType, TDetail, TResult>
  ) =>
  async (...args: Parameters<typeof handler>) => {
    return handler(...args);
  };

// This is the handler for any singular lambdas
// For example this should be used lambdas that handle 1 event type
export const singleEventBridgeHandler = <
  TDetailType extends string,
  TDetail,
  TResult,
>(
  ...args: Parameters<typeof eventBridgeHandler<TDetailType, TDetail, TResult>>
) =>
  wrapHandler(
    middy(eventBridgeHandler<TDetailType, TDetail, TResult>(...args))
      .use(injectLambdaContext(logger, { resetKeys: true }))
      .before((request) => {
        // Don't wait for event loop to be empty before returning response.
        // This prevents delays caused by open connections (e.g., DynamoDB client keep-alive).
        request.context.callbackWaitsForEmptyEventLoop = false;
      }),
    { flushTimeout: SENTRY_FLUSH_TIMEOUT_MS }
  );

// This is a handler for each function invoked via a mono-lambda
// For example this should be used for the functions orchestrated by a mono-lambda, e.g the notifier
export const eventBridgeEventHandler = <
  TDetailType extends string,
  TDetail,
  TResult,
>(
  ...args: Parameters<typeof eventBridgeHandler<TDetailType, TDetail, TResult>>
) => eventBridgeHandler<TDetailType, TDetail, TResult>(...args);

// This handler instruments all middleware and should be used as the entrypoint for the event lambdas.
// For example this should be used for the mono-lambdas but not the functions it then invokes.
export const monoLambdaEventBridgeHandler = <
  TDetailType extends string,
  TDetail,
  TResult,
>(
  ...args: Parameters<typeof eventBridgeHandler<TDetailType, TDetail, TResult>>
) =>
  wrapHandler(
    middy(eventBridgeHandler<TDetailType, TDetail, TResult>(...args))
      .use(injectLambdaContext(logger, { resetKeys: true }))
      .before((request) => {
        // Don't wait for event loop to be empty before returning response.
        // This prevents delays caused by open connections (e.g., DynamoDB client keep-alive).
        request.context.callbackWaitsForEmptyEventLoop = false;
      }),
    { flushTimeout: SENTRY_FLUSH_TIMEOUT_MS }
  );
