import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from 'src/utils/dynamo-client';
import { ApiHandler } from 'sst/node/api';
import { Table } from 'sst/node/table';

export const handler = ApiHandler(async (event) => {
  console.log('Deleting SCIM token:', event);
  try {
    if (
      !event.pathParameters ||
      !event.pathParameters.orgKey ||
      !event.pathParameters.tokenId
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing orgKey or tokenId in path parameters',
        }),
      };
    }
    const orgKey = event.pathParameters.orgKey;
    const tokenId = event.pathParameters.tokenId;

    // Delete the key metadata in DynamoDB
    await dynamoClient.send(
      new DeleteCommand({
        TableName: Table.ScimApiKeys.tableName,
        Key: {
          client_id: orgKey,
          key_id: tokenId,
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        keyId: tokenId,
      }),
    };
  } catch (error) {
    console.error('Error creating token:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
      }),
    };
  }
});
