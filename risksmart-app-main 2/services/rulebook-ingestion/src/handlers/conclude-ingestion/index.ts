import { randomUUID } from 'node:crypto';

import { RulebookEvent } from '@risksmart-app/events/src/types/common';
import type { ExternalObligationsUpdatedEvent } from '@risksmart-app/events/src/types/org-events';
import type { Handler } from 'aws-lambda';
import { createDynamoDbAdaptor } from 'src/adaptors/database/dynamo-adaptor';
import { createEventBridgeAdaptor } from 'src/adaptors/event-bridge-adaptor';
import { createS3Adaptor } from 'src/adaptors/s3-adaptor';
import type { IngestionRun, ManifestRegulatorEntry } from 'src/domain/types';
import { getEnv } from 'src/lib';
import { getLogger } from 'src/logger';
import { createConcludeIngestionUseCase } from 'src/use-cases/conclude-ingestion';

const logger = getLogger();

export const handler: Handler<
  { ingestionRun: IngestionRun; manifestEntries: ManifestRegulatorEntry[] },
  { ingestionRun: IngestionRun; manifestLocation: string }
> = async (event) => {
  const { ingestionRun, manifestEntries } = event;
  logger.info('Starting conclude ingestion handler', {
    ingestionRunId: ingestionRun.id,
  });

  const tableName = getEnv('DYNAMODB_TABLE_NAME');

  const databaseAdaptor = createDynamoDbAdaptor({
    tableName,
  });

  const s3Adaptor = createS3Adaptor({
    bucketName: getEnv('CHANGES_BUCKET_NAME'),
  });

  const eventBridgeAdaptor = createEventBridgeAdaptor({
    eventBusName: getEnv('EVENT_BUS_NAME'),
    source: 'rulebook-ingestion-service',
  });

  const emitChangeEvent = async (
    _ingestionRun: IngestionRun,
    manifestLocation: string
  ): Promise<void> => {
    const changeEvent: ExternalObligationsUpdatedEvent = {
      type: RulebookEvent.ExternalObligationsUpdated,
      data: { location: manifestLocation },
      metadata: {
        eventId: randomUUID(),
        version: '1.0',
        timestamp: new Date().toISOString(),
        domain: 'risksmart.app',
        service: 'rulebook-ingestion-service',
        correlationId: randomUUID(),
        tenant: ingestionRun.tenant,
        orgKey: ingestionRun.orgKey,
        userId: 'SYSTEM',
      },
    };

    await eventBridgeAdaptor.emitRulesUpdatedMessage(changeEvent);
  };

  const concludeIngestion = createConcludeIngestionUseCase({
    getIngestionRun: databaseAdaptor.getIngestionRun,
    saveIngestionRun: databaseAdaptor.upsertIngestionRun,
    exportManifest: s3Adaptor.exportManifest,
    emitChangeEvent,
  });

  return concludeIngestion.execute(ingestionRun.id, manifestEntries);
};
