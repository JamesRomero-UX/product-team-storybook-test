import type { Handler } from 'aws-lambda';
import {
  type AscentApiReference,
  createApiAdaptor,
} from 'src/adaptors/ascent/api-adaptor';
import { createPrefetchStorageAdaptor } from 'src/adaptors/ascent/prefetch-storage-adaptor';
import { createDynamoDbAdaptor } from 'src/adaptors/database/dynamo-adaptor';
import { createSecretsManagerAdaptor } from 'src/adaptors/secrets-manager-adaptor';
import { createFetchAllObligationChangesByRegulator } from 'src/domain/services/ascent/fetch-all-obligation-changes-by-regulator';
import { createFetchAllTasksByRegulator } from 'src/domain/services/ascent/fetch-all-tasks-by-regulator';
import type { IngestionRun } from 'src/domain/types';
import { getEnv } from 'src/lib';
import { createPrefetchTasksUseCase } from 'src/use-cases/prefetch-tasks';

export const handler: Handler<
  { ingestionRun: IngestionRun; apiRef: AscentApiReference },
  { ingestionRun: IngestionRun; apiRef: AscentApiReference }
> = async ({ ingestionRun, apiRef }) => {
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

  const fetchAllTasksByRegulator = createFetchAllTasksByRegulator({
    getTasks: ascentApiAdaptor.getTasks,
  });

  const fetchAllObligationChangesByRegulator =
    createFetchAllObligationChangesByRegulator({
      getObligationChanges: ascentApiAdaptor.getTaskVersions,
    });

  const taskStorageAdaptor = createPrefetchStorageAdaptor({
    bucketName: getEnv('TASK_STORAGE_BUCKET_NAME'),
  });

  const prefetch = createPrefetchTasksUseCase({
    getIngestionRun: databaseAdaptor.getIngestionRun,
    updateIngestionRun: databaseAdaptor.upsertIngestionRun,
    fetchAllTasksByRegulator,
    persistTasksByRegulator: taskStorageAdaptor.persistTasksByRegulator,
    fetchAllObligationChangesByRegulator: fetchAllObligationChangesByRegulator,
    persistObligationChangesByRegulator:
      taskStorageAdaptor.persistObligationChangesByRegulator,
  });

  const updatedIngestionRun = await prefetch.execute(ingestionRun.id);

  return { ingestionRun: updatedIngestionRun, apiRef };
};
