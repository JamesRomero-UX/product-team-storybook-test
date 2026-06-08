import type {
  DynamoDBClientConfig,
  QueryCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  BatchGetCommand,
  BatchWriteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import type { Obligation, RegulatorId } from 'src/domain/types';
import {
  type IngestionRun,
  type IngestionRunId,
  ingestionRunIdSchema,
  ingestionRunSchema,
  type NewIngestionRun,
  obligationSchema,
} from 'src/domain/types';
import {
  type ObligationChange,
  obligationChangeSchema,
} from 'src/domain/types/obligation-change';
import { v7 as uuidv7 } from 'uuid';
import z from 'zod';

const obligationHashSchema = z.object({
  externalId: z.string(),
  contentHash: z.string(),
});

// DynamoDB key construction helpers
const keys = {
  run: {
    // For fetching a run by ID: pk=RUN#{id}, sk=RUN#{id}
    byId: (id: IngestionRunId) => ({
      pk: `RUN#${id}`,
      sk: `RUN#${id}`,
    }),

    // For indexing runs by provider: RUN#${orgKey}#${providerName}, sk=RUN#{id}
    byOrgProvider: (
      orgKey: string,
      providerName: string,
      id: IngestionRunId
    ) => ({
      pk: `RUN#${orgKey}#${providerName}`,
      sk: `RUN#${id}`,
    }),

    // For querying all runs by provider (returns pk and sk prefix)
    queryByOrgProvider: (orgKey: string, providerName: string) => ({
      pk: `RUN#${orgKey}#${providerName}`,
      skPrefix: 'RUN#',
    }),
  },

  obligation: {
    // For specific obligation: pk=RUN#{runId}, sk=REGULATOR#{regId}#OBLIGATION#{extId}
    byExternalId: (
      runId: IngestionRunId,
      regulatorId: RegulatorId | string,
      externalId: string
    ) => ({
      pk: `RUN#${runId}`,
      sk: `REGULATOR#${regulatorId}#OBLIGATION#${externalId}`,
    }),

    // For querying obligations by regulator (returns pk and sk prefix)
    queryByRegulator: (
      runId: IngestionRunId,
      regulatorId: RegulatorId | string
    ) => ({
      pk: `RUN#${runId}`,
      skPrefix: `REGULATOR#${regulatorId}#OBLIGATION#`,
    }),
  },

  obligation_change: {
    // For specific obligation change: pk=RUN#{runId}, sk=REGULATOR#{regId}#OBLIGATION_CHANGE#{extId}
    byExternalId: (
      runId: IngestionRunId,
      regulatorId: RegulatorId | string,
      externalId: string
    ) => ({
      pk: `RUN#${runId}`,
      sk: `REGULATOR#${regulatorId}#OBLIGATION_CHANGE#${externalId}`,
    }),

    // For querying obligation changes by regulator (returns pk and sk prefix)
    queryByRegulator: (
      runId: IngestionRunId,
      regulatorId: RegulatorId | string
    ) => ({
      pk: `RUN#${runId}`,
      skPrefix: `REGULATOR#${regulatorId}#OBLIGATION_CHANGE#`,
    }),
  },
} as const;

export const createDynamoDbAdaptor = (config: {
  tableName: string;
  credentials?: DynamoDBClientConfig;
}) => {
  const client = new DynamoDBClient(config.credentials ?? {});
  const ddbDocClient = DynamoDBDocumentClient.from(client);

  const batchWriteWithRetry = async (
    items: Record<string, unknown>[],
    maxRetries = 3
  ): Promise<void> => {
    let unprocessedItems = items;
    let attempt = 0;

    while (unprocessedItems.length > 0 && attempt < maxRetries) {
      const batch = unprocessedItems.slice(0, 25);

      const result = await ddbDocClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [config.tableName]: batch.map((item) => ({
              PutRequest: { Item: item },
            })),
          },
        })
      );

      // Check for unprocessed items
      const unprocessed = result.UnprocessedItems?.[config.tableName];

      if (!unprocessed || unprocessed.length === 0) {
        // Success - move to next batch
        unprocessedItems = unprocessedItems.slice(25);
        attempt = 0; // Reset retry counter for next batch
      } else {
        // Extract items that failed
        unprocessedItems = unprocessed.map(
          // BatchWrite unprocessed items are Record<string, AttributeValue>; widening to Record<string, unknown> to match the internal loop type.
          (req) => req.PutRequest!.Item as Record<string, unknown>
        );
        attempt++;

        if (attempt < maxRetries) {
          // Exponential backoff: 100ms, 200ms, 400ms
          await new Promise((resolve) =>
            setTimeout(resolve, 100 * Math.pow(2, attempt))
          );
        }
      }
    }

    if (unprocessedItems.length > 0) {
      throw new Error(
        `Failed to write ${unprocessedItems.length} items after ${maxRetries} retries`
      );
    }
  };

  const upsertIngestionRun = async (
    ingestionRun: IngestionRun
  ): Promise<IngestionRun> => {
    const providerItem = {
      ...keys.run.byOrgProvider(
        ingestionRun.orgKey,
        ingestionRun.providerName,
        ingestionRun.id
      ),
      phaseType: ingestionRun.phase.type,
    };

    const idLookupItem = {
      ...keys.run.byId(ingestionRun.id),
      ...ingestionRun,
    };

    const command = new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: config.tableName,
            Item: providerItem,
          },
        },
        {
          Put: {
            TableName: config.tableName,
            Item: idLookupItem,
          },
        },
      ],
    });

    await ddbDocClient.send(command);

    return ingestionRun;
  };

  const saveNewIngestionRun = async (
    newIngestionRun: NewIngestionRun
  ): Promise<IngestionRun> => {
    const ingestionRun = ingestionRunSchema.parse({
      ...newIngestionRun,

      id: uuidv7(),
    });

    return upsertIngestionRun(ingestionRun);
  };

  const getIngestionRun = async (
    ingestionRunId: IngestionRunId
  ): Promise<IngestionRun | null> => {
    const command = new GetCommand({
      TableName: config.tableName,
      Key: keys.run.byId(ingestionRunId),
    });

    const result = await ddbDocClient.send(command);

    const item = result.Item;
    if (!item) {
      return null;
    }

    return ingestionRunSchema.parse(item);
  };

  const getLastSuccessfulIngestionRun = async (
    orgKey: string,
    providerName: string
  ): Promise<IngestionRun | null> => {
    const { pk, skPrefix } = keys.run.queryByOrgProvider(orgKey, providerName);

    const result = await ddbDocClient.send(
      new QueryCommand({
        TableName: config.tableName,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        FilterExpression: '#phaseType = :phaseType',
        ExpressionAttributeNames: {
          '#phaseType': 'phaseType',
        },
        ExpressionAttributeValues: {
          ':pk': pk,
          ':sk': skPrefix,
          ':phaseType': 'completed',
        },
        ScanIndexForward: false, // descending order
      })
    );

    if (!result.Items?.length || result.Items[0] === undefined) {
      return null;
    }

    const item = z
      .object({
        sk: z.string(),
      })
      .parse(result.Items[0]);

    // We only have minimal data, need to fetch full run
    const runId = ingestionRunIdSchema.parse(item.sk.replace('RUN#', ''));

    return getIngestionRun(runId);
  };

  const saveObligations = async (
    ingestionRunId: IngestionRunId,
    newObligations: Obligation[]
  ): Promise<Obligation[]> => {
    const items = newObligations.map((obligation) => {
      return {
        ...keys.obligation.byExternalId(
          ingestionRunId,
          obligation.externalRegulatorId,
          obligation.externalId
        ),
        ...obligation,
      };
    });

    await batchWriteWithRetry(items);

    return newObligations;
  };

  const saveObligationChanges = async (
    ingestionRunId: IngestionRunId,
    obligationChanges: ObligationChange[]
  ): Promise<ObligationChange[]> => {
    const items = obligationChanges.map((change) => {
      return {
        ...keys.obligation_change.byExternalId(
          ingestionRunId,
          change.regulatorId,
          change.externalId
        ),
        ...change,
      };
    });
    await batchWriteWithRetry(items);

    return obligationChanges;
  };

  /**
   * Get obligation hashes for a specific regulator within a run.
   * Uses KeyConditionExpression with the regulator prefix for efficient queries.
   */
  const getObligationHashesForRegulator = async (
    ingestionRunId: IngestionRunId,
    regulatorId: RegulatorId
  ): Promise<{ externalId: string; contentHash: string }[]> => {
    const { pk, skPrefix } = keys.obligation.queryByRegulator(
      ingestionRunId,
      regulatorId
    );

    return await getHashesForRegulator(pk, skPrefix);
  };

  /**
   * Get obligation change hashes for a specific regulator within a run.
   * Uses KeyConditionExpression with the regulator prefix for efficient queries.
   */
  const getObligationChangeHashesForRegulator = async (
    ingestionRunId: IngestionRunId,
    regulatorId: RegulatorId
  ): Promise<{ externalId: string; contentHash: string }[]> => {
    const { pk, skPrefix } = keys.obligation_change.queryByRegulator(
      ingestionRunId,
      regulatorId
    );

    return await getHashesForRegulator(pk, skPrefix);
  };

  const getHashesForRegulator = async (
    pk: string,
    skPrefix: string
  ): Promise<{ externalId: string; contentHash: string }[]> => {
    const hashes: { externalId: string; contentHash: string }[] = [];
    let lastEvaluatedKey: QueryCommandOutput['LastEvaluatedKey'] | undefined;

    do {
      const result = await ddbDocClient.send(
        new QueryCommand({
          TableName: config.tableName,
          KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
          ProjectionExpression: '#externalId, #contentHash',
          ExpressionAttributeNames: {
            '#externalId': 'externalId',
            '#contentHash': 'contentHash',
          },
          ExpressionAttributeValues: {
            ':pk': pk,
            ':sk': skPrefix,
          },
          ExclusiveStartKey: lastEvaluatedKey,
          Limit: 5000,
        })
      );

      if (result.Items) {
        hashes.push(
          ...result.Items.map((item) => obligationHashSchema.parse(item))
        );
      }

      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return hashes;
  };

  const batchGetByExternalIds = async <T>(
    externalIds: string[],
    buildKey: (externalId: string) => Record<string, unknown>,
    parseItem: (item: Record<string, unknown>) => T,
    itemTypeName: string,
    maxRetries = 5
  ): Promise<T[]> => {
    if (externalIds.length === 0) {
      return [];
    }

    const results: T[] = [];

    // BatchGetItem has a limit of 100 keys per request
    for (let i = 0; i < externalIds.length; i += 100) {
      const chunk = externalIds.slice(i, i + 100);
      let unprocessedKeys: Record<string, unknown>[] | undefined =
        chunk.map(buildKey);
      let attempt = 0;

      while (unprocessedKeys && unprocessedKeys.length > 0) {
        if (attempt >= maxRetries) {
          throw new Error(
            `Failed to fetch ${unprocessedKeys.length} ${itemTypeName} after ${maxRetries} retries`
          );
        }

        if (attempt > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, 100 * Math.pow(2, attempt))
          );
        }

        const result = await ddbDocClient.send(
          new BatchGetCommand({
            RequestItems: {
              [config.tableName]: {
                Keys: unprocessedKeys,
              },
            },
          })
        );

        const responses = result.Responses?.[config.tableName];
        if (responses) {
          results.push(...responses.map(parseItem));
        }

        // Keys from UnprocessedKeys is Record<string, AttributeValue>[]; widening to Record<string, unknown>[]
        // to match the internal type used throughout this batch-get retry loop.
        unprocessedKeys = result.UnprocessedKeys?.[config.tableName]?.Keys as
          | Record<string, unknown>[]
          | undefined;
        attempt++;
      }
    }

    return results;
  };

  const getObligationsByRegulator = async (
    ingestionRunId: IngestionRunId,
    regulatorId: RegulatorId,
    externalIds: string[],
    maxRetries = 5
  ): Promise<Obligation[]> => {
    return batchGetByExternalIds(
      externalIds,
      (externalId) =>
        keys.obligation.byExternalId(ingestionRunId, regulatorId, externalId),
      (item) => obligationSchema.parse(item),
      'obligations',
      maxRetries
    );
  };

  const getObligationChangesByRegulator = async (
    ingestionRunId: IngestionRunId,
    regulatorId: RegulatorId,
    externalIds: string[],
    maxRetries = 5
  ): Promise<ObligationChange[]> => {
    return batchGetByExternalIds(
      externalIds,
      (externalId) =>
        keys.obligation_change.byExternalId(
          ingestionRunId,
          regulatorId,
          externalId
        ),
      (item) => obligationChangeSchema.parse(item),
      'obligation changes',
      maxRetries
    );
  };

  return {
    saveNewIngestionRun,
    getIngestionRun,
    getLastSuccessfulIngestionRun,
    upsertIngestionRun,

    saveObligations,
    saveObligationChanges,
    getObligationHashesForRegulator,
    getObligationChangeHashesForRegulator,
    getObligationsByRegulator,
    getObligationChangesByRegulator,
  };
};
