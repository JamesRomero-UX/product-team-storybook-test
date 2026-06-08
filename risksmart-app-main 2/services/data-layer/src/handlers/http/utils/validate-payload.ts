import type { APIGatewayProxyEvent } from 'aws-lambda';
import { BadRequest } from 'http-errors';
import type { ServiceContext } from 'src/types';
import type { z } from 'zod';

import { extractServiceContext } from './extract-context';

export interface PayloadValidationConfig {
  schema: z.ZodSchema;
}

const parseJsonBody = (event: APIGatewayProxyEvent): unknown => {
  if (!event.body) {
    throw new BadRequest('Request body is required');
  }

  try {
    return JSON.parse(event.body);
  } catch {
    throw new BadRequest('Request body contains invalid JSON');
  }
};

export const validatePayload = <T extends z.ZodSchema>(
  event: APIGatewayProxyEvent,
  schema: T
): { payload: z.infer<T>; context: ServiceContext } => {
  const parsedBody = parseJsonBody(event);

  const validation = schema.safeParse(parsedBody);

  if (!validation.success) {
    const errorMessages = validation.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    throw new BadRequest(`Invalid payload: ${errorMessages}`);
  }

  const context = extractServiceContext(event);

  return { payload: validation.data, context };
};

export const validatePathParams = <T extends z.ZodSchema>(
  event: APIGatewayProxyEvent,
  schema: T
): { params: z.infer<T>; context: ServiceContext } => {
  const pathParams = event.pathParameters ?? {};

  const validation = schema.safeParse(pathParams);

  if (!validation.success) {
    const errorMessages = validation.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    throw new BadRequest(`Invalid path parameters: ${errorMessages}`);
  }

  const context = extractServiceContext(event);

  return { params: validation.data, context };
};
