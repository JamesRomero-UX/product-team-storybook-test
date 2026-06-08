import {
  DeleteSecretCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { getLogger } from 'src/logger';

const logger = getLogger();

export const deleteSecret = async (secretArn: string): Promise<void> => {
  const secretsManager = new SecretsManagerClient();

  try {
    await secretsManager.send(
      new DeleteSecretCommand({
        SecretId: secretArn,
        ForceDeleteWithoutRecovery: true,
      })
    );

    logger.info('Ingestion config secret deleted successfully', {
      secretArn,
    });
  } catch (error) {
    logger.error('Failed to delete ingestion config secret', {
      error: error as Error,
      secretArn,
    });
    throw error;
  }
};
