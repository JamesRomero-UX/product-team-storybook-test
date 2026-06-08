import { AsyncRequestEvent } from '@risksmart-app/events/src/types/common';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest } from 'http-errors';
import { v4 as uuidv4 } from 'uuid';
import type z from 'zod';

import { appendToRequest } from '../../../event-store/aggregator/facets';
import { RequestStateTaskStatus } from '../../../event-store/aggregator/types';
import type {
  InitiateAsyncRequestBody,
  initiateAsyncRequestDataSchema,
  SimplifiedRequestBody,
} from '../../../schemas/initiate-request';
import {
  requestHeadersSchema,
  simplifiedRequestBodySchema,
} from '../../../schemas/initiate-request';
import { restApiLambdaHandler } from '../../../utils/lambda-handler';
import { getLogger } from '../../../utils/logger';

const logger = getLogger();

/**
 * Response structure for the POST initiate request endpoint
 */
export interface InitiateRequestResponse {
  correlationId: string;
  status: RequestStateTaskStatus;
}

/**
 * Extracts and validates required headers from the request
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

const extractHeaders = (event: APIGatewayProxyEvent) => {
  const headers = {
    'x-tenant': getHeader(event, 'x-tenant'),
    'x-org-key': getHeader(event, 'x-org-key'),
    'x-user-id': getHeader(event, 'x-user-id'),
    'x-correlation-id': getHeader(event, 'x-correlation-id'),
    'x-domain': getHeader(event, 'x-domain'),
    'x-service': getHeader(event, 'x-service'),
  };

  const validationResult = requestHeadersSchema.safeParse(headers);

  if (!validationResult.success) {
    const missingHeaders = validationResult.error.errors
      .map((e) => e.message)
      .join(', ');
    throw new BadRequest(`Missing or invalid headers: ${missingHeaders}`);
  }

  return validationResult.data;
};

/**
 * Builds the full InitiateAsyncRequest event from headers and simplified body
 */
const buildInitiateAsyncRequestEvent = (
  headers: ReturnType<typeof extractHeaders>,
  body: SimplifiedRequestBody
): InitiateAsyncRequestBody => {
  const timestamp = new Date().toISOString();

  return {
    type: AsyncRequestEvent.InitiateAsyncRequest,
    data: {
      request: body.request,
      subType: body.type,
    } as z.infer<typeof initiateAsyncRequestDataSchema>,
    metadata: {
      eventId: uuidv4(),
      version: '1.0',
      timestamp,
      domain: headers['x-domain'],
      service: headers['x-service'],
      correlationId: headers['x-correlation-id'],
      userId: headers['x-user-id'],
      tenant: headers['x-tenant'],
      orgKey: headers['x-org-key'],
    },
  };
};

/**
 * POST handler to initiate an async request
 * This provides an HTTP alternative to the EventBridge INITIATE_ASYNC_REQUEST event
 *
 * Required headers:
 * - x-tenant: Tenant identifier
 * - x-org-key: Organization key
 * - x-user-id: User identifier
 * - x-correlation-id: UUID for tracking the request
 * - x-domain: Domain name
 * - x-service: Service name
 *
 * @param event - API Gateway proxy event containing headers and simplified request body
 * @returns Response with correlationId and PENDING status
 */
const postInitiateRequestHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('Processing POST initiate request');

  // Extract and validate headers
  const headers = extractHeaders(event);

  // Parse and validate request body
  if (!event.body) {
    throw new BadRequest('Request body is required');
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(event.body);
  } catch {
    throw new BadRequest('Invalid JSON in request body');
  }

  const validationResult = simplifiedRequestBodySchema.safeParse(parsedBody);

  if (!validationResult.success) {
    logger.warn('Request validation failed', {
      errors: validationResult.error.errors,
    });
    throw new BadRequest(
      `Invalid request body: ${validationResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
    );
  }

  const requestBody = validationResult.data;
  const { correlationId, tenant, orgKey, userId } = {
    correlationId: headers['x-correlation-id'],
    tenant: headers['x-tenant'],
    orgKey: headers['x-org-key'],
    userId: headers['x-user-id'],
  };

  logger.appendKeys({
    tenant,
    orgKey,
    userId,
    correlationId,
    requestType: requestBody.type,
  });

  logger.info('Initiating async request via HTTP', {
    correlationId,
    requestType: requestBody.type,
  });

  try {
    // Build the full event structure expected by the rule engine
    const initiateAsyncRequestEvent = buildInitiateAsyncRequestEvent(
      headers,
      requestBody
    );

    // Use the same event name as the EventBridge handler for consistency
    const eventName = AsyncRequestEvent.InitiateAsyncRequest;

    await appendToRequest(correlationId, tenant, {
      eventName,
      event: initiateAsyncRequestEvent,
    });

    logger.info('Async request initiated successfully', { correlationId });

    const response: InitiateRequestResponse = {
      correlationId,
      status: RequestStateTaskStatus.PENDING,
    };

    return {
      statusCode: 202,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    logger.error('Error initiating async request', error as Error);
    throw error;
  }
};

export const handler = restApiLambdaHandler(postInitiateRequestHandler);

// Export the inner handler for testing
export { postInitiateRequestHandler };
