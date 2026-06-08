import { wrapHandler } from '@sentry/aws-serverless';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { BadRequest } from 'http-errors';
import { ApiHandler } from 'sst/node/api';
import type { ZodSchema } from 'zod';

import { errorHandler } from './errorHandler';
import { initSentry } from './sentryInit';

initSentry();

type BackendHandler<T> = (
  body: T
) => Promise<APIGatewayProxyStructuredResultV2>;

const backendApiHandler =
  <T>(schema: ZodSchema<T>, handler: BackendHandler<T>) =>
  async (evt: APIGatewayProxyEventV2) => {
    const body = JSON.parse(evt.body || '{}') as T;
    const parseResult = schema.safeParse(body);
    if (parseResult.success) {
      return handler(parseResult.data);
    }
    throw new BadRequest(parseResult.error.message);
  };

export default <T>(...args: Parameters<typeof backendApiHandler<T>>) =>
  wrapHandler(
    ApiHandler(errorHandler(backendApiHandler<T>(...args)))
  ) as ReturnType<typeof ApiHandler>;
