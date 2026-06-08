import type middy from '@middy/core';
import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { BadRequest, Forbidden } from 'http-errors';
import { createPermitDependencies } from 'src/clients/permit';
import { getLogger } from 'src/utils/logger';
import { extractPaginationParams } from 'src/utils/pagination';
import type z from 'zod';

import { extractServiceContext } from '../extract-context';
import { formatReadResponse } from '../format-read-response/format-read-response';
import type {
  BulkPermissionCheckConfig,
  EnrichedReadLambdaContext,
  PermissionFilterConfig,
  ValidatedReadLambdaContext,
} from '../read-handler-types';

type ReadApiMiddleware<
  TContext extends LambdaContext = EnrichedReadLambdaContext,
> = middy.MiddlewareObj<APIGatewayProxyEvent, unknown, Error, TContext>;

/**
 * Middleware that extracts and validates service context from request headers
 */
export const serviceContextMiddleware = (): ReadApiMiddleware => ({
  before: (request) => {
    const serviceContext = extractServiceContext(request.event);
    request.context.serviceContext = serviceContext;
  },
});

/**
 * Middleware that validates path parameters against a Zod schema
 */
export const pathParamsMiddleware = <
  TSchema extends z.ZodType<Record<string, string | undefined>>,
>(
  schema: TSchema
): ReadApiMiddleware => ({
  before: (request) => {
    const pathParams = request.event.pathParameters ?? {};

    const validation = schema.safeParse(pathParams);

    if (!validation.success) {
      const errorMessages = validation.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('; ');
      throw new BadRequest(`Invalid path parameters: ${errorMessages}`);
    }

    request.context.pathParams = validation.data;
  },
});

/**
 * Middleware that validates query parameters against a Zod schema
 */
export const queryParamsMiddleware = <
  TSchema extends z.ZodType<Record<string, string | undefined>>,
>(
  schema: TSchema
): ReadApiMiddleware => ({
  before: (request) => {
    const queryParams = request.event.queryStringParameters ?? {};

    const validation = schema.safeParse(queryParams);

    if (!validation.success) {
      const errorMessages = validation.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('; ');
      throw new BadRequest(`Invalid query parameters: ${errorMessages}`);
    }

    request.context.queryParams = validation.data;
  },
});

/**
 * Middleware that extracts pagination parameters from query string
 */
export const paginationMiddleware = (): ReadApiMiddleware => ({
  before: (request) => {
    const pagination = extractPaginationParams(request.event);
    request.context.pagination = pagination;
  },
});

const logger = getLogger();

/**
 * Middleware that performs an all-or-nothing bulk permission check before the
 * handler executes. If none of the requested permissions are granted, the
 * handler is skipped and an empty array is returned.
 *
 * Must run after serviceContextMiddleware.
 */
export const bulkPermissionCheckMiddleware = (
  config: BulkPermissionCheckConfig & { objectName: string }
): ReadApiMiddleware<ValidatedReadLambdaContext> => ({
  before: async (request) => {
    const { serviceContext } = request.context;

    const { permitClient } = await createPermitDependencies(logger);
    const permitted = await permitClient.bulkCheck(
      config.checks,
      serviceContext.userId,
      serviceContext.orgKey
    );

    if (permitted.length === 0) {
      logger.info('Bulk permission check denied, returning empty result', {
        objectName: config.objectName,
        userId: serviceContext.userId,
        orgKey: serviceContext.orgKey,
        checks: config.checks,
      });

      // Set context for after middlewares (responseFormatter needs these)
      request.context.data = [];
      request.context.objectName = config.objectName;

      // Returning a response from before skips the handler; responseFormatterMiddleware
      // will overwrite this with the properly formatted empty result in the after phase.
      return { statusCode: 200, body: '' };
    }
  },
});

/**
 * Middleware that filters data based on user permissions.
 * Runs after the handler has set data on context.
 */
export const permissionFilterMiddleware = <TData>(
  config: PermissionFilterConfig<TData>
): ReadApiMiddleware<ValidatedReadLambdaContext> => ({
  after: async (request) => {
    const { serviceContext, data, objectName } = request.context;

    if (!data) {
      throw new Error(
        'permissionFilterMiddleware requires data on context. ' +
          'Ensure the handler sets context.data before this middleware runs.'
      );
    }

    const preFilterCount = data.length;

    const { permitClient } = await createPermitDependencies(logger);
    const filteredData = await permitClient.filter<TData>(
      data as TData[],
      config.resourceType,
      config.idExtractor,
      serviceContext.userId,
      serviceContext.orgKey
    );

    logger.info('Permission filtering complete', {
      objectName,
      originalCount: preFilterCount,
      filteredCount: filteredData.length,
    });

    if (
      config.isSingleItemResult &&
      filteredData.length === 0 &&
      preFilterCount > 0
    ) {
      throw new Forbidden(
        `Access denied: insufficient permissions to view this ${objectName}`
      );
    }

    request.context.data = filteredData;
  },
});

/**
 * Configuration for the response formatter middleware
 */
interface ResponseFormatterConfig {
  isSingleItemResult: boolean;
}

/**
 * Middleware that formats the response from context data.
 * Must run last in the after chain to produce the final APIGatewayProxyResult.
 */
export const responseFormatterMiddleware = (
  config: ResponseFormatterConfig
): ReadApiMiddleware<ValidatedReadLambdaContext> => ({
  after: (request) => {
    const { data, pagination, objectName } = request.context;

    if (!data) {
      throw new Error(
        'responseFormatterMiddleware requires data on context. ' +
          'Ensure the handler sets context.data before this middleware runs.'
      );
    }

    if (!objectName) {
      throw new Error(
        'responseFormatterMiddleware requires objectName on context.'
      );
    }

    request.response = formatReadResponse(data, {
      isSingleItemResult: config.isSingleItemResult,
      isPaginated: !!pagination,
      pagination,
      objectName,
    });
  },
});
