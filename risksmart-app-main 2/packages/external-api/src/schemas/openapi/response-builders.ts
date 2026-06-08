import type { z } from '../openapi.zod';
import type { VersionedSchemas } from '../openapi-registry-builder';

// Response builders for creating consistent OpenAPI response objects

interface JsonResponseContent {
  description: string;
  content: { 'application/json': { schema: z.ZodType } };
}

function buildResponseContent(
  description: string,
  schema: z.ZodType
): JsonResponseContent {
  return {
    description,
    content: { 'application/json': { schema } },
  };
}

// Creates a validation error response (400)
export function createValidationErrorResponse(schemas: VersionedSchemas) {
  return {
    400: buildResponseContent('Bad request', schemas.validationErrorResponse),
  };
}

// Creates a success response (200) with the specified schema
export function createSuccessResponse(description: string, schema: z.ZodType) {
  return {
    200: buildResponseContent(description, schema),
  };
}

// Creates a created response (201) with the specified schema
export function createCreatedResponse(description: string, schema: z.ZodType) {
  return {
    201: buildResponseContent(description, schema),
  };
}
