import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

import { getLogger } from '../../logger';
const logger = getLogger();

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

/**
 * @param id
 * @param tableName
 * @returns true if id already exists
 */
export const checkIdempotencyKeyExists = async (
  id: string,
  tableName: string
): Promise<boolean> => {
  try {
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: tableName,
        Key: { id },
      })
    );

    if (result.Item !== undefined && result.Item !== null) {
      logger.info('Idempotency key item found');

      return true;
    }

    return false;
  } catch (err) {
    logger.info('Error getting from dynamoDB', {
      error: err,
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw err;
  }
};

export const setIdempotency = async (
  id: string,
  tableName: string
): Promise<boolean> => {
  try {
    await dynamoDb.send(
      new PutCommand({
        TableName: tableName,
        Item: { id },
        ConditionExpression: 'attribute_not_exists(id)',
      })
    );

    logger.info('Idempotency key added');

    return true;
  } catch (err) {
    if (
      err instanceof Error &&
      err.name === 'ConditionalCheckFailedException'
    ) {
      logger.info('Idempotency key already exists');

      return false;
    }

    logger.info('Error putting to dynamoDB', {
      error: err,
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw err;
  }
};
