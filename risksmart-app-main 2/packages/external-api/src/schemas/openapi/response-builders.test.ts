import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import type { VersionedSchemas } from '../openapi-registry-builder';
import {
  createCreatedResponse,
  createSuccessResponse,
  createValidationErrorResponse,
} from './response-builders';

describe('response-builders', () => {
  describe('createValidationErrorResponse', () => {
    it('should create 400 validation error response', () => {
      const mockValidationErrorSchema = z.object({
        error: z.string(),
        message: z.string(),
      });

      const mockSchemas = {
        validationErrorResponse: mockValidationErrorSchema,
      } as unknown as VersionedSchemas;

      const response = createValidationErrorResponse(mockSchemas);

      expect(response).toHaveProperty('400');
      expect(response[400]).toEqual({
        description: 'Bad request',
        content: {
          'application/json': {
            schema: mockValidationErrorSchema,
          },
        },
      });
    });

    it('should use the provided schemas validationErrorResponse', () => {
      const customSchema = z.object({
        custom: z.string(),
      });
      const mockSchemas = {
        validationErrorResponse: customSchema,
      } as unknown as VersionedSchemas;

      const response = createValidationErrorResponse(mockSchemas);

      expect(response[400].content['application/json'].schema).toBe(
        customSchema
      );
    });

    it('should have correct structure', () => {
      const mockSchemas = {
        validationErrorResponse: z.object({}),
      } as unknown as VersionedSchemas;

      const response = createValidationErrorResponse(mockSchemas);

      expect(response).toHaveProperty('400');
      expect(response[400]).toHaveProperty('description');
      expect(response[400]).toHaveProperty('content');
      expect(response[400].content).toHaveProperty('application/json');
      expect(response[400].content['application/json']).toHaveProperty(
        'schema'
      );
    });
  });

  describe('createSuccessResponse', () => {
    it('should create 200 success response with description and schema', () => {
      const testSchema = z.object({
        id: z.string(),
        name: z.string(),
      });

      const response = createSuccessResponse('Resource found', testSchema);

      expect(response).toHaveProperty('200');
      expect(response[200]).toEqual({
        description: 'Resource found',
        content: {
          'application/json': {
            schema: testSchema,
          },
        },
      });
    });

    it('should use the provided description', () => {
      const testSchema = z.string();
      const customDescription = 'Custom success message';

      const response = createSuccessResponse(customDescription, testSchema);
      expect(response[200].description).toBe(customDescription);
    });

    it('should use the provided schema', () => {
      const customSchema = z.object({
        data: z.array(z.string()),
      });

      const response = createSuccessResponse('Success', customSchema);

      expect(response[200].content['application/json'].schema).toBe(
        customSchema
      );
    });

    it('should work with different schema types', () => {
      const schemas = [
        z.string(),
        z.number(),
        z.boolean(),
        z.object({ test: z.string() }),
        z.array(z.number()),
      ];

      schemas.forEach((schema) => {
        const response = createSuccessResponse('Test', schema);
        expect(response[200].content['application/json'].schema).toBe(schema);
      });
    });

    it('should have correct structure', () => {
      const testSchema = z.object({});

      const response = createSuccessResponse('Test description', testSchema);

      expect(response).toHaveProperty('200');
      expect(response[200]).toHaveProperty('description');
      expect(response[200]).toHaveProperty('content');
      expect(response[200].content).toHaveProperty('application/json');
      expect(response[200].content['application/json']).toHaveProperty(
        'schema'
      );
    });

    it('should handle empty description', () => {
      const testSchema = z.object({});

      const response = createSuccessResponse('', testSchema);

      expect(response[200].description).toBe('');
    });

    it('should handle long descriptions', () => {
      const testSchema = z.object({});
      const longDescription = 'A'.repeat(1000);

      const response = createSuccessResponse(longDescription, testSchema);
      expect(response[200].description).toBe(longDescription);
      expect(response[200].description.length).toBe(1000);
    });
  });

  describe('createCreatedResponse', () => {
    it('should create 201 created response with description and schema', () => {
      const testSchema = z.object({
        id: z.string(),
      });

      const response = createCreatedResponse('Resource created', testSchema);

      expect(response).toHaveProperty('201');
      expect(response[201]).toEqual({
        description: 'Resource created',
        content: {
          'application/json': {
            schema: testSchema,
          },
        },
      });
    });

    it('should use the provided description', () => {
      const testSchema = z.string();
      const customDescription = 'Custom created message';

      const response = createCreatedResponse(customDescription, testSchema);
      expect(response[201].description).toBe(customDescription);
    });

    it('should use the provided schema', () => {
      const customSchema = z.object({
        id: z.string().uuid(),
      });

      const response = createCreatedResponse('Created', customSchema);

      expect(response[201].content['application/json'].schema).toBe(
        customSchema
      );
    });

    it('should have correct structure', () => {
      const testSchema = z.object({});

      const response = createCreatedResponse('Test description', testSchema);

      expect(response).toHaveProperty('201');
      expect(response[201]).toHaveProperty('description');
      expect(response[201]).toHaveProperty('content');
      expect(response[201].content).toHaveProperty('application/json');
      expect(response[201].content['application/json']).toHaveProperty(
        'schema'
      );
    });

    it('should not have 200 key', () => {
      const testSchema = z.object({});

      const response = createCreatedResponse('Created', testSchema);

      expect(response).not.toHaveProperty('200');
    });
  });
});
