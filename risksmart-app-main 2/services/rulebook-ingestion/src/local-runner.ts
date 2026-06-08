/* eslint-disable no-console */
import 'dotenv/config';

import { randomUUID } from 'node:crypto';

import { RulebookEvent } from '@risksmart-app/events/src/types/common';
import type { ExternalObligationsUpdatedEvent } from '@risksmart-app/events/src/types/org-events';
import { createApiAdaptor } from 'src/adaptors/ascent/api-adaptor';
import { createExtractRuleHierarchy } from 'src/adaptors/ascent/extract-rule-hierarchy';
import { createPrefetchStorageAdaptor } from 'src/adaptors/ascent/prefetch-storage-adaptor';
import { createDataLayerApiClient } from 'src/adaptors/data-layer-api-client';
import { createDynamoDbAdaptor } from 'src/adaptors/database/dynamo-adaptor';
import { createLocalEventBridgeAdaptor } from 'src/adaptors/local-event-bridge-adaptor';
import { createS3Adaptor } from 'src/adaptors/s3-adaptor';
import { createSecretsManagerAdaptor } from 'src/adaptors/secrets-manager-adaptor';
import { createFetchAllObligationChangesByRegulator } from 'src/domain/services/ascent/fetch-all-obligation-changes-by-regulator';
import { createFetchAllTasksByRegulator } from 'src/domain/services/ascent/fetch-all-tasks-by-regulator';
import { createAscentRegulatorIngestionService } from 'src/domain/services/ascent/ingest-rules';
import { createChangeDetectionService } from 'src/domain/services/change-detection-service';
import type { IngestionRun } from 'src/domain/types';
import { createChangeDetectionUseCase } from 'src/use-cases/change-detection';
import { createConcludeIngestionUseCase } from 'src/use-cases/conclude-ingestion';
import { createIngestAscentRulebooksUseCase } from 'src/use-cases/ingest-ascent-rulebooks';
import { createIngestObligationChangesUseCase } from 'src/use-cases/ingest-obligation-changes';
import { createInitialiseIngestionUseCase } from 'src/use-cases/initialise-ingestion';
import { createPrefetchTasksUseCase } from 'src/use-cases/prefetch-tasks';
import { runIngestionPipeline } from 'test/pipeline/run-pipeline';

// ─── CLI Argument Parsing ────────────────────────────────────────────

const parseArgs = (): { orgKey: string; tenant: string } => {
  const args = process.argv.slice(2);
  let orgKey = process.env.ORG_KEY;
  let tenant = process.env.TENANT;

  for (const arg of args) {
    const [key, value] = arg.split('=');
    if (key === '--org-key' && value) {
      orgKey = value;
    }
    if (key === '--tenant' && value) {
      tenant = value;
    }
  }

  if (!orgKey || !tenant) {
    console.error(
      'Usage: pnpm run:local -- --org-key=<org-key> --tenant=<tenant>'
    );
    console.error(
      '  Or set ORG_KEY and TENANT environment variables in .env.local'
    );
    process.exit(1);
  }

  return { orgKey, tenant };
};

// ─── Environment Helpers ─────────────────────────────────────────────

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }

  return value;
};

// ─── Progress Logging ────────────────────────────────────────────────

const onProgress = (step: string, detail?: string): void => {
  switch (step) {
    case 'initialise':
      console.log('\n[1/6] Initialising ingestion run...');
      break;
    case 'prefetch':
      console.log('\n[2/6] Prefetching tasks...');
      break;
    case 'ingest':
      console.log('\n[3-4/6] Ingesting rulebooks and obligation changes...');
      break;
    case 'ingest:regulator':
      console.log(`  Ingesting: ${detail}`);
      break;
    case 'detect-changes':
      console.log('\n[5/6] Detecting changes...');
      break;
    case 'detect-changes:regulator':
      console.log(`  Detecting changes: ${detail}`);
      break;
    case 'conclude':
      console.log('\n[6/6] Concluding ingestion...');
      break;
  }
};

// ─── Main ────────────────────────────────────────────────────────────

const main = async () => {
  const { orgKey, tenant } = parseArgs();

  const dynamoEndpoint = requireEnv('DYNAMODB_ENDPOINT');
  const s3Endpoint = requireEnv('S3_ENDPOINT');
  const tableName = requireEnv('DYNAMODB_TABLE_NAME');
  const taskStorageBucketName = requireEnv('TASK_STORAGE_BUCKET_NAME');
  const changesBucketName = requireEnv('CHANGES_BUCKET_NAME');
  const eventRouterPort = process.env.EVENT_ROUTER_PORT ?? '3010';
  const eventRouterUrl = `http://localhost:${eventRouterPort}/`;

  console.log('=== Rulebook Ingestion Local Runner ===');
  console.log(`  Org Key:      ${orgKey}`);
  console.log(`  Tenant:       ${tenant}`);
  console.log(`  DynamoDB:     ${dynamoEndpoint}`);
  console.log(`  S3 (RustFS):  ${s3Endpoint}`);
  console.log(`  Event Router: ${eventRouterUrl}`);

  // ─── Local infrastructure credentials ──────────────────────────────

  const localCredentials = {
    endpoint: dynamoEndpoint,
    region: process.env.AWS_REGION ?? 'eu-west-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'local',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'local',
    },
  };

  const localS3Credentials = {
    forcePathStyle: true,
    endpoint: s3Endpoint,
    region: process.env.AWS_REGION ?? 'eu-west-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'local',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'local',
    },
  };

  // ─── Create adaptors ──────────────────────────────────────────────

  const databaseAdaptor = createDynamoDbAdaptor({
    tableName,
    credentials: localCredentials,
  });

  const taskStorageAdaptor = createPrefetchStorageAdaptor({
    bucketName: taskStorageBucketName,
    credentials: localS3Credentials,
  });

  const s3Adaptor = createS3Adaptor({
    bucketName: changesBucketName,
    credentials: localS3Credentials,
  });

  const localEventBridgeAdaptor = createLocalEventBridgeAdaptor({
    eventRouterUrl,
    source: 'rulebook-ingestion-service',
  });

  // ─── Fetch ingestion config ────────────────────────────────────────

  console.log('\nFetching ingestion config...');

  const dataLayerApiUrl = requireEnv('DATA_LAYER_API_URL');
  const dataLayerClient = createDataLayerApiClient({
    baseUrl: dataLayerApiUrl,
    signRequests: false,
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

  const secretsManager = createSecretsManagerAdaptor();
  const secret = await secretsManager.getIngestionSecret(
    ingestionConfig.secretArn
  );

  const ascentApiAdaptor = createApiAdaptor({
    baseUrl: ingestionConfig.baseUrl,
    apiKey: secret.apiKey,
    profileId: ingestionConfig.profileId,
  });

  // ─── Compose use cases ────────────────────────────────────────────

  const emitChangeEvent = async (
    run: IngestionRun,
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
        tenant: run.tenant,
        orgKey: run.orgKey,
        userId: 'SYSTEM',
      },
    };

    await localEventBridgeAdaptor.emitRulesUpdatedMessage(changeEvent);
  };

  const { extractRuleHierarchy } = createExtractRuleHierarchy();

  const useCases = {
    initialiseIngestionRun: createInitialiseIngestionUseCase({
      saveNewIngestionRun: databaseAdaptor.saveNewIngestionRun,
      updateIngestionRun: databaseAdaptor.upsertIngestionRun,
      getRegulators: ascentApiAdaptor.getRegulators,
    }),
    prefetchTasks: createPrefetchTasksUseCase({
      getIngestionRun: databaseAdaptor.getIngestionRun,
      updateIngestionRun: databaseAdaptor.upsertIngestionRun,
      fetchAllTasksByRegulator: createFetchAllTasksByRegulator({
        getTasks: ascentApiAdaptor.getTasks,
      }),
      persistTasksByRegulator: taskStorageAdaptor.persistTasksByRegulator,
      fetchAllObligationChangesByRegulator:
        createFetchAllObligationChangesByRegulator({
          getObligationChanges: ascentApiAdaptor.getTaskVersions,
        }),
      persistObligationChangesByRegulator:
        taskStorageAdaptor.persistObligationChangesByRegulator,
    }),
    ingestRulebooks: createIngestAscentRulebooksUseCase({
      getIngestionRun: databaseAdaptor.getIngestionRun,
      updateIngestionRun: databaseAdaptor.upsertIngestionRun,
      loadRegulatorTasks: taskStorageAdaptor.loadRegulatorTasks,
      ingestRegulatorData: createAscentRegulatorIngestionService({
        getRegulatorRules: ascentApiAdaptor.getRegulatorRules,
        saveObligations: databaseAdaptor.saveObligations,
        extractRuleHierarchy,
      }),
    }),
    ingestObligationChanges: createIngestObligationChangesUseCase({
      getIngestionRun: databaseAdaptor.getIngestionRun,
      saveIngestionRun: databaseAdaptor.upsertIngestionRun,
      loadRegulatorObligationChanges:
        taskStorageAdaptor.loadObligationChangesByRegulator,
      saveObligationChanges: databaseAdaptor.saveObligationChanges,
    }),
    changeDetection: createChangeDetectionUseCase({
      getIngestionRun: databaseAdaptor.getIngestionRun,
      saveIngestionRun: databaseAdaptor.upsertIngestionRun,
      getLastSuccessfulIngestionRun:
        databaseAdaptor.getLastSuccessfulIngestionRun,
      detectChangesForObligations: createChangeDetectionService({
        getHashesForRegulator: databaseAdaptor.getObligationHashesForRegulator,
        getByRegulator: databaseAdaptor.getObligationsByRegulator,
      }),
      detectChangesForObligationChanges: createChangeDetectionService({
        getHashesForRegulator:
          databaseAdaptor.getObligationChangeHashesForRegulator,
        getByRegulator: databaseAdaptor.getObligationChangesByRegulator,
      }),
      exportRegulatorChanges: s3Adaptor.exportRegulatorChanges,
    }),
    concludeIngestion: createConcludeIngestionUseCase({
      getIngestionRun: databaseAdaptor.getIngestionRun,
      saveIngestionRun: databaseAdaptor.upsertIngestionRun,
      exportManifest: s3Adaptor.exportManifest,
      emitChangeEvent,
    }),
  };

  // ─── Run pipeline ─────────────────────────────────────────────────

  const { ingestionRunId, manifestEntries, manifestLocation } =
    await runIngestionPipeline(useCases, {
      orgKey,
      tenant,
      providerName: 'ascent',
      onProgress,
    });

  // ─── Summary ──────────────────────────────────────────────────────

  console.log('\n=== Ingestion Complete ===');
  console.log(`  Run ID:            ${ingestionRunId}`);
  console.log(`  Manifest Location: ${manifestLocation}`);

  for (const entry of manifestEntries) {
    console.log(`\n  Regulator: ${entry.name}`);
    console.log(
      `    obligations: +${entry.obligations.added} ~${entry.obligations.updated} -${entry.obligations.removed}`
    );

    console.log(
      `    obligationChanges: +${entry.obligationChanges.added} ~${entry.obligationChanges.updated} -${entry.obligationChanges.removed}`
    );
  }
};

main().catch((error) => {
  console.error('\nIngestion failed:', error);
  process.exit(1);
});
