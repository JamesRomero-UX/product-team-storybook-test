import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// AWS SDK v3 automatically picks up AWS_ENDPOINT_URL_DYNAMODB from the
// environment to redirect requests to a local mock when running locally.
const client = new DynamoDBClient({});

const createDynamoDBClient = () => {
  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });
};

export const dynamoClient = createDynamoDBClient();

export const getTableName = (tenant: string): string => {
  const stage = process.env.STAGE;
  const appName = process.env.APP_NAME;
  const baseTableName = process.env.TENANT_REQUEST_EVENT_TABLE_NAME;

  if (!stage) {
    throw new Error('STAGE environment variable is required');
  }
  if (!appName) {
    throw new Error('APP_NAME environment variable is required');
  }
  if (!baseTableName) {
    throw new Error(
      'TENANT_REQUEST_EVENT_TABLE_NAME environment variable is required'
    );
  }

  const tableName = `${stage}-${appName}-${tenant}-${baseTableName}`;

  return tableName;
};
