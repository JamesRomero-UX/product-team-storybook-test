import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { getEnv } from 'src/environment';
import type { SharePointCredentials } from 'src/handlers/data-export/types';
import { getLogger } from 'src/logger';

const logger = getLogger();

export const getCredentials = async (): Promise<SharePointCredentials> => {
  try {
    const secretId = getEnv('ENTRA_SECRET_NAME');

    logger.info('Retrieving Entra credential secret', {
      secretId,
    });

    const secretManagerClient = new SecretsManagerClient();
    const secrets = await secretManagerClient.send(
      new GetSecretValueCommand({ SecretId: secretId })
    );

    return JSON.parse(secrets.SecretString!);
  } catch (e) {
    logger.error('Failed to retrieve Entra secret', e as Error);
    throw e;
  }
};
