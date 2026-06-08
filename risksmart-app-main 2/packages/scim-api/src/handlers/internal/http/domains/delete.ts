import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from 'src/utils/dynamo-client';
import { ApiHandler } from 'sst/node/api';
import { Table } from 'sst/node/table';

import type { DeleteSchema } from './deleteSchema';
import { deleteSchema } from './deleteSchema';

interface ScimDomain {
  domain: string;
  createdOn: string;
}

export const handler = ApiHandler(async (event) => {
  console.info('Deleting SCIM domain from configuration', event);
  try {
    if (!event.pathParameters || !event.pathParameters.orgKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing orgKey in path parameters',
        }),
      };
    }
    const body = JSON.parse(event.body || '{}') as DeleteSchema;
    const parsedBody = deleteSchema.safeParse(body);
    if (!parsedBody.success) {
      console.error('Invalid request body', parsedBody.error);

      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid request body',
        }),
      };
    }
    const orgKey = event.pathParameters.orgKey;
    const domain = parsedBody.data.domain;

    // Get existing domains from dynamoDb
    console.info('Getting existing domains for organisation:', orgKey);
    const key = {
      client_id: orgKey,
      key_id: 'DOMAINS',
    };
    const domainsResult = await dynamoClient.send(
      new GetCommand({
        TableName: Table.ScimApiKeys.tableName,
        Key: key,
      })
    );

    if (!domainsResult.Item) {
      console.info('No domains found for organisation', orgKey);

      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Organisation domains not found',
        }),
      };
    }

    const domains: ScimDomain[] = domainsResult.Item.domains || [];
    console.info('Existing domains:', domains);

    // Check if domain already exists
    if (!domains.find((x) => x.domain === domain)) {
      console.info('Domain does not exist for organisation', orgKey);

      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Domain does not exist for organisation',
        }),
      };
    }

    // Remove domain from existing domains
    const updatedDomains = domains.filter((x) => x.domain !== domain);

    // Save updated domains to DynamoDB
    console.info('Saving updated domains to DynamoDB:', domains);
    await dynamoClient.send(
      new PutCommand({
        TableName: Table.ScimApiKeys.tableName,
        Item: {
          ...key,
          domains: updatedDomains,
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ updatedDomains }),
    };
  } catch (error) {
    console.error('Error getting Scim configuration for organisation', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
      }),
    };
  }
});
