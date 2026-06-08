import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import axios from 'axios';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import * as sign from 'src/signRequest';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { handler } from './get';

vi.mock('@aws-sdk/credential-providers', () => ({
  fromEnv: vi.fn(() => async () => ({
    accessKeyId: 'mockAccessKeyId',
    secretAccessKey: 'mockSecretAccessKey',
    sessionToken: 'mockSessionToken',
  })),
}));

vi.mock('sst/node/config', () => ({
  Config: {
    AUTH0_CLIENT_SECRET: 'mock-auth0-client-secret',
  },
}));

const mockOrgKey = 'test-org';

const mockToken = {
  keyId: 'test-key-123',
  orgKey: mockOrgKey,
  createdOn: '2024-01-01T00:00:00.000Z',
  expiresOn: '2025-01-01T00:00:00.000Z',
  status: 'active',
};

const mockSuccessResponse = {
  legacyTokens: false,
  domains: ['example.com'],
  tokens: [mockToken],
};

const mockEvent = (): APIGatewayProxyEventV2 => ({
  version: '2.0',
  routeKey: '',
  rawPath: '',
  rawQueryString: '',
  headers: {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestContext: {} as any,
  isBase64Encoded: false,
  pathParameters: {},
  body: JSON.stringify({
    action: {
      name: 'getScimConfig',
    },
    input: {},
    session_variables: {
      'x-hasura-org-id': mockOrgKey,
    },
  }),
});

const scimApiUrl = `https://mock-scim-api.com/organisation/${mockOrgKey}/config`;
const server = setupServer(
  http.get(scimApiUrl, async () => {
    return HttpResponse.json(mockSuccessResponse);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});

describe('SCIM Get Configuration Proxy Handler', () => {
  beforeEach(() => {
    vi.stubEnv('SCIM_INTERNAL_API_URL', 'https://mock-scim-api.com');
  });

  afterEach(() => {
    server.resetHandlers();
    vi.restoreAllMocks();
  });

  it('should successfully proxy the request and return 200 with configuration details', async () => {
    const response = await handler(mockEvent(), {} as Context);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body ?? '')).toEqual(mockSuccessResponse);
  });

  it('should return the status code from the internal SCIM API', async () => {
    server.use(
      http.get(scimApiUrl, async () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 });
      })
    );

    const response = await handler(mockEvent(), {} as Context);

    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body ?? '')).toEqual({
      message: 'Unauthorized',
    });
  });

  it('should return 500 if the internal API call fails', async () => {
    server.use(
      http.get(scimApiUrl, async () => {
        return HttpResponse.error();
      })
    );

    const response = await handler(mockEvent(), {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(500);
    expect(responseBody).toEqual(
      expect.objectContaining({
        message: 'Internal server error',
      })
    );
  });

  it('should sign the request properly before calling the API', async () => {
    const signRequestSpy = vi.spyOn(sign, 'signRequest');

    await handler(mockEvent(), {} as Context);

    expect(signRequestSpy).toHaveBeenCalledWith(
      expect.stringContaining(`organisation/${mockOrgKey}/config`),
      'GET'
    );
  });

  it('should call the internal API with the correct headers', async () => {
    const axiosSpy = vi.spyOn(axios, 'get');

    await handler(mockEvent(), {} as Context);

    expect(axiosSpy).toHaveBeenCalledWith(
      expect.stringContaining(`organisation/${mockOrgKey}/config`),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^AWS4-HMAC-SHA256 /),
          Host: expect.any(String),
          'X-Amz-Date': expect.any(String),
          'X-Amz-Security-Token': expect.any(String),
        }),
        validateStatus: expect.any(Function),
      })
    );
  });
});
