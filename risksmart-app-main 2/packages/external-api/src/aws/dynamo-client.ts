import {
  DynamoDB,
  DynamoDBClient as DynamoClient,
} from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

import type {
  DeleteItemParams,
  DynamoDBClient,
  GetItemParams,
  PutItemParams,
  QueryParams,
  UpdateItemParams,
} from '../types/dynamo-client';
import { logger } from '../utils/logger';

interface AWSDynamoDBClientProps {
  endpoint?: string;
}

export class AWSDynamoDBClient implements DynamoDBClient {
  private docClient: DynamoDBDocumentClient;
  private dynamoDBClient: DynamoClient;
  public dynamoDB: DynamoDB;

  constructor(props?: AWSDynamoDBClientProps) {
    this.dynamoDBClient = new DynamoClient(
      props?.endpoint ? { endpoint: props.endpoint } : {}
    );
    this.docClient = DynamoDBDocumentClient.from(this.dynamoDBClient);
    this.dynamoDB = new DynamoDB(
      props?.endpoint ? { endpoint: props.endpoint } : {}
    );
  }

  async putItem(params: PutItemParams): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: params.tableName,
        Item: params.item,
        ...(params.conditionExpression && {
          ConditionExpression: params.conditionExpression,
        }),
      });

      await this.docClient.send(command);

      logger.debug(
        {
          operation: 'putItem',
          tableName: params.tableName,
        },
        'Successfully put item to DynamoDB'
      );
    } catch (error) {
      logger.error(
        {
          operation: 'putItem',
          tableName: params.tableName,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to put item to DynamoDB'
      );
      throw error;
    }
  }

  async getItem<T>(params: GetItemParams): Promise<T | null> {
    try {
      const command = new GetCommand({
        TableName: params.tableName,
        Key: params.key,
      });

      const response = await this.docClient.send(command);

      logger.debug(
        {
          operation: 'getItem',
          tableName: params.tableName,
          found: !!response.Item,
        },
        'Executed get item from DynamoDB'
      );

      return (response.Item as T) || null;
    } catch (error) {
      logger.error(
        {
          operation: 'getItem',
          tableName: params.tableName,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to get item from DynamoDB'
      );
      throw error;
    }
  }

  async query<T>(params: QueryParams): Promise<T[]> {
    try {
      const command = new QueryCommand({
        TableName: params.tableName,
        KeyConditionExpression: params.keyConditionExpression,
        ...(params.expressionAttributeValues && {
          ExpressionAttributeValues: params.expressionAttributeValues,
        }),
        ...(params.expressionAttributeNames && {
          ExpressionAttributeNames: params.expressionAttributeNames,
        }),
        ...(params.indexName && { IndexName: params.indexName }),
        ...(params.limit && { Limit: params.limit }),
        ...(params.projectionExpression && {
          ProjectionExpression: params.projectionExpression,
        }),
      });

      const response = await this.docClient.send(command);

      logger.debug(
        {
          operation: 'query',
          tableName: params.tableName,
          query: params,
          itemCount: response.Items?.length || 0,
        },
        'Successfully queried items from DynamoDB'
      );

      return (response.Items as T[]) || [];
    } catch (error) {
      logger.error(
        {
          operation: 'query',
          tableName: params.tableName,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to query items from DynamoDB'
      );
      throw error;
    }
  }

  async updateItem(params: UpdateItemParams): Promise<void> {
    try {
      const command = new UpdateCommand({
        TableName: params.tableName,
        Key: params.key,
        UpdateExpression: params.updateExpression,
        ...(params.expressionAttributeValues && {
          ExpressionAttributeValues: params.expressionAttributeValues,
        }),
        ...(params.expressionAttributeNames && {
          ExpressionAttributeNames: params.expressionAttributeNames,
        }),
        ...(params.conditionExpression && {
          ConditionExpression: params.conditionExpression,
        }),
      });

      await this.docClient.send(command);

      logger.debug(
        {
          operation: 'updateItem',
          tableName: params.tableName,
        },
        'Successfully updated item in DynamoDB'
      );
    } catch (error) {
      logger.error(
        {
          operation: 'updateItem',
          tableName: params.tableName,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to update item in DynamoDB'
      );
      throw error;
    }
  }

  async deleteItem(params: DeleteItemParams): Promise<void> {
    try {
      const command = new DeleteCommand({
        TableName: params.tableName,
        Key: params.key,
        ...(params.conditionExpression && {
          ConditionExpression: params.conditionExpression,
        }),
      });

      await this.docClient.send(command);

      logger.debug(
        {
          operation: 'deleteItem',
          tableName: params.tableName,
        },
        'Successfully deleted item from DynamoDB'
      );
    } catch (error) {
      logger.error(
        {
          operation: 'deleteItem',
          tableName: params.tableName,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to delete item from DynamoDB'
      );
      throw error;
    }
  }
}
