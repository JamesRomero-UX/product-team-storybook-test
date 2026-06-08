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

import { handler } from './delete';
import type { DeleteSchema } from './deleteSchema';

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
const mockKeyId = 'test-key-123';

const mockSuccessResponse = {
  keyId: mockKeyId,
};

const mockEvent = (body: DeleteSchema): APIGatewayProxyEventV2 => ({
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
      name: 'delete_scim_token',
    },
    input: body ?? undefined,
    session_variables: {
      'x-hasura-org-id': mockOrgKey,
      'x-hasura-tenant-name': mockTenant,
    },
  }),
});

const scimApiUrl = `https://mock-scim-api.com/organisation/${mockOrgKey}/tokens/${mockKeyId}`;
const server = setupServer(
  http.delete(scimApiUrl, async () => {
    return HttpResponse.json(mockSuccessResponse);
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});

describe('SCIM Delete Token Proxy Handler', () => {
  beforeEach(() => {
    vi.stubEnv('SCIM_INTERNAL_API_URL', 'https://mock-scim-api.com');
  });
  afterEach(() => {
    server.resetHandlers();
    vi.restoreAllMocks();
  });

  it('should successfully proxy the request and return 200 with the deleted keyId', async () => {
    const response = await handler(
      mockEvent({ keyId: mockKeyId }),
      {} as Context
    );

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body ?? '')).toEqual(mockSuccessResponse);
  });

  it('should return the status code from the internal SCIM API when response code is 400 or less', async () => {
    server.use(
      http.delete(scimApiUrl, async () => {
        return HttpResponse.json({ message: 'Bad Request' }, { status: 400 });
      })
    );

    const response = await handler(
      mockEvent({ keyId: mockKeyId }),
      {} as Context
    );

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body ?? '')).toEqual({
      message: 'Bad Request',
    });
  });

  it('should return an internal server error when response code from the internal SCIM API is greater than 400', async () => {
    server.use(
      http.delete(scimApiUrl, async () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 403 });
      })
    );

    const response = await handler(
      mockEvent({ keyId: mockKeyId }),
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
    [{ invalidField: 'wrong' } as unknown as DeleteSchema, 'invalid_type'],
    [{ keyId: '' } as unknown as DeleteSchema, 'too_small'],
    [{ keyId: 123 } as unknown as DeleteSchema, 'invalid_type'],
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
      http.delete(scimApiUrl, async () => {
        return HttpResponse.error();
      })
    );

    const response = await handler(
      mockEvent({ keyId: mockKeyId }),
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

    await handler(mockEvent({ keyId: mockKeyId }), {} as Context);

    expect(signRequestSpy).toHaveBeenCalledWith(
      expect.stringContaining(`organisation/${mockOrgKey}/tokens/${mockKeyId}`),
      'DELETE',
      {},
      JSON.stringify({ tenant: mockTenant })
    );
  });

  it('should call the internal API with the correct headers and payload', async () => {
    const axiosSpy = vi.spyOn(axios, 'delete');

    await handler(mockEvent({ keyId: mockKeyId }), {} as Context);

    expect(axiosSpy).toHaveBeenCalledWith(
      expect.stringContaining(`organisation/${mockOrgKey}/tokens/${mockKeyId}`),
      expect.objectContaining({
        data: JSON.stringify({ tenant: mockTenant }),
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^AWS4-HMAC-SHA256 /),
          'X-Amz-Content-Sha256': expect.any(String),
          'Content-Type': 'application/json',
        }),
      })
    );
  });
});
