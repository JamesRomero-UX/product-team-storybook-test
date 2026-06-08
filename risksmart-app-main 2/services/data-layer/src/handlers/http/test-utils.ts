/**
 * Shared test utilities for data-layer HTTP handlers.
 *
 * Provides common mock factories for API Gateway events and Lambda contexts
 * to reduce duplication across test files.
 */
import type {
  APIGatewayEventRequestContextWithAuthorizer,
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';

/**
 * Creates a mock API Gateway proxy event for testing HTTP handlers.
 *
 * @param overrides - Partial event properties to override defaults
 * @returns A complete APIGatewayProxyEvent with sensible defaults
 *
 * @example
 * ```ts
 * const event = createMockEvent({
 *   path: '/actions/register',
 *   httpMethod: 'GET',
 *   headers: { 'x-tenant': 'my-tenant' },
 * });
 * ```
 */
export const createMockEvent = (
  overrides: Partial<APIGatewayProxyEvent> = {}
): APIGatewayProxyEvent => {
  const defaultHeaders = {
    Host: 'api.example.com',
    'x-tenant': 'test-tenant',
    'x-org-key': 'test-org',
    'x-user-id': 'user-123',
  };

  return {
    headers: { ...defaultHeaders, ...overrides.headers },
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    body: null,
    resource: '/{proxy+}',
    requestContext: {
      stage: 'test',
      requestId: 'test-request-id',
      accountId: '123456789012',
      resourceId: 'test-resource',
      apiId: 'test-api',
      path: '/',
      httpMethod: 'GET',
      identity: {
        sourceIp: '127.0.0.1',
        userAgent: 'test-agent',
      },
      authorizer: {},
    } as APIGatewayEventRequestContextWithAuthorizer<Record<string, unknown>>,
    ...overrides,
  } as APIGatewayProxyEvent;
};

/**
 * Creates a mock Lambda context for testing handlers.
 *
 * @param overrides - Partial context properties to override defaults
 * @returns A complete Lambda Context with sensible defaults
 *
 * @example
 * ```ts
 * const context = createMockLambdaContext({
 *   functionName: 'my-function',
 * });
 * ```
 */
export const createMockLambdaContext = (
  overrides: Partial<LambdaContext> = {}
): LambdaContext => ({
  functionName: 'test-function',
  functionVersion: '$LATEST',
  invokedFunctionArn:
    'arn:aws:lambda:us-east-1:123456789012:function:test-function',
  memoryLimitInMB: '256',
  awsRequestId: 'test-request-id',
  logGroupName: '/aws/lambda/test-function',
  logStreamName: '2026/01/28/[$LATEST]test-stream',
  getRemainingTimeInMillis: () => 30000,
  done: () => {
    /* noop */
  },
  fail: () => {
    /* noop */
  },
  succeed: () => {
    /* noop */
  },
  callbackWaitsForEmptyEventLoop: false,
  ...overrides,
});

/**
 * Creates a mock service context for testing processors.
 * This represents the extracted request context (tenant, org, user).
 *
 * @param overrides - Partial context properties to override defaults
 * @returns A service context object with sensible defaults
 *
 * @example
 * ```ts
 * const context = createMockServiceContext({
 *   tenant: 'custom-tenant',
 * });
 * ```
 */
export const createMockServiceContext = (
  overrides: Partial<{
    tenant: string;
    orgKey: string;
    userId: string;
    correlationId: string;
  }> = {}
) => ({
  tenant: 'test-tenant',
  orgKey: 'test-org',
  userId: 'user-123',
  correlationId: 'correlation-123',
  ...overrides,
});

/**
 * Helper to create a stubbed/partial object for mocking.
 * Useful for creating mock repositories or other dependencies.
 *
 * @param value - Partial object to use as the stub
 * @returns The partial object cast to the full type
 *
 * @example
 * ```ts
 * const mockRepo = stub<ActionRepository>({
 *   findById: vi.fn().mockResolvedValue(mockAction),
 * });
 * ```
 */
export const stub = <T>(value: Partial<T> = {}): T => {
  return value as T;
};
