import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { ServiceContext } from 'src/types';
import z from 'zod';

import type { PermissionCheck } from './check-permissions';
import { validatePathParams, validatePayload } from './validate-payload';

const deleteParamsSchema = z.object({
  id: z.string().uuid('Invalid update ID format'),
});

interface DeleteHandlerByIdDependencies {
  checkPermissions: (options: {
    requiredPermissions: PermissionCheck[];
    context: ServiceContext;
  }) => Promise<void>;
  bodySchema?: never;
  processor: (input: { id: string; context: ServiceContext }) => Promise<void>;
}

interface DeleteHandlerWithBodyDependencies<TBody extends z.ZodSchema> {
  checkPermissions: (options: {
    requiredPermissions: PermissionCheck[];
    context: ServiceContext;
  }) => Promise<void>;
  bodySchema: TBody;
  processor: (input: {
    id: string;
    context: ServiceContext;
    body: z.infer<TBody>;
  }) => Promise<void>;
}

type DeleteHandlerDependencies<TBody extends z.ZodSchema = z.ZodSchema> =
  | DeleteHandlerByIdDependencies
  | DeleteHandlerWithBodyDependencies<TBody>;

export const createDeleteHandler = <TBody extends z.ZodSchema = z.ZodSchema>(
  deps: DeleteHandlerDependencies<TBody>
) => {
  return async (
    event: APIGatewayProxyEvent,
    getRequiredPermissions: (
      params: z.infer<typeof deleteParamsSchema>
    ) => PermissionCheck[]
  ): Promise<APIGatewayProxyResult> => {
    // both validatePathParams and validatePayload extract context separately, we could optimize that
    const { params, context } = validatePathParams(event, deleteParamsSchema);

    await deps.checkPermissions({
      requiredPermissions: getRequiredPermissions(params),
      context,
    });

    let payload: z.infer<TBody> | undefined = undefined;

    if (deps.bodySchema) {
      const result = validatePayload(event, deps.bodySchema);
      payload = result.payload;
    }

    await deps.processor({ id: params.id, body: payload, context });

    return {
      statusCode: 204,
      headers: {
        'Content-Type': 'application/json',
      },
      body: '',
    };
  };
};
