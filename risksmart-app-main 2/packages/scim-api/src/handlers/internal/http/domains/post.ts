import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { getHasuraAdminClient } from 'src/adminGraphqlClient';
import type { ScimDomain, ScimDomainsMetaData } from 'src/scim/types';
import { getOrganisation } from 'src/services/hasura/getOrganisation';
import { dynamoClient } from 'src/utils/dynamo-client';
import { ApiHandler } from 'sst/node/api';
import { Table } from 'sst/node/table';

import type { PostSchema } from './postSchema';
import { postSchema } from './postSchema';

export const handler = ApiHandler(async (event) => {
  console.info('Adding SCIM domain to configuration', event);
  try {
    if (!event.pathParameters || !event.pathParameters.orgKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing orgKey in path parameters',
        }),
      };
    }
    const body = JSON.parse(event.body || '{}') as PostSchema;
    const parsedBody = postSchema.safeParse(body);
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
    const tenant = parsedBody.data.tenant;

    // Check if organisation is enabled for SCIM
    const hasuraClient = getHasuraAdminClient(tenant);
    const organisation = await getOrganisation(hasuraClient, {
      OrgKey: orgKey,
    });
    if (!organisation) {
      console.info('Organisation not found:', orgKey);

      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Organisation not found',
        }),
      };
    }

    if (!organisation.ScimEnabled) {
      console.info('Organisation not enabled for SCIM:', orgKey);

      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Organisation not enabled for SCIM',
        }),
      };
    }

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
    const domains: ScimDomain[] = domainsResult.Item?.domains || [];
    console.info('Existing domains:', domains);

    // Check if domain already exists
    if (domains.find((x) => x.domain === domain)) {
      console.info('Domain already exists for organisation', orgKey);

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: 'Domain already exists',
        }),
      };
    }

    // Add new domain to existing domains
    const newDomain: ScimDomain = {
      domain: domain,
      createdOn: new Date().toISOString(),
    };
    domains.push(newDomain);

    // Save updated domains to DynamoDB
    console.info('Saving updated domains to DynamoDB:', domains);
    const item: ScimDomainsMetaData = {
      ...key,
      domains,
    };
    await dynamoClient.send(
      new PutCommand({
        TableName: Table.ScimApiKeys.tableName,
        Item: item,
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify(newDomain),
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
