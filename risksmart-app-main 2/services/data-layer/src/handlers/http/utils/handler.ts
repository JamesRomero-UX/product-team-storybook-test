import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { ServiceContext } from 'src/types';
import type z from 'zod';

import type { PermissionCheck } from './check-permissions';
import { validatePathParams, validatePayload } from './validate-payload';

interface Dependencies<TIn extends z.ZodSchema> {
  checkPermissions: (options: {
    requiredPermissions: PermissionCheck[];
    context: ServiceContext;
  }) => Promise<void>;
  schema: TIn;
  processor: (input: {
    payload: z.infer<TIn>;
    context: ServiceContext;
  }) => Promise<{ Id: string }>;
}

const buildLocationUrl = (
  event: APIGatewayProxyEvent,
  objectId: string,
  objectType: string
): string => {
  const host = event.headers['Host'] || event.headers['host'];
  const stage = event.requestContext.stage;
  const protocol = 'https';

  return `${protocol}://${host}/${stage}/${objectType}/${objectId}`;
};

/**
 * @deprecated Use createHttpMutationHandler with middleware pattern instead
 * @see {@link createHttpMutationHandler} in create-http-handler.ts
 *
 * This legacy handler pattern manually handles validation, permissions, and response formatting.
 * The new middleware-based approach provides better separation of concerns, reusability,
 * and automatic event emission.
 *
 * @example Migration example
 * ```typescript
 * // OLD:
 * const handle = createPostHandler({ checkPermissions, schema, processor });
 * return handle(event, getRequiredPermissions, 'object-type');
 *
 * // NEW:
 * const eventStrategy = new ObjectEventStrategy('object_type', 'create', eventBridge, logger);
 * return createHttpMutationHandler(schema)
 *   .withSchema(schema)
 *   .withObjectName('object_type')
 *   .withEventStrategy(eventStrategy)
 *   .withPermissions((payload) => getRequiredPermissions(payload))
 *   .withHandler(async (event, context) => {
 *     const result = await processor({ payload: context.payload, context: context.serviceContext });
 *     return {
 *       response: createdResponse({ event, result, objectType: 'object-type' }),
 *       strategyData: { objectIds: [result.Id] },
 *     };
 *   })
 *   .execute(event, context);
 * ```
 */
export const createPostHandler = <TIn extends z.ZodSchema>(
  deps: Dependencies<TIn>
) => {
  return async (
    event: APIGatewayProxyEvent,
    getRequiredPermissions: (payload: z.infer<TIn>) => PermissionCheck[],
    objectType: string
  ): Promise<APIGatewayProxyResult> => {
    const { payload, context } = validatePayload(event, deps.schema);

    await deps.checkPermissions({
      requiredPermissions: getRequiredPermissions(payload),
      context,
    });

    const result = await deps.processor({ payload, context });

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        Location: buildLocationUrl(event, result.Id, objectType),
      },
      body: JSON.stringify({ data: result }),
    };
  };
};

interface DeleteDependencies<TParams extends z.ZodSchema> {
  checkPermissions: (options: {
    requiredPermissions: PermissionCheck[];
    context: ServiceContext;
  }) => Promise<void>;
  paramsSchema: TParams;
  processor: (input: {
    params: z.infer<TParams>;
    context: ServiceContext;
  }) => Promise<void>;
}

/**
 * @deprecated Use createHttpMutationHandler with middleware pattern instead
 * @see {@link createHttpMutationHandler} in create-http-handler.ts
 *
 * This legacy handler pattern manually handles validation, permissions, and response formatting.
 * The new middleware-based approach provides better separation of concerns and reusability.
 *
 * @example Migration example
 * ```typescript
 * // OLD:
 * const handle = createDeleteHandler({ checkPermissions, paramsSchema, processor });
 * return handle(event, getRequiredPermissions);
 *
 * // NEW:
 * const eventStrategy = new ObjectEventStrategy('object_name', 'delete', eventBridge, logger);
 * return createHttpMutationHandler(paramsSchema)
 *   .withSchema(paramsSchema)
 *   .withObjectName('object_name')
 *   .withEventStrategy(eventStrategy)
 *   .withPermissions((params) => getRequiredPermissions(params))
 *   .withHandler(async (event, context) => {
 *     await processor({ params: context.payload, context: context.serviceContext });
 *     // For single object delete, return array with one ID
 *     // For batch delete, processor should return array of deleted IDs
 *     return {
 *       response: { statusCode: 204, headers: {}, body: '' },
 *       objectIds: [context.payload.id], // or deletedIds from processor
 *     };
 *   })
 *   .execute(event, context);
 * ```
 */
export const createDeleteHandler = <TParams extends z.ZodSchema>(
  deps: DeleteDependencies<TParams>
) => {
  return async (
    event: APIGatewayProxyEvent,
    getRequiredPermissions: (params: z.infer<TParams>) => PermissionCheck[]
  ): Promise<APIGatewayProxyResult> => {
    const { params, context } = validatePathParams(event, deps.paramsSchema);

    await deps.checkPermissions({
      requiredPermissions: getRequiredPermissions(params),
      context,
    });

    await deps.processor({ params, context });

    return {
      statusCode: 204,
      headers: {
        'Content-Type': 'application/json',
      },
      body: '',
    };
  };
};
