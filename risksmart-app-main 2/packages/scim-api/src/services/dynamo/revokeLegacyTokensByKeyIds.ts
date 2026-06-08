import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { Table } from 'sst/node/table';

export const revokeLegacyTokensByKeyIds = async (
  dynamoDb: DynamoDBDocumentClient,
  orgKey: string,
  keyIds: string[]
): Promise<void> => {
  try {
    console.log('Revoking SCIM legacy tokens for organisation', orgKey, keyIds);
    await dynamoDb.send(
      new TransactWriteCommand({
        TransactItems: keyIds.map((key_id) => ({
          Update: {
            TableName: Table.ScimApiAuth.tableName,
            Key: {
              id: key_id,
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

    console.log('Revoked legacy tokens successfully');
  } catch (error) {
    console.error('Error revoking legacy tokens:', error);
    throw error;
  }
};
