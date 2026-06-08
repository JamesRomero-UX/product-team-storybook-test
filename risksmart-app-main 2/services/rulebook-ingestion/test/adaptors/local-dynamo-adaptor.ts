import {
  DynamoDBClient,
  type DynamoDBClientConfig,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { getEnv } from '@risksmart-app/shared/src/utils/environment';
import type {
  IngestionRun,
  IngestionRunId,
  Obligation,
} from 'src/domain/types';
import { ingestionRunSchema, obligationSchema } from 'src/domain/types';
import {
  type ObligationChange,
  obligationChangeSchema,
} from 'src/domain/types/obligation-change';

export const localDynamoConfiguration: {
  tableName: string;
  credentials: DynamoDBClientConfig;
} = {
  tableName: 'RulebookIngestion',
  credentials: {
    endpoint: getEnv('DYNAMODB_ENDPOINT'),
    region: getEnv('AWS_REGION'),
    credentials: {
      accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
      secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
    },
  },
};

const client = new DynamoDBClient({
  ...localDynamoConfiguration.credentials,
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

export const getRunById = async (id: IngestionRunId): Promise<IngestionRun> => {
  const command = new GetCommand({
    TableName: localDynamoConfiguration.tableName,
    Key: {
      pk: `RUN#${id}`,
      sk: `RUN#${id}`,
    },
  });

  const result = await ddbDocClient.send(command);

  const run = result.Item;

  if (!run) {
    throw new Error('Ingestion run not found');
  }

  return ingestionRunSchema.parse(run);
};

export const getAllObligations = async (
  ingestionRunId: IngestionRunId
): Promise<Obligation[]> => {
  const items: Obligation[] = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  do {
    const result = await ddbDocClient.send(
      new QueryCommand({
        TableName: localDynamoConfiguration.tableName,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
          ':pk': `RUN#${ingestionRunId}`,
          ':sk': 'REGULATOR#',
        },
        ExclusiveStartKey: lastEvaluatedKey,
      })
    );

    items.push(
      ...(result.Items?.filter(
        (item) => !String(item.sk).includes('#OBLIGATION_CHANGE#')
      ).map((item) => obligationSchema.parse(item)) ?? [])
    );

    lastEvaluatedKey = result.LastEvaluatedKey as
      | Record<string, unknown>
      | undefined;
  } while (lastEvaluatedKey);

  return items;
};

export const getAllObligationChanges = async (
  ingestionRunId: IngestionRunId
): Promise<ObligationChange[]> => {
  const items: ObligationChange[] = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  do {
    const result = await ddbDocClient.send(
      new QueryCommand({
        TableName: localDynamoConfiguration.tableName,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
          ':pk': `RUN#${ingestionRunId}`,
          ':sk': 'REGULATOR#',
        },
        ExclusiveStartKey: lastEvaluatedKey,
      })
    );

    items.push(
      ...(result.Items?.filter((item) =>
        String(item.sk).includes('#OBLIGATION_CHANGE#')
      ).map((item) => obligationChangeSchema.parse(item)) ?? [])
    );

    lastEvaluatedKey = result.LastEvaluatedKey as
      | Record<string, unknown>
      | undefined;
  } while (lastEvaluatedKey);

  return items;
};
