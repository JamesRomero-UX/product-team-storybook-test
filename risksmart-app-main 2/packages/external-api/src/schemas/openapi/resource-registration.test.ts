import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import type { VersionedSchemas } from '../openapi-registry-builder';
import {
  type AuthTokenPathConfig,
  type ChildResourceConfig,
  registerAuthTokenPath,
  registerChildItemPath,
  registerChildSingletonPath,
  registerCrudResource,
  registerItemOnlyResource,
  registerResourceByIdPath,
  registerResourceCreatePath,
  registerResourceDeletePath,
  registerResourceListPath,
  registerResourceUpdatePath,
  type ResourceConfig,
} from './resource-registration';

describe('resource-registration', () => {
  let mockRegistry: OpenAPIRegistry;
  let mockSchemas: VersionedSchemas;

  beforeEach(() => {
    mockRegistry = new OpenAPIRegistry();
    vi.spyOn(mockRegistry, 'registerPath');

    mockSchemas = {
      validationErrorResponse: z.object({ error: z.string() }),
      errorResponse: z.object({ error: z.string() }),
      mutationResponse: z.object({ id: z.string().uuid() }),
    } as unknown as VersionedSchemas;
  });

  describe('registerResourceListPath', () => {
    it('should register list endpoint with correct path', () => {
      const config: ResourceConfig = {
        name: 'Risk',
        pluralName: 'Risks',
        tag: 'Risks',
        itemSchema: z.object({}),
        listSchema: z.object({}),
      };

      registerResourceListPath(mockRegistry, config, mockSchemas);

      expect(mockRegistry.registerPath).toHaveBeenCalledTimes(1);
      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          path: '/api/v1/risks',
          tags: ['Risks'],
        })
      );
    });

    it('should register list endpoint with custom path prefix', () => {
      const config: ResourceConfig = {
        name: 'Obligation',
        pluralName: 'Obligations',
        tag: 'Obligations',
        itemSchema: z.object({}),
        listSchema: z.object({}),
        pathPrefix: '/compliance',
      };

      registerResourceListPath(mockRegistry, config, mockSchemas);

      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/v1/compliance/obligations',
        })
      );
    });

    it('should use custom query schema if provided', () => {
      const customQuerySchema = z.object({
        page: z.number(),
        limit: z.number(),
      });

      const config: ResourceConfig = {
        name: 'Risk',
        pluralName: 'Risks',
        tag: 'Risks',
        itemSchema: z.object({}),
        listSchema: z.object({}),
        querySchema: customQuerySchema,
      };

      registerResourceListPath(mockRegistry, config, mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      expect(firstCall?.request?.query).toBe(customQuerySchema);
    });

    it('should use baseQuerySchema if no custom query schema provided', () => {
      const config: ResourceConfig = {
        name: 'Risk',
        pluralName: 'Risks',
        tag: 'Risks',
        itemSchema: z.object({}),
        listSchema: z.object({}),
      };

      registerResourceListPath(mockRegistry, config, mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      expect(firstCall?.request?.query).toBeDefined();
    });

    it('should include auth header in request', () => {
      const config: ResourceConfig = {
        name: 'Risk',
        pluralName: 'Risks',
        tag: 'Risks',
        itemSchema: z.object({}),
        listSchema: z.object({}),
      };

      registerResourceListPath(mockRegistry, config, mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      expect(firstCall?.request?.headers).toBeDefined();
    });

    it('should include correct responses', () => {
      const config: ResourceConfig = {
        name: 'Risk',
        pluralName: 'Risks',
        tag: 'Risks',
        itemSchema: z.object({}),
        listSchema: z.object({}),
      };

      registerResourceListPath(mockRegistry, config, mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      const responses = firstCall?.responses;
      expect(responses).toHaveProperty('200');
      expect(responses).toHaveProperty('400');
      expect(responses).toHaveProperty('401');
      expect(responses).toHaveProperty('403');
      expect(responses).toHaveProperty('500');
    });

    it('should use correct description and summary', () => {
      const config: ResourceConfig = {
        name: 'Control',
        pluralName: 'Controls',
        tag: 'Controls',
        itemSchema: z.object({}),
        listSchema: z.object({}),
      };

      registerResourceListPath(mockRegistry, config, mockSchemas);

      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Get all controls',
          summary: 'List controls',
        })
      );
    });
  });

  describe('registerResourceByIdPath', () => {
    it('should register get-by-id endpoint with correct path', () => {
      const config: ResourceConfig = {
        name: 'Risk',
        pluralName: 'Risks',
        tag: 'Risks',
        itemSchema: z.object({}),
        listSchema: z.object({}),
      };

      registerResourceByIdPath(mockRegistry, config);

      expect(mockRegistry.registerPath).toHaveBeenCalledTimes(1);
      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          path: '/api/v1/risks/{id}',
          tags: ['Risks'],
        })
      );
    });

    it('should register get-by-id endpoint with custom path prefix', () => {
      const config: ResourceConfig = {
        name: 'Obligation',
        pluralName: 'Obligations',
        tag: 'Obligations',
        itemSchema: z.object({}),
        listSchema: z.object({}),
        pathPrefix: '/compliance',
      };

      registerResourceByIdPath(mockRegistry, config);

      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/v1/compliance/obligations/{id}',
        })
      );
    });

    it('should include UUID param schema in request', () => {
      const config: ResourceConfig = {
        name: 'Risk',
        pluralName: 'Risks',
        tag: 'Risks',
        itemSchema: z.object({}),
        listSchema: z.object({}),
      };

      registerResourceByIdPath(mockRegistry, config);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      expect(firstCall?.request?.params).toBeDefined();
      expect(firstCall?.request?.headers).toBeDefined();
    });

    it('should include correct responses', () => {
      const config: ResourceConfig = {
        name: 'Risk',
        pluralName: 'Risks',
        tag: 'Risks',
        itemSchema: z.object({}),
        listSchema: z.object({}),
      };

      registerResourceByIdPath(mockRegistry, config);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      const responses = firstCall?.responses;
      expect(responses).toHaveProperty('200');
      expect(responses).toHaveProperty('404');
      expect(responses).toHaveProperty('401');
      expect(responses).toHaveProperty('403');
      expect(responses).toHaveProperty('500');
    });

    it('should use correct description and summary', () => {
      const config: ResourceConfig = {
        name: 'Control',
        pluralName: 'Controls',
        tag: 'Controls',
        itemSchema: z.object({}),
        listSchema: z.object({}),
      };

      registerResourceByIdPath(mockRegistry, config);

      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Get a specific control by ID',
          summary: 'Get control by ID',
        })
      );
    });
  });

  describe('registerCrudResource', () => {
    it('should register both list and get-by-id endpoints', () => {
      const config: ResourceConfig = {
        name: 'Risk',
        pluralName: 'Risks',
        tag: 'Risks',
        itemSchema: z.object({}),
        listSchema: z.object({}),
      };

      registerCrudResource(mockRegistry, config, mockSchemas);

      expect(mockRegistry.registerPath).toHaveBeenCalledTimes(2);
    });

    it('should register list endpoint first', () => {
      const config: ResourceConfig = {
        name: 'Risk',
        pluralName: 'Risks',
        tag: 'Risks',
        itemSchema: z.object({}),
        listSchema: z.object({}),
      };

      registerCrudResource(mockRegistry, config, mockSchemas);

      const firstCall = vi.mocked(mockRegistry.registerPath).mock.calls[0]?.[0];
      expect(firstCall?.path).toBe('/api/v1/risks');
    });

    it('should register get-by-id endpoint second', () => {
      const config: ResourceConfig = {
        name: 'Risk',
        pluralName: 'Risks',
        tag: 'Risks',
        itemSchema: z.object({}),
        listSchema: z.object({}),
      };

      registerCrudResource(mockRegistry, config, mockSchemas);

      const secondCall = vi.mocked(mockRegistry.registerPath).mock
        .calls[1]?.[0];
      expect(secondCall?.path).toBe('/api/v1/risks/{id}');
    });

    it('should work with custom path prefix', () => {
      const config: ResourceConfig = {
        name: 'Obligation',
        pluralName: 'Obligations',
        tag: 'Obligations',
        itemSchema: z.object({}),
        listSchema: z.object({}),
        pathPrefix: '/compliance',
      };

      registerCrudResource(mockRegistry, config, mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      expect(calls[0]?.[0]?.path).toBe('/api/v1/compliance/obligations');
      expect(calls[1]?.[0]?.path).toBe('/api/v1/compliance/obligations/{id}');
    });

    it('should register 5 endpoints when all mutation config is set', () => {
      const config: ResourceConfig = {
        name: 'Risk',
        pluralName: 'Risks',
        tag: 'Risks',
        itemSchema: z.object({}),
        listSchema: z.object({}),
        createSchema: z.object({ title: z.string() }),
        updateSchema: z.object({ title: z.string() }),
        deleteEnabled: true,
      };

      registerCrudResource(mockRegistry, config, mockSchemas);

      expect(mockRegistry.registerPath).toHaveBeenCalledTimes(5);
    });

    it('should register only create endpoint when only createSchema is provided', () => {
      const config: ResourceConfig = {
        name: 'Risk',
        pluralName: 'Risks',
        tag: 'Risks',
        itemSchema: z.object({}),
        listSchema: z.object({}),
        createSchema: z.object({ title: z.string() }),
      };

      registerCrudResource(mockRegistry, config, mockSchemas);

      expect(mockRegistry.registerPath).toHaveBeenCalledTimes(3);
      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      expect(calls[2]?.[0]?.method).toBe('post');
    });

    it('should not register mutation endpoints when no mutation config is provided', () => {
      const config: ResourceConfig = {
        name: 'Risk',
        pluralName: 'Risks',
        tag: 'Risks',
        itemSchema: z.object({}),
        listSchema: z.object({}),
      };

      registerCrudResource(mockRegistry, config, mockSchemas);

      expect(mockRegistry.registerPath).toHaveBeenCalledTimes(2);
    });
  });

  describe('registerResourceCreatePath', () => {
    const createSchema = z.object({ title: z.string() });

    const createConfig = (
      overrides: Partial<ResourceConfig> = {}
    ): ResourceConfig & { createSchema: z.ZodType } => ({
      name: 'Risk',
      pluralName: 'Risks',
      tag: 'Risks',
      itemSchema: z.object({}),
      listSchema: z.object({}),
      createSchema,
      ...overrides,
    });

    it('should register POST endpoint with correct path', () => {
      registerResourceCreatePath(mockRegistry, createConfig(), mockSchemas);

      expect(mockRegistry.registerPath).toHaveBeenCalledTimes(1);
      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          path: '/api/v1/risks',
          tags: ['Risks'],
        })
      );
    });

    it('should include request body with correct schema', () => {
      registerResourceCreatePath(mockRegistry, createConfig(), mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      const requestBody = firstCall?.request?.body as
        | {
            content?: { 'application/json'?: { schema?: z.ZodType } };
            required?: boolean;
          }
        | undefined;

      expect(requestBody).toBeDefined();
      expect(requestBody?.required).toBe(true);
      expect(requestBody?.content?.['application/json']?.schema).toBe(
        createSchema
      );
    });

    it('should include 201 response', () => {
      registerResourceCreatePath(mockRegistry, createConfig(), mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const responses = calls[0]?.[0]?.responses;
      expect(responses).toHaveProperty('201');
    });

    it('should include auth header', () => {
      registerResourceCreatePath(mockRegistry, createConfig(), mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      expect(firstCall?.request?.headers).toBeDefined();
    });

    it('should not include 404 response', () => {
      registerResourceCreatePath(mockRegistry, createConfig(), mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const responses = calls[0]?.[0]?.responses;
      expect(responses).not.toHaveProperty('404');
    });

    it('should include 400, 401, 403, 500 responses', () => {
      registerResourceCreatePath(mockRegistry, createConfig(), mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const responses = calls[0]?.[0]?.responses;
      expect(responses).toHaveProperty('400');
      expect(responses).toHaveProperty('401');
      expect(responses).toHaveProperty('403');
      expect(responses).toHaveProperty('500');
    });

    it('should work with custom path prefix', () => {
      registerResourceCreatePath(
        mockRegistry,
        createConfig({
          name: 'Obligation',
          pluralName: 'Obligations',
          tag: 'Compliance',
          pathPrefix: '/compliance',
        }),
        mockSchemas
      );

      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/v1/compliance/obligations',
        })
      );
    });
  });

  describe('registerResourceUpdatePath', () => {
    const updateSchema = z.object({ title: z.string() });

    const createConfig = (
      overrides: Partial<ResourceConfig> = {}
    ): ResourceConfig & { updateSchema: z.ZodType } => ({
      name: 'Risk',
      pluralName: 'Risks',
      tag: 'Risks',
      itemSchema: z.object({}),
      listSchema: z.object({}),
      updateSchema,
      ...overrides,
    });

    it('should register PUT endpoint with correct path', () => {
      registerResourceUpdatePath(mockRegistry, createConfig(), mockSchemas);

      expect(mockRegistry.registerPath).toHaveBeenCalledTimes(1);
      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'put',
          path: '/api/v1/risks/{id}',
          tags: ['Risks'],
        })
      );
    });

    it('should include request body with correct schema', () => {
      registerResourceUpdatePath(mockRegistry, createConfig(), mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      const requestBody = firstCall?.request?.body as
        | {
            content?: { 'application/json'?: { schema?: z.ZodType } };
            required?: boolean;
          }
        | undefined;

      expect(requestBody).toBeDefined();
      expect(requestBody?.required).toBe(true);
      expect(requestBody?.content?.['application/json']?.schema).toBe(
        updateSchema
      );
    });

    it('should include UUID param schema', () => {
      registerResourceUpdatePath(mockRegistry, createConfig(), mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      expect(firstCall?.request?.params).toBeDefined();
    });

    it('should include 200 response', () => {
      registerResourceUpdatePath(mockRegistry, createConfig(), mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const responses = calls[0]?.[0]?.responses;
      expect(responses).toHaveProperty('200');
    });

    it('should include 404 response', () => {
      registerResourceUpdatePath(mockRegistry, createConfig(), mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const responses = calls[0]?.[0]?.responses;
      expect(responses).toHaveProperty('404');
    });

    it('should include 400, 401, 403, 500 responses', () => {
      registerResourceUpdatePath(mockRegistry, createConfig(), mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const responses = calls[0]?.[0]?.responses;
      expect(responses).toHaveProperty('400');
      expect(responses).toHaveProperty('401');
      expect(responses).toHaveProperty('403');
      expect(responses).toHaveProperty('500');
    });

    it('should work with custom path prefix', () => {
      registerResourceUpdatePath(
        mockRegistry,
        createConfig({
          name: 'Obligation',
          pluralName: 'Obligations',
          tag: 'Compliance',
          pathPrefix: '/compliance',
        }),
        mockSchemas
      );

      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/v1/compliance/obligations/{id}',
        })
      );
    });
  });

  describe('registerResourceDeletePath', () => {
    const createConfig = (
      overrides: Partial<ResourceConfig> = {}
    ): ResourceConfig => ({
      name: 'Risk',
      pluralName: 'Risks',
      tag: 'Risks',
      itemSchema: z.object({}),
      listSchema: z.object({}),
      deleteEnabled: true,
      ...overrides,
    });

    it('should register DELETE endpoint with correct path', () => {
      registerResourceDeletePath(mockRegistry, createConfig(), mockSchemas);

      expect(mockRegistry.registerPath).toHaveBeenCalledTimes(1);
      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'delete',
          path: '/api/v1/risks/{id}',
          tags: ['Risks'],
        })
      );
    });

    it('should not include request body', () => {
      registerResourceDeletePath(mockRegistry, createConfig(), mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      expect(firstCall?.request?.body).toBeUndefined();
    });

    it('should include UUID param schema', () => {
      registerResourceDeletePath(mockRegistry, createConfig(), mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      expect(firstCall?.request?.params).toBeDefined();
    });

    it('should include 200 response', () => {
      registerResourceDeletePath(mockRegistry, createConfig(), mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const responses = calls[0]?.[0]?.responses;
      expect(responses).toHaveProperty('200');
    });

    it('should include 404 response', () => {
      registerResourceDeletePath(mockRegistry, createConfig(), mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const responses = calls[0]?.[0]?.responses;
      expect(responses).toHaveProperty('404');
    });

    it('should include 400, 401, 403, 500 responses', () => {
      registerResourceDeletePath(mockRegistry, createConfig(), mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const responses = calls[0]?.[0]?.responses;
      expect(responses).toHaveProperty('400');
      expect(responses).toHaveProperty('401');
      expect(responses).toHaveProperty('403');
      expect(responses).toHaveProperty('500');
    });

    it('should work with custom path prefix', () => {
      registerResourceDeletePath(
        mockRegistry,
        createConfig({
          name: 'Obligation',
          pluralName: 'Obligations',
          tag: 'Compliance',
          pathPrefix: '/compliance',
        }),
        mockSchemas
      );

      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/v1/compliance/obligations/{id}',
        })
      );
    });
  });

  describe('registerItemOnlyResource', () => {
    it('should register only get-by-id endpoint', () => {
      const config = {
        name: 'User',
        pluralName: 'Users',
        tag: 'Users',
        itemSchema: z.object({}),
      };

      registerItemOnlyResource(mockRegistry, config);

      expect(mockRegistry.registerPath).toHaveBeenCalledTimes(1);
      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/v1/users/{id}',
        })
      );
    });

    it('should work without listSchema and querySchema', () => {
      const config = {
        name: 'User',
        pluralName: 'Users',
        tag: 'Users',
        itemSchema: z.object({ id: z.string() }),
      };

      expect(() => {
        registerItemOnlyResource(mockRegistry, config);
      }).not.toThrow();
    });

    it('should register endpoint with correct structure', () => {
      const config = {
        name: 'User',
        pluralName: 'Users',
        tag: 'Users',
        itemSchema: z.object({}),
      };

      registerItemOnlyResource(mockRegistry, config);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      expect(firstCall?.method).toBe('get');
      expect(firstCall?.tags).toEqual(['Users']);
      expect(firstCall?.request?.params).toBeDefined();
      expect(firstCall?.request?.headers).toBeDefined();
    });
  });

  describe('registerAuthTokenPath', () => {
    // Common test schemas for auth token endpoint
    const authTokenRequestSchema = z.object({
      clientKey: z.string(),
      clientSecret: z.string(),
    });

    const authTokenResponseSchema = z.object({
      accessToken: z.string(),
      tokenType: z.literal('Bearer'),
      expiresIn: z.number().int().positive(),
    });

    // Config factory for auth token tests
    const createAuthTokenConfig = (
      overrides: Partial<AuthTokenPathConfig> = {}
    ): AuthTokenPathConfig => ({
      requestSchema: authTokenRequestSchema,
      responseSchema: authTokenResponseSchema,
      ...overrides,
    });

    it('should register POST endpoint at /api/v1/auth/token', () => {
      const config = createAuthTokenConfig();

      registerAuthTokenPath(mockRegistry, config, mockSchemas);

      expect(mockRegistry.registerPath).toHaveBeenCalledTimes(1);
      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          path: '/api/v1/auth/token',
        })
      );
    });

    it('should apply Authentication tag', () => {
      const config = createAuthTokenConfig();

      registerAuthTokenPath(mockRegistry, config, mockSchemas);

      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['Authentication'],
        })
      );
    });

    it('should have empty security array for public endpoint', () => {
      const config = createAuthTokenConfig();

      registerAuthTokenPath(mockRegistry, config, mockSchemas);

      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          security: [],
        })
      );
    });

    it('should include request body with correct schema', () => {
      const config = createAuthTokenConfig();

      registerAuthTokenPath(mockRegistry, config, mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      const requestBody = firstCall?.request?.body as
        | {
            content?: { 'application/json'?: { schema?: z.ZodType } };
            required?: boolean;
          }
        | undefined;

      expect(requestBody).toBeDefined();
      expect(requestBody?.required).toBe(true);
      expect(requestBody?.content?.['application/json']?.schema).toBe(
        authTokenRequestSchema
      );
    });

    it('should include 200 success response with correct schema', () => {
      const config = createAuthTokenConfig();

      registerAuthTokenPath(mockRegistry, config, mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      const responses = firstCall?.responses;
      const response200 = responses?.['200'] as
        | { content?: { 'application/json'?: { schema?: z.ZodType } } }
        | undefined;

      expect(responses).toHaveProperty('200');
      expect(response200?.content?.['application/json']?.schema).toBe(
        authTokenResponseSchema
      );
    });

    it('should include 400 validation error response', () => {
      const config = createAuthTokenConfig();

      registerAuthTokenPath(mockRegistry, config, mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      const responses = firstCall?.responses;

      expect(responses).toHaveProperty('400');
    });

    it('should include 401 unauthorized response for invalid credentials', () => {
      const config = createAuthTokenConfig();

      registerAuthTokenPath(mockRegistry, config, mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      const responses = firstCall?.responses;
      const response401 = responses?.['401'] as
        | { description?: string }
        | undefined;

      expect(responses).toHaveProperty('401');
      expect(response401?.description).toBe('Invalid client credentials');
    });

    it('should include 500 internal server error response', () => {
      const config = createAuthTokenConfig();

      registerAuthTokenPath(mockRegistry, config, mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      const responses = firstCall?.responses;

      expect(responses).toHaveProperty('500');
    });

    it('should not include 403 or 404 responses', () => {
      const config = createAuthTokenConfig();

      registerAuthTokenPath(mockRegistry, config, mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      const responses = firstCall?.responses;

      expect(responses).not.toHaveProperty('403');
      expect(responses).not.toHaveProperty('404');
    });

    it('should use correct description and summary', () => {
      const config = createAuthTokenConfig();

      registerAuthTokenPath(mockRegistry, config, mockSchemas);

      expect(mockRegistry.registerPath).toHaveBeenCalledWith(
        expect.objectContaining({
          description:
            'Authenticate using client credentials to obtain an access token',
          summary: 'Get access token',
        })
      );
    });

    it('should work with custom request and response schemas', () => {
      const customRequestSchema = z.object({
        apiKey: z.string(),
        secret: z.string(),
        scope: z.array(z.string()).optional(),
      });
      const customResponseSchema = z.object({
        token: z.string(),
        type: z.literal('Bearer'),
        expires: z.number(),
        refreshToken: z.string().optional(),
      });

      const config = createAuthTokenConfig({
        requestSchema: customRequestSchema,
        responseSchema: customResponseSchema,
      });

      registerAuthTokenPath(mockRegistry, config, mockSchemas);

      const calls = vi.mocked(mockRegistry.registerPath).mock.calls;
      const firstCall = calls[0]?.[0];
      const requestBody = firstCall?.request?.body as
        | { content?: { 'application/json'?: { schema?: z.ZodType } } }
        | undefined;
      const response200 = firstCall?.responses?.['200'] as
        | { content?: { 'application/json'?: { schema?: z.ZodType } } }
        | undefined;

      expect(requestBody?.content?.['application/json']?.schema).toBe(
        customRequestSchema
      );
      expect(response200?.content?.['application/json']?.schema).toBe(
        customResponseSchema
      );
    });
  });

  describe('customFields schema extension', () => {
    // Common test schemas
    const baseItemSchema = z.object({
      id: z.string().uuid(),
      name: z.string(),
    });

    // Common resource config factory
    const createResourceConfig = (
      overrides: Partial<ResourceConfig> = {}
    ): ResourceConfig => ({
      name: 'TestResource',
      pluralName: 'TestResources',
      tag: 'Test',
      itemSchema: baseItemSchema,
      listSchema: z.object({ items: z.array(baseItemSchema) }),
      ...overrides,
    });

    // Common child resource config factory
    const createChildResourceConfig = (
      overrides: Partial<ChildResourceConfig> = {}
    ): Required<Pick<ChildResourceConfig, 'itemSchema'>> &
      ChildResourceConfig => ({
      parentName: 'Parent',
      parentPluralName: 'Parents',
      childName: 'Child',
      childPluralName: 'Children',
      tag: 'Test',
      listSchema: z.object({ items: z.array(baseItemSchema) }),
      itemSchema: baseItemSchema,
      ...overrides,
    });

    // Helper to extract response schema shape from registered path
    const getResponseSchemaShape = (
      registry: OpenAPIRegistry,
      callIndex = 0
    ): z.ZodRawShape | undefined => {
      const calls = vi.mocked(registry.registerPath).mock.calls;
      const call = calls[callIndex]?.[0];
      const response200 = call?.responses?.['200'] as
        | { content?: { 'application/json'?: { schema?: z.ZodType } } }
        | undefined;
      const schema = response200?.content?.['application/json']?.schema;
      if (schema instanceof z.ZodObject) {
        return schema.shape as z.ZodRawShape;
      }

      return undefined;
    };

    describe('registerResourceByIdPath', () => {
      it('should include customFields schema by default', () => {
        const config = createResourceConfig();

        registerResourceByIdPath(mockRegistry, config);

        const shape = getResponseSchemaShape(mockRegistry);
        expect(shape).toBeDefined();
        expect(shape).toHaveProperty('customFields');
        expect(shape).not.toHaveProperty('schemaUpdatedAt');
      });

      it('should exclude customFields schema when excludeCustomFields is true', () => {
        const config = createResourceConfig({ excludeCustomFields: true });

        registerResourceByIdPath(mockRegistry, config);

        const shape = getResponseSchemaShape(mockRegistry);
        expect(shape).toBeDefined();
        expect(shape).not.toHaveProperty('customFields');
      });

      it('should preserve original schema properties when extending with customFields', () => {
        const config = createResourceConfig();

        registerResourceByIdPath(mockRegistry, config);

        const shape = getResponseSchemaShape(mockRegistry);
        expect(shape).toBeDefined();
        expect(shape).toHaveProperty('id');
        expect(shape).toHaveProperty('name');
      });

      it('should nest schemaUpdatedAt and fields inside customFields', () => {
        const config = createResourceConfig();

        registerResourceByIdPath(mockRegistry, config);

        const shape = getResponseSchemaShape(mockRegistry);
        expect(shape).toBeDefined();
        const customFieldsSchema = shape!['customFields'];
        expect(customFieldsSchema).toBeDefined();
        // The customFields value is a partial of CustomAttributesResponseCompactSchema
        // which contains schemaUpdatedAt and fields
        if (customFieldsSchema instanceof z.ZodOptional) {
          const innerShape = (
            customFieldsSchema.unwrap() as z.ZodObject<z.ZodRawShape>
          ).shape;
          expect(innerShape).toHaveProperty('schemaUpdatedAt');
          expect(innerShape).toHaveProperty('fields');
        }
      });
    });

    describe('registerChildItemPath', () => {
      it('should include customFields schema by default', () => {
        const config = createChildResourceConfig();

        registerChildItemPath(mockRegistry, config);

        const shape = getResponseSchemaShape(mockRegistry);
        expect(shape).toBeDefined();
        expect(shape).toHaveProperty('customFields');
        expect(shape).not.toHaveProperty('schemaUpdatedAt');
      });

      it('should exclude customFields schema when excludeCustomFields is true', () => {
        const config = createChildResourceConfig({ excludeCustomFields: true });

        registerChildItemPath(mockRegistry, config);

        const shape = getResponseSchemaShape(mockRegistry);
        expect(shape).toBeDefined();
        expect(shape).not.toHaveProperty('customFields');
      });

      it('should preserve original schema properties when extending with customFields', () => {
        const config = createChildResourceConfig();

        registerChildItemPath(mockRegistry, config);

        const shape = getResponseSchemaShape(mockRegistry);
        expect(shape).toBeDefined();
        expect(shape).toHaveProperty('id');
        expect(shape).toHaveProperty('name');
      });
    });

    describe('registerChildSingletonPath', () => {
      it('should include customFields schema by default', () => {
        const config = createChildResourceConfig();

        registerChildSingletonPath(mockRegistry, config);

        const shape = getResponseSchemaShape(mockRegistry);
        expect(shape).toBeDefined();
        expect(shape).toHaveProperty('customFields');
        expect(shape).not.toHaveProperty('schemaUpdatedAt');
      });

      it('should exclude customFields schema when excludeCustomFields is true', () => {
        const config = createChildResourceConfig({ excludeCustomFields: true });

        registerChildSingletonPath(mockRegistry, config);

        const shape = getResponseSchemaShape(mockRegistry);
        expect(shape).toBeDefined();
        expect(shape).not.toHaveProperty('customFields');
      });

      it('should preserve original schema properties when extending with customFields', () => {
        const config = createChildResourceConfig();

        registerChildSingletonPath(mockRegistry, config);

        const shape = getResponseSchemaShape(mockRegistry);
        expect(shape).toBeDefined();
        expect(shape).toHaveProperty('id');
        expect(shape).toHaveProperty('name');
      });
    });

    describe('edge cases', () => {
      it('should handle non-ZodObject schemas using intersection', () => {
        // Use a union type which is not a ZodObject
        const unionSchema = z.union([
          z.object({ type: z.literal('a'), value: z.string() }),
          z.object({ type: z.literal('b'), value: z.number() }),
        ]);
        const config = createResourceConfig({ itemSchema: unionSchema });

        // Should not throw when handling non-ZodObject
        expect(() => {
          registerResourceByIdPath(mockRegistry, config);
        }).not.toThrow();

        expect(mockRegistry.registerPath).toHaveBeenCalledTimes(1);
      });

      it('should handle excludeCustomFields explicitly set to false', () => {
        const config = createResourceConfig({ excludeCustomFields: false });

        registerResourceByIdPath(mockRegistry, config);

        const shape = getResponseSchemaShape(mockRegistry);
        expect(shape).toBeDefined();
        expect(shape).toHaveProperty('customFields');
        expect(shape).not.toHaveProperty('schemaUpdatedAt');
      });
    });
  });
});
