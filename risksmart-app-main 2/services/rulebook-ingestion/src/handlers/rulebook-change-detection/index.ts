import type { Handler } from 'aws-lambda';
import { createDynamoDbAdaptor } from 'src/adaptors/database/dynamo-adaptor';
import { createS3Adaptor } from 'src/adaptors/s3-adaptor';
import { createChangeDetectionService } from 'src/domain/services/change-detection-service';
import type {
  IngestionRun,
  ManifestRegulatorEntry,
  RegulatorId,
} from 'src/domain/types';
import { getEnv } from 'src/lib';
import { getLogger } from 'src/logger';
import { createChangeDetectionUseCase } from 'src/use-cases/change-detection';

const logger = getLogger();

export const handler: Handler<
  { ingestionRun: IngestionRun; regulatorId: RegulatorId },
  { ingestionRun: IngestionRun; manifestEntry: ManifestRegulatorEntry }
> = async (event) => {
  logger.info('Starting rulebook-change-detection handler', {
    ingestionRunId: event.ingestionRun.id,
    regulatorId: event.regulatorId,
    event,
  });

  const tableName = getEnv('DYNAMODB_TABLE_NAME');

  const databaseAdaptor = createDynamoDbAdaptor({
    tableName,
  });

  const s3Adaptor = createS3Adaptor({
    bucketName: getEnv('CHANGES_BUCKET_NAME'),
  });

  const detectChangesForObligations = createChangeDetectionService({
    getHashesForRegulator: databaseAdaptor.getObligationHashesForRegulator,
    getByRegulator: databaseAdaptor.getObligationsByRegulator,
  });

  const detectChangesForObligationChanges = createChangeDetectionService({
    getHashesForRegulator:
      databaseAdaptor.getObligationChangeHashesForRegulator,
    getByRegulator: databaseAdaptor.getObligationChangesByRegulator,
  });

  const detectChanges = createChangeDetectionUseCase({
    getIngestionRun: databaseAdaptor.getIngestionRun,
    saveIngestionRun: databaseAdaptor.upsertIngestionRun,
    getLastSuccessfulIngestionRun:
      databaseAdaptor.getLastSuccessfulIngestionRun,
    detectChangesForObligations,
    detectChangesForObligationChanges,
    exportRegulatorChanges: s3Adaptor.exportRegulatorChanges,
  });

  return detectChanges.execute(event.ingestionRun.id, event.regulatorId);
};
