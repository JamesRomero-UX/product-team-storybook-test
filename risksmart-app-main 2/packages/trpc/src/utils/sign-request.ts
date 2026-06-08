import {
  fromContainerMetadata,
  fromNodeProviderChain,
} from '@aws-sdk/credential-providers';
import aws4 from 'aws4';
import crypto from 'crypto';

import { logger } from './logger';

/**
 * Signs an HTTP request with AWS IAM credentials using SigV4
 * Used for authenticating requests to internal AWS API Gateway endpoints
 */
export const signRequest = async (
  url: string,
  method: string,
  headers: Record<string, string> = {},
  body = ''
): Promise<Record<string, string>> => {
  logger.debug({ url }, 'Parsing URL');
  const urlObj = new URL(url);
  const host = urlObj.host;
  // Include query string in path for SigV4 signing - aws4 expects path to include query params
  const path = urlObj.pathname + urlObj.search;

  logger.debug('Getting AWS credentials for lambda execution role');
  // Use container metadata for ECS, fall back to provider chain for local dev
  const credentialProvider = process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI
    ? fromContainerMetadata()
    : fromNodeProviderChain();
  const credentials = await credentialProvider();

  const bodyHash = crypto
    .createHash('sha256')
    .update(body || '')
    .digest('hex');

  const region = process.env.AWS_REGION || 'eu-west-2';

  logger.debug({ host, path, method, bodyHash }, 'Signing request');
  const signedRequest = aws4.sign(
    {
      host,
      path,
      service: 'execute-api',
      region,
      method,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'X-Amz-Content-Sha256': bodyHash,
      },
      body,
    },
    {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    }
  );

  if (!signedRequest.headers) {
    throw new Error('Failed to sign request');
  }

  logger.debug('Request signed successfully');

  return signedRequest.headers as Record<string, string>;
};
