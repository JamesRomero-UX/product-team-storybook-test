import middy from '@middy/core';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import type z from 'zod';

import type { EventStrategy } from '../events/event-strategies';
import type { PermissionCheck } from './check-permissions';
import type {
  HandlerResult,
  ValidatedLambdaContext,
} from './mutation-middleware';
import {
  EventMiddleware,
  payloadValidationMiddleware,
  permissionsMiddleware,
} from './mutation-middleware';

/**
 * Builder interface for creating HTTP mutation handlers with type-safe strategy data
 */
interface MutationHandlerBuilder<
  TSchema extends z.ZodSchema,
  TStrategyData = unknown,
> {
  withSchema<TNewSchema extends z.ZodSchema>(
    newSchema: TNewSchema
  ): MutationHandlerBuilder<TNewSchema, TStrategyData>;

  withObjectName(name: string): this;

  /**
   * Configure the event strategy for this mutation handler
   * This method updates the builder type to include the strategy's data type
   * @param strategy - The EventStrategy to use
   */
  withEventStrategy<TNewStrategyData>(
    strategy: EventStrategy<TNewStrategyData>
  ): MutationHandlerBuilder<TSchema, TNewStrategyData>;

  withPermissions(
    permissionsFn: ({
      payload,
      pathParams,
    }: {
      payload: z.infer<TSchema>;
      pathParams: Record<string, string | undefined>;
    }) => PermissionCheck[] | PermissionCheck[][]
  ): this;

  withHandler(
    handlerFn: (
      event: APIGatewayProxyEvent,
      context: ValidatedLambdaContext<z.infer<TSchema>, TStrategyData>
    ) => Promise<HandlerResult<APIGatewayProxyResult, TStrategyData>>
  ): this;

  execute(
    event: APIGatewayProxyEvent,
    context: LambdaContext
  ): Promise<APIGatewayProxyResult>;
}

export const createHttpMutationHandler = <
  TSchema extends z.ZodSchema = z.ZodSchema,
  TStrategyData = unknown,
>(): MutationHandlerBuilder<TSchema, TStrategyData> => {
  let schema: z.ZodSchema | undefined;
  let objectName: string | undefined;
  let eventStrategy: EventStrategy<TStrategyData> | undefined;
  let getRequiredPermissions:
    | (({
        payload,
        pathParams,
      }: {
        payload: z.infer<TSchema>;
        pathParams: Record<string, string | undefined>;
      }) => PermissionCheck[] | PermissionCheck[][])
    | undefined;
  let handler:
    | ((
        event: APIGatewayProxyEvent,
        context: ValidatedLambdaContext<z.infer<TSchema>, TStrategyData>
      ) => Promise<HandlerResult<APIGatewayProxyResult, TStrategyData>>)
    | undefined;

  const builder: MutationHandlerBuilder<TSchema, TStrategyData> = {
    withSchema<TNewSchema extends z.ZodSchema>(newSchema: TNewSchema) {
      schema = newSchema;

      return builder as unknown as MutationHandlerBuilder<
        TNewSchema,
        TStrategyData
      >;
    },

    withObjectName(name: string) {
      objectName = name;

      return builder;
    },

    withEventStrategy<TNewStrategyData>(
      strategy: EventStrategy<TNewStrategyData>
    ) {
      eventStrategy = strategy as unknown as EventStrategy<TStrategyData>;

      return builder as unknown as MutationHandlerBuilder<
        TSchema,
        TNewStrategyData
      >;
    },

    withPermissions(
      permissionsFn: ({
        payload,
        pathParams,
      }: {
        payload: z.infer<TSchema>;
        pathParams: Record<string, string | undefined>;
      }) => PermissionCheck[] | PermissionCheck[][]
    ) {
      getRequiredPermissions = permissionsFn;

      return builder;
    },

    withHandler(
      handlerFn: (
        event: APIGatewayProxyEvent,
        context: ValidatedLambdaContext<z.infer<TSchema>, TStrategyData>
      ) => Promise<HandlerResult<APIGatewayProxyResult, TStrategyData>>
    ) {
      handler = handlerFn;

      return builder;
    },

    async execute(
      event: APIGatewayProxyEvent,
      context: LambdaContext
    ): Promise<APIGatewayProxyResult> {
      if (!schema) {
        throw new Error(
          'Schema is required. Call .withSchema() before .execute()'
        );
      }
      if (!objectName) {
        throw new Error(
          'Object name is required. Call .withObjectName() before .execute()'
        );
      }
      if (!getRequiredPermissions) {
        throw new Error(
          'Permissions are required. Call .withPermissions() before .execute()'
        );
      }
      if (!handler) {
        throw new Error(
          'Handler is required. Call .withHandler() before .execute()'
        );
      }
      if (!eventStrategy) {
        throw new Error(
          'Event strategy is required. Call .withEventStrategy() before .execute()'
        );
      }

      // Wrap handler to extract strategyData and set on context before middleware runs
      const guaranteedHandler = handler;
      const wrappedHandler = async (
        event: APIGatewayProxyEvent,
        context: ValidatedLambdaContext<z.infer<TSchema>, TStrategyData>
      ): Promise<APIGatewayProxyResult> => {
        const result = await guaranteedHandler(event, context);

        // Set strategyData on context for the event strategy to use
        context.strategyData = result.strategyData;

        return result.response;
      };

      const middlewareHandler = middy(wrappedHandler)
        .use(payloadValidationMiddleware<typeof schema, TStrategyData>(schema))
        .use(
          permissionsMiddleware<z.infer<TSchema>, TStrategyData>(
            getRequiredPermissions
          )
        )
        .use(EventMiddleware<z.infer<TSchema>, TStrategyData>(eventStrategy));

      // Type assertion required: middy infers narrowed type from middleware chain,
      // but at invocation we pass base context which middleware will enrich
      return await middlewareHandler(
        event,
        context as ValidatedLambdaContext<z.infer<TSchema>, TStrategyData>
      );
    },
  };

  return builder;
};
