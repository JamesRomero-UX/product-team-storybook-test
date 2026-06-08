import { z } from '../openapi.zod';

export const ErrorResponseSchema = z.object({
  error: z
    .string()
    .openapi({ example: 'Unauthorized', description: 'Short error code' }),
  message: z.string().openapi({
    example: 'Invalid or missing authentication token',
    description: 'Human-readable error description',
  }),
  statusCode: z
    .number()
    .openapi({ example: 401, description: 'HTTP status code' }),
  timestamp: z.string().openapi({
    example: '2024-01-15T10:00:00Z',
    description: 'When the error occurred',
  }),
});

export const ValidationErrorResponseSchema = ErrorResponseSchema.extend({
  error: z
    .string()
    .openapi({ example: 'ValidationError', description: 'Short error code' }),
  message: z.string().openapi({
    example: 'Request body failed validation',
    description: 'Human-readable error description',
  }),
  statusCode: z
    .number()
    .openapi({ example: 422, description: 'HTTP status code' }),
  details: z.array(
    z.object({
      field: z.string().openapi({
        example: 'title',
        description: 'Field that failed validation',
      }),
      message: z.string().openapi({
        example: 'Title is required',
        description: 'Validation failure message',
      }),
    })
  ),
});

export const ForbiddenResponseSchema = ErrorResponseSchema.extend({
  error: z
    .string()
    .openapi({ example: 'Forbidden', description: 'Short error code' }),
  message: z.string().openapi({
    example: 'Insufficient permissions to access this resource',
    description: 'Human-readable error description',
  }),
  statusCode: z
    .number()
    .openapi({ example: 403, description: 'HTTP status code' }),
});

export const NotFoundResponseSchema = ErrorResponseSchema.extend({
  error: z
    .string()
    .openapi({ example: 'NotFound', description: 'Short error code' }),
  message: z.string().openapi({
    example: 'The requested resource was not found',
    description: 'Human-readable error description',
  }),
  statusCode: z
    .number()
    .openapi({ example: 404, description: 'HTTP status code' }),
});

export const InternalServerErrorResponseSchema = ErrorResponseSchema.extend({
  error: z.string().openapi({
    example: 'InternalServerError',
    description: 'Short error code',
  }),
  message: z.string().openapi({
    example: 'An unexpected error occurred',
    description: 'Human-readable error description',
  }),
  statusCode: z
    .number()
    .openapi({ example: 500, description: 'HTTP status code' }),
});
