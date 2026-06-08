import { CognitoAppClient } from '../auth/cognito-app-client.auth';
import { CognitoAuthClient } from '../aws/cognito-client';
import { AWSDynamoDBClient } from '../aws/dynamo-client';
import type { AppAuthClientConfig } from '../schemas/app-config/app-config.schema';
import type { IAuthClient } from './client.interface';

export function CognitoAuthClientAdapter(
  config: AppAuthClientConfig
): IAuthClient {
  if (config.clientType !== 'cognito') {
    throw new Error('auh client config type cognito required');
  }
  const {
    tokenUrl,
    userPoolId,
    authTableName,
    accessTokenExpiryHrs,
    orgClientLimit,
  } = config;
  const cognitoClient = new CognitoAuthClient(
    tokenUrl,
    userPoolId,
    accessTokenExpiryHrs
  );
  const dynamoClient = new AWSDynamoDBClient();

  return new CognitoAppClient(
    { tableName: authTableName, orgClientLimit },
    cognitoClient,
    dynamoClient
  );
}
