import {
  CreateSecretCommand,
  PutSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { DataExportScheduleStorageTypeEnum } from 'generated/graphql';
import { getLogger } from 'src/logger';
import type { z } from 'zod';

import type { CreateScheduleSchema } from '../schema';

const logger = getLogger();

export interface StoreSecretProps {
  tenant: string;
  orgKey: string;
  inputObject: z.infer<typeof CreateScheduleSchema>['object'];
}

const buildSecretValue = ({
  tenant,
  orgKey,
  inputObject,
}: StoreSecretProps) => {
  const baseSecret = { tenant, orgKey };

  if (
    inputObject.storageType === DataExportScheduleStorageTypeEnum.MsSharePoint
  ) {
    return JSON.stringify({
      ...baseSecret,
      entraSecretValue: inputObject.entraSecretValue,
      entraTenantId: inputObject.entraTenantId,
      entraClientId: inputObject.entraClientId,
      sharePointSiteId: inputObject.sharePointSiteId,
      sharePointDriveId: inputObject.sharePointDriveId,
      sPFolder: inputObject.spFolder,
    });
  }

  if (inputObject.storageType === DataExportScheduleStorageTypeEnum.Sftp) {
    return JSON.stringify({
      ...baseSecret,
      hostname: inputObject.hostname,
      port: inputObject.port,
      username: inputObject.username,
      password: inputObject.password,
      sftpFolder: inputObject.sftpFolder,
    });
  }
};

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

  // Check multiple indicators of ResourceNotFoundException
  // (instanceof check removed as it's unreliable with bundling)
  return (
    err.name === 'ResourceNotFoundException' ||
    err.message === 'ResourceNotFoundException' ||
    err.$metadata?.httpStatusCode === 404
  );
};

export const storeSecret = async ({
  tenant,
  orgKey,
  inputObject,
}: StoreSecretProps): Promise<string> => {
  const secretsManager = new SecretsManagerClient();
  const secretValue = buildSecretValue({ tenant, orgKey, inputObject });

  const storageTypeMap: Partial<
    Record<DataExportScheduleStorageTypeEnum, string>
  > = {
    [DataExportScheduleStorageTypeEnum.MsSharePoint]: 'SharePoint',
    [DataExportScheduleStorageTypeEnum.Sftp]: 'SFTP',
  };
  const secretName = `${process.env.SST_STAGE}-${storageTypeMap[inputObject.storageType]}-data-export-schedule-secret-${orgKey}`;

  try {
    // Try to update existing secret first (no need to describe first)
    try {
      const updateResponse = await secretsManager.send(
        new PutSecretValueCommand({
          SecretId: secretName,
          SecretString: secretValue,
        })
      );

      logger.info('Secret updated successfully', {
        secretName,
        storageType: inputObject.storageType,
      });

      return updateResponse.ARN!;
    } catch (error) {
      // If secret doesn't exist, create it
      if (isResourceNotFoundError(error)) {
        const response = await secretsManager.send(
          new CreateSecretCommand({
            Name: secretName,
            SecretString: secretValue,
            Description: `${storageTypeMap[inputObject.storageType]} data export schedule secret`,
          })
        );

        logger.info('Secret created successfully', {
          secretName,
          storageType: inputObject.storageType,
        });

        return response.ARN!;
      }
      throw error;
    }
  } catch (error) {
    logger.error('Failed to store secret', {
      error: error as Error,
      storageType: inputObject.storageType,
    });
    throw error;
  }
};
