import { fromEnv } from '@aws-sdk/credential-providers';
import aws4 from 'aws4';
import crypto from 'crypto';
import { getLogger } from 'src/logger';

const logger = getLogger();
const credentialProvider = fromEnv();

/**
 * Signs an HTTP request with AWS IAM credentials using SigV4.
 * Used for authenticating requests to internal AWS API Gateway endpoints.
 */
export const signRequest = async (
  url: string,
  method: string,
  headers: Record<string, string> = {},
  body = ''
): Promise<Record<string, string>> => {
  const urlObj = new URL(url);
  const host = urlObj.host;
  const path = urlObj.pathname + urlObj.search;

  const credentials = await credentialProvider();

  const bodyHash = crypto
    .createHash('sha256')
    .update(body || '')
    .digest('hex');

  logger.debug('Signing request', { host, path, method });
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

  // aws4 types header values as string | undefined, but all values are populated strings after signing.
  return signedRequest.headers as Record<string, string>;
};
