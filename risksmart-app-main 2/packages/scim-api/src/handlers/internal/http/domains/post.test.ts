import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import type { GetOrganisationQuery } from 'generated/graphql';
import { mockGetOrganisationQuery } from 'generated/graphql';
import { HttpResponse } from 'msw';
import { server } from 'src/testing/mocks/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handler } from './post';
import type { PostSchema } from './postSchema';

vi.mock('sst/node/config', () => {
  return {
    Config: {
      AUTH0_CLIENT_SECRET: 'mock-auth0-client-secret',
    },
  };
});

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
const tenant = 'test-tenant';
const domain = 'example.com';

const mockEvent = (body: PostSchema): APIGatewayProxyEventV2 => ({
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

// Sample organisation response
const mockOrganisation: GetOrganisationQuery['auth_organisation_by_pk'] = {
  Name: 'Test Org',
  ScimEnabled: true,
};

const mockHandlers = [
  mockGetOrganisationQuery(() => {
    return HttpResponse.json({
      data: {
        auth_organisation_by_pk: mockOrganisation,
      },
    });
  }),
];

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => server.close());

describe('SCIM Add Domain Handler', () => {
  beforeEach(() => {
    server.use(...mockHandlers);

    // Default DynamoDB mock: get returns empty domains, put succeeds
    mockDynamoSend.mockImplementation((command: unknown) => {
      const name = (command as { constructor: { name: string } }).constructor
        .name;
      const input = (command as { input: { Key?: { client_id?: string } } })
        .input;

      if (name === 'GetCommand') {
        if (input.Key && input.Key.client_id === orgKey) {
          return Promise.resolve({ Item: { domains: [] } });
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

  it('should add a new SCIM domain and return 201', async () => {
    const response = await handler(
      mockEvent({ domain, tenant }),
      {} as Context
    );
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(201);
    expect(responseBody).toEqual({
      domain: 'example.com',
      createdOn: expect.any(String),
    });
  });

  it('should return 201 if the domain already exists', async () => {
    mockDynamoSend.mockImplementation((command: unknown) => {
      const name = (command as { constructor: { name: string } }).constructor
        .name;
      if (name === 'GetCommand') {
        return Promise.resolve({
          Item: { domains: [{ domain, createdOn: '2024-01-01' }] },
        });
      }

      return Promise.resolve({});
    });

    const response = await handler(
      mockEvent({ domain, tenant }),
      {} as Context
    );
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(201);
    expect(responseBody).toEqual({
      message: 'Domain already exists',
    });
  });

  it('should call DynamoDB with the correct parameters when adding a new domain', async () => {
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
    expect(putInput.Item.client_id).toBe(orgKey);
    expect(putInput.Item.key_id).toBe('DOMAINS');
    expect(putInput.Item.domains).toEqual(
      expect.arrayContaining([expect.objectContaining({ domain })])
    );
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
      mockEvent({ dmn: 'wrong' } as unknown as PostSchema),
      {} as Context
    );
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(400);
    expect(responseBody).toEqual({
      message: 'Invalid request body',
    });
  });

  it('should return 404 if organisation is not found', async () => {
    server.use(
      mockGetOrganisationQuery(() =>
        HttpResponse.json({
          data: {
            auth_organisation_by_pk: null,
          },
        })
      )
    );

    const response = await handler(
      mockEvent({ domain, tenant }),
      {} as Context
    );
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(404);
    expect(responseBody).toEqual({
      message: 'Organisation not found',
    });
  });

  it('should return 400 if SCIM is not enabled', async () => {
    server.use(
      mockGetOrganisationQuery(() =>
        HttpResponse.json({
          data: {
            auth_organisation_by_pk: {
              ...mockOrganisation,
              ScimEnabled: false,
            },
          },
        })
      )
    );

    const response = await handler(
      mockEvent({ domain, tenant }),
      {} as Context
    );
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(400);
    expect(responseBody).toEqual({
      message: 'Organisation not enabled for SCIM',
    });
  });

  it('should return 500 if DynamoDB put fails', async () => {
    mockDynamoSend.mockImplementation((command: unknown) => {
      const name = (command as { constructor: { name: string } }).constructor
        .name;
      if (name === 'GetCommand') {
        return Promise.resolve({ Item: { domains: [] } });
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
    server.use(
      mockGetOrganisationQuery(() => {
        throw new Error('Unexpected error');
      })
    );

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
