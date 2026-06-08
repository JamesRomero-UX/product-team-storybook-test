import { PutCommand } from '@aws-sdk/lib-dynamodb';
import type {
  ScimDomain,
  ScimDomainsMetaData,
  ScimTokenMetaData,
} from 'src/scim/types';
import { getLegacyTokenConfig } from 'src/services/dynamo/getLegacyTokenConfig';
import { getTokenConfig } from 'src/services/dynamo/getTokenConfig';
import { dynamoClient } from 'src/utils/dynamo-client';
import { ApiHandler } from 'sst/node/api';
import { Table } from 'sst/node/table';

interface TokenMetaDataResponse {
  keyId: string;
  orgKey: string;
  createdOn: string;
  expiresOn: string;
  status: string;
}

export const handler = ApiHandler(async (event) => {
  try {
    if (!event.pathParameters || !event.pathParameters.orgKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing orgKey in path parameters',
        }),
      };
    }
    const orgKey = event.pathParameters.orgKey;

    console.log('Getting SCIM configuration for organisation', orgKey);
    const { tokens, domains } = await getTokenConfig(dynamoClient, orgKey);

    // Get legacy tokens from DynamoDB
    console.log('Getting legacy SCIM configuration for organisation', orgKey);
    const { legacyTokens, legacyDomains } = await getLegacyTokenConfig(
      dynamoClient,
      orgKey
    );

    // Mapping config response
    console.log('Mapping SCIM configuration response');
    let domainResponse = domains;
    if (!domains.length && legacyDomains.length) {
      domainResponse = await updateDomainsFromLegacy(orgKey, legacyDomains);
    }
    const tokenResponse = tokens.map(mapTokenResponse);
    const legacyTokenResponse = tokens.length === 0 && legacyTokens.length > 0;

    return {
      statusCode: 200,
      body: JSON.stringify({
        domains: domainResponse,
        tokens: tokenResponse,
        legacyTokens: legacyTokenResponse,
      }),
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

const mapTokenResponse = (token: ScimTokenMetaData): TokenMetaDataResponse => ({
  keyId: token.key_id,
  orgKey: token.client_id,
  createdOn: token.created_at,
  expiresOn: token.expires_at,
  status: token.revoked
    ? 'revoked'
    : new Date(token.expires_at) < new Date()
      ? 'expired'
      : 'active',
});

const updateDomainsFromLegacy = async (
  orgKey: string,
  legacyDomains: string[]
): Promise<ScimDomain[]> => {
  console.log('Migrating legacy scim domains to new table', { legacyDomains });
  const now = new Date().toISOString();
  const newDomains = legacyDomains.map((domain) => ({
    domain,
    createdOn: now,
  }));

  if (!newDomains.length) {
    return [];
  }

  const item: ScimDomainsMetaData = {
    client_id: orgKey,
    key_id: 'DOMAINS',
    domains: newDomains,
  };
  await dynamoClient.send(
    new PutCommand({
      TableName: Table.ScimApiKeys.tableName,
      Item: item,
    })
  );

  console.log('Legacy domains migrated to new table', { newDomains });

  return newDomains;
};
