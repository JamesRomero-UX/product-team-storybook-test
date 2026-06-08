import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { ScimLegacyTokenMetaData } from 'src/scim/types';
import { Table } from 'sst/node/table';

export const getLegacyTokenConfig = async (
  dynamoDb: DynamoDBDocumentClient,
  orgKey: string
): Promise<{
  legacyTokens: ScimLegacyTokenMetaData[];
  legacyDomains: string[];
}> => {
  const result = await dynamoDb.send(
    new QueryCommand({
      TableName: Table.ScimApiAuth.tableName,
      IndexName: 'orgKeyIndex',
      KeyConditionExpression: 'orgKey = :orgKey',
      ExpressionAttributeValues: {
        ':orgKey': orgKey,
      },
    })
  );

  if (!result.Items || result.Items.length === 0) {
    return {
      legacyTokens: [],
      legacyDomains: [],
    };
  }

  const legacyToken = result.Items[0] as ScimLegacyTokenMetaData;
  if (legacyToken.revoked) {
    return {
      legacyTokens: [],
      legacyDomains: [],
    };
  }
  const legacyDomains = legacyToken.domains;

  return {
    legacyTokens: [legacyToken],
    legacyDomains,
  };
};
