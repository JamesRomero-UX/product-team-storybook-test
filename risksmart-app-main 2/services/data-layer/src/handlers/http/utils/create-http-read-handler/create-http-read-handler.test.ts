import type {
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { Forbidden, NotFound } from 'http-errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

const { mockFilter, mockBulkCheck } = vi.hoisted(() => ({
  mockFilter: vi.fn((data: unknown[]) => Promise.resolve(data)),
  mockBulkCheck: vi.fn(() => Promise.resolve([{ resourceName: 'default' }])),
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

import { createHttpReadHandler } from '../create-http-read-handler';

const createMockEvent = (
  overrides: Partial<APIGatewayProxyEvent> = {}
): APIGatewayProxyEvent =>
  ({
    headers: {
      'x-tenant': 'test-tenant',
      'x-org-key': 'test-org',
      'x-user-id': 'user-123',
    },
    pathParameters: null,
    queryStringParameters: null,
    ...overrides,
  }) as APIGatewayProxyEvent;

const createMockContext = (): LambdaContext =>
  ({
    functionName: 'test-function',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:test',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: 'test-log-group',
    logStreamName: 'test-log-stream',
    getRemainingTimeInMillis: () => 30000,
    done: vi.fn(),
    fail: vi.fn(),
    succeed: vi.fn(),
    callbackWaitsForEmptyEventLoop: false,
  }) as LambdaContext;

interface TestObject {
  id: string;
  name: string;
}

describe('createHttpReadHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('configuration validation', () => {
    it('should throw error when objectName is not configured', async () => {
      const handler = createHttpReadHandler<
        undefined,
        undefined,
        TestObject
      >().withHandler(() => Promise.resolve([{ id: '1', name: 'Test' }]));

      await expect(
        handler.execute(createMockEvent(), createMockContext())
      ).rejects.toThrow(
        'Object name is required. Call .withObjectName() before .execute()'
      );
    });

    it('should throw error when handler is not configured', async () => {
      const handler = createHttpReadHandler<
        undefined,
        undefined,
        TestObject
      >().withObjectName('TestObject');

      await expect(
        handler.execute(createMockEvent(), createMockContext())
      ).rejects.toThrow(
        'Handler is required. Call .withHandler() before .execute()'
      );
    });
  });

  describe('builder pattern', () => {
    it('should return the builder instance for method chaining', () => {
      const builder = createHttpReadHandler<
        z.ZodObject<{ id: z.ZodString }>,
        z.ZodObject<{ search: z.ZodOptional<z.ZodString> }>,
        TestObject
      >();

      const pathSchema = z.object({ id: z.string() });
      const querySchema = z.object({ search: z.string().optional() });

      const result = builder
        .withPathParamsSchema(pathSchema)
        .withQueryParamsSchema(querySchema)
        .withObjectName('TestObject')
        .withPagination()
        .forSingleItem()
        .withPermissionFilter({
          resourceType: 'test_resource',
          idExtractor: (object: TestObject) => object.id,
        })
        .withHandler(() => Promise.resolve([]));

      expect(result).toBe(builder);
    });
  });

  describe('handler execution', () => {
    it('should return single item when forSingleItem is configured', async () => {
      const object: TestObject = { id: '123', name: 'Test Item' };

      const handler = createHttpReadHandler<undefined, undefined, TestObject>()
        .withObjectName('TestObject')
        .forSingleItem()
        .withHandler(() => Promise.resolve(object));

      const result = await handler.execute(
        createMockEvent(),
        createMockContext()
      );

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({ data: object });
    });

    it('should return array when handler returns array', async () => {
      const objects: TestObject[] = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];

      const handler = createHttpReadHandler<undefined, undefined, TestObject>()
        .withObjectName('TestObject')
        .withHandler(() => Promise.resolve(objects));

      const result = await handler.execute(
        createMockEvent(),
        createMockContext()
      );

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({ data: objects });
    });

    it('should throw NotFound when handler returns null', async () => {
      const handler = createHttpReadHandler<undefined, undefined, TestObject>()
        .withObjectName('TestObject')
        .withHandler(() => Promise.resolve(null));

      await expect(
        handler.execute(createMockEvent(), createMockContext())
      ).rejects.toThrow(NotFound);
      await expect(
        handler.execute(createMockEvent(), createMockContext())
      ).rejects.toThrow('TestObject not found');
    });
  });

  describe('middleware integration', () => {
    it('should pass validated path params to handler', async () => {
      const pathSchema = z.object({ id: z.string().uuid() });
      const objectId = '123e4567-e89b-12d3-a456-426614174000';
      const object: TestObject = { id: objectId, name: 'Test' };

      let capturedPathParams: unknown;
      const handler = createHttpReadHandler<
        typeof pathSchema,
        undefined,
        TestObject
      >()
        .withPathParamsSchema(pathSchema)
        .withObjectName('TestObject')
        .withHandler((ctx) => {
          capturedPathParams = ctx.pathParams;

          return Promise.resolve(object);
        });

      await handler.execute(
        createMockEvent({ pathParameters: { id: objectId } }),
        createMockContext()
      );

      expect(capturedPathParams).toEqual({ id: objectId });
    });

    it('should pass validated query params to handler', async () => {
      const querySchema = z.object({ status: z.enum(['active', 'inactive']) });
      const object: TestObject = { id: '1', name: 'Test' };

      let capturedQueryParams: unknown;
      const handler = createHttpReadHandler<
        undefined,
        typeof querySchema,
        TestObject
      >()
        .withQueryParamsSchema(querySchema)
        .withObjectName('TestObject')
        .withHandler((ctx) => {
          capturedQueryParams = ctx.queryParams;

          return Promise.resolve([object]);
        });

      await handler.execute(
        createMockEvent({ queryStringParameters: { status: 'active' } }),
        createMockContext()
      );

      expect(capturedQueryParams).toEqual({ status: 'active' });
    });

    it('should pass pagination to handler when enabled', async () => {
      const objects: TestObject[] = [{ id: '1', name: 'Test' }];

      let capturedPagination: unknown;
      const handler = createHttpReadHandler<undefined, undefined, TestObject>()
        .withPagination()
        .withObjectName('TestObject')
        .withHandler((ctx) => {
          capturedPagination = ctx.pagination;

          return Promise.resolve(objects);
        });

      await handler.execute(
        createMockEvent({
          queryStringParameters: { limit: '25', offset: '50' },
        }),
        createMockContext()
      );

      expect(capturedPagination).toEqual({ limit: 25, offset: 50 });
    });

    it('should pass service context to handler', async () => {
      const object: TestObject = { id: '1', name: 'Test' };

      let capturedServiceContext: unknown;
      const handler = createHttpReadHandler<undefined, undefined, TestObject>()
        .withObjectName('TestObject')
        .withHandler((ctx) => {
          capturedServiceContext = ctx.serviceContext;

          return Promise.resolve(object);
        });

      await handler.execute(createMockEvent(), createMockContext());

      expect(capturedServiceContext).toEqual({
        tenant: 'test-tenant',
        orgKey: 'test-org',
        userId: 'user-123',
        correlationId: undefined,
      });
    });

    it('should return 403 when single item is filtered out by permissions', async () => {
      const object: TestObject = { id: '1', name: 'Test' };
      mockFilter.mockResolvedValueOnce([]);

      const handler = createHttpReadHandler<undefined, undefined, TestObject>()
        .withObjectName('TestObject')
        .forSingleItem()
        .withPermissionFilter({
          resourceType: 'test_resource',
          idExtractor: (o) => o.id,
        })
        .withHandler(() => Promise.resolve(object));

      const result = handler.execute(createMockEvent(), createMockContext());

      await expect(result).rejects.toThrow(Forbidden);
      await expect(result).rejects.toThrow(
        'Access denied: insufficient permissions to view this TestObject'
      );
    });

    it('should return empty result when bulk permission check denies access', async () => {
      mockBulkCheck.mockResolvedValueOnce([]);
      const handlerFn = vi.fn(() =>
        Promise.resolve([{ id: '1', name: 'Test' }])
      );

      const handler = createHttpReadHandler<undefined, undefined, TestObject>()
        .withObjectName('TestObject')
        .withBulkPermissionCheck({
          checks: [{ resourceName: 'test_resource', action: 'read' }],
        })
        .withHandler(handlerFn);

      const result = await handler.execute(
        createMockEvent(),
        createMockContext()
      );

      expect(handlerFn).not.toHaveBeenCalled();
      expect(result.statusCode).toBe(200);
    });

    it('should execute handler when bulk permission check grants access', async () => {
      mockBulkCheck.mockResolvedValueOnce([{ resourceName: 'test_resource' }]);
      const objects: TestObject[] = [{ id: '1', name: 'Test' }];

      const handler = createHttpReadHandler<undefined, undefined, TestObject>()
        .withObjectName('TestObject')
        .withBulkPermissionCheck({
          checks: [{ resourceName: 'test_resource', action: 'read' }],
        })
        .withHandler(() => Promise.resolve(objects));

      const result = await handler.execute(
        createMockEvent(),
        createMockContext()
      );

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({ data: objects });
    });
  });
});
