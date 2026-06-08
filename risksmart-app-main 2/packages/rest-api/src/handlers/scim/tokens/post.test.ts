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

import { handler } from './post';
import type { PostSchema } from './postSchema';

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
const mockTenant = 'test-tenant';
const mockTokenResponse = {
  keyId: 'test-key-123',
  orgKey: mockOrgKey,
  createdOn: '2024-01-01T00:00:00.000Z',
  expiresOn: '2025-01-01T00:00:00.000Z',
  status: 'active',
  token: 'mock-scim-token',
};

const mockEvent = (body: PostSchema): APIGatewayProxyEventV2 => ({
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
      name: 'insert_scim_token',
    },
    input: body ?? undefined,
    session_variables: {
      'x-hasura-org-id': mockOrgKey,
      'x-hasura-tenant-name': mockTenant,
    },
  }),
});

const scimApiUrl = `https://mock-scim-api.com/organisation/${mockOrgKey}/tokens`;
const server = setupServer(
  http.post(scimApiUrl, async () => {
    return HttpResponse.json(mockTokenResponse);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => server.close());

describe('SCIM Add Token Proxy Handler', () => {
  beforeEach(() => {
    vi.stubEnv('SCIM_INTERNAL_API_URL', 'https://mock-scim-api.com');
  });
  afterEach(() => {
    server.resetHandlers();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('should successfully proxy the request and return 200 with SCIM token details', async () => {
    const response = await handler(
      mockEvent({ expireInMonths: '6' }),
      {} as Context
    );

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body ?? '')).toEqual(mockTokenResponse);
  });

  it('should return the status code from the internal SCIM API when response code is 400 or less', async () => {
    server.use(
      http.post(scimApiUrl, async () => {
        return HttpResponse.json({ message: 'Bad Request' }, { status: 400 });
      })
    );

    const response = await handler(
      mockEvent({ expireInMonths: '6' }),
      {} as Context
    );

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body ?? '')).toEqual({
      message: 'Bad Request',
    });
  });

  it('should return an internal server error when response code from the internal SCIM API is greater than 400', async () => {
    server.use(
      http.post(scimApiUrl, async () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 });
      })
    );

    const response = await handler(
      mockEvent({ expireInMonths: '6' }),
      {} as Context
    );

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body ?? '')).toEqual(
      expect.objectContaining({
        message: 'Internal server error',
      })
    );
  });

  test.each([
    [{ invalidField: 'wrong' } as unknown as PostSchema, 'unrecognized_keys'],
    [{ expireInMonths: '3' } as unknown as PostSchema, 'invalid_enum_value'],
    [{ expireInMonths: 3 } as unknown as PostSchema, 'invalid_type'],
  ])(
    'should return 400 when request body is invalid (%s) and return code (%s)',
    async (body, errorCode) => {
      const response = await handler(mockEvent(body), {} as Context);
      const responseBody = JSON.parse(response.body ?? '');

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(responseBody.message)).toEqual(
        expect.arrayContaining([expect.objectContaining({ code: errorCode })])
      );
    }
  );

  it('should return 500 if the internal API call fails', async () => {
    server.use(
      http.post(scimApiUrl, async () => {
        return HttpResponse.error();
      })
    );

    const response = await handler(
      mockEvent({ expireInMonths: '12' }),
      {} as Context
    );
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

    await handler(mockEvent({ expireInMonths: '6' }), {} as Context);

    expect(signRequestSpy).toHaveBeenCalledWith(
      expect.stringContaining(`organisation/${mockOrgKey}/tokens`),
      'POST',
      {},
      JSON.stringify({ tenant: mockTenant, expireInMonths: '6' })
    );
  });

  it('should call the internal API with the correct headers and payload', async () => {
    const axiosSpy = vi.spyOn(axios, 'post');

    await handler(mockEvent({ expireInMonths: '6' }), {} as Context);

    expect(axiosSpy).toHaveBeenCalledWith(
      expect.stringContaining(`organisation/${mockOrgKey}/tokens`),
      JSON.stringify({ tenant: mockTenant, expireInMonths: '6' }),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^AWS4-HMAC-SHA256 /),
          'X-Amz-Content-Sha256': expect.any(String),
          'Content-Type': 'application/json',
        }),
      })
    );
  });
});
