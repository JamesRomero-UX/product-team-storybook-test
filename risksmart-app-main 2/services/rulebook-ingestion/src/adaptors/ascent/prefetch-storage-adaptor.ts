import type { S3ClientConfig } from '@aws-sdk/client-s3';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { IngestionRunId } from 'src/domain/types';
import {
  type NewRawExternalObligation,
  newRawExternalObligationSchema,
  type RegulatorId,
} from 'src/domain/types';
import type { ObligationChange } from 'src/domain/types/obligation-change';
import {
  type NewRawExternalObligationChange,
  newRawExternalObligationChangeSchema,
} from 'src/domain/types/obligation-change';

import { getLogger } from '../../logger';
import { transformTaskVersionToObligationChange } from './transform';

const logger = getLogger();

export const createPrefetchStorageAdaptor = (config: {
  bucketName: string;
  credentials?: S3ClientConfig;
}) => {
  const client = new S3Client(config.credentials || {});

  const getObjectKey = (
    ingestionRunId: IngestionRunId,
    type: 'tasks' | 'obligationChanges',
    regulatorId: string
  ) => {
    return `${ingestionRunId}/prefetch/${type}/${regulatorId}.json`;
  };

  const persist = async (
    key: string,
    data: NewRawExternalObligation[] | NewRawExternalObligationChange[]
  ): Promise<void> => {
    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: 'application/json',
    });

    await client.send(command);
  };

  const persistTasksByRegulator = async (
    ingestionRunId: IngestionRunId,
    tasksByRegulator: Map<string, NewRawExternalObligation[]>
  ): Promise<void> => {
    await Promise.all(
      Array.from(tasksByRegulator.entries()).map(([regulatorId, tasks]) =>
        persist(getObjectKey(ingestionRunId, 'tasks', regulatorId), tasks)
      )
    );
  };

  const persistObligationChangesByRegulator = async (
    ingestionRunId: IngestionRunId,
    obligationChangeByRegulator: Map<string, NewRawExternalObligationChange[]>
  ): Promise<void> => {
    await Promise.all(
      Array.from(obligationChangeByRegulator.entries()).map(
        ([regulatorId, changes]) =>
          persist(
            getObjectKey(ingestionRunId, 'obligationChanges', regulatorId),
            changes
          )
      )
    );
  };

  const loadItemsAsJson = async (key: string): Promise<string | null> => {
    const command = new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    });

    try {
      const response = await client.send(command);
      const body = await response.Body?.transformToString();

      if (!body) {
        logger.info(`S3 object has no body for key.`, {
          key: key,
          bucket: config.bucketName,
        });

        return null;
      }

      return body;
    } catch (error) {
      if (error instanceof Error && error.name === 'NoSuchKey') {
        logger.info(`No S3 object found for key.`, {
          key: key,
          bucket: config.bucketName,
        });

        return null;
      }
      if (error instanceof Error) {
        logger.error(`Error loading tasks from S3 for key.`, {
          key: key,
          bucket: config.bucketName,
          errorMessage: error.message,
        });
      } else {
        logger.error(`Unknown error loading tasks from S3 for key.`, {
          key: key,
          bucket: config.bucketName,
        });
      }

      throw error;
    }
  };

  const loadRegulatorTasks = async (
    ingestionRunId: IngestionRunId,
    regulatorId: RegulatorId
  ): Promise<NewRawExternalObligation[] | null> => {
    const objectKey = getObjectKey(ingestionRunId, 'tasks', regulatorId);

    const json = await loadItemsAsJson(objectKey);
    if (!json) {
      return null;
    }

    return newRawExternalObligationSchema.array().parse(JSON.parse(json));
  };

  const loadObligationChangesByRegulator = async (
    ingestionRunId: IngestionRunId,
    regulatorId: RegulatorId
  ): Promise<ObligationChange[] | null> => {
    const objectKey = getObjectKey(
      ingestionRunId,
      'obligationChanges',
      regulatorId
    );

    const json = await loadItemsAsJson(objectKey);

    if (!json) {
      return null;
    }

    const obligationChanges = newRawExternalObligationChangeSchema
      .array()
      .parse(JSON.parse(json));

    return obligationChanges.map((change) =>
      transformTaskVersionToObligationChange(change, regulatorId)
    );
  };

  return {
    persistTasksByRegulator,
    persistObligationChangesByRegulator,
    loadRegulatorTasks,
    loadObligationChangesByRegulator,
  };
};
