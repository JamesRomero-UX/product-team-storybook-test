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

const frontendApiHandler =
  <T>(
    schema: ZodSchema<T>,
    handler: (
      body: T,
      evt: APIGatewayProxyEventV2
    ) => Promise<APIGatewayProxyStructuredResultV2>
  ) =>
  async (evt: APIGatewayProxyEventV2) => {
    const body = JSON.parse(evt.body || '{}') as T;
    const parseResult = schema.safeParse(body);
    if (parseResult.success) {
      return handler({ ...body }, evt);
    }
    throw new BadRequest(parseResult.error.message);
  };

export default <T>(...args: Parameters<typeof frontendApiHandler<T>>) =>
  wrapHandler(
    ApiHandler(errorHandler(frontendApiHandler<T>(...args)))
  ) as ReturnType<typeof ApiHandler>;
