import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Table } from 'sst/node/table';

export const revokeTokensByKeyIds = async (
  dynamoDb: DynamoDBDocumentClient,
  orgKey: string,
  keyIds: string[]
): Promise<void> => {
  try {
    console.log('Revoking SCIM tokens for organisation', orgKey, keyIds);
    await dynamoDb.send(
      new TransactWriteCommand({
        TransactItems: keyIds.map((key_id) => ({
          Update: {
            TableName: Table.ScimApiKeys.tableName,
            Key: {
              client_id: orgKey,
              key_id,
            },
            UpdateExpression: 'SET #revoked = :revoked',
            ExpressionAttributeNames: {
              '#revoked': 'revoked',
            },
            ExpressionAttributeValues: {
              ':revoked': true,
            },
          },
        })),
      })
    );

    console.log('Revoked tokens successfully');
  } catch (error) {
    console.error('Error revoking tokens:', error);
    throw error;
  }
};
