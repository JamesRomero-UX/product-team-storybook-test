import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';

import { handler } from './post';

vi.mock('sst/node/table', () => {
  return {
    Table: {
      ScimApiKeys: {
        tableName: 'mock-scim-table-name',
      },
      ScimApiAuth: {
        tableName: 'mock-legacy-scim-table-name',
      },
    },
  };
});

const { mockDynamoSend, mockSsmSend } = vi.hoisted(() => ({
  mockDynamoSend: vi.fn(),
  mockSsmSend: vi.fn(),
}));
vi.mock('src/utils/dynamo-client', () => ({
  dynamoClient: { send: mockDynamoSend },
}));
vi.mock('src/utils/ssm-client', () => ({
  ssmClient: { send: mockSsmSend },
}));

const stage = process.env.SST_STAGE;

const mockStage = stage;
const mockOrgKey = 'testOrgKey';
const mockTenant = 'testTenant';
const mockSecret = 'testSecret';
const mockNow = Math.floor(Date.now() / 1000);

const mockEvent: APIGatewayProxyEventV2 = {
  version: '2.0',
  routeKey: '',
  rawPath: '',
  rawQueryString: '',
  headers: {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestContext: {} as any,
  isBase64Encoded: false,
  pathParameters: { orgKey: mockOrgKey },
};

describe('SCIM Token Generation Handler', () => {
  beforeAll(() => {
    process.env.SST_STAGE = mockStage;
  });

  beforeEach(() => {
    // Default DynamoDB mock: query returns empty, put succeeds, transactWrite succeeds
    mockDynamoSend.mockImplementation((command: unknown) => {
      const name = (command as { constructor: { name: string } }).constructor
        .name;
      if (name === 'QueryCommand') {
        return Promise.resolve({ Items: [] });
      }
      if (name === 'PutCommand') {
        return Promise.resolve({});
      }
      if (name === 'TransactWriteCommand') {
        return Promise.resolve({});
      }

      return Promise.resolve({});
    });

    // Default SSM mock: getParameter returns mockSecret
    mockSsmSend.mockImplementation(() => {
      return Promise.resolve({
        Parameter: {
          Value: mockSecret,
        },
      });
    });

    vi.spyOn(Date, 'now').mockReturnValue(mockNow * 1000);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should return 400 if orgKey is missing', async () => {
    const event: APIGatewayProxyEventV2 = {
      ...mockEvent,
      pathParameters: undefined,
    };

    const response = await handler(event, {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(400);
    expect(responseBody.message).toBe('Missing orgKey in path parameters');
  });

  test('should return 400 if request body is invalid', async () => {
    const event: APIGatewayProxyEventV2 = {
      ...mockEvent,
      pathParameters: { orgKey: mockOrgKey },
      body: JSON.stringify({ invalid: 'data' }),
    };

    const response = await handler(event, {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(400);
    expect(responseBody.message).toBe('Invalid request body');
  });

  test('should return 400 if organisation already has an active token', async () => {
    const validBody = { tenant: mockTenant };
    const event: APIGatewayProxyEventV2 = {
      ...mockEvent,
      pathParameters: { orgKey: mockOrgKey },
      body: JSON.stringify(validBody),
    };

    mockDynamoSend.mockImplementation((command: unknown) => {
      const input = (
        command as { input: { TableName?: string; IndexName?: string } }
      ).input;
      const name = (command as { constructor: { name: string } }).constructor
        .name;
      if (name === 'QueryCommand') {
        if (input.TableName === 'mock-scim-table-name') {
          return Promise.resolve({
            Items: [
              {
                client_id: mockOrgKey,
                key_id: 'testKeyId',
                tenant: mockTenant,
                token: 'testToken',
                created_at: '2025-01-01T00:00:00Z',
                expires_at: new Date(
                  mockNow * 1000 + 365 * 24 * 60 * 60 * 1000
                ).toISOString(), // 1 year from now
                revoked: false,
                token_version: 'v1',
              },
            ],
          });
        }

        return Promise.resolve({});
      }

      return Promise.resolve({});
    });

    const response = await handler(event, {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(400);
    expect(responseBody.message).toBe(
      'Active token already exists for organisation'
    );
  });

  test('should return 200 and generate a token successfully', async () => {
    const validBody = { tenant: mockTenant };
    const event: APIGatewayProxyEventV2 = {
      ...mockEvent,
      pathParameters: { orgKey: mockOrgKey },
      body: JSON.stringify(validBody),
    };

    const response = await handler(event, {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(200);
    expect(responseBody.orgKey).toBe(mockOrgKey);
    expect(responseBody.keyId).toBeTruthy();
    expect(responseBody.token).toBeTruthy();
    // TransactWrite should not be called (no legacy tokens)
    const transactWriteCalls = mockDynamoSend.mock.calls.filter(
      (call) =>
        (call[0] as { constructor: { name: string } }).constructor.name ===
        'TransactWriteCommand'
    );
    expect(transactWriteCalls).toHaveLength(0);
  });

  test('should return 200 and revoke all legacy tokens when present', async () => {
    const validBody = { tenant: mockTenant };
    const event: APIGatewayProxyEventV2 = {
      ...mockEvent,
      pathParameters: { orgKey: mockOrgKey },
      body: JSON.stringify(validBody),
    };

    mockDynamoSend.mockImplementation((command: unknown) => {
      const input = (
        command as { input: { TableName?: string; IndexName?: string } }
      ).input;
      const name = (command as { constructor: { name: string } }).constructor
        .name;
      if (name === 'QueryCommand') {
        if (input.TableName === 'mock-legacy-scim-table-name') {
          return Promise.resolve({
            Items: [
              {
                id: 'legacyToken',
                orgKey: mockOrgKey,
                domains: ['testDomain'],
                tenant: mockTenant,
              },
            ],
          });
        }

        return Promise.resolve({ Items: [] });
      }

      return Promise.resolve({});
    });

    const response = await handler(event, {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(200);
    expect(responseBody.orgKey).toBe(mockOrgKey);
    expect(responseBody.keyId).toBeTruthy();
    expect(responseBody.token).toBeTruthy();
    const transactWriteCalls = mockDynamoSend.mock.calls.filter(
      (call) =>
        (call[0] as { constructor: { name: string } }).constructor.name ===
        'TransactWriteCommand'
    );
    expect(transactWriteCalls).toHaveLength(1);
  });

  test('should return 500 if an error occurs in SSM', async () => {
    mockSsmSend.mockRejectedValue(new Error('SSM error'));

    const validBody = { tenant: mockTenant };
    const event: APIGatewayProxyEventV2 = {
      ...mockEvent,
      pathParameters: { orgKey: mockOrgKey },
      body: JSON.stringify(validBody),
    };

    const response = await handler(event, {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(500);
    expect(responseBody.message).toBe('Internal server error');
  });
});
