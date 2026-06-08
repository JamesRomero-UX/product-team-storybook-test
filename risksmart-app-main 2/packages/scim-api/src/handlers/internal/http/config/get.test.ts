import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import type {
  ScimDomainsMetaData,
  ScimLegacyTokenMetaData,
  ScimTokenMetaData,
} from 'src/scim/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handler } from './get';

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

const { mockDynamoSend } = vi.hoisted(() => ({
  mockDynamoSend: vi.fn(),
}));
vi.mock('src/utils/dynamo-client', () => ({
  dynamoClient: { send: mockDynamoSend },
}));

const orgKey = 'test-org';

const mockEvent: APIGatewayProxyEventV2 = {
  version: '2.0',
  routeKey: '',
  rawPath: '',
  rawQueryString: '',
  headers: {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestContext: {} as any,
  isBase64Encoded: false,
  pathParameters: { orgKey },
};

// Mocked responses
const mockScimTokenData: ScimTokenMetaData = {
  key_id: '123',
  client_id: orgKey,
  tenant: 'tenant',
  revoked_at: null,
  token_version: 'v1',
  last_used_at: null,
  created_at: '2024-01-01T00:00:00.000Z',
  expires_at: '2030-01-01T00:00:00.000Z',
  revoked: false,
};

const mockScimDomainData: ScimDomainsMetaData = {
  client_id: orgKey,
  key_id: 'DOMAINS',
  domains: [{ domain: 'example.com', createdOn: '2024-01-01' }],
};
const mockScimData: Array<ScimTokenMetaData | ScimDomainsMetaData> = [
  mockScimTokenData,
  mockScimDomainData,
];

const mockLegacyScimData: ScimLegacyTokenMetaData = {
  id: '456',
  orgKey,
  tenant: 'tenant',
  domains: ['legacy.com'],
};

// Helper to set up DynamoDB mock based on command type and table name
const setupQueryMock = (
  resolver: (input: { TableName?: string; IndexName?: string }) => {
    Items?: unknown[];
  }
) => {
  mockDynamoSend.mockImplementation((command: unknown) => {
    const input = (
      command as { input: { TableName?: string; IndexName?: string } }
    ).input;

    return Promise.resolve(resolver(input));
  });
};

describe('SCIM Configuration Handler', () => {
  beforeEach(() => {
    setupQueryMock((input) => {
      if (input.TableName === 'mock-scim-table-name') {
        return { Items: mockScimData };
      }
      if (input.TableName === 'mock-legacy-scim-table-name') {
        return { Items: [mockLegacyScimData] };
      }

      return { Items: [] };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return SCIM configuration with tokens and domains', async () => {
    const response = await handler(mockEvent, {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(200);
    expect(responseBody).toEqual({
      domains: mockScimDomainData.domains,
      tokens: [
        {
          keyId: '123',
          orgKey: orgKey,
          createdOn: '2024-01-01T00:00:00.000Z',
          expiresOn: '2030-01-01T00:00:00.000Z',
          status: 'active',
        },
      ],
      legacyTokens: false,
    });
  });

  it('should return SCIM configuration with legacy tokens if no current tokens exist', async () => {
    setupQueryMock((input) => {
      if (input.TableName === 'mock-scim-table-name') {
        return { Items: [] };
      }
      if (input.TableName === 'mock-legacy-scim-table-name') {
        return { Items: [mockLegacyScimData] };
      }

      return { Items: [] };
    });

    const response = await handler(mockEvent, {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(200);
    expect(responseBody).toEqual({
      domains: mockLegacyScimData.domains.map((domain) => ({
        domain,
        createdOn: expect.any(String),
      })),
      tokens: [],
      legacyTokens: true,
    });
  });

  it('should return empty arrays if no tokens or domains exist', async () => {
    setupQueryMock(() => ({ Items: [] }));

    const response = await handler(mockEvent, {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(200);
    expect(responseBody).toEqual({
      domains: [],
      tokens: [],
      legacyTokens: false,
    });
  });

  it('should return empty arrays if no new tokens exist and all legacy tokens are revoked', async () => {
    const revokedLegacyToken = {
      ...mockLegacyScimData,
      revoked: true,
      revoked_at: '2025-01-01T00:00:00.000Z',
    };
    setupQueryMock((input) => {
      if (input.TableName === 'mock-scim-table-name') {
        return { Items: [] };
      }
      if (input.TableName === 'mock-legacy-scim-table-name') {
        return { Items: [revokedLegacyToken] };
      }

      return { Items: [] };
    });

    const response = await handler(mockEvent, {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(200);
    expect(responseBody).toEqual({
      domains: [],
      tokens: [],
      legacyTokens: false,
    });
  });

  it('should migrate legacy domains if no new domains exist', async () => {
    // The handler calls getTokenConfig (QueryCommand), getLegacyTokenConfig (QueryCommand),
    // then updateDomainsFromLegacy (PutCommand). We need to handle all three.
    mockDynamoSend.mockImplementation((command: unknown) => {
      const name = (command as { constructor: { name: string } }).constructor
        .name;
      const input = (
        command as { input: { TableName?: string; IndexName?: string } }
      ).input;

      if (name === 'QueryCommand') {
        if (input.TableName === 'mock-scim-table-name') {
          return Promise.resolve({ Items: [] });
        }
        if (input.TableName === 'mock-legacy-scim-table-name') {
          return Promise.resolve({ Items: [mockLegacyScimData] });
        }
      }
      if (name === 'PutCommand') {
        return Promise.resolve({});
      }

      return Promise.resolve({ Items: [] });
    });

    const response = await handler(mockEvent, {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(200);
    expect(responseBody.domains).toEqual(
      mockLegacyScimData.domains.map((domain) => ({
        domain,
        createdOn: expect.any(String),
      }))
    );

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
    expect(putInput.TableName).toBe('mock-scim-table-name');
    expect(putInput.Item.client_id).toBe(orgKey);
    expect(putInput.Item.key_id).toBe('DOMAINS');
    expect(putInput.Item.domains).toEqual(
      mockLegacyScimData.domains.map((domain) => ({
        domain,
        createdOn: expect.any(String),
      }))
    );
  });

  it('should return expired status for tokens that have expired', async () => {
    const expiredToken = {
      ...mockScimTokenData,
      expires_at: '2025-01-01T00:00:00.000Z',
    };
    setupQueryMock((input) => {
      if (input.TableName === 'mock-scim-table-name') {
        return { Items: [expiredToken, mockScimDomainData] };
      }
      if (input.TableName === 'mock-legacy-scim-table-name') {
        return { Items: [mockLegacyScimData] };
      }

      return { Items: [] };
    });

    const response = await handler(mockEvent, {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(200);
    expect(responseBody.tokens).toEqual([
      {
        keyId: '123',
        orgKey: orgKey,
        createdOn: '2024-01-01T00:00:00.000Z',
        expiresOn: '2025-01-01T00:00:00.000Z',
        status: 'expired',
      },
    ]);
  });

  it('should return revoked status for tokens that have been revoked', async () => {
    const revokedToken = {
      ...mockScimTokenData,
      revoked: true,
      revoked_at: '2025-01-01T00:00:00.000Z',
    };
    setupQueryMock((input) => {
      if (input.TableName === 'mock-scim-table-name') {
        return { Items: [revokedToken, mockScimDomainData] };
      }
      if (input.TableName === 'mock-legacy-scim-table-name') {
        return { Items: [mockLegacyScimData] };
      }

      return { Items: [] };
    });

    const response = await handler(mockEvent, {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(200);
    expect(responseBody.tokens).toEqual([
      {
        keyId: '123',
        orgKey: orgKey,
        createdOn: '2024-01-01T00:00:00.000Z',
        expiresOn: '2030-01-01T00:00:00.000Z',
        status: 'revoked',
      },
    ]);
  });

  it('should return 400 if orgKey is missing', async () => {
    const response = await handler(
      { ...mockEvent, pathParameters: undefined },
      {} as Context
    );
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(400);
    expect(responseBody).toEqual({
      message: 'Missing orgKey in path parameters',
    });
  });

  it('should return 500 on an internal server error', async () => {
    mockDynamoSend.mockRejectedValue(new Error('DynamoDB failure'));

    const response = await handler(mockEvent, {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(500);
    expect(responseBody).toEqual({
      message: 'Internal server error',
    });
  });
});
