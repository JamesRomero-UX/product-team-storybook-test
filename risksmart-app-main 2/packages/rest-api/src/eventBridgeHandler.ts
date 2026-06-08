import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import middy from '@middy/core';
import { wrapHandler } from '@sentry/aws-serverless';
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import type { EventBridgeHandler } from 'aws-lambda';

import type { ActionInput } from './hasuraActionHelpers';
import { getLogger } from './logger';
import { initSentry } from './sentryInit';

initSentry();
const logger = getLogger();
const SENTRY_FLUSH_TIMEOUT_MS = 500;
export type BackendHandler<T> = (
  body: ActionInput<T>
) => Promise<APIGatewayProxyStructuredResultV2>;

// Not doing anything at the moment except being wrapped in sentry, but can be used for adding middleware.

const eventBridgeHandler =
  <TDetailType extends string, TDetail, TResult>(
    handler: EventBridgeHandler<TDetailType, TDetail, TResult>
  ) =>
  async (...args: Parameters<typeof handler>) => {
    return handler(...args);
  };

const simpleEventHandler =
  <TInput>(handler: (input: TInput) => void) =>
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

// This is the handler for EventBridge scheduled events e.g. cron jobs
export const scheduledEventHandler = <TInput>(
  ...args: Parameters<typeof simpleEventHandler<TInput>>
) =>
  wrapHandler(
    middy(simpleEventHandler<TInput>(...args))
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
