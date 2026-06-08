import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { BlobServiceClient } from '@azure/storage-blob';
import { IndicatorResultsAndRiskRatingsDocument } from 'generated/graphql';
import { getHasuraBackendClient } from 'src/backendGraphqlClient';
import { getEnv } from 'src/environment';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { getLogger } from 'src/logger';
import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from 'src/repositories/types';

const logger = getLogger();

interface Credentials {
  accountName: string;
  containerName: string;
  sasToken: string;
  tenant: string;
  orgKey: string;
}

const getCredentials = async (): Promise<Credentials> => {
  try {
    const secretId = getEnv('MOUNTSTREET_EXPORT_SECRET_NAME');
    logger.info('Retrieving database credential secret', {
      secretId,
    });
    const secretManagerClient = new SecretsManagerClient();
    const secrets = await secretManagerClient.send(
      new GetSecretValueCommand({ SecretId: secretId })
    );

    return JSON.parse(secrets.SecretString!);
  } catch (e) {
    logger.error('Failed to parse mountstreet secret', e as Error);
    throw e;
  }
};

export const handler = singleEventBridgeHandler<
  string,
  { tenant: string; orgKey: string },
  void
>(async () => {
  if (process.env.SST_STAGE !== 'prod' || process.env.IS_LOCAL) {
    logger.warn('Attempted to run Mountstreet export in non-prod environment');

    return;
  }

  const { accountName, containerName, sasToken, tenant, orgKey } =
    await getCredentials();

  logger.info('Exporting Mountstreet data', { tenant, orgKey });

  const hasuraClient = getHasuraBackendClient(
    tenant,
    orgKey,
    SYSTEM_USER,
    CUSTOMER_SUPPORT_ROLE
  );

  const fileName = `risks-ratings-and-indicators-${new Date().toISOString()}.json`;

  const { data } = await hasuraClient.query({
    query: IndicatorResultsAndRiskRatingsDocument,
  });

  const body = JSON.stringify(data);
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}?${sasToken}`
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);

  await containerClient.uploadBlockBlob(fileName, body, body.length, {
    metadata: {
      ContentType: 'application/json',
    },
  });
});
