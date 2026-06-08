import {
  CreateSecretCommand,
  PutSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { getLogger } from 'src/logger';

const logger = getLogger();

export interface StoreSecretProps {
  tenant: string;
  orgKey: string;
  apiKey: string;
}

/**
 * Checks if an error is a ResourceNotFoundException from AWS SDK
 * Handles various error formats due to bundling/serialization
 */
const isResourceNotFoundError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const err = error as {
    name?: string;
    message?: string;
    $metadata?: { httpStatusCode?: number };
  };

  return (
    err.name === 'ResourceNotFoundException' ||
    err.message === 'ResourceNotFoundException' ||
    err.$metadata?.httpStatusCode === 404
  );
};

export const storeSecret = async ({
  tenant,
  orgKey,
  apiKey,
}: StoreSecretProps): Promise<string> => {
  const secretsManager = new SecretsManagerClient();
  const secretValue = JSON.stringify({ apiKey, tenant, orgKey });
  const secretName = `${process.env.SST_STAGE}-ingestion-config-secret-${orgKey}`;

  try {
    try {
      const updateResponse = await secretsManager.send(
        new PutSecretValueCommand({
          SecretId: secretName,
          SecretString: secretValue,
        })
      );

      logger.info('Ingestion config secret updated successfully', {
        secretName,
      });

      return updateResponse.ARN!;
    } catch (error) {
      if (isResourceNotFoundError(error)) {
        const response = await secretsManager.send(
          new CreateSecretCommand({
            Name: secretName,
            SecretString: secretValue,
            Description: 'Ingestion config API key secret',
          })
        );

        logger.info('Ingestion config secret created successfully', {
          secretName,
        });

        return response.ARN!;
      }
      throw error;
    }
  } catch (error) {
    logger.error('Failed to store ingestion config secret', {
      error: error as Error,
    });
    throw error;
  }
};
