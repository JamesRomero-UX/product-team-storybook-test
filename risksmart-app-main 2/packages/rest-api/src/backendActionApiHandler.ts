import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import middy from '@middy/core';
import { wrapHandler } from '@sentry/aws-serverless';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context,
} from 'aws-lambda';
import { BadRequest } from 'http-errors';
import { getSessionData } from 'src/session';
import { ApiHandler } from 'sst/node/api';
import type { ZodSchema } from 'zod';

import { errorHandler } from './errorHandler';
import type { ActionInput } from './hasuraActionHelpers';
import { getLogger } from './logger';
import { initSentry } from './sentryInit';

initSentry();
const logger = getLogger();

type Handler = (
  event: APIGatewayProxyEventV2,
  context: Context
) => Promise<APIGatewayProxyStructuredResultV2 | undefined>;

type BackendHandler<T> = (
  body: ActionInput<T>
) => Promise<APIGatewayProxyStructuredResultV2>;

const backendActionApiHandler =
  <T>(schema: ZodSchema<T>, handler: BackendHandler<T>) =>
  async (evt: APIGatewayProxyEventV2) => {
    const bodyString = evt.isBase64Encoded
      ? Buffer.from(evt.body ?? '', 'base64').toString('utf-8')
      : evt.body;

    const body = JSON.parse(bodyString || '{}') as ActionInput<T>;

    const parseResult = schema.safeParse(body.input);
    if (parseResult.success) {
      const session = { ...body, input: parseResult.data };
      logger.appendKeys({
        ...getSessionData(session.session_variables),
      });

      return handler({ ...session, event: evt });
    }
    throw new BadRequest(parseResult.error.message);
  };

// This should only be used by the lambda orchestrating the routing of HTTP requests
export const monoLambdaBackendHandler = (handler: Handler) =>
  wrapHandler(
    middy(ApiHandler(handler)).use(
      injectLambdaContext(logger, { resetKeys: true })
    )
  ) as ReturnType<typeof ApiHandler>;

// This function is used to wrap individual routes within a mono lambda routed API
export const backendRouteHandler = <T>(
  ...args: Parameters<typeof backendActionApiHandler<T>>
) =>
  errorHandler(backendActionApiHandler<T>(...args)) as ReturnType<
    typeof ApiHandler
  >;

// This function is used to wrap individual lambdas which are not part of a mono lambda structure
export const singleLambdaBackendHandler = <T>(
  ...args: Parameters<typeof backendActionApiHandler<T>>
) =>
  wrapHandler(
    middy(ApiHandler(errorHandler(backendActionApiHandler<T>(...args)))).use(
      injectLambdaContext(logger, { resetKeys: true })
    )
  ) as ReturnType<typeof ApiHandler>;
