import { fromEnv } from '@aws-sdk/credential-providers';
import aws4 from 'aws4';
import crypto from 'crypto';

import { getLogger } from '../logger';

const logger = getLogger();
const credentialProvider = fromEnv();

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
  logger.info('Parsing URL', { url });
  const urlObj = new URL(url);
  const host = urlObj.host;
  // Include query string in path for SigV4 signing - aws4 expects path to include query params
  const path = urlObj.pathname + urlObj.search;

  logger.info('Getting AWS credentials for lambda execution role');

  const credentials = await credentialProvider();

  const bodyHash = crypto
    .createHash('sha256')
    .update(body || '')
    .digest('hex');

  logger.info('Signing request', { host, path, method, headers, bodyHash });
  const signedRequest = aws4.sign(
    {
      host,
      path,
      service: 'execute-api',
      region: process.env.AWS_REGION || 'eu-west-2',
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

  logger.info('Request signed successfully');

  // aws4 types header values as string | undefined, but all headers are populated strings after signing.
  return signedRequest.headers as Record<string, string>;
};
