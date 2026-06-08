import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CognitoAuthClient } from '../aws/cognito-client';
import type { AWSDynamoDBClient } from '../aws/dynamo-client';
import type { ClientAccessTokenResult } from '../clients/client.interface';
import {
  AppClientAlreadyExistsError,
  AppClientFailedToRollbackError,
  AppClientNotFoundError,
  ClientLimitError,
} from '../errors/app-client.errors';
import type { AppClientCreate } from '../schemas/app-clients/app-client.schema';
import type { AuthTokenRequestData } from '../schemas/auth.schema';
import type { CreateUserPoolClientResult } from '../types/auth-client';
import { CognitoAppClient } from './cognito-app-client.auth';

describe('CognitoAppClient', () => {
  let cognitoAppClient: CognitoAppClient;
  let mockCognitoClient: CognitoAuthClient;
  let mockDynamoClient: AWSDynamoDBClient;

  const mockProps = {
    orgClientLimit: 5,
    tableName: 'test-clients-table',
  };

  const mockClientRecord = {
    pk: '#tenant-456#org-123',
    sk: '#client_123#testclient',
    gsi_1_pk: 'active',
    gsi_1_sk: 'client_123',
    clientId: 'client_123',
    clientName: 'Test Client',
    tenantId: 'tenant-456',
    orgId: 'org-123',
    scopes: 'risks:read,risks:write',
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
    createdBy: 'user|123',
    updatedBy: 'user|123',
    status: 'active' as const,
    compatVersion: '1.0.0',
    role: 'rs-external' as const,
    rateLimitProfile: 'chill' as const,
  };

  const mockActorId = 'user|987654321';
  const mockClientId = 'client_123';

  beforeEach(() => {
    vi.clearAllMocks();

    mockCognitoClient = {
      createUserPoolClient: vi.fn(),
      removeUserPoolClient: vi.fn(),
      getClientAccessToken: vi.fn(),
    } as unknown as CognitoAuthClient;

    mockDynamoClient = {
      query: vi.fn(),
      updateItem: vi.fn(),
      putItem: vi.fn(),
    } as unknown as AWSDynamoDBClient;

    cognitoAppClient = new CognitoAppClient(
      mockProps,
      mockCognitoClient,
      mockDynamoClient
    );
  });

  describe('disableAndRemoveClient', () => {
    describe('happy path', () => {
      it('should successfully disable and remove an active client', async () => {
        vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([
          mockClientRecord,
        ]);
        vi.mocked(mockDynamoClient.updateItem).mockResolvedValueOnce();
        vi.mocked(mockCognitoClient.removeUserPoolClient).mockResolvedValueOnce(
          { clientId: mockClientId }
        );

        await cognitoAppClient.disableAndRemoveClient(
          mockClientId,
          mockActorId
        );

        expect(mockDynamoClient.query).toHaveBeenCalledWith({
          tableName: mockProps.tableName,
          indexName: 'gsi_1',
          keyConditionExpression: '#gsi_pk = :gsi_pk and #gsi_sk = :gsi_sk',
          expressionAttributeNames: {
            '#gsi_pk': 'gsi_1_pk',
            '#gsi_sk': 'gsi_1_sk',
          },
          expressionAttributeValues: {
            ':gsi_pk': 'active',
            ':gsi_sk': mockClientId,
          },
        });
        expect(mockDynamoClient.updateItem).toHaveBeenCalledWith({
          tableName: mockProps.tableName,
          key: { pk: mockClientRecord.pk, sk: mockClientRecord.sk },
          updateExpression:
            'SET #status = :removed, #updatedBy = :actorId, #updatedAt = :now, #gsi_1_pk = :removed',
          expressionAttributeNames: {
            '#status': 'status',
            '#updatedBy': 'updatedBy',
            '#updatedAt': 'updatedAt',
            '#gsi_1_pk': 'gsi_1_pk',
          },
          expressionAttributeValues: {
            ':removed': 'removed',
            ':actorId': mockActorId,
            ':now': expect.any(Number) as number,
            ':active': 'active',
          },
          conditionExpression: '#status = :active',
        });
        expect(mockCognitoClient.removeUserPoolClient).toHaveBeenCalledWith({
          clientId: mockClientId,
        });
        expect(mockDynamoClient.updateItem).toHaveBeenCalledTimes(1);
      });

      it('should use the supplied actorId in the update expression', async () => {
        const differentClientId = 'client_999';
        const differentActorId = 'user|111222333';

        vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([
          { ...mockClientRecord, clientId: differentClientId },
        ]);
        vi.mocked(mockDynamoClient.updateItem).mockResolvedValueOnce();
        vi.mocked(mockCognitoClient.removeUserPoolClient).mockResolvedValueOnce(
          { clientId: differentClientId }
        );

        await cognitoAppClient.disableAndRemoveClient(
          differentClientId,
          differentActorId
        );

        expect(mockDynamoClient.updateItem).toHaveBeenCalledWith(
          expect.objectContaining({
            expressionAttributeValues: expect.objectContaining({
              ':actorId': differentActorId,
            }) as Record<string, unknown>,
          })
        );
      });
    });

    describe('unhappy path', () => {
      it('should throw AppClientNotFoundError and attempt no writes when the client is not found', async () => {
        vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([]);

        await expect(
          cognitoAppClient.disableAndRemoveClient(mockClientId, mockActorId)
        ).rejects.toThrow(AppClientNotFoundError);

        expect(mockDynamoClient.updateItem).not.toHaveBeenCalled();
        expect(mockCognitoClient.removeUserPoolClient).not.toHaveBeenCalled();
      });

      it.each([
        'DynamoDB update failed',
        'ConditionalCheckFailedException',
        'ProvisionedThroughputExceededException',
      ])(
        'should throw "%s" and not attempt Cognito deletion when the initial DynamoDB update fails',
        async (message) => {
          vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([
            mockClientRecord,
          ]);
          vi.mocked(mockDynamoClient.updateItem).mockRejectedValueOnce(
            new Error(message)
          );

          await expect(
            cognitoAppClient.disableAndRemoveClient(mockClientId, mockActorId)
          ).rejects.toThrow(message);

          expect(mockCognitoClient.removeUserPoolClient).not.toHaveBeenCalled();
        }
      );

      it('should rollback the DynamoDB update with correct params when Cognito deletion fails', async () => {
        vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([
          mockClientRecord,
        ]);
        vi.mocked(mockDynamoClient.updateItem).mockResolvedValueOnce();
        vi.mocked(mockCognitoClient.removeUserPoolClient).mockRejectedValueOnce(
          new Error('Cognito deletion failed')
        );
        vi.mocked(mockDynamoClient.updateItem).mockResolvedValueOnce();

        await expect(
          cognitoAppClient.disableAndRemoveClient(mockClientId, mockActorId)
        ).rejects.toThrow('Cognito deletion failed');

        expect(mockDynamoClient.updateItem).toHaveBeenCalledTimes(2);
        expect(mockDynamoClient.updateItem).toHaveBeenNthCalledWith(2, {
          tableName: mockProps.tableName,
          key: { pk: mockClientRecord.pk, sk: mockClientRecord.sk },
          updateExpression:
            'SET #status = :active, #updatedAt = :now, #gsi_1_pk = :active',
          expressionAttributeNames: {
            '#status': 'status',
            '#updatedAt': 'updatedAt',
            '#gsi_1_pk': 'gsi_1_pk',
          },
          expressionAttributeValues: {
            ':active': 'active',
            ':now': expect.any(Number) as number,
          },
        });
      });

      it('should throw AppClientFailedToRollbackError with the clientId when both Cognito deletion and rollback fail', async () => {
        vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([
          mockClientRecord,
        ]);
        vi.mocked(mockDynamoClient.updateItem).mockResolvedValueOnce();
        vi.mocked(mockCognitoClient.removeUserPoolClient).mockRejectedValueOnce(
          new Error('Cognito deletion failed')
        );
        vi.mocked(mockDynamoClient.updateItem).mockRejectedValueOnce(
          new Error('Rollback failed')
        );

        const error = await cognitoAppClient
          .disableAndRemoveClient(mockClientId, mockActorId)
          .catch((e: unknown) => e);

        expect(error).toBeInstanceOf(AppClientFailedToRollbackError);
        expect(error).toHaveProperty(
          'message',
          `Failed to delete from Cognito and rollback failed for clientId: ${mockClientId}`
        );
      });
    });

    describe('edge cases', () => {
      it('should use the first record returned by the query', async () => {
        const secondRecord = { ...mockClientRecord, clientId: 'client_456' };

        vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([
          mockClientRecord,
          secondRecord,
        ]);
        vi.mocked(mockDynamoClient.updateItem).mockResolvedValueOnce();
        vi.mocked(mockCognitoClient.removeUserPoolClient).mockResolvedValueOnce(
          { clientId: mockClientId }
        );

        await cognitoAppClient.disableAndRemoveClient(
          mockClientId,
          mockActorId
        );

        expect(mockDynamoClient.updateItem).toHaveBeenCalledWith(
          expect.objectContaining({
            key: { pk: mockClientRecord.pk, sk: mockClientRecord.sk },
          })
        );
      });

      it('should rollback and preserve the original Cognito error when rollback succeeds', async () => {
        vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([
          mockClientRecord,
        ]);
        vi.mocked(mockDynamoClient.updateItem).mockResolvedValueOnce();
        vi.mocked(mockCognitoClient.removeUserPoolClient).mockRejectedValueOnce(
          new Error('Custom Cognito error with details')
        );
        vi.mocked(mockDynamoClient.updateItem).mockResolvedValueOnce();

        await expect(
          cognitoAppClient.disableAndRemoveClient(mockClientId, mockActorId)
        ).rejects.toThrow('Custom Cognito error with details');

        expect(mockDynamoClient.updateItem).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('createNewClient', () => {
    const mockNewClientData: AppClientCreate = {
      orgId: 'org-123',
      tenantId: 'tenant-456',
      name: 'My Test Client',
      scopes: ['risks:read', 'risks:write'],
      status: 'active',
      createdAt: 1704067200000,
      createdBy: 'user|creator-123',
      updatedAt: 1704067200000,
      updatedBy: 'user|creator-123',
      compatVersion: '1.0.0',
      role: 'rs-external',
      rateLimitProfile: 'chill',
    };

    const mockCognitoCreateResponse: CreateUserPoolClientResult = {
      clientId: 'new-client-id-abc',
      clientSecret: 'super-secret-value',
      clientName: 'org-123-My Test Client',
    };

    describe('happy path', () => {
      it('should return clientName, clientKey, and clientSecret and persist the full record to DynamoDB', async () => {
        vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([]);
        vi.mocked(mockCognitoClient.createUserPoolClient).mockResolvedValueOnce(
          mockCognitoCreateResponse
        );
        vi.mocked(mockDynamoClient.putItem).mockResolvedValueOnce();

        const result =
          await cognitoAppClient.createNewClient(mockNewClientData);

        expect(result).toEqual({
          clientName: mockNewClientData.name,
          clientKey: mockCognitoCreateResponse.clientId,
          clientSecret: mockCognitoCreateResponse.clientSecret,
        });
        expect(mockCognitoClient.createUserPoolClient).toHaveBeenCalledWith({
          clientName: `${mockNewClientData.orgId}-mytestclient`,
        });
        expect(mockDynamoClient.putItem).toHaveBeenCalledWith({
          tableName: mockProps.tableName,
          conditionExpression: 'attribute_not_exists(sk)',
          item: {
            pk: `#${mockNewClientData.tenantId}#${mockNewClientData.orgId}`,
            sk: `#${mockCognitoCreateResponse.clientId}#mytestclient`,
            clientId: mockCognitoCreateResponse.clientId,
            tenantId: mockNewClientData.tenantId,
            orgId: mockNewClientData.orgId,
            scopes: mockNewClientData.scopes.join(','),
            createdAt: mockNewClientData.createdAt,
            createdBy: mockNewClientData.createdBy,
            updatedBy: mockNewClientData.createdBy,
            updatedAt: mockNewClientData.updatedAt,
            status: mockNewClientData.status,
            compatVersion: mockNewClientData.compatVersion,
            role: mockNewClientData.role,
            rateLimitProfile: mockNewClientData.rateLimitProfile,
            clientName: mockNewClientData.name,
            gsi_1_pk: mockNewClientData.status,
            gsi_1_sk: mockCognitoCreateResponse.clientId,
          },
        });
      });

      it('should allow creation when all existing records with the same name are removed', async () => {
        const removedRecord = {
          ...mockClientRecord,
          clientName: mockNewClientData.name,
          status: 'removed' as const,
          gsi_1_pk: 'removed',
        };

        vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([
          removedRecord,
        ]);
        vi.mocked(mockCognitoClient.createUserPoolClient).mockResolvedValueOnce(
          mockCognitoCreateResponse
        );
        vi.mocked(mockDynamoClient.putItem).mockResolvedValueOnce();

        const result =
          await cognitoAppClient.createNewClient(mockNewClientData);

        expect(result.clientKey).toBe(mockCognitoCreateResponse.clientId);
      });

      it.each([
        {
          label: 'no existing records',
          records: [],
          expectedCompatVersion: '1.0.0',
        },
        {
          label: 'one existing record',
          records: [
            {
              ...mockClientRecord,
              compatVersion: '2.5.0',
              updatedAt: 2000000000000,
              clientName: 'Other Client',
              clientId: 'other-id',
            },
          ],
          expectedCompatVersion: '2.5.0',
        },
        {
          label: 'multiple records (picks newest by updatedAt)',
          records: [
            {
              ...mockClientRecord,
              compatVersion: '1.0.0',
              updatedAt: 1000000000000,
              clientName: 'Older Client',
              clientId: 'older-id',
            },
            {
              ...mockClientRecord,
              compatVersion: '3.0.0',
              updatedAt: 2000000000000,
              clientName: 'Newer Client',
              clientId: 'newer-id',
            },
          ],
          expectedCompatVersion: '3.0.0',
        },
      ])(
        'should use compatVersion "$expectedCompatVersion" when $label',
        async ({ records, expectedCompatVersion }) => {
          vi.mocked(mockDynamoClient.query).mockResolvedValueOnce(records);
          vi.mocked(
            mockCognitoClient.createUserPoolClient
          ).mockResolvedValueOnce(mockCognitoCreateResponse);
          vi.mocked(mockDynamoClient.putItem).mockResolvedValueOnce();

          await cognitoAppClient.createNewClient(mockNewClientData);

          expect(mockDynamoClient.putItem).toHaveBeenCalledWith(
            expect.objectContaining({
              item: expect.objectContaining({
                compatVersion: expectedCompatVersion,
              }) as Record<string, unknown>,
            })
          );
        }
      );
    });

    describe('unhappy path', () => {
      it('should throw ClientLimitError and attempt no Cognito or DynamoDB writes when the org client limit is reached', async () => {
        const activeRecords = Array.from(
          { length: mockProps.orgClientLimit },
          (_, i) => ({
            ...mockClientRecord,
            clientId: `client_${i}`,
            clientName: `Existing Client ${i}`,
          })
        );

        vi.mocked(mockDynamoClient.query).mockResolvedValueOnce(activeRecords);

        await expect(
          cognitoAppClient.createNewClient(mockNewClientData)
        ).rejects.toThrow(ClientLimitError);

        expect(mockCognitoClient.createUserPoolClient).not.toHaveBeenCalled();
        expect(mockDynamoClient.putItem).not.toHaveBeenCalled();
      });

      it.each(['active', 'pending'] as const)(
        'should throw AppClientAlreadyExistsError and attempt no writes when an existing %s client has the same name',
        async (status) => {
          const existingRecord = {
            ...mockClientRecord,
            clientName: mockNewClientData.name,
            status,
          };

          vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([
            existingRecord,
          ]);

          await expect(
            cognitoAppClient.createNewClient(mockNewClientData)
          ).rejects.toThrow(AppClientAlreadyExistsError);

          expect(mockCognitoClient.createUserPoolClient).not.toHaveBeenCalled();
          expect(mockDynamoClient.putItem).not.toHaveBeenCalled();
        }
      );

      it('should remove the Cognito client and rethrow the original error when DynamoDB putItem fails', async () => {
        const putError = new Error('DynamoDB put failed');

        vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([]);
        vi.mocked(mockCognitoClient.createUserPoolClient).mockResolvedValueOnce(
          mockCognitoCreateResponse
        );
        vi.mocked(mockDynamoClient.putItem).mockRejectedValueOnce(putError);
        vi.mocked(mockCognitoClient.removeUserPoolClient).mockResolvedValueOnce(
          { clientId: mockCognitoCreateResponse.clientId }
        );

        await expect(
          cognitoAppClient.createNewClient(mockNewClientData)
        ).rejects.toThrow('DynamoDB put failed');

        expect(mockCognitoClient.removeUserPoolClient).toHaveBeenCalledWith({
          clientId: mockCognitoCreateResponse.clientId,
        });
      });

      it('should throw AppClientFailedToRollbackError with the clientId when both DynamoDB putItem and Cognito cleanup fail', async () => {
        vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([]);
        vi.mocked(mockCognitoClient.createUserPoolClient).mockResolvedValueOnce(
          mockCognitoCreateResponse
        );
        vi.mocked(mockDynamoClient.putItem).mockRejectedValueOnce(
          new Error('DynamoDB put failed')
        );
        vi.mocked(mockCognitoClient.removeUserPoolClient).mockRejectedValueOnce(
          new Error('Cognito cleanup failed')
        );

        const error = await cognitoAppClient
          .createNewClient(mockNewClientData)
          .catch((e: unknown) => e);

        expect(error).toBeInstanceOf(AppClientFailedToRollbackError);
        expect(error).toHaveProperty(
          'message',
          `Failed to persist to DynamoDB and Cognito cleanup failed for clientId: ${mockCognitoCreateResponse.clientId}`
        );
      });
    });

    describe('edge cases', () => {
      it('should match existing client names case-insensitively and ignoring spaces', async () => {
        // 'MY TEST CLIENT' normalises to 'mytestclient', same as 'My Test Client'
        const existingRecord = {
          ...mockClientRecord,
          clientName: 'MY TEST CLIENT',
          status: 'active' as const,
        };

        vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([
          existingRecord,
        ]);

        await expect(
          cognitoAppClient.createNewClient(mockNewClientData)
        ).rejects.toThrow(AppClientAlreadyExistsError);
      });

      it('should not count removed records toward the org client limit', async () => {
        const activeRecords = Array.from(
          { length: mockProps.orgClientLimit - 1 },
          (_, i) => ({
            ...mockClientRecord,
            clientId: `client_active_${i}`,
            clientName: `Active Client ${i}`,
            status: 'active' as const,
          })
        );
        const removedRecords = Array.from({ length: 10 }, (_, i) => ({
          ...mockClientRecord,
          clientId: `client_removed_${i}`,
          clientName: `Removed Client ${i}`,
          status: 'removed' as const,
        }));

        vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([
          ...activeRecords,
          ...removedRecords,
        ]);
        vi.mocked(mockCognitoClient.createUserPoolClient).mockResolvedValueOnce(
          mockCognitoCreateResponse
        );
        vi.mocked(mockDynamoClient.putItem).mockResolvedValueOnce();

        const result =
          await cognitoAppClient.createNewClient(mockNewClientData);

        expect(result).toBeDefined();
        expect(mockCognitoClient.createUserPoolClient).toHaveBeenCalledTimes(1);
      });

      it('should encode the sk using lowercase-no-spaces normalisation of the name', async () => {
        const clientDataWithSpacedName: AppClientCreate = {
          ...mockNewClientData,
          name: 'Has Spaces And CAPS',
        };

        vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([]);
        vi.mocked(mockCognitoClient.createUserPoolClient).mockResolvedValueOnce(
          mockCognitoCreateResponse
        );
        vi.mocked(mockDynamoClient.putItem).mockResolvedValueOnce();

        await cognitoAppClient.createNewClient(clientDataWithSpacedName);

        expect(mockDynamoClient.putItem).toHaveBeenCalledWith(
          expect.objectContaining({
            item: expect.objectContaining({
              sk: `#${mockCognitoCreateResponse.clientId}#hasspacesandcaps`,
            }) as Record<string, unknown>,
          })
        );
      });
    });
  });

  describe('createClientAccessToken', () => {
    const mockAuthTokenRequest: AuthTokenRequestData = {
      clientKey: 'client-key-abc',
      clientSecret: 'client-secret-xyz',
    };

    const mockAccessTokenResult: ClientAccessTokenResult = {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
      tokenType: 'Bearer',
      expiresIn: 3600,
    };

    it('should map clientKey to clientId and return the Cognito token response', async () => {
      vi.mocked(mockCognitoClient.getClientAccessToken).mockResolvedValueOnce(
        mockAccessTokenResult
      );

      const result =
        await cognitoAppClient.createClientAccessToken(mockAuthTokenRequest);

      expect(mockCognitoClient.getClientAccessToken).toHaveBeenCalledWith({
        clientId: mockAuthTokenRequest.clientKey,
        clientSecret: mockAuthTokenRequest.clientSecret,
      });
      expect(result).toEqual(mockAccessTokenResult);
    });

    it('should throw when Cognito returns an error', async () => {
      vi.mocked(mockCognitoClient.getClientAccessToken).mockRejectedValueOnce(
        new Error('Invalid client credentials')
      );

      await expect(
        cognitoAppClient.createClientAccessToken(mockAuthTokenRequest)
      ).rejects.toThrow('Invalid client credentials');
    });
  });

  describe('getOrgClients', () => {
    const mockTenantId = 'tenant-456';
    const mockOrgId = 'org-123';

    it('should query by the correctly formatted pk and return all records for the org', async () => {
      const secondRecord = { ...mockClientRecord, clientId: 'client_456' };
      vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([
        mockClientRecord,
        secondRecord,
      ]);

      const result = await cognitoAppClient.getOrgClients(
        mockTenantId,
        mockOrgId
      );

      expect(mockDynamoClient.query).toHaveBeenCalledWith({
        tableName: mockProps.tableName,
        keyConditionExpression: '#pk = :pk',
        expressionAttributeNames: { '#pk': 'pk' },
        expressionAttributeValues: {
          ':pk': `#${mockTenantId}#${mockOrgId}`,
        },
      });
      expect(result).toEqual([mockClientRecord, secondRecord]);
    });

    it('should return an empty array when no clients exist for the org', async () => {
      vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([]);

      const result = await cognitoAppClient.getOrgClients(
        mockTenantId,
        mockOrgId
      );

      expect(result).toEqual([]);
    });
  });

  describe('getActiveClient', () => {
    it('should query the gsi_1 index with status "active" and return the matching record', async () => {
      vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([
        mockClientRecord,
      ]);

      const result = await cognitoAppClient.getActiveClient(mockClientId);

      expect(mockDynamoClient.query).toHaveBeenCalledWith({
        tableName: mockProps.tableName,
        indexName: 'gsi_1',
        keyConditionExpression: '#gsi_pk = :gsi_pk and #gsi_sk = :gsi_sk',
        expressionAttributeNames: {
          '#gsi_pk': 'gsi_1_pk',
          '#gsi_sk': 'gsi_1_sk',
        },
        expressionAttributeValues: {
          ':gsi_pk': 'active',
          ':gsi_sk': mockClientId,
        },
      });
      expect(result).toEqual(mockClientRecord);
    });

    it('should return null when no active client is found', async () => {
      vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([]);

      const result = await cognitoAppClient.getActiveClient(mockClientId);

      expect(result).toBeNull();
    });

    it('should return only the first record when the query returns multiple', async () => {
      const secondRecord = { ...mockClientRecord, clientId: 'client_999' };
      vi.mocked(mockDynamoClient.query).mockResolvedValueOnce([
        mockClientRecord,
        secondRecord,
      ]);

      const result = await cognitoAppClient.getActiveClient(mockClientId);

      expect(result).toEqual(mockClientRecord);
    });
  });
});
