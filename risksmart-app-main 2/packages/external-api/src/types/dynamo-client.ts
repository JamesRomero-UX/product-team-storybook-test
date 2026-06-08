export interface PutItemParams {
  tableName: string;
  item: Record<string, unknown>;
  conditionExpression?: string;
}

export interface GetItemParams {
  tableName: string;
  key: Record<string, unknown>;
}

export interface QueryParams {
  tableName: string;
  keyConditionExpression: string;
  expressionAttributeValues?: Record<string, unknown>;
  expressionAttributeNames?: Record<string, string>;
  indexName?: string;
  limit?: number;
  projectionExpression?: string;
}

export interface UpdateItemParams {
  tableName: string;
  key: Record<string, unknown>;
  updateExpression: string;
  expressionAttributeValues?: Record<string, unknown>;
  expressionAttributeNames?: Record<string, string>;
  conditionExpression?: string;
}

export interface DeleteItemParams {
  tableName: string;
  key: Record<string, unknown>;
  conditionExpression?: string;
}

export interface DynamoDBClient {
  putItem(params: PutItemParams): Promise<void>;
  getItem<T = Record<string, unknown>>(
    params: GetItemParams
  ): Promise<T | null>;
  query<T = Record<string, unknown>>(params: QueryParams): Promise<T[]>;
  updateItem(params: UpdateItemParams): Promise<void>;
  deleteItem(params: DeleteItemParams): Promise<void>;
}
