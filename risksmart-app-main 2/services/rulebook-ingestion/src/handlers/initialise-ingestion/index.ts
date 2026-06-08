import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import type { Handler } from 'aws-lambda';
import {
  type AscentApiReference,
  createApiAdaptor,
} from 'src/adaptors/ascent/api-adaptor';
import { createDataLayerApiClient } from 'src/adaptors/data-layer-api-client';
import { createDynamoDbAdaptor } from 'src/adaptors/database/dynamo-adaptor';
import { createSecretsManagerAdaptor } from 'src/adaptors/secrets-manager-adaptor';
import type { IngestionEvent, IngestionRun } from 'src/domain/types';
import { ingestionEventSchema } from 'src/domain/types';
import { getEnv } from 'src/lib';
import { getLogger } from 'src/logger';
import { createInitialiseIngestionUseCase } from 'src/use-cases/initialise-ingestion';

const logger = getLogger();

let cachedDataLayerUrl: string | null = null;

const resolveDataLayerUrl = async (): Promise<string> => {
  if (cachedDataLayerUrl) {
    return cachedDataLayerUrl;
  }

  const paramName = getEnv('DATA_LAYER_INTERNAL_API_URL_SSM_PARAM');
  const ssmClient = new SSMClient({});
  const response = await ssmClient.send(
    new GetParameterCommand({ Name: paramName })
  );

  if (!response.Parameter?.Value) {
    throw new Error(`Failed to retrieve SSM parameter: ${paramName}`);
  }

  cachedDataLayerUrl = response.Parameter.Value.replace(/\/$/, '');

  return cachedDataLayerUrl;
};

export const handler: Handler<
  IngestionEvent,
  { ingestionRun: IngestionRun; apiRef: AscentApiReference }
> = async (event) => {
  const { orgKey, tenant } = ingestionEventSchema.parse(event);

  logger.info('Initialising ingestion for org', { orgKey, tenant });

  // 1. Fetch ingestion config from data-layer
  const dataLayerUrl = await resolveDataLayerUrl();
  const dataLayerClient = createDataLayerApiClient({
    baseUrl: dataLayerUrl,
    signRequests: true,
  });
  const ingestionConfig = await dataLayerClient.getIngestionConfig(
    tenant,
    orgKey
  );

  if (!ingestionConfig) {
    throw new Error(
      `No ingestion config found for org ${orgKey} in tenant ${tenant}`
    );
  }

  // 2. Fetch API key from Secrets Manager
  const secretsManager = createSecretsManagerAdaptor();
  const secret = await secretsManager.getIngestionSecret(
    ingestionConfig.secretArn
  );

  // 3. Create API adaptor and run initialisation
  const tableName = getEnv('DYNAMODB_TABLE_NAME');

  const databaseAdaptor = createDynamoDbAdaptor({ tableName });
  const ascentApiAdaptor = createApiAdaptor({
    baseUrl: ingestionConfig.baseUrl,
    apiKey: secret.apiKey,
    profileId: ingestionConfig.profileId,
  });

  const ingest = createInitialiseIngestionUseCase({
    saveNewIngestionRun: databaseAdaptor.saveNewIngestionRun,
    updateIngestionRun: databaseAdaptor.upsertIngestionRun,
    getRegulators: ascentApiAdaptor.getRegulators,
  });

  const ingestionRun = await ingest.execute({
    providerName: 'ascent',
    orgKey,
    tenant,
  });

  // Return a non-secret reference for downstream steps to resolve the key themselves
  const apiRef: AscentApiReference = {
    secretArn: ingestionConfig.secretArn,
    baseUrl: ingestionConfig.baseUrl,
    profileId: ingestionConfig.profileId,
  };

  return { ingestionRun, apiRef };
};
