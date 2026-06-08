import type { APIGatewayProxyEvent } from 'aws-lambda';
import { BadRequest, Forbidden, NotFound } from 'http-errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

const { mockFilter, mockBulkCheck } = vi.hoisted(() => ({
  mockFilter: vi.fn(),
  mockBulkCheck: vi.fn(),
}));

vi.mock('src/clients/permit', () => ({
  createPermitDependencies: vi.fn(() =>
    Promise.resolve({
      permitClient: { filter: mockFilter, bulkCheck: mockBulkCheck },
    })
  ),
}));

vi.mock('src/utils/logger', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

import type {
  EnrichedReadLambdaContext,
  ValidatedReadLambdaContext,
} from '../read-handler-types';
import {
  bulkPermissionCheckMiddleware,
  paginationMiddleware,
  pathParamsMiddleware,
  permissionFilterMiddleware,
  queryParamsMiddleware,
  responseFormatterMiddleware,
  serviceContextMiddleware,
} from '../read-middleware';

const createMockEvent = (
  overrides: Partial<APIGatewayProxyEvent> = {}
): APIGatewayProxyEvent =>
  ({
    headers: {},
    pathParameters: null,
    queryStringParameters: null,
    ...overrides,
  }) as APIGatewayProxyEvent;

const createMockRequest = (
  eventOverrides: Partial<APIGatewayProxyEvent> = {},
  contextOverrides: Partial<EnrichedReadLambdaContext> = {}
) => ({
  event: createMockEvent(eventOverrides),
  context: { ...contextOverrides } as EnrichedReadLambdaContext,
  response: null,
  error: null as Error | null,
  internal: {},
});

describe('read-middleware', () => {
  describe('serviceContextMiddleware', () => {
    it('should extract service context from headers', () => {
      const request = createMockRequest({
        headers: {
          'x-tenant': 'test-tenant',
          'x-org-key': 'test-org',
          'x-user-id': 'user-123',
          'x-correlation-id': 'correlation-456',
        },
      });

      const middleware = serviceContextMiddleware();
      middleware.before?.(request);

      expect(request.context.serviceContext).toEqual({
        tenant: 'test-tenant',
        orgKey: 'test-org',
        userId: 'user-123',
        correlationId: 'correlation-456',
      });
    });

    it('should extract service context without optional correlation id', () => {
      const request = createMockRequest({
        headers: {
          'x-tenant': 'test-tenant',
          'x-org-key': 'test-org',
          'x-user-id': 'user-123',
        },
      });

      const middleware = serviceContextMiddleware();
      middleware.before?.(request);

      expect(request.context.serviceContext).toEqual({
        tenant: 'test-tenant',
        orgKey: 'test-org',
        userId: 'user-123',
        correlationId: undefined,
      });
    });

    it('should throw BadRequest when required headers are missing', () => {
      const request = createMockRequest({
        headers: { 'x-tenant': 'test-tenant' },
      });

      const middleware = serviceContextMiddleware();

      expect(() => {
        middleware.before?.(request);
      }).toThrow(BadRequest);
      expect(() => {
        middleware.before?.(request);
      }).toThrow('Missing required context headers');
    });
  });

  describe('pathParamsMiddleware', () => {
    const schema = z.object({
      id: z.string().uuid(),
    });

    it('should validate and set path params on context', () => {
      const request = createMockRequest({
        pathParameters: { id: '123e4567-e89b-12d3-a456-426614174000' },
      });

      const middleware = pathParamsMiddleware(schema);
      middleware.before?.(request);

      expect(request.context.pathParams).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
      });
    });

    it('should handle missing path parameters as empty object', () => {
      const optionalSchema = z.object({
        id: z.string().optional(),
      });
      const request = createMockRequest({ pathParameters: null });

      const middleware = pathParamsMiddleware(optionalSchema);
      middleware.before?.(request);

      expect(request.context.pathParams).toEqual({});
    });

    it('should throw BadRequest for invalid path parameters', () => {
      const request = createMockRequest({
        pathParameters: { id: 'not-a-uuid' },
      });

      const middleware = pathParamsMiddleware(schema);

      expect(() => {
        middleware.before?.(request);
      }).toThrow(BadRequest);
      expect(() => {
        middleware.before?.(request);
      }).toThrow('Invalid path parameters');
    });

    it('should include field name in error message', () => {
      const request = createMockRequest({
        pathParameters: { id: 'not-a-uuid' },
      });

      const middleware = pathParamsMiddleware(schema);

      expect(() => {
        middleware.before?.(request);
      }).toThrow(/id:/);
    });
  });

  describe('queryParamsMiddleware', () => {
    const schema = z.object({
      status: z.enum(['active', 'inactive']),
      search: z.string().optional(),
    });

    it('should validate and set query params on context', () => {
      const request = createMockRequest({
        queryStringParameters: { status: 'active', search: 'test' },
      });

      const middleware = queryParamsMiddleware(schema);
      middleware.before?.(request);

      expect(request.context.queryParams).toEqual({
        status: 'active',
        search: 'test',
      });
    });

    it('should handle missing query parameters as empty object', () => {
      const optionalSchema = z.object({
        status: z.string().optional(),
      });
      const request = createMockRequest({ queryStringParameters: null });

      const middleware = queryParamsMiddleware(optionalSchema);
      middleware.before?.(request);

      expect(request.context.queryParams).toEqual({});
    });

    it('should throw BadRequest for invalid query parameters', () => {
      const request = createMockRequest({
        queryStringParameters: { status: 'unknown' },
      });

      const middleware = queryParamsMiddleware(schema);

      expect(() => {
        middleware.before?.(request);
      }).toThrow(BadRequest);
      expect(() => {
        middleware.before?.(request);
      }).toThrow('Invalid query parameters');
    });

    it('should include field name in error message', () => {
      const request = createMockRequest({
        queryStringParameters: { status: 'unknown' },
      });

      const middleware = queryParamsMiddleware(schema);

      expect(() => {
        middleware.before?.(request);
      }).toThrow(/status:/);
    });
  });

  describe('paginationMiddleware', () => {
    it('should extract pagination params from query string', () => {
      const request = createMockRequest({
        queryStringParameters: { limit: '25', offset: '50' },
      });

      const middleware = paginationMiddleware();
      middleware.before?.(request);

      expect(request.context.pagination).toEqual({
        limit: 25,
        offset: 50,
      });
    });

    it('should use default pagination when no query params provided', () => {
      const request = createMockRequest({ queryStringParameters: null });

      const middleware = paginationMiddleware();
      middleware.before?.(request);

      expect(request.context.pagination).toEqual({
        limit: 50,
        offset: 0,
      });
    });
  });

  describe('bulkPermissionCheckMiddleware', () => {
    const checks = [{ resourceName: 'test_resource', action: 'read' as const }];

    const createValidatedRequest = (
      contextOverrides: Partial<ValidatedReadLambdaContext> = {}
    ) => ({
      event: createMockEvent(),
      context: {
        serviceContext: {
          tenant: 'test-tenant',
          orgKey: 'test-org',
          userId: 'user-123',
        },
        pathParams: {},
        queryParams: {},
        ...contextOverrides,
      } as ValidatedReadLambdaContext,
      response: null,
      error: null as Error | null,
      internal: {},
    });

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call permit client bulkCheck with correct parameters', async () => {
      mockBulkCheck.mockResolvedValue([{ resourceName: 'test_resource' }]);

      const request = createValidatedRequest();
      const middleware = bulkPermissionCheckMiddleware({
        checks,
        objectName: 'TestObject',
      });

      await middleware.before?.(request);

      expect(mockBulkCheck).toHaveBeenCalledWith(
        checks,
        'user-123',
        'test-org'
      );
    });

    it('should short-circuit with empty data when no permissions granted', async () => {
      mockBulkCheck.mockResolvedValue([]);

      const request = createValidatedRequest();
      const middleware = bulkPermissionCheckMiddleware({
        checks,
        objectName: 'TestObject',
      });

      const result = await middleware.before?.(request);

      expect(result).toEqual({ statusCode: 200, body: '' });
      expect(request.context.data).toEqual([]);
      expect(request.context.objectName).toBe('TestObject');
    });

    it('should pass through when permissions are granted', async () => {
      mockBulkCheck.mockResolvedValue([{ resourceName: 'test_resource' }]);

      const request = createValidatedRequest();
      const middleware = bulkPermissionCheckMiddleware({
        checks,
        objectName: 'TestObject',
      });

      const result = await middleware.before?.(request);

      expect(result).toBeUndefined();
      expect(request.context.data).toBeUndefined();
    });
  });

  describe('permissionFilterMiddleware', () => {
    interface TestObject {
      id: string;
      name: string;
    }

    const createValidatedRequest = (
      contextOverrides: Partial<ValidatedReadLambdaContext> = {}
    ) => ({
      event: createMockEvent(),
      context: {
        serviceContext: {
          tenant: 'test-tenant',
          orgKey: 'test-org',
          userId: 'user-123',
        },
        pathParams: {},
        queryParams: {},
        objectName: 'TestObject',
        data: [],
        ...contextOverrides,
      } as ValidatedReadLambdaContext,
      response: { statusCode: 200, body: '' },
      error: null as Error | null,
      internal: {},
    });

    beforeEach(() => {
      vi.clearAllMocks();
      mockFilter.mockResolvedValue([]);
    });

    it('should call permit client filter with correct parameters', async () => {
      const objects: TestObject[] = [{ id: '123', name: 'Test' }];
      mockFilter.mockResolvedValue(objects);

      const idExtractor = (e: TestObject) => e.id;
      const request = createValidatedRequest({
        data: objects,
      });

      const middleware = permissionFilterMiddleware<TestObject>({
        resourceType: 'my_resource',
        idExtractor,
      });

      await middleware.after?.(request);

      expect(mockFilter).toHaveBeenCalledWith(
        objects,
        'my_resource',
        idExtractor,
        'user-123',
        'test-org'
      );
    });

    it('should update data with filtered results', async () => {
      const objects: TestObject[] = [
        { id: '1', name: 'Allowed' },
        { id: '2', name: 'Forbidden' },
      ];
      const filteredObjects = [objects[0]];
      mockFilter.mockResolvedValue(filteredObjects);

      const request = createValidatedRequest({
        data: objects,
      });

      const middleware = permissionFilterMiddleware<TestObject>({
        resourceType: 'test_resource',
        idExtractor: (e) => e.id,
      });

      await middleware.after?.(request);

      expect(request.context.data).toEqual(filteredObjects);
    });

    it('should throw error when data is missing', async () => {
      const request = createValidatedRequest({
        data: undefined,
      });

      const middleware = permissionFilterMiddleware<TestObject>({
        resourceType: 'test_resource',
        idExtractor: (e) => e.id,
      });

      await expect(middleware.after?.(request)).rejects.toThrow(
        'permissionFilterMiddleware requires data on context'
      );
    });

    it('should throw Forbidden when single item was filtered by permissions', async () => {
      const objects: TestObject[] = [{ id: '1', name: 'Test' }];
      mockFilter.mockResolvedValue([]);

      const request = createValidatedRequest({
        data: objects,
      });

      const middleware = permissionFilterMiddleware<TestObject>({
        resourceType: 'test_resource',
        idExtractor: (e) => e.id,
        isSingleItemResult: true,
      });

      await expect(middleware.after?.(request)).rejects.toThrow(Forbidden);
      await expect(middleware.after?.(request)).rejects.toThrow(
        'Access denied: insufficient permissions to view this TestObject'
      );
    });

    it('should not throw Forbidden for list results when all items filtered', async () => {
      const objects: TestObject[] = [{ id: '1', name: 'Test' }];
      mockFilter.mockResolvedValue([]);

      const request = createValidatedRequest({
        data: objects,
      });

      const middleware = permissionFilterMiddleware<TestObject>({
        resourceType: 'test_resource',
        idExtractor: (e) => e.id,
        isSingleItemResult: false,
      });

      await middleware.after?.(request);

      expect(request.context.data).toEqual([]);
    });
  });

  describe('responseFormatterMiddleware', () => {
    interface TestObject {
      id: string;
      name: string;
    }

    const createValidatedRequest = (
      contextOverrides: Partial<ValidatedReadLambdaContext> = {}
    ) => ({
      event: createMockEvent(),
      context: {
        serviceContext: {
          tenant: 'test-tenant',
          orgKey: 'test-org',
          userId: 'user-123',
        },
        pathParams: {},
        queryParams: {},
        objectName: 'TestObject',
        data: [],
        ...contextOverrides,
      } as ValidatedReadLambdaContext,
      response: { statusCode: 200, body: '' } as {
        statusCode: number;
        body: string;
      },
      error: null as Error | null,
      internal: {},
    });

    it('should format single item response', () => {
      const object: TestObject = { id: '123', name: 'Test Item' };
      const request = createValidatedRequest({
        data: [object],
      });

      const middleware = responseFormatterMiddleware({
        isSingleItemResult: true,
      });
      middleware.after?.(request);

      expect(request.response.statusCode).toBe(200);
      expect(JSON.parse(request.response.body)).toEqual({ data: object });
    });

    it('should format array response', () => {
      const objects: TestObject[] = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      const request = createValidatedRequest({
        data: objects,
      });

      const middleware = responseFormatterMiddleware({
        isSingleItemResult: false,
      });
      middleware.after?.(request);

      expect(request.response.statusCode).toBe(200);
      expect(JSON.parse(request.response.body)).toEqual({ data: objects });
    });

    it('should format paginated response', () => {
      const objects: TestObject[] = [{ id: '1', name: 'Item 1' }];
      const request = createValidatedRequest({
        data: objects,
        pagination: { limit: 25, offset: 0 },
      });

      const middleware = responseFormatterMiddleware({
        isSingleItemResult: false,
      });
      middleware.after?.(request);

      expect(request.response.statusCode).toBe(200);
      const body = JSON.parse(request.response.body) as {
        data: TestObject[];
        pageMetadata: unknown;
      };
      expect(body.data).toEqual(objects);
      expect(body.pageMetadata).toBeDefined();
    });

    it('should throw NotFound when single item not found and no permission filtering', () => {
      const request = createValidatedRequest({
        data: [],
      });

      const middleware = responseFormatterMiddleware({
        isSingleItemResult: true,
      });

      expect(() => {
        middleware.after?.(request);
      }).toThrow(NotFound);
      expect(() => {
        middleware.after?.(request);
      }).toThrow('TestObject not found');
    });

    it('should return empty array when list is filtered to empty', () => {
      const request = createValidatedRequest({
        data: [],
      });

      const middleware = responseFormatterMiddleware({
        isSingleItemResult: false,
      });
      middleware.after?.(request);

      expect(request.response.statusCode).toBe(200);
      expect(JSON.parse(request.response.body)).toEqual({ data: [] });
    });

    it('should throw error when data is missing', () => {
      const request = createValidatedRequest({
        data: undefined,
      });

      const middleware = responseFormatterMiddleware({
        isSingleItemResult: false,
      });

      expect(() => {
        middleware.after?.(request);
      }).toThrow('responseFormatterMiddleware requires data on context');
    });

    it('should throw error when objectName is missing', () => {
      const request = createValidatedRequest({
        data: [{ id: '1', name: 'Test' }],
        objectName: undefined,
      });

      const middleware = responseFormatterMiddleware({
        isSingleItemResult: false,
      });

      expect(() => {
        middleware.after?.(request);
      }).toThrow('responseFormatterMiddleware requires objectName on context');
    });
  });
});
