import type { GetSecretValueCommandOutput } from '@aws-sdk/client-secrets-manager';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { getLogger } from 'src/logger';

const logger = getLogger();

export const getSecretFromArn = async <T>(secretArn: string): Promise<T> => {
  const secretsManagerClient = new SecretsManagerClient({});
  const secretName = secretArn.split(':').pop();

  try {
    logger.info('Retrieving secret from ARN', { secretName });

    const command = new GetSecretValueCommand({
      SecretId: secretArn,
    });

    const response: GetSecretValueCommandOutput =
      await secretsManagerClient.send(command);

    if (!response.SecretString) {
      throw new Error('Secret string is empty');
    }

    return JSON.parse(response.SecretString) as T;
  } catch (error) {
    logger.error('Failed to retrieve secret', { secretName });
    throw error;
  }
};
