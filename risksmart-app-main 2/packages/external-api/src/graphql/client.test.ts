import { parse } from 'graphql';
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';

import type { GraphqlClientConfig, GraphqlResponse } from './client';
import { createGraphqlClient } from './client';

const mockDocument = parse(`mutation TestMutation($input: String!) {
  testMutation(input: $input) {
    id
  }
}`);

const defaultConfig: GraphqlClientConfig = {
  endpoint: 'https://api.example.com/graphql',
  defaultHeaders: {
    'x-api-key': 'test-key',
    authorization: 'Bearer token-123',
  },
};

interface TestMutationData {
  testMutation: { id: string };
}

interface TestVariables {
  input: string;
}

const mockVariables: TestVariables = { input: 'test-value' };

const successResponse: GraphqlResponse<TestMutationData> = {
  data: { testMutation: { id: 'result-1' } },
};

const errorResponse: GraphqlResponse<TestMutationData> = {
  data: null,
  errors: [{ message: 'Something went wrong' }],
};

function createMockResponse(
  body: GraphqlResponse<TestMutationData>,
  status = 200,
  statusText = 'OK'
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response;
}

describe('createGraphqlClient', () => {
  let fetchSpy: MockInstance<typeof globalThis.fetch>;

  beforeEach(() => {
    fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(createMockResponse(successResponse));
  });

  describe('mutate - happy path', () => {
    it('should send a POST request to the configured endpoint', async () => {
      const client = createGraphqlClient(defaultConfig);
      await client.mutate(mockDocument, mockVariables);

      expect(fetchSpy).toHaveBeenCalledOnce();
      expect(fetchSpy.mock.calls[0]![0]).toBe(defaultConfig.endpoint);
    });

    it('should include Content-Type and default headers', async () => {
      const client = createGraphqlClient(defaultConfig);
      await client.mutate(mockDocument, mockVariables);

      const callArgs = fetchSpy.mock.calls[0]![1] as RequestInit;
      expect(callArgs.headers).toEqual(
        expect.objectContaining({
          'Content-Type': 'application/json',
          'x-api-key': 'test-key',
          authorization: 'Bearer token-123',
        })
      );
    });

    it('should merge per-call headers with default headers', async () => {
      const client = createGraphqlClient(defaultConfig);
      const extraHeaders = { 'x-custom': 'custom-value' };
      await client.mutate(mockDocument, mockVariables, extraHeaders);

      const callArgs = fetchSpy.mock.calls[0]![1] as RequestInit;
      expect(callArgs.headers).toEqual(
        expect.objectContaining({
          'Content-Type': 'application/json',
          'x-api-key': 'test-key',
          authorization: 'Bearer token-123',
          'x-custom': 'custom-value',
        })
      );
    });

    it('should allow per-call headers to override default headers', async () => {
      const client = createGraphqlClient(defaultConfig);
      const overrideHeaders = { authorization: 'Bearer override-token' };
      await client.mutate(mockDocument, mockVariables, overrideHeaders);

      const callArgs = fetchSpy.mock.calls[0]![1] as RequestInit;
      expect(callArgs.headers).toEqual(
        expect.objectContaining({
          authorization: 'Bearer override-token',
        })
      );
    });

    it('should serialize the document and variables in the request body', async () => {
      const client = createGraphqlClient(defaultConfig);
      await client.mutate(mockDocument, mockVariables);

      const callArgs = fetchSpy.mock.calls[0]![1] as RequestInit;
      const body = JSON.parse(callArgs.body as string) as {
        query: string;
        variables: TestVariables;
      };

      expect(body.query).toContain('mutation TestMutation');
      expect(body.variables).toEqual(mockVariables);
    });

    it('should return the parsed response body', async () => {
      const client = createGraphqlClient(defaultConfig);
      const result = await client.mutate<TestMutationData, TestVariables>(
        mockDocument,
        mockVariables
      );

      expect(result).toEqual(successResponse);
    });

    it('should return a response containing graphql errors', async () => {
      fetchSpy.mockResolvedValue(createMockResponse(errorResponse));

      const client = createGraphqlClient(defaultConfig);
      const result = await client.mutate<TestMutationData, TestVariables>(
        mockDocument,
        mockVariables
      );

      expect(result).toEqual(errorResponse);
    });
  });

  describe('mutate - unhappy path', () => {
    it('should throw when the HTTP response status is not ok', async () => {
      fetchSpy.mockResolvedValue(
        createMockResponse(successResponse, 500, 'Internal Server Error')
      );

      const client = createGraphqlClient(defaultConfig);

      await expect(client.mutate(mockDocument, mockVariables)).rejects.toThrow(
        'GraphQL request failed: 500 Internal Server Error'
      );
    });

    it('should throw for a 401 unauthorized response', async () => {
      fetchSpy.mockResolvedValue(
        createMockResponse(successResponse, 401, 'Unauthorized')
      );

      const client = createGraphqlClient(defaultConfig);

      await expect(client.mutate(mockDocument, mockVariables)).rejects.toThrow(
        'GraphQL request failed: 401 Unauthorized'
      );
    });

    it('should throw for a 403 forbidden response', async () => {
      fetchSpy.mockResolvedValue(
        createMockResponse(successResponse, 403, 'Forbidden')
      );

      const client = createGraphqlClient(defaultConfig);

      await expect(client.mutate(mockDocument, mockVariables)).rejects.toThrow(
        'GraphQL request failed: 403 Forbidden'
      );
    });

    it('should propagate network errors from fetch', async () => {
      fetchSpy.mockRejectedValue(new Error('Network error'));

      const client = createGraphqlClient(defaultConfig);

      await expect(client.mutate(mockDocument, mockVariables)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('edge cases', () => {
    it('should work with no per-call headers', async () => {
      const client = createGraphqlClient(defaultConfig);
      await client.mutate(mockDocument, mockVariables);

      const callArgs = fetchSpy.mock.calls[0]![1] as RequestInit;
      expect(callArgs.headers).toEqual({
        'Content-Type': 'application/json',
        ...defaultConfig.defaultHeaders,
      });
    });

    it('should work with empty default headers', async () => {
      const config: GraphqlClientConfig = {
        endpoint: 'https://api.example.com/graphql',
        defaultHeaders: {},
      };
      const client = createGraphqlClient(config);
      await client.mutate(mockDocument, mockVariables);

      const callArgs = fetchSpy.mock.calls[0]![1] as RequestInit;
      expect(callArgs.headers).toEqual({
        'Content-Type': 'application/json',
      });
    });

    it('should use POST method for all requests', async () => {
      const client = createGraphqlClient(defaultConfig);
      await client.mutate(mockDocument, mockVariables);

      const callArgs = fetchSpy.mock.calls[0]![1] as RequestInit;
      expect(callArgs.method).toBe('POST');
    });
  });
});
