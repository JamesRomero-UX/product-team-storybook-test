import type { Handler } from 'aws-lambda';
import {
  type AscentApiReference,
  createApiAdaptor,
} from 'src/adaptors/ascent/api-adaptor';
import { createExtractRuleHierarchy } from 'src/adaptors/ascent/extract-rule-hierarchy';
import { createPrefetchStorageAdaptor } from 'src/adaptors/ascent/prefetch-storage-adaptor';
import { createDynamoDbAdaptor } from 'src/adaptors/database/dynamo-adaptor';
import { createSecretsManagerAdaptor } from 'src/adaptors/secrets-manager-adaptor';
import { createAscentRegulatorIngestionService } from 'src/domain/services/ascent/ingest-rules';
import { type IngestionRun, type RegulatorId } from 'src/domain/types';
import { getEnv } from 'src/lib';
import { createIngestAscentRulebooksUseCase } from 'src/use-cases/ingest-ascent-rulebooks';

export const handler: Handler<
  {
    ingestionRun: IngestionRun;
    regulatorId: RegulatorId;
    apiRef: AscentApiReference;
  },
  IngestionRun
> = async ({ ingestionRun, regulatorId, apiRef }) => {
  const tableName = getEnv('DYNAMODB_TABLE_NAME');

  const databaseAdaptor = createDynamoDbAdaptor({
    tableName,
  });

  const secretsManager = createSecretsManagerAdaptor();
  const secret = await secretsManager.getIngestionSecret(apiRef.secretArn);

  const ascentApiAdaptor = createApiAdaptor({
    baseUrl: apiRef.baseUrl,
    apiKey: secret.apiKey,
    profileId: apiRef.profileId,
  });

  const { extractRuleHierarchy } = createExtractRuleHierarchy();

  const ingestRegulatorData = createAscentRegulatorIngestionService({
    getRegulatorRules: ascentApiAdaptor.getRegulatorRules,
    saveObligations: databaseAdaptor.saveObligations,
    extractRuleHierarchy,
  });

  const taskStorageAdaptor = createPrefetchStorageAdaptor({
    bucketName: getEnv('TASK_STORAGE_BUCKET_NAME'),
  });

  const ingest = createIngestAscentRulebooksUseCase({
    getIngestionRun: databaseAdaptor.getIngestionRun,
    updateIngestionRun: databaseAdaptor.upsertIngestionRun,
    loadRegulatorTasks: taskStorageAdaptor.loadRegulatorTasks,
    ingestRegulatorData,
  });

  return await ingest.execute(ingestionRun.id, regulatorId);
};
