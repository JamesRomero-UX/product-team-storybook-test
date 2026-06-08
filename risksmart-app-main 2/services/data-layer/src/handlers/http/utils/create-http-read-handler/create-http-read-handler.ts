import middy from '@middy/core';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { NotFound } from 'http-errors';
import { getLogger } from 'src/utils/logger';
import type z from 'zod';

import type {
  BulkPermissionCheckConfig,
  InferSchemaType,
  PermissionFilterConfig,
  ReadHandlerContext,
  ReadHandlerFn,
  ValidatedReadLambdaContext,
} from '../read-handler-types';
import {
  bulkPermissionCheckMiddleware,
  paginationMiddleware,
  pathParamsMiddleware,
  permissionFilterMiddleware,
  queryParamsMiddleware,
  responseFormatterMiddleware,
  serviceContextMiddleware,
} from '../read-middleware';

const logger = getLogger();

export const createHttpReadHandler = <
  TPathSchema extends z.ZodSchema | undefined,
  TQuerySchema extends z.ZodSchema | undefined,
  TData = unknown,
>() => {
  let pathParamsSchema: z.ZodSchema | undefined;
  let queryParamsSchema: z.ZodSchema | undefined;
  let objectName: string | undefined;
  let isPaginated = false;
  let isSingleItemResult = false;
  let permissionFilterConfig: PermissionFilterConfig<TData> | undefined;
  let bulkPermissionCheckConfig: BulkPermissionCheckConfig | undefined;
  let handlerFn:
    | ReadHandlerFn<
        InferSchemaType<TPathSchema>,
        InferSchemaType<TQuerySchema>,
        TData
      >
    | undefined;

  return {
    /**
     * Set the Zod schema for path parameter validation.
     * Generic type TPathSchema must be specified when calling createHttpReadHandler.
     */
    withPathParamsSchema(schema: NonNullable<TPathSchema>) {
      pathParamsSchema = schema;

      return this;
    },

    /**
     * Set the Zod schema for query parameter validation.
     * Generic type TQuerySchema must be specified when calling createHttpReadHandler.
     */
    withQueryParamsSchema(schema: NonNullable<TQuerySchema>) {
      queryParamsSchema = schema;

      return this;
    },

    /**
     * Set the object name for logging and error messages
     */
    withObjectName(name: string) {
      objectName = name;

      return this;
    },

    /**
     * Enable pagination mode for list operations
     */
    withPagination() {
      isPaginated = true;

      return this;
    },

    /**
     * Mark this handler as returning a single item (not an array).
     * Affects response formatting: single items return { data: item },
     * arrays return { data: [...] }
     */
    forSingleItem() {
      isSingleItemResult = true;

      return this;
    },

    /**
     * Configure post-fetch permission filtering
     */
    withPermissionFilter(config: PermissionFilterConfig<TData>) {
      permissionFilterConfig = config;

      return this;
    },

    /**
     * Configure an all-or-nothing bulk permission check that runs before the
     * handler. If none of the checks pass, the handler is skipped and an empty
     * result is returned immediately.
     */
    withBulkPermissionCheck(config: BulkPermissionCheckConfig) {
      bulkPermissionCheckConfig = config;

      return this;
    },

    /**
     * Set the handler function that fetches data
     */
    withHandler(
      handler: ReadHandlerFn<
        InferSchemaType<TPathSchema>,
        InferSchemaType<TQuerySchema>,
        TData
      >
    ) {
      handlerFn = handler;

      return this;
    },

    /**
     * Execute the handler with the configured middleware
     */
    async execute(
      event: APIGatewayProxyEvent,
      context: LambdaContext
    ): Promise<APIGatewayProxyResult> {
      // Validate required configuration
      if (!objectName) {
        throw new Error(
          'Object name is required. Call .withObjectName() before .execute()'
        );
      }
      if (!handlerFn) {
        throw new Error(
          'Handler is required. Call .withHandler() before .execute()'
        );
      }

      // Capture variables for use in handler
      const capturedObjectName = objectName;
      const capturedHandlerFn = handlerFn;

      // Core handler - fetches data and sets context for middleware processing
      const coreHandler = async (
        _event: APIGatewayProxyEvent,
        ctx: ValidatedReadLambdaContext<
          InferSchemaType<TPathSchema>,
          InferSchemaType<TQuerySchema>
        >
      ): Promise<APIGatewayProxyResult> => {
        const { serviceContext, pathParams, queryParams, pagination } = ctx;

        logger.info('Processing read request', {
          objectName: capturedObjectName,
          userId: serviceContext.userId,
          orgKey: serviceContext.orgKey,
          tenant: serviceContext.tenant,
          isPaginated: !!pagination,
        });

        // Build handler context
        const handlerContext: ReadHandlerContext<
          InferSchemaType<TPathSchema>,
          InferSchemaType<TQuerySchema>
        > = {
          pathParams,
          queryParams,
          serviceContext,
          pagination,
        };

        // Execute the handler to fetch data
        const data = await capturedHandlerFn(handlerContext);

        // Handle null/undefined data
        if (data === null || data === undefined) {
          throw new NotFound(`${capturedObjectName} not found`);
        }

        const dataArray = Array.isArray(data) ? data : [data];

        // Set context for middleware processing
        ctx.data = dataArray;
        ctx.objectName = capturedObjectName;

        // Return placeholder - responseFormatterMiddleware will build the actual response
        return { statusCode: 200, body: '' };
      };

      // Build middleware chain
      let middlewareHandler = middy(coreHandler).use(
        serviceContextMiddleware()
      );

      // Add path params middleware if schema provided
      if (pathParamsSchema) {
        middlewareHandler = middlewareHandler.use(
          pathParamsMiddleware(pathParamsSchema)
        );
      }

      // Add query params middleware if schema provided
      if (queryParamsSchema) {
        middlewareHandler = middlewareHandler.use(
          queryParamsMiddleware(queryParamsSchema)
        );
      }

      // Add pagination middleware if enabled
      if (isPaginated) {
        middlewareHandler = middlewareHandler.use(paginationMiddleware());
      }

      // Add bulk permission check middleware if configured (runs before handler in before phase)
      if (bulkPermissionCheckConfig) {
        middlewareHandler = middlewareHandler.use(
          bulkPermissionCheckMiddleware({
            ...bulkPermissionCheckConfig,
            objectName: capturedObjectName,
          })
        );
      }

      // Add response formatter middleware (runs last in after phase)
      middlewareHandler = middlewareHandler.use(
        responseFormatterMiddleware({ isSingleItemResult })
      );

      // Add permission filter middleware if configured (runs before response formatter in after phase)
      if (permissionFilterConfig) {
        middlewareHandler = middlewareHandler.use(
          permissionFilterMiddleware({
            ...permissionFilterConfig,
            isSingleItemResult,
          })
        );
      }

      // Type assertion required: middy infers narrowed type from middleware chain,
      // but at invocation we pass base context which middleware will enrich
      return await middlewareHandler(
        event,
        context as ValidatedReadLambdaContext<
          InferSchemaType<TPathSchema>,
          InferSchemaType<TQuerySchema>
        >
      );
    },
  };
};
