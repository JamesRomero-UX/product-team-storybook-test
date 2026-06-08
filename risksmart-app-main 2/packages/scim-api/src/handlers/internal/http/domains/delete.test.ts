import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import type { ScimDomain } from 'src/scim/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handler } from './delete';
import type { DeleteSchema } from './deleteSchema';
import type { PostSchema } from './postSchema';

vi.mock('sst/node/table', () => {
  return {
    Table: {
      ScimApiKeys: {
        tableName: 'ScimApiKeys',
      },
    },
  };
});

const { mockDynamoSend } = vi.hoisted(() => ({
  mockDynamoSend: vi.fn(),
}));
vi.mock('src/utils/dynamo-client', () => ({
  dynamoClient: { send: mockDynamoSend },
}));

const orgKey = 'test-org';
const domain = 'example.com';
const tenant = 'test-tenant';

const mockEvent = (body: DeleteSchema): APIGatewayProxyEventV2 => ({
  version: '2.0',
  routeKey: '',
  rawPath: '',
  rawQueryString: '',
  headers: {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestContext: {} as any,
  isBase64Encoded: false,
  pathParameters: { orgKey },
  body: body ? JSON.stringify(body) : undefined,
});

const existingDomains: ScimDomain[] = [
  { domain: 'example.com', createdOn: '2024-01-01T00:00:00.000Z' },
  { domain: 'another.com', createdOn: '2023-12-15T00:00:00.000Z' },
];

describe('SCIM Domain Deletion Handler', () => {
  beforeEach(() => {
    // Default DynamoDB mock: get returns existing domains, put succeeds
    mockDynamoSend.mockImplementation((command: unknown) => {
      const name = (command as { constructor: { name: string } }).constructor
        .name;
      const input = (command as { input: { Key?: { client_id?: string } } })
        .input;

      if (name === 'GetCommand') {
        if (input.Key && input.Key.client_id === orgKey) {
          return Promise.resolve({ Item: { domains: existingDomains } });
        }

        return Promise.resolve({});
      }
      if (name === 'PutCommand') {
        return Promise.resolve({});
      }

      return Promise.resolve({});
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delete an existing SCIM domain and return 200', async () => {
    const response = await handler(
      mockEvent({ domain, tenant }),
      {} as Context
    );
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(200);
    expect(responseBody.updatedDomains).toEqual([
      { domain: 'another.com', createdOn: '2023-12-15T00:00:00.000Z' },
    ]);
  });

  it('should update DynamoDB with the correct parameters when deleting a domain', async () => {
    await handler(mockEvent({ domain, tenant }), {} as Context);

    const putCalls = mockDynamoSend.mock.calls.filter(
      (call) =>
        (call[0] as { constructor: { name: string } }).constructor.name ===
        'PutCommand'
    );
    expect(putCalls).toHaveLength(1);
    const putInput = (
      putCalls[0][0] as {
        input: { TableName: string; Item: Record<string, unknown> };
      }
    ).input;
    expect(putInput.TableName).toBe('ScimApiKeys');
    expect(putInput.Item).toEqual(
      expect.objectContaining({
        client_id: orgKey,
        key_id: 'DOMAINS',
        domains: [
          { domain: 'another.com', createdOn: '2023-12-15T00:00:00.000Z' },
        ],
      })
    );
  });

  it('should fetch existing domains from DynamoDB', async () => {
    await handler(mockEvent({ domain, tenant }), {} as Context);

    const getCalls = mockDynamoSend.mock.calls.filter(
      (call) =>
        (call[0] as { constructor: { name: string } }).constructor.name ===
        'GetCommand'
    );
    expect(getCalls).toHaveLength(1);
    const getInput = (
      getCalls[0][0] as {
        input: { TableName: string; Key: Record<string, string> };
      }
    ).input;
    expect(getInput.TableName).toBe('ScimApiKeys');
    expect(getInput.Key).toEqual({
      client_id: orgKey,
      key_id: 'DOMAINS',
    });
  });

  it('should return 404 if the domain does not exist', async () => {
    const response = await handler(
      mockEvent({ domain: 'nonexistent.com', tenant }),
      {} as Context
    );
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(404);
    expect(responseBody).toEqual({
      message: 'Domain does not exist for organisation',
    });
  });

  it('should return 404 if no domains are found for the organisation', async () => {
    mockDynamoSend.mockImplementation((command: unknown) => {
      const name = (command as { constructor: { name: string } }).constructor
        .name;
      if (name === 'GetCommand') {
        return Promise.resolve({ Item: undefined });
      }

      return Promise.resolve({});
    });

    const response = await handler(
      mockEvent({ domain, tenant }),
      {} as Context
    );
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(404);
    expect(responseBody).toEqual({
      message: 'Organisation domains not found',
    });
  });

  it('should return 400 if orgKey is missing', async () => {
    const response = await handler(
      { ...mockEvent({ domain, tenant }), pathParameters: {} },
      {} as Context
    );
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(400);
    expect(responseBody).toEqual({
      message: 'Missing orgKey in path parameters',
    });
  });

  it('should return 400 if request body is invalid', async () => {
    const response = await handler(
      mockEvent({ invalidKey: 'wrong' } as unknown as PostSchema),
      {} as Context
    );
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(400);
    expect(responseBody).toEqual({
      message: 'Invalid request body',
    });
  });

  it('should return 500 if DynamoDB put fails', async () => {
    mockDynamoSend.mockImplementation((command: unknown) => {
      const name = (command as { constructor: { name: string } }).constructor
        .name;
      if (name === 'GetCommand') {
        return Promise.resolve({ Item: { domains: existingDomains } });
      }
      if (name === 'PutCommand') {
        return Promise.reject(new Error('DynamoDB failure'));
      }

      return Promise.resolve({});
    });

    const response = await handler(
      mockEvent({ domain, tenant }),
      {} as Context
    );
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(500);
    expect(responseBody).toEqual({
      message: 'Internal server error',
    });
  });

  it('should return 500 on an unexpected error', async () => {
    mockDynamoSend.mockRejectedValue(new Error('Unexpected error'));

    const response = await handler(
      mockEvent({ domain, tenant }),
      {} as Context
    );
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(500);
    expect(responseBody).toEqual({
      message: 'Internal server error',
    });
  });
});
