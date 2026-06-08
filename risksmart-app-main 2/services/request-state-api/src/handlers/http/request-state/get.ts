import { GetCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, NotFound } from 'http-errors';

import { REQUEST_STATE_FACET } from '../../../constants/facets';
import {
  type RequestState,
  RequestStateTaskStatus,
} from '../../../event-store/aggregator/types';
import {
  extractRequestState,
  getRequestStateSchema,
  stateRecordSchema,
} from '../../../schemas/request-state';
import { dynamoClient, getTableName } from '../../../utils/dynamo-client';
import { restApiLambdaHandler } from '../../../utils/lambda-handler';
import { getLogger } from '../../../utils/logger';

const logger = getLogger();

/**
 * Response structure for the GET request state endpoint
 */
export interface RequestStateResponse {
  correlationId: string;
  status: RequestStateTaskStatus;
  response?: unknown;
  error?: unknown;
}

/**
 * Computes the overall status based on task states and includes response/error data
 */
const computeStatusFromTasks = (
  requestState: RequestState
): RequestStateResponse => {
  const { correlationId, tasks, response, error } = requestState;

  if (!tasks || Object.keys(tasks).length === 0) {
    return {
      correlationId,
      status: RequestStateTaskStatus.PENDING,
    };
  }

  const taskStatuses = Object.values(tasks).map((task) => task.status);

  // Check if any tasks failed
  if (taskStatuses.some((status) => status === RequestStateTaskStatus.FAILED)) {
    const result: RequestStateResponse = {
      correlationId,
      status: RequestStateTaskStatus.FAILED,
    };

    // Include parsed error if available
    if (error) {
      try {
        result.error = typeof error === 'string' ? JSON.parse(error) : error;
      } catch (_e) {
        logger.warn('Failed to parse error field as JSON', {
          error,
          correlationId,
        });
        // If parsing fails, include the raw error
        result.error = error;
      }
    }

    return result;
  }

  // Check if all tasks are complete
  if (
    taskStatuses.every((status) => status === RequestStateTaskStatus.COMPLETE)
  ) {
    const result: RequestStateResponse = {
      correlationId,
      status: RequestStateTaskStatus.COMPLETE,
    };

    // Include parsed response if available
    if (response) {
      try {
        result.response =
          typeof response === 'string' ? JSON.parse(response) : response;
      } catch (_e) {
        logger.warn('Failed to parse response field as JSON', {
          response,
          correlationId,
        });
        // If parsing fails, include the raw response
        result.response = response;
      }
    }

    return result;
  }

  // Default case: if not all complete and none failed, must be pending
  return {
    correlationId,
    status: RequestStateTaskStatus.PENDING,
  };
};

/**
 * Extracts tenant from x-tenant header
 */
const getHeader = (
  event: APIGatewayProxyEvent,
  name: string
): string | undefined => {
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(event.headers)) {
    if (key.toLowerCase() === lower) {
      return value;
    }
  }

  return undefined;
};

const extractTenantFromHeaders = (event: APIGatewayProxyEvent): string => {
  const tenant = getHeader(event, 'x-tenant');

  if (!tenant) {
    throw new BadRequest('x-tenant header is required');
  }

  return tenant;
};

/**
 * Extracts correlation ID from API Gateway path parameters
 */
const extractCorrelationIdFromPath = (event: APIGatewayProxyEvent): string => {
  const correlationId = event.pathParameters?.correlationId;

  if (!correlationId) {
    throw new BadRequest('Correlation ID is required in path parameters');
  }

  // Validate the correlation ID using the schema
  const parseResult = getRequestStateSchema.safeParse({ correlationId });

  if (!parseResult.success) {
    throw new BadRequest(
      `Invalid correlation ID: ${parseResult.error.message}`
    );
  }

  return parseResult.data.correlationId;
};

/**
 * Queries DynamoDB for request state by correlation ID
 * Uses the event store pattern where correlationId is used as the primary key
 */
const getRequestStateFromDynamoDB = async (
  correlationId: string,
  tenant: string
): Promise<RequestStateResponse | null> => {
  try {
    // Based on the event store pattern, the primary key is typically the facet + ID
    // and we want the STATE record which has _rng = 'STATE'
    const primaryKey = `${REQUEST_STATE_FACET}/${correlationId}`;
    const tableName = getTableName(tenant);

    const command = new GetCommand({
      TableName: tableName,
      Key: {
        _id: primaryKey,
        _rng: 'STATE',
      },
      ConsistentRead: true,
    });

    logger.info('Querying DynamoDB for request state', {
      correlationId,
      tenant,
      tableName,
      primaryKey,
    });

    const result = await dynamoClient.send(command);

    if (!result.Item) {
      logger.info('Request state not found', { correlationId });

      return null;
    }

    // Validate the DynamoDB result using Zod schema to ensure type safety
    const parseResult = stateRecordSchema.safeParse(result.Item);

    if (!parseResult.success) {
      logger.error('Invalid state record schema from DynamoDB', {
        correlationId,
        tenant,
        validationErrors: parseResult.error.issues,
        rawItem: result.Item,
      });
      throw new Error(
        `Invalid state record schema: ${parseResult.error.message}`
      );
    }

    // The validated data is now typed as StateRecord<RequestState>
    const stateRecord = parseResult.data;

    // Extract just the RequestState data (excluding DynamoDB internal fields)
    const requestState = extractRequestState(stateRecord);

    // Compute the overall status based on task states
    const computedResponse = computeStatusFromTasks(requestState);

    logger.info('Request state found', {
      correlationId,
      status: computedResponse.status,
      taskCount: Object.keys(requestState.tasks || {}).length,
    });

    return computedResponse;
  } catch (error) {
    logger.error('Error querying DynamoDB for request state', {
      error,
      correlationId,
      tenant,
    });
    throw error;
  }
};

/**
 * Main handler function
 */
const getRequestStateHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const tenant = extractTenantFromHeaders(event);
  const correlationId = extractCorrelationIdFromPath(event);

  logger.appendKeys({ correlationId, tenant });

  const requestStateResponse = await getRequestStateFromDynamoDB(
    correlationId,
    tenant
  );

  if (!requestStateResponse) {
    throw new NotFound(
      `Request state not found for correlation ID: ${correlationId}`
    );
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestStateResponse),
  };
};

export const handler = restApiLambdaHandler(getRequestStateHandler);

// Export the inner handler for testing
export { getRequestStateHandler };
