import type { CognitoAuthClient } from '../aws/cognito-client';
import type { AWSDynamoDBClient } from '../aws/dynamo-client';
import type {
  ClientAccessTokenResult,
  IAuthClient,
} from '../clients/client.interface';
import {
  AppClientAlreadyExistsError,
  AppClientFailedToRollbackError,
  AppClientNotFoundError,
  ClientLimitError,
} from '../errors/app-client.errors';
import type { AppClientCreate } from '../schemas/app-clients/app-client.schema';
import type { AuthTokenRequestData } from '../schemas/auth.schema';
import { logger } from '../utils/logger';
import { toLowercaseNoSpaces } from '../utils/string';

interface AppClientRecord extends Omit<AppClientCreate, 'name' | 'scopes'> {
  pk: string;
  sk: string;
  gsi_1_pk: string;
  gsi_1_sk: string;
  clientName: string;
  scopes: string;
  clientId: string;
}
interface CognitoAppClientProps {
  orgClientLimit: number;
  tableName: string;
}

export class CognitoAppClient implements IAuthClient {
  constructor(
    private props: CognitoAppClientProps,
    private cognitoClient: CognitoAuthClient,
    private dynamoClient: AWSDynamoDBClient
  ) {}

  async disableAndRemoveClient(clientId: string, actorId: string) {
    // Check if client record exists and has active status
    const [clientRecord] = await this.getClientByGsi1('active', clientId);

    if (!clientRecord) {
      logger.error(
        { clientId, actorId },
        'Cannot disable and remove client: client not found or not active'
      );
      throw new AppClientNotFoundError();
    }

    const { pk, sk, orgId, clientName } = clientRecord;
    const now = Date.now();

    // optimistic lock to set record to removed before cognito client delete.
    await this.dynamoClient.updateItem({
      tableName: this.props.tableName,
      key: { pk, sk },
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
        ':actorId': actorId,
        ':now': now,
        ':active': 'active',
      },
      conditionExpression: '#status = :active',
    });

    // Only delete from Cognito after DynamoDB succeeds
    try {
      await this.cognitoClient.removeUserPoolClient({ clientId });
    } catch (cognitoError) {
      // Rollback record update on failure
      await this.dynamoClient
        .updateItem({
          tableName: this.props.tableName,
          key: { pk, sk },
          updateExpression:
            'SET #status = :active, #updatedAt = :now, #gsi_1_pk = :active',
          expressionAttributeNames: {
            '#status': 'status',
            '#updatedAt': 'updatedAt',
            '#gsi_1_pk': 'gsi_1_pk',
          },
          expressionAttributeValues: {
            ':active': 'active',
            ':now': Date.now(),
          },
        })
        .catch((rollbackError) => {
          // Log and wrap both errors
          logger.error(
            {
              cognitoError,
              rollbackError: rollbackError as Error,
              clientId,
              orgId,
            },
            'Failed to rollback'
          );
          throw new AppClientFailedToRollbackError(
            `Failed to delete from Cognito and rollback failed for clientId: ${clientId}`
          );
        });

      // Rollback succeeded, throw original error
      logger.warn(
        { cognitoError, clientId, orgId },
        'Cognito deletion failed, successfully rolled back'
      );
      throw cognitoError;
    }

    logger.info(
      { clientId, orgId, updatedBy: actorId, name: clientName },
      'Successfully disabled and removed client'
    );
  }

  // creates a new access token for supplied creds.
  createClientAccessToken(
    clientData: AuthTokenRequestData
  ): Promise<ClientAccessTokenResult> {
    const { clientKey, clientSecret } = clientData;

    return this.cognitoClient.getClientAccessToken({
      clientId: clientKey,
      clientSecret,
    });
  }

  getOrgClients(tenantId: string, orgId: string) {
    return this.getClientsByPk(`#${tenantId}#${orgId}`);
  }

  async getActiveClient(clientId: string) {
    const [record = null] = await this.getClientByGsi1('active', clientId);

    return record;
  }

  // creates a new app client in cognito and add details to dynamo
  async createNewClient(newClientData: AppClientCreate) {
    const {
      orgId,
      scopes,
      name,
      tenantId,
      status,
      createdAt,
      createdBy,
      updatedAt,
      compatVersion,
      role,
      rateLimitProfile,
    } = newClientData;

    // check for any existing active records with same name.
    const normalisedName = toLowercaseNoSpaces(name);
    const existingRecords = await this.getClientsByPk(`#${tenantId}#${orgId}`);

    let existingRecordForName: AppClientRecord | undefined;
    let latestExistingRecord: AppClientRecord | undefined;
    let liveExistingRecordCount = 0;

    for (const record of existingRecords) {
      if (record.status !== 'removed') {
        liveExistingRecordCount++;
        if (toLowercaseNoSpaces(record.clientName) === normalisedName) {
          existingRecordForName = record;
        }
      }
      if (
        !latestExistingRecord ||
        record.updatedAt > latestExistingRecord.updatedAt
      ) {
        latestExistingRecord = record;
      }
    }

    const pinnedCompatVersion =
      latestExistingRecord?.compatVersion ?? compatVersion;

    if (liveExistingRecordCount >= this.props.orgClientLimit) {
      logger.error(
        {
          tenantId,
          orgId,
          clientName: name,
          clientLimit: this.props.orgClientLimit,
        },
        'cannot create new client, max client credentials limit hit'
      );
      throw new ClientLimitError();
    }

    if (existingRecordForName) {
      logger.error(
        {
          tenantId,
          orgId,
          clientName: name,
          existingClientId: existingRecordForName.clientId,
        },
        'app client already exists with the same name'
      );
      throw new AppClientAlreadyExistsError();
    }

    // create new app client in cognito.
    const { clientId, clientSecret } =
      await this.cognitoClient.createUserPoolClient({
        clientName: `${orgId}-${normalisedName}`,
      });

    // add new dynamoDB row for client.
    const recordItem = {
      pk: `#${tenantId}#${orgId}`,
      sk: `#${clientId}#${normalisedName}`,
      clientId,
      tenantId,
      orgId,
      scopes: scopes.join(','),
      createdAt,
      createdBy,
      updatedBy: createdBy,
      updatedAt,
      status,
      compatVersion: pinnedCompatVersion,
      role,
      rateLimitProfile,
      clientName: name,
      gsi_1_pk: status,
      gsi_1_sk: clientId,
    };
    try {
      await this.dynamoClient.putItem({
        tableName: this.props.tableName,
        conditionExpression: 'attribute_not_exists(sk)',
        item: recordItem,
      });
    } catch (putError) {
      logger.error(
        { putError, recordItem },
        'Failed to put new client item record'
      );
      // remove cognito client on failure.
      await this.cognitoClient
        .removeUserPoolClient({ clientId })
        .catch((cleanupError) => {
          logger.error(
            { putError, cleanupError, clientId, orgId },
            'Failed to persist to DynamoDB and Cognito cleanup failed'
          );
          throw new AppClientFailedToRollbackError(
            `Failed to persist to DynamoDB and Cognito cleanup failed for clientId: ${clientId}`
          );
        });
      throw putError;
    }

    return {
      clientName: name,
      clientKey: clientId,
      clientSecret,
    };
  }

  private getClientByGsi1(pk: string, sk: string) {
    return this.dynamoClient.query<AppClientRecord>({
      tableName: this.props.tableName,
      indexName: 'gsi_1',
      keyConditionExpression: '#gsi_pk = :gsi_pk and #gsi_sk = :gsi_sk',
      expressionAttributeNames: {
        '#gsi_pk': 'gsi_1_pk',
        '#gsi_sk': 'gsi_1_sk',
      },
      expressionAttributeValues: { ':gsi_pk': pk, ':gsi_sk': sk },
    });
  }

  private getClientsByPk(pk: `#${string}#${string}`) {
    // check for org existing clients.
    return this.dynamoClient.query<AppClientRecord>({
      tableName: this.props.tableName,
      keyConditionExpression: '#pk = :pk',
      expressionAttributeNames: { '#pk': 'pk' },
      expressionAttributeValues: { ':pk': pk },
    });
  }
}
