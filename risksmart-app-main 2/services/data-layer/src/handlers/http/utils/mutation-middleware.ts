import type middy from '@middy/core';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context as LambdaContext,
} from 'aws-lambda';
import { createPermitDependencies } from 'src/clients/permit';
import type { ServiceContext } from 'src/types';
import { getLogger } from 'src/utils/logger';
import type z from 'zod';

import { createDefaultMetadata } from '../events/event';
import type { EventStrategy } from '../events/event-strategies';
import {
  createCheckPermissions,
  type PermissionCheck,
} from './check-permissions';
import { validatePayload } from './validate-payload';

const logger = getLogger();

export interface EnrichedLambdaContext<
  TPayload,
  TStrategyData = unknown,
> extends LambdaContext {
  payload?: TPayload;
  serviceContext?: ServiceContext;
  /**
   * Generic data container for event strategies
   * Type-safe based on the EventStrategy being used
   */
  strategyData?: TStrategyData;
}

export interface ValidatedLambdaContext<
  TPayload,
  TStrategyData = unknown,
> extends LambdaContext {
  payload: TPayload;
  serviceContext: ServiceContext;
  /**
   * Generic data container for event strategies
   * Type-safe based on the EventStrategy being used
   */
  strategyData?: TStrategyData;
}

export type OperationType = 'create' | 'update' | 'delete';

/**
 * Handler result that includes both the HTTP response and strategy data for event emission
 */
export interface HandlerResult<
  TResponse = APIGatewayProxyResult,
  TStrategyData = unknown,
> {
  response: TResponse;
  /**
   * Generic data container for event strategies
   * Type-safe based on the EventStrategy being used
   *
   * Examples:
   * - ObjectEventStrategy expects: { objectIds: string[] }
   * - FormEventStrategy expects: { formFieldIds: { fieldId: string; parentType: string }[] }
   */
  strategyData?: TStrategyData;
}

type AsyncApiMiddleware<
  T,
  TStrategyData = unknown,
  TContext extends LambdaContext = EnrichedLambdaContext<T, TStrategyData>,
> = middy.MiddlewareObj<APIGatewayProxyEvent, unknown, Error, TContext>;

export const payloadValidationMiddleware = <
  TSchema extends z.ZodSchema,
  TStrategyData = unknown,
>(
  schema: TSchema
): AsyncApiMiddleware<
  z.infer<TSchema>,
  TStrategyData,
  EnrichedLambdaContext<z.infer<TSchema>, TStrategyData>
> => ({
  before: (request) => {
    const { payload, context } = validatePayload(request.event, schema);

    request.context.payload = payload;
    request.context.serviceContext = context;
  },
});

export const permissionsMiddleware = <T, TStrategyData = unknown>(
  getRequiredPermissions: ({
    payload,
    pathParams,
  }: {
    payload: T | undefined;
    pathParams: Record<string, string | undefined>;
  }) => PermissionCheck[] | PermissionCheck[][]
): AsyncApiMiddleware<
  T,
  TStrategyData,
  ValidatedLambdaContext<T, TStrategyData>
> => ({
  before: async (request) => {
    const { payload, serviceContext } = request.context;

    const pathParams: Record<string, string | undefined> =
      request.event.pathParameters ?? {};

    if (!serviceContext) {
      throw new Error(
        'Payload validation middleware must run before permissions middleware'
      );
    }

    const requiredPermissions = getRequiredPermissions({ payload, pathParams });

    const { permitClient } = await createPermitDependencies(logger);
    const checkPermissions = createCheckPermissions({ permitClient });

    await checkPermissions({
      requiredPermissions,
      context: serviceContext,
    });
  },
});

/**
 * Generic event middleware that works with any EventStrategy
 * Replaces both EventMiddleware and FormEventMiddleware with a unified implementation
 */
export const EventMiddleware = <T, TStrategyData = unknown>(
  strategy: EventStrategy<TStrategyData>
): AsyncApiMiddleware<
  T,
  TStrategyData,
  ValidatedLambdaContext<T, TStrategyData>
> => {
  const after: middy.MiddlewareFn<
    APIGatewayProxyEvent,
    unknown,
    Error,
    ValidatedLambdaContext<T, TStrategyData>
  > = async ({ context }): Promise<void> => {
    const eventMetadata = createDefaultMetadata(context.serviceContext);

    // Validate that context has required data for this event type
    strategy.validateContext(context);

    // Extract event data (could be multiple items for batch operations)
    const eventDataItems = strategy.extractEventData(context);

    // Emit success events for all items
    await Promise.all(
      eventDataItems.map((eventData) =>
        strategy.emitSuccessEvent(eventMetadata, eventData)
      )
    );
  };

  const onError: middy.MiddlewareFn<
    APIGatewayProxyEvent,
    unknown,
    Error,
    ValidatedLambdaContext<T, TStrategyData>
  > = async ({ context, error }) => {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Guard: serviceContext may be undefined if the error occurred before
    // or during payload validation (e.g. BadRequest from schema validation).
    // In that case we cannot build event metadata, so skip event emission.
    if (!context.serviceContext) {
      logger.warn(
        'Skipping failure event emission: serviceContext not available',
        { originalError: errorMessage }
      );

      return;
    }

    const eventMetadata = createDefaultMetadata(context.serviceContext);

    try {
      // Attempt to extract event data even on failure
      const eventDataItems = strategy.extractEventData(context);

      // Emit failure events for all items
      await Promise.all(
        eventDataItems.map((eventData) =>
          strategy.emitFailureEvent(eventMetadata, eventData, errorMessage)
        )
      );
    } catch (extractionError) {
      // If we can't extract event data, log and continue
      logger.warn('Failed to extract event data for failure event', {
        error: extractionError,
        originalError: errorMessage,
      });
    }
  };

  return {
    after,
    onError,
  };
};
