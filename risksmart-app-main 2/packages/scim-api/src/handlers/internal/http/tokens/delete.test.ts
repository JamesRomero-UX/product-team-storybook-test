import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handler } from './delete';

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
const tokenId = 'test-token';

const mockEvent = {
  version: '2.0',
  routeKey: '',
  rawPath: '',
  rawQueryString: '',
  headers: {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestContext: {} as any,
  isBase64Encoded: false,
  pathParameters: { orgKey, tokenId },
} as APIGatewayProxyEventV2;

describe('SCIM Token Deletion Handler', () => {
  beforeEach(() => {
    mockDynamoSend.mockResolvedValue({} as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delete the token and return 200', async () => {
    const response = await handler(mockEvent, {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(200);
    expect(responseBody).toEqual({
      keyId: tokenId,
    });
  });

  it('should return 400 if orgKey is missing', async () => {
    const response = await handler(
      { ...mockEvent, pathParameters: { tokenId } },
      {} as Context
    );
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(400);
    expect(responseBody).toEqual({
      message: 'Missing orgKey or tokenId in path parameters',
    });
  });

  it('should return 400 if tokenId is missing', async () => {
    const response = await handler(
      { ...mockEvent, pathParameters: { orgKey } },
      {} as Context
    );
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(400);
    expect(responseBody).toEqual({
      message: 'Missing orgKey or tokenId in path parameters',
    });
  });

  it('should return 500 if DynamoDB delete operation fails', async () => {
    mockDynamoSend.mockRejectedValue(new Error('DynamoDB failure'));

    const response = await handler(mockEvent, {} as Context);
    const responseBody = JSON.parse(response.body ?? '');

    expect(response.statusCode).toBe(500);
    expect(responseBody).toEqual({
      message: 'Internal server error',
    });
  });
});
