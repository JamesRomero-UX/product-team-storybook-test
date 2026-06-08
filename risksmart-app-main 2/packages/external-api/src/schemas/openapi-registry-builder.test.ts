import { describe, expect, it } from 'vitest';

import { CURRENT_API_VERSION } from '../versions/index';
import {
  baseErrorResponses,
  buildOpenApiRegistry,
  type RegistryWithSchemas,
  type VersionedSchemas,
} from './openapi-registry-builder';

describe('openapi-registry-builder', () => {
  describe('buildOpenApiRegistry', () => {
    it('should return registry and schemas for latest version', () => {
      const result: RegistryWithSchemas = buildOpenApiRegistry();

      expect(result).toHaveProperty('registry');
      expect(result).toHaveProperty('schemas');
      expect(result.registry).toBeDefined();
      expect(result.schemas).toBeDefined();
    });

    it('should return registry with all required schema properties', () => {
      const result = buildOpenApiRegistry();
      const schemas: VersionedSchemas = result.schemas;

      expect(schemas).toHaveProperty('controlItemSchema');
      expect(schemas).toHaveProperty('controlListResponse');
      expect(schemas).toHaveProperty('riskSchema');
      expect(schemas).toHaveProperty('riskListResponse');
      expect(schemas).toHaveProperty('errorResponse');
      expect(schemas).toHaveProperty('validationErrorResponse');
      expect(schemas).toHaveProperty('actionListResponse');
      expect(schemas).toHaveProperty('actionItemSchema');
    });

    it('should register all schemas in the registry', () => {
      const result = buildOpenApiRegistry();

      // Check that schemas have been registered
      const definitions = result.registry.definitions;
      expect(definitions.length).toBeGreaterThan(0);

      // Check that we have schema registrations
      const schemaRegistrations = definitions.filter(
        (def) => def.type === 'schema'
      );
      expect(schemaRegistrations.length).toBeGreaterThan(0);

      // Verify all required schemas are present in the returned schemas object
      expect(result.schemas.riskSchema).toBeDefined();
      expect(result.schemas.riskListResponse).toBeDefined();
      expect(result.schemas.controlItemSchema).toBeDefined();
      expect(result.schemas.controlListResponse).toBeDefined();
      expect(result.schemas.actionItemSchema).toBeDefined();
      expect(result.schemas.actionListResponse).toBeDefined();
      expect(result.schemas.errorResponse).toBeDefined();
      expect(result.schemas.validationErrorResponse).toBeDefined();
    });

    it('should build registry for current version by default', () => {
      const result = buildOpenApiRegistry();

      expect(result.registry).toBeDefined();
      expect(result.schemas).toBeDefined();
    });

    it('should build registry for specific version (2025-10-10)', () => {
      const result = buildOpenApiRegistry('2025-10-10');

      expect(result.registry).toBeDefined();
      expect(result.schemas).toBeDefined();
      expect(result.schemas.controlItemSchema).toBeDefined();
    });

    it('should build registry for oldest supported version (2025-09-01)', () => {
      const result = buildOpenApiRegistry('2025-09-01');

      expect(result.registry).toBeDefined();
      expect(result.schemas).toBeDefined();
      expect(result.schemas.controlItemSchema).toBeDefined();
    });

    it('should return different control schemas for different versions', () => {
      const latestResult = buildOpenApiRegistry(CURRENT_API_VERSION);
      const olderResult = buildOpenApiRegistry('2025-10-10');

      // The schemas should be different objects (different versions)
      expect(latestResult.schemas.controlItemSchema).toBeDefined();
      expect(olderResult.schemas.controlItemSchema).toBeDefined();

      // Both should be Zod types
      expect(latestResult.schemas.controlItemSchema).toHaveProperty('_def');
      expect(olderResult.schemas.controlItemSchema).toHaveProperty('_def');
    });

    it('should create control list response from versioned control item schema', () => {
      const result = buildOpenApiRegistry('2025-10-10');

      expect(result.schemas.controlListResponse).toBeDefined();
      expect(result.schemas.controlListResponse).toHaveProperty('_def');
    });

    it('should include error response schemas', () => {
      const result = buildOpenApiRegistry();

      expect(result.schemas.errorResponse).toBeDefined();
      expect(result.schemas.validationErrorResponse).toBeDefined();

      // Verify they are Zod schemas
      expect(result.schemas.errorResponse).toHaveProperty('_def');
      expect(result.schemas.validationErrorResponse).toHaveProperty('_def');
    });

    it('should parse valid error response data', () => {
      const result = buildOpenApiRegistry();
      const errorData = {
        error: 'Not Found',
        message: 'Resource not found',
        statusCode: 404,
        timestamp: '2025-10-16T10:00:00.000Z',
      };

      const parsed: unknown = result.schemas.errorResponse.parse(errorData);
      expect(parsed).toEqual(errorData);
    });

    it('should parse valid validation error response data', () => {
      const result = buildOpenApiRegistry();
      const validationErrorData = {
        error: 'Validation Error',
        message: 'Invalid request data',
        statusCode: 400,
        timestamp: '2025-10-16T10:00:00.000Z',
        details: [
          {
            field: 'email',
            message: 'Invalid email format',
          },
          {
            field: 'age',
            message: 'Must be a positive number',
          },
        ],
      };

      const parsed: unknown =
        result.schemas.validationErrorResponse.parse(validationErrorData);
      expect(parsed).toEqual(validationErrorData);
    });

    it('should throw when parsing invalid error response data', () => {
      const result = buildOpenApiRegistry();
      const invalidData: Record<string, string> = {
        error: 'Not Found',
        message: 'Resource not found',
        // Missing statusCode and timestamp
      };

      expect(() => {
        const _parsed: unknown =
          result.schemas.errorResponse.parse(invalidData);

        return _parsed;
      }).toThrow();
    });

    it('should include risk schemas', () => {
      const result = buildOpenApiRegistry();

      expect(result.schemas.riskSchema).toBeDefined();
      expect(result.schemas.riskListResponse).toBeDefined();
    });

    it('should include action schemas', () => {
      const result = buildOpenApiRegistry();

      expect(result.schemas.actionItemSchema).toBeDefined();
      expect(result.schemas.actionListResponse).toBeDefined();
    });

    it('should return registry with non-empty definitions', () => {
      const result = buildOpenApiRegistry();

      expect(result.registry.definitions).toBeDefined();
      expect(result.registry.definitions.length).toBeGreaterThan(0);
    });

    it('should handle multiple consecutive builds without side effects', () => {
      const result1 = buildOpenApiRegistry(CURRENT_API_VERSION);
      const result2 = buildOpenApiRegistry(CURRENT_API_VERSION);
      const result3 = buildOpenApiRegistry('2025-10-10');

      // Each build should be independent
      expect(result1.registry).not.toBe(result2.registry);
      expect(result1.registry).not.toBe(result3.registry);
      expect(result2.registry).not.toBe(result3.registry);

      // All should have valid structures
      expect(result1.registry.definitions.length).toBeGreaterThan(0);
      expect(result2.registry.definitions.length).toBeGreaterThan(0);
      expect(result3.registry.definitions.length).toBeGreaterThan(0);
    });
  });

  describe('baseErrorResponses', () => {
    it('should return error responses with 404 included by default', () => {
      const responses = baseErrorResponses('User');

      expect(responses).toHaveProperty('404');
      expect(responses).toHaveProperty('401');
      expect(responses).toHaveProperty('403');
      expect(responses).toHaveProperty('500');
    });

    it('should include custom resource name in 404 description', () => {
      const responses = baseErrorResponses('Control');

      expect(responses[404]?.description).toBe('Control not found');
    });

    it('should not include 404 when includeNotFound is false', () => {
      const responses = baseErrorResponses('User', false);

      expect(responses).not.toHaveProperty('404');
      expect(responses).toHaveProperty('401');
      expect(responses).toHaveProperty('403');
      expect(responses).toHaveProperty('500');
    });

    it('should include 401 Unauthorized response', () => {
      const responses = baseErrorResponses('User');

      expect(responses[401]).toBeDefined();
      expect(responses[401]?.description).toBe('Unauthorized');
      expect(responses[401]?.content).toHaveProperty('application/json');
    });

    it('should include 403 Forbidden response', () => {
      const responses = baseErrorResponses('User');

      expect(responses[403]).toBeDefined();
      expect(responses[403]?.description).toBe('Forbidden');
      expect(responses[403]?.content).toHaveProperty('application/json');
    });

    it('should include 500 Internal Server Error response', () => {
      const responses = baseErrorResponses('User');

      expect(responses[500]).toBeDefined();
      expect(responses[500]?.description).toBe('Internal server error');
      expect(responses[500]?.content).toHaveProperty('application/json');
    });

    it('should have error schema in all response types', () => {
      const responses = baseErrorResponses('User');

      // Check that each response has the error schema structure
      expect(responses[401]?.content['application/json'].schema).toBeDefined();
      expect(responses[403]?.content['application/json'].schema).toBeDefined();
      expect(responses[500]?.content['application/json'].schema).toBeDefined();

      // Verify they are Zod schemas
      expect(responses[401]?.content['application/json'].schema).toHaveProperty(
        '_def'
      );
      expect(responses[403]?.content['application/json'].schema).toHaveProperty(
        '_def'
      );
      expect(responses[500]?.content['application/json'].schema).toHaveProperty(
        '_def'
      );
    });

    it('should handle empty resource name', () => {
      const responses = baseErrorResponses('');

      expect(responses[404]?.description).toBe(' not found');
    });

    it('should handle special characters in resource name', () => {
      const responses = baseErrorResponses('User/Profile');

      expect(responses[404]?.description).toBe('User/Profile not found');
    });

    it('should return same structure for different resource names', () => {
      const responses1 = baseErrorResponses('User', false);
      const responses2 = baseErrorResponses('Control', false);

      // Same keys (excluding 404)
      expect(Object.keys(responses1).sort()).toEqual(
        Object.keys(responses2).sort()
      );

      // Same status codes
      expect(responses1).toHaveProperty('401');
      expect(responses1).toHaveProperty('403');
      expect(responses1).toHaveProperty('500');
      expect(responses2).toHaveProperty('401');
      expect(responses2).toHaveProperty('403');
      expect(responses2).toHaveProperty('500');
    });
  });
});
