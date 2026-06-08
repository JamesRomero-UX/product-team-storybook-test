import { GetCommand } from '@aws-sdk/lib-dynamodb';
import type {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import type { ScimDomain, ScimLegacyTokenMetaData } from 'src/scim/types';
import { getSecretByName } from 'src/services/ssm/getSecretByName';
import { dynamoClient } from 'src/utils/dynamo-client';
import { Table } from 'sst/node/table';

import type { AuthContext } from './authContext';

const stage = process.env.SST_STAGE;

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  try {
    const authentication = await authenticate(event);
    console.log('Authentication:', authentication);

    const domains = authentication.context?.domains ?? [];
    const result: APIGatewayAuthorizerResult = {
      principalId: authentication.context?.orgKey || 'unknown',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: authentication.success ? 'Allow' : 'Deny',
            Resource: event.methodArn,
          },
        ],
      },
      context: {
        orgKey: authentication.context?.orgKey,
        tenant: authentication.context?.tenant,
        domains: JSON.stringify(domains),
      },
    };

    console.log('Authorization result:', result);

    return result;
  } catch (error) {
    console.error('Error authorizing token:', error);
    throw error;
  }
};

const authenticate = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<{ success: boolean; context?: AuthContext }> => {
  try {
    const { token } = getTokenOrThrow(event);
    const context = await validateToken(token);
    if (context) {
      return { success: true, context: context as AuthContext };
    }
    throw new Error('Invalid token');
  } catch {
    return { success: false };
  }
};

const validateToken = async (token: string) => {
  const tokenResult = await validateTokenWithSecret(token);
  console.log('Token result:', tokenResult);
  if (tokenResult) {
    return tokenResult;
  }

  return await validateLegacyToken(token);
};

const validateTokenWithSecret = async (token: string) => {
  try {
    console.info('Validating token with secret');

    // Decode token
    const decoded = jwt.decode(token);
    if (!decoded) {
      console.info('Invalid v2 token');

      return false;
    }

    // Validate token data types
    const { sub: orgKey, kid, iat, exp, iss } = decoded as jwt.JwtPayload;

    if (
      typeof orgKey !== 'string' ||
      typeof kid !== 'string' ||
      typeof iat !== 'number' ||
      typeof exp !== 'number' ||
      typeof iss !== 'string'
    ) {
      console.info('Invalid token data types:', decoded);

      return false;
    }

    // Get key metadata from dynamodb
    console.info('Getting key metadata from dynamodb:', orgKey, kid);
    const keyResult = await dynamoClient.send(
      new GetCommand({
        TableName: Table.ScimApiKeys.tableName,
        Key: {
          client_id: orgKey,
          key_id: kid,
        },
      })
    );

    // Validate key metadata
    if (!keyResult.Item) {
      console.info('Key not found:', orgKey, kid);

      return false;
    }

    if (keyResult.Item.revoked) {
      console.info('Key has been revoked:', orgKey, kid);

      return false;
    }

    // Get secret from parameter store
    const tenant = keyResult.Item.tenant;
    const tokenVersion = keyResult.Item.token_version;
    const secretName = `/${stage}/scim-api/token-secret/${tenant}/${orgKey}/${tokenVersion}`;
    const secret = await getSecretByName(secretName);
    if (!secret) {
      console.info('Secret not found:', secretName);

      return false;
    }

    // Verify token
    try {
      jwt.verify(token, secret, {
        algorithms: ['HS256'],
        subject: orgKey,
        issuer: `https://${stage === 'prod' ? 'app' : stage}.risksmart.link`,
      });
      console.log('Token successfully verified.');
    } catch (error) {
      console.info('Token verification failed:', error);

      return false;
    }

    // Get domains data from dynamo
    console.info('Getting domains data from dynamo:', orgKey);
    const domainsResult = await dynamoClient.send(
      new GetCommand({
        TableName: Table.ScimApiKeys.tableName,
        Key: {
          client_id: orgKey,
          key_id: 'DOMAINS',
        },
      })
    );
    console.log('Domains result:', domainsResult);

    if (!domainsResult.Item) {
      console.info('No domains configured for organisation', orgKey);

      return false;
    }

    const domains: string[] = domainsResult.Item.domains.map(
      (domain: ScimDomain) => domain.domain
    );

    return {
      orgKey,
      tenant: keyResult.Item.tenant,
      domains,
    };
  } catch (error) {
    console.error('Error validating v2 token:', error);

    return false;
  }
};

const validateLegacyToken = async (token: string) => {
  console.info('Validating legacy token.');
  try {
    const result = await dynamoClient.send(
      new GetCommand({
        TableName: Table.ScimApiAuth.tableName,
        Key: {
          id: token,
        },
      })
    );
    console.log('DynamoDB result:', result);

    if (
      !result.Item ||
      !result.Item.orgKey ||
      !result.Item.tenant ||
      !result.Item.domains
    ) {
      return false;
    }

    const tokenResult = result.Item as ScimLegacyTokenMetaData;
    if (tokenResult.revoked) {
      console.info('Legacy token has been revoked');

      return false;
    }

    return result.Item as ScimLegacyTokenMetaData;
  } catch (error) {
    console.error('Error validating legacy token:', error);

    return false;
  }
};

const getTokenOrThrow = (event: APIGatewayTokenAuthorizerEvent) => {
  const auth = event.authorizationToken || '';
  const [scheme, token] = auth.split(' ', 2);
  if ((scheme || '').toLowerCase() !== 'bearer') {
    throw new Error("Authorization header value did not start with 'Bearer'.");
  }
  if (!token?.length) {
    throw new Error('Authorization header did not contain a Bearer token.');
  }

  return { auth, scheme, token };
};
