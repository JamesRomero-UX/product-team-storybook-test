import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { ScimDomain, ScimTokenMetaData } from 'src/scim/types';
import { Table } from 'sst/node/table';

export const getTokenConfig = async (
  dynamoDb: DynamoDBDocumentClient,
  orgKey: string
): Promise<{
  tokens: ScimTokenMetaData[];
  domains: ScimDomain[];
}> => {
  try {
    console.log('Getting SCIM configuration for organisation', orgKey);
    const result = await dynamoDb.send(
      new QueryCommand({
        TableName: Table.ScimApiKeys.tableName,
        KeyConditionExpression: 'client_id = :client_id',
        ExpressionAttributeValues: {
          ':client_id': orgKey,
        },
      })
    );

    if (!result.Items) {
      return {
        tokens: [],
        domains: [],
      };
    }

    const tokens = result.Items.filter(
      (x) => x.key_id !== 'DOMAINS'
    ) as ScimTokenMetaData[];
    const domains =
      result.Items.find((x) => x.key_id === 'DOMAINS')?.domains ||
      ([] as ScimDomain[]);

    return {
      tokens,
      domains,
    };
  } catch (error) {
    console.error('Error getting token config:', error);
    throw error;
  }
};
