import type { Handler } from 'aws-lambda';
import { createPrefetchStorageAdaptor } from 'src/adaptors/ascent/prefetch-storage-adaptor';
import { createDynamoDbAdaptor } from 'src/adaptors/database/dynamo-adaptor';
import { type IngestionRun, type RegulatorId } from 'src/domain/types';
import { getEnv } from 'src/lib';
import { createIngestObligationChangesUseCase } from 'src/use-cases/ingest-obligation-changes';

export const handler: Handler<
  { ingestionRun: IngestionRun; regulatorId: RegulatorId },
  IngestionRun
> = async ({ ingestionRun, regulatorId }) => {
  const tableName = getEnv('DYNAMODB_TABLE_NAME');

  const databaseAdaptor = createDynamoDbAdaptor({
    tableName,
  });

  const taskStorageAdaptor = createPrefetchStorageAdaptor({
    bucketName: getEnv('TASK_STORAGE_BUCKET_NAME'),
  });

  const useCase = createIngestObligationChangesUseCase({
    getIngestionRun: databaseAdaptor.getIngestionRun,
    saveIngestionRun: databaseAdaptor.upsertIngestionRun,
    loadRegulatorObligationChanges:
      taskStorageAdaptor.loadObligationChangesByRegulator,
    saveObligationChanges: databaseAdaptor.saveObligationChanges,
  });

  return await useCase.execute(ingestionRun.id, regulatorId);
};
