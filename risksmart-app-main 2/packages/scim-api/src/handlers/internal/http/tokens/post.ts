import { PutCommand } from '@aws-sdk/lib-dynamodb';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import type { ScimTokenMetaData } from 'src/scim/types';
import { getLegacyTokenConfig } from 'src/services/dynamo/getLegacyTokenConfig';
import { getTokenConfig } from 'src/services/dynamo/getTokenConfig';
import { revokeLegacyTokensByKeyIds } from 'src/services/dynamo/revokeLegacyTokensByKeyIds';
import { getSecretByName } from 'src/services/ssm/getSecretByName';
import { dynamoClient } from 'src/utils/dynamo-client';
import { ApiHandler } from 'sst/node/api';
import { Table } from 'sst/node/table';

import type { PostSchema } from './postSchema';
import { postSchema } from './postSchema';

const stage = process.env.SST_STAGE;

export const handler = ApiHandler(async (event) => {
  console.log('Creating SCIM token:', event);
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
    const tenant = parsedBody.data.tenant;
    const expireInMonths = Number(parsedBody.data.expireInMonths) || 12;

    // Get active tokens for organisation
    const { tokens } = await getTokenConfig(dynamoClient, orgKey);
    if (
      tokens.some(
        (token) => !token.revoked && new Date(token.expires_at) > new Date()
      )
    ) {
      console.error('Active token already exists for organisation:', orgKey);

      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Active token already exists for organisation',
        }),
      };
    }

    // Retrieve the secret from Parameter Store
    const tokenVersionKeyName = `/${stage}/scim-api/token-secret/${tenant}/${orgKey}/active-version`;
    const tokenVersion = await getSecretByName(tokenVersionKeyName);
    if (!tokenVersion) {
      throw new Error(`Token version not found: ${tokenVersionKeyName}`);
    }
    console.info('Token version:', tokenVersion);

    const tokenSecretKeyName = `/${stage}/scim-api/token-secret/${tenant}/${orgKey}/${tokenVersion}`;
    const secret = await getSecretByName(tokenSecretKeyName);
    if (!secret) {
      throw new Error(`Token secret not found: ${tokenSecretKeyName}`);
    }

    // Create the JWT
    const keyId = crypto.randomUUID();
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const nowDate = new Date(nowInSeconds * 1000);

    // Calculate the expiry date
    nowDate.setUTCMonth(nowDate.getUTCMonth() + expireInMonths);
    const expiresAtSeconds = Math.floor(nowDate.getTime() / 1000);
    const expiresInSeconds = expiresAtSeconds - nowInSeconds;

    const token = jwt.sign(
      { sub: orgKey, kid: keyId, iat: nowInSeconds },
      secret,
      {
        algorithm: 'HS256',
        expiresIn: expiresInSeconds,
        issuer: `https://${stage === 'prod' ? 'app' : stage}.risksmart.link`,
      }
    );

    console.log('SCIM token successfully created for organisation', {
      keyId,
      orgKey,
    });

    // Save the key metadata to DynamoDB
    const createdAt = new Date(nowInSeconds * 1000).toISOString();
    const expiresAt = new Date(expiresAtSeconds * 1000).toISOString();

    const Item: ScimTokenMetaData = {
      client_id: orgKey,
      key_id: keyId,
      tenant,
      created_at: createdAt,
      expires_at: expiresAt,
      revoked: false,
      revoked_at: null,
      token_version: tokenVersion,
      last_used_at: null,
    };
    await dynamoClient.send(
      new PutCommand({
        TableName: Table.ScimApiKeys.tableName,
        Item,
      })
    );

    // Revoke all legacy tokens
    const { legacyTokens } = await getLegacyTokenConfig(dynamoClient, orgKey);
    const legacyTokenIds = legacyTokens.map((token) => token.id);
    if (legacyTokenIds.length > 0) {
      await revokeLegacyTokensByKeyIds(dynamoClient, orgKey, legacyTokenIds);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        keyId,
        orgKey,
        createdOn: createdAt,
        expiresOn: expiresAt,
        status: 'active',
        token,
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
