import type { APIGatewayTokenAuthorizerEvent } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import type {
  ScimDomainsMetaData,
  ScimLegacyTokenMetaData,
  ScimTokenMetaData,
} from 'src/scim/types';
import { getSecretByName } from 'src/services/ssm/getSecretByName';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { handler } from './bearerTokenAuthorizer';

vi.mock('sst/node/table', () => {
  return {
    Table: {
      ScimApiAuth: {
        tableName: 'mock-legacy-scim-table-name',
      },
      ScimApiKeys: {
        tableName: 'mock-scim-table-name',
      },
    },
  };
});

vi.mock('src/services/ssm/getSecretByName', () => ({
  getSecretByName: vi.fn(),
}));

const { mockDynamoSend } = vi.hoisted(() => ({
  mockDynamoSend: vi.fn(),
}));
vi.mock('src/utils/dynamo-client', () => ({
  dynamoClient: { send: mockDynamoSend },
}));

const stage = process.env.SST_STAGE;

describe('bearer Token Authorizer', () => {
  const secret = 'test-secret';
  const event = {
    authorizationToken: '',
    methodArn: 'arn:aws:execute-api:region:accountId:apiId/stage/GET/resource',
  } as APIGatewayTokenAuthorizerEvent;

  const now = Math.floor(Date.now() / 1000);

  const legacyMockItem: ScimLegacyTokenMetaData = {
    id: 'mockLegacyToken123',
    domains: ['risksmart.co.uk'],
    orgKey: 'org_mockKey',
    tenant: 'LegacyTenant',
  };

  const newTokenMetadata: ScimTokenMetaData = {
    client_id: 'org_mockKey',
    key_id: 'mockKid',
    tenant: 'NewTenant',
    created_at: new Date(now * 1000).toISOString(),
    expires_at: new Date((now + 60 * 60) * 1000).toISOString(),
    revoked: false,
    revoked_at: null,
    token_version: 'v2',
    last_used_at: null,
  };

  const domainsData: ScimDomainsMetaData = {
    client_id: 'org_mockKey',
    key_id: 'DOMAINS',
    domains: [
      {
        domain: 'risksmart.co.uk',
        createdOn: '2021-09-01T00:00:00Z',
      },
      {
        domain: 'example.com',
        createdOn: '2021-09-01T00:00:00Z',
      },
    ],
  };

  let validToken: string;

  // Helper to set up DynamoDB mock responses based on table/key
  const setupDynamoMock = (
    resolver: (params: { TableName: string; Key: Record<string, string> }) => {
      Item?: unknown;
    }
  ) => {
    mockDynamoSend.mockImplementation((command: unknown) => {
      const input = (
        command as { input: { TableName: string; Key: Record<string, string> } }
      ).input;

      return Promise.resolve(resolver(input));
    });
  };

  beforeEach(() => {
    // Generate a valid token for the tests
    validToken = jwt.sign(
      {
        sub: 'org_mockKey',
        kid: 'mockKid',
        iat: now,
        exp: now + 60 * 60, // 1 hour expiry
        iss: `https://${stage === 'prod' ? 'app' : stage}.risksmart.link`,
      },
      secret,
      { algorithm: 'HS256' }
    );

    // Set the token in the event
    event.authorizationToken = `Bearer ${validToken}`;

    // Mock DynamoDB responses
    setupDynamoMock((params) => {
      if (
        params.TableName === 'mock-scim-table-name' &&
        params.Key.key_id === 'mockKid'
      ) {
        return { Item: newTokenMetadata };
      } else if (
        params.TableName === 'mock-scim-table-name' &&
        params.Key.key_id === 'DOMAINS'
      ) {
        return { Item: domainsData };
      } else if (params.TableName === 'mock-legacy-scim-table-name') {
        return { Item: legacyMockItem };
      }

      return {};
    });

    // Mock SSM response for the secret
    vi.mocked(getSecretByName).mockResolvedValue(secret);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when a valid JWT token is provided and domains are configured', () => {
    test('should allow access', async () => {
      // Arrange
      const expectedDomains = domainsData.domains.map((d) => d.domain);

      // Act
      const result = await handler(event);

      // Assert
      expect(result.policyDocument.Statement[0].Effect).toBe('Allow');
      expect(result.context?.domains).toBe(JSON.stringify(expectedDomains));
    });
  });

  describe('when a valid JWT token is provided and no domains are configured', () => {
    test('should deny access', async () => {
      // Arrange
      setupDynamoMock((params) => {
        if (
          params.TableName === 'mock-scim-table-name' &&
          params.Key.key_id === 'mockKid'
        ) {
          return { Item: { ...newTokenMetadata } };
        } else if (
          params.TableName === 'mock-scim-table-name' &&
          params.Key.key_id === 'DOMAINS'
        ) {
          return {};
        } else if (params.TableName === 'mock-legacy-scim-table-name') {
          return {};
        }

        return {};
      });

      // Act
      const result = await handler(event);

      // Assert
      expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
    });
  });

  describe('when a token with incorrect claims is provided', () => {
    test('should deny access', async () => {
      // Arrange
      const invalidToken = jwt.sign(
        {
          sub: 'org_mockKey',
          kid: null, // Invalid claim
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
          iss: 'https://dev.risksmart.link',
        },
        secret,
        { algorithm: 'HS256' }
      );
      event.authorizationToken = `Bearer ${invalidToken}`;

      // Remock DynamoDB responses
      setupDynamoMock((params) => {
        if (params.TableName === 'mock-scim-table-name') {
          return {}; // No metadata for the invalid JWT
        } else if (params.TableName === 'mock-legacy-scim-table-name') {
          return {}; // No legacy token result
        }

        return {};
      });

      // Act
      const result = await handler(event);

      // Assert
      expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
    });
  });

  describe('when an expired token is provided', () => {
    test('should deny access', async () => {
      // Arrange
      const issuedAt = Math.floor(Date.now() / 1000) - 2 * 60 * 60; // Issued 2 hours ago
      const expiresAt = Math.floor(Date.now() / 1000) - 60 * 60; // Expired 1 hour ago
      const expiredToken = jwt.sign(
        {
          sub: 'org_mockKey',
          kid: 'mockKid',
          iat: issuedAt,
          exp: expiresAt,
          iss: 'https://dev.risksmart.link',
        },
        secret,
        { algorithm: 'HS256' }
      );
      event.authorizationToken = `Bearer ${expiredToken}`;

      // Remock DynamoDB responses
      setupDynamoMock((params) => {
        if (params.TableName === 'mock-scim-table-name') {
          return {
            Item: {
              ...newTokenMetadata,
              created_at: new Date(issuedAt * 1000).toISOString(),
              expires_at: new Date(expiresAt * 1000).toISOString(),
            },
          };
        } else if (params.TableName === 'mock-legacy-scim-table-name') {
          return {};
        }

        return {};
      });

      // Act
      const result = await handler(event);

      // Assert
      expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
    });
  });

  describe('when a token with an invalid issuer is provided', () => {
    test('should deny access', async () => {
      // Arrange
      const invalidIssuerToken = jwt.sign(
        {
          sub: 'org_mockKey',
          kid: 'mockKid',
          iat: now,
          exp: now + 60 * 60,
          iss: 'https://invalid-issuer.com', // Invalid issuer
        },
        secret,
        { algorithm: 'HS256' }
      );
      event.authorizationToken = `Bearer ${invalidIssuerToken}`;

      // Remock DynamoDB responses
      setupDynamoMock((params) => {
        if (params.TableName === 'mock-scim-table-name') {
          return { Item: newTokenMetadata };
        } else if (params.TableName === 'mock-legacy-scim-table-name') {
          return {}; // No legacy token result
        }

        return {};
      });

      // Act
      const result = await handler(event);

      // Assert
      expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
    });
  });

  describe('when a valid legacy token is provided', () => {
    test('should allow access', async () => {
      // Arrange
      event.authorizationToken = 'Bearer mockLegacyToken123';

      // Remock DynamoDB responses
      setupDynamoMock((params) => {
        if (params.TableName === 'mock-scim-table-name') {
          return {}; // No metadata for the legacy token
        } else if (params.TableName === 'mock-legacy-scim-table-name') {
          return { Item: legacyMockItem };
        }

        return {};
      });

      // Act
      const result = await handler(event);

      // Assert
      expect(result.policyDocument.Statement[0].Effect).toBe('Allow');
    });
  });

  describe('when an invalid legacy token is provided', () => {
    test('should deny access', async () => {
      // Arrange
      setupDynamoMock(() => ({}));
      event.authorizationToken = 'Bearer invalidLegacyToken';

      // Act
      const result = await handler(event);

      // Assert
      expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
    });
  });

  describe('when the key metadata is revoked', () => {
    test('should deny access', async () => {
      // Arrange
      setupDynamoMock((params) => {
        if (params.TableName === 'mock-scim-table-name') {
          return { Item: { ...newTokenMetadata, revoked: true } };
        } else if (params.TableName === 'mock-legacy-scim-table-name') {
          return {}; // No legacy token result
        }

        return {};
      });

      // Act
      const result = await handler(event);

      // Assert
      expect(result.policyDocument.Statement[0].Effect).toBe('Deny');
    });
  });
});
