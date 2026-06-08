import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context,
} from 'aws-lambda';
import { isHttpError } from 'http-errors';

import { ModifiedSinceLastViewError } from './errors/ModifiedSinceLastViewError';
import { getLogger } from './logger';
import { ChangeRequestConfirmationRequiredError } from './services/approval/workflowUtils';
const logger = getLogger();
type Handler = (
  event: APIGatewayProxyEventV2,
  context: Context
) => Promise<APIGatewayProxyStructuredResultV2>;

export const errorHandler = (handler: Handler) => {
  return async (
    event: APIGatewayProxyEventV2,
    context: Context
  ): Promise<APIGatewayProxyStructuredResultV2> => {
    try {
      return await handler(event, context);
    } catch (ex) {
      const extensions: { code: string; [optionalFields: string]: string }[] =
        [];
      if (ex instanceof ChangeRequestConfirmationRequiredError) {
        logger.info(ex.message);

        return {
          statusCode: 400,
          body: JSON.stringify({
            message: ex.message,
            extensions,
          }),
        };
      }

      if (isHttpError(ex)) {
        if (ex instanceof ModifiedSinceLastViewError) {
          extensions.push({
            code: ex.code,
          });
        }

        if (ex.statusCode >= 500) {
          logger.error(ex);
        } else {
          logger.info(ex);
        }

        return {
          statusCode: ex.statusCode,
          body: JSON.stringify({
            message: ex.message,
            extensions,
          }),
        };
      } else {
        throw ex;
      }
    }
  };
};
