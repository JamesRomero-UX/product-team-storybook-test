import {
  LinkedItemEvent,
  ObjectEvent,
  PermissionsEvent,
} from '@risksmart-app/events/src/types/common';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { stub } from 'src/testing/stub';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { REQUEST_STATE_FACET } from '../../../constants/facets';
import type {
  RequestState,
  RequestStateTask,
} from '../../../event-store/aggregator/types';
import { RequestStateTaskStatus } from '../../../event-store/aggregator/types';
import type { StateRecord } from '../../../event-store/db/db';

// Mock the dynamo client
vi.mock('../../../utils/dynamo-client', () => ({
  dynamoClient: {
    send: vi.fn(),
  },
  getTableName: vi.fn((tenant: string) => `${tenant}-RequestState`),
}));

// Mock logger
vi.mock('../../../utils/logger', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    appendKeys: vi.fn().mockReturnThis(),
    clearBuffer: vi.fn(),
    clearKeys: vi.fn(),
    resetKeys: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    addContext: vi.fn(),
  })),
}));

// Mock sentry
vi.mock('../../../utils/sentry-init', () => ({
  initSentry: vi.fn(),
}));

// Import handler after mocks
import { dynamoClient } from '../../../utils/dynamo-client';
import type { RequestStateResponse } from './get';
import { getRequestStateHandler } from './get';

// Type the mocked send function properly for testing
// eslint-disable-next-line @typescript-eslint/unbound-method
const { send } = dynamoClient;
const mockSend = send as ReturnType<typeof vi.fn>;

const generateEvent = (
  correlationId?: string,
  tenant?: string
): APIGatewayProxyEvent => {
  return stub<APIGatewayProxyEvent>({
    pathParameters: {
      correlationId,
    },
    headers: {
      'x-tenant': tenant,
    },
    requestContext: {
      domainPrefix: 'test',
    },
  });
};

const createMockRequestState = (
  correlationId: string,
  tasks: Record<string, RequestStateTask> = {},
  response?: string,
  error?: string
): StateRecord<RequestState> => ({
  _id: `${REQUEST_STATE_FACET}/${correlationId}`,
  _rng: 'STATE',
  _facet: REQUEST_STATE_FACET,
  _typ: 'STATE',
  _ts: Date.now(),
  _date: '2025-09-30',
  _seq: 1,
  correlationId,
  tenant: 'test-tenant',
  orgKey: 'test-org',
  userId: 'test-user',
  tasks,
  response,
  error,
});

describe('GET /request/{correlationId}', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful request processing', () => {
    it('should return PENDING status when no tasks exist', async () => {
      // Arrange
      const correlationId = '550e8400-e29b-41d4-a716-446655440000';
      const tenant = 'test-tenant';
      const event = generateEvent(correlationId, tenant);

      const requestState = createMockRequestState(correlationId, {});

      mockSend.mockResolvedValue({
        Item: requestState,
      });

      // Act
      const response = await getRequestStateHandler(event);
      const body = JSON.parse(response.body ?? '') as RequestStateResponse;

      // Assert
      expect(response.statusCode).toBe(200);
      expect(body).toEqual({
        correlationId,
        status: RequestStateTaskStatus.PENDING,
      });
    });

    it('should return COMPLETE status when all tasks are complete', async () => {
      // Arrange
      const correlationId = '550e8400-e29b-41d4-a716-446655440001';
      const tenant = 'test-tenant';
      const event = generateEvent(correlationId, tenant);
      const responseData = { result: 'success', data: [1, 2, 3] };

      const requestState = createMockRequestState(
        correlationId,
        {
          task1: {
            status: RequestStateTaskStatus.COMPLETE,
            eventType: ObjectEvent.ObjectCreated,
          },
          task2: {
            status: RequestStateTaskStatus.COMPLETE,
            eventType: ObjectEvent.ObjectUpdated,
          },
        },
        JSON.stringify(responseData)
      );

      mockSend.mockResolvedValue({
        Item: requestState,
      });

      // Act
      const response = await getRequestStateHandler(event);
      const body = JSON.parse(response.body ?? '') as RequestStateResponse;

      // Assert
      expect(response.statusCode).toBe(200);
      expect(body).toEqual({
        correlationId,
        status: RequestStateTaskStatus.COMPLETE,
        response: responseData,
      });
    });

    it('should return FAILED status when any task failed', async () => {
      // Arrange
      const correlationId = '550e8400-e29b-41d4-a716-446655440002';
      const tenant = 'test-tenant';
      const event = generateEvent(correlationId, tenant);
      const errorData = {
        error: 'Task processing failed',
        code: 'PROCESSING_ERROR',
      };

      const requestState = createMockRequestState(
        correlationId,
        {
          task1: {
            status: RequestStateTaskStatus.COMPLETE,
            eventType: ObjectEvent.ObjectCreated,
          },
          task2: {
            status: RequestStateTaskStatus.FAILED,
            eventType: ObjectEvent.ObjectUpdated,
          },
          task3: {
            status: RequestStateTaskStatus.PENDING,
            eventType: ObjectEvent.ObjectDeleted,
          },
        },
        undefined,
        JSON.stringify(errorData)
      );

      mockSend.mockResolvedValue({
        Item: requestState,
      });

      // Act
      const response = await getRequestStateHandler(event);
      const body = JSON.parse(response.body ?? '') as RequestStateResponse;

      // Assert
      expect(response.statusCode).toBe(200);
      expect(body).toEqual({
        correlationId,
        status: RequestStateTaskStatus.FAILED,
        error: errorData,
      });
    });

    it('should return PENDING status when tasks are mix of complete and pending', async () => {
      // Arrange
      const correlationId = '550e8400-e29b-41d4-a716-446655440003';
      const tenant = 'test-tenant';
      const event = generateEvent(correlationId, tenant);

      const requestState = createMockRequestState(correlationId, {
        task1: {
          status: RequestStateTaskStatus.COMPLETE,
          eventType: ObjectEvent.ObjectCreated,
        },
        task2: {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectUpdated,
        },
        task3: {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
        },
      });

      mockSend.mockResolvedValue({
        Item: requestState,
      });

      // Act
      const response = await getRequestStateHandler(event);
      const body = JSON.parse(response.body ?? '') as RequestStateResponse;

      // Assert
      expect(response.statusCode).toBe(200);
      expect(body).toEqual({
        correlationId,
        status: RequestStateTaskStatus.PENDING,
      });
    });
  });

  describe('error handling', () => {
    it('should return 400 when correlation ID is missing', async () => {
      // Arrange
      const event = generateEvent(undefined, 'test-tenant');

      // Act & Assert
      await expect(getRequestStateHandler(event)).rejects.toThrow(
        'Correlation ID is required in path parameters'
      );
    });

    it('should return 400 when tenant header is missing', async () => {
      // Arrange
      const event = generateEvent(
        '550e8400-e29b-41d4-a716-446655440009',
        undefined
      );

      // Act & Assert
      await expect(getRequestStateHandler(event)).rejects.toThrow(
        'x-tenant header is required'
      );
    });

    it('should return 400 when correlation ID fails schema validation', async () => {
      // Arrange
      const correlationId = ''; // Invalid correlation ID
      const tenant = 'test-tenant';
      const event = generateEvent(correlationId, tenant);

      // Act & Assert
      await expect(getRequestStateHandler(event)).rejects.toThrow();
    });

    it('should return 404 when request state not found', async () => {
      // Arrange
      const correlationId = '550e8400-e29b-41d4-a716-446655440010';
      const tenant = 'test-tenant';
      const event = generateEvent(correlationId, tenant);

      mockSend.mockResolvedValue({}); // No Item returned

      // Act & Assert
      await expect(getRequestStateHandler(event)).rejects.toThrow(
        `Request state not found for correlation ID: ${correlationId}`
      );
    });

    it('should handle DynamoDB errors correctly', async () => {
      // Arrange
      const correlationId = '550e8400-e29b-41d4-a716-446655440011';
      const tenant = 'test-tenant';
      const event = generateEvent(correlationId, tenant);
      const dynamoError = new Error('DynamoDB connection failed');

      mockSend.mockRejectedValue(dynamoError);

      // Act & Assert
      await expect(getRequestStateHandler(event)).rejects.toThrow(
        'DynamoDB connection failed'
      );
    });

    it('should handle invalid state record schema from DynamoDB', async () => {
      // Arrange
      const correlationId = '550e8400-e29b-41d4-a716-446655440012';
      const tenant = 'test-tenant';
      const event = generateEvent(correlationId, tenant);

      // Create an invalid state record missing required fields
      const invalidStateRecord = {
        _id: `${REQUEST_STATE_FACET}/${correlationId}`,
        _rng: 'STATE',
        _facet: REQUEST_STATE_FACET,
        _typ: 'STATE',
        _ts: Date.now(),
        _date: '2025-09-30',
        _seq: 1,
        correlationId,
        tenant: 'test-tenant',
        // Missing required fields: orgKey, userId, tasks
        invalidField: 'this should not be here',
      };

      mockSend.mockResolvedValue({
        Item: invalidStateRecord,
      });

      // Act & Assert
      await expect(getRequestStateHandler(event)).rejects.toThrow(
        'Invalid state record schema'
      );
    });
  });

  describe('response parsing', () => {
    it('should handle non-JSON response data gracefully', async () => {
      // Arrange
      const correlationId = '550e8400-e29b-41d4-a716-446655440012';
      const tenant = 'test-tenant';
      const event = generateEvent(correlationId, tenant);
      const rawResponse = 'This is a plain text response';

      const requestState = createMockRequestState(
        correlationId,
        {
          task1: {
            status: RequestStateTaskStatus.COMPLETE,
            eventType: ObjectEvent.ObjectCreated,
          },
        },
        rawResponse
      );

      mockSend.mockResolvedValue({
        Item: requestState,
      });

      // Act
      const response = await getRequestStateHandler(event);
      const body = JSON.parse(response.body ?? '') as RequestStateResponse;

      // Assert
      expect(response.statusCode).toBe(200);
      expect(body.response).toBe(rawResponse);
    });

    it('should handle non-JSON error data gracefully', async () => {
      // Arrange
      const correlationId = '550e8400-e29b-41d4-a716-446655440013';
      const tenant = 'test-tenant';
      const event = generateEvent(correlationId, tenant);
      const rawError = 'This is a plain text error';

      const requestState = createMockRequestState(
        correlationId,
        {
          task1: {
            status: RequestStateTaskStatus.FAILED,
            eventType: ObjectEvent.ObjectCreated,
          },
        },
        undefined,
        rawError
      );

      mockSend.mockResolvedValue({
        Item: requestState,
      });

      // Act
      const response = await getRequestStateHandler(event);
      const body = JSON.parse(response.body ?? '') as RequestStateResponse;

      // Assert
      expect(response.statusCode).toBe(200);
      expect(body.error).toBe(rawError);
    });

    it('should handle object response data without JSON parsing', async () => {
      // Arrange
      const correlationId = '550e8400-e29b-41d4-a716-446655440014';
      const tenant = 'test-tenant';
      const event = generateEvent(correlationId, tenant);
      const objectResponse = { result: 'success', nested: { data: [1, 2, 3] } };

      const requestState = createMockRequestState(
        correlationId,
        {
          task1: {
            status: RequestStateTaskStatus.COMPLETE,
            eventType: ObjectEvent.ObjectCreated,
          },
        },
        JSON.stringify(objectResponse)
      );

      mockSend.mockResolvedValue({
        Item: requestState,
      });

      // Act
      const response = await getRequestStateHandler(event);
      const body = JSON.parse(response.body ?? '') as RequestStateResponse;

      // Assert
      expect(response.statusCode).toBe(200);
      expect(body.response).toEqual(objectResponse);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex request state with multiple task types', async () => {
      // Arrange
      const correlationId = '550e8400-e29b-41d4-a716-446655440015';
      const tenant = 'complex-tenant';
      const event = generateEvent(correlationId, tenant);

      const requestState = createMockRequestState(correlationId, {
        CREATE_ACTION_UPDATE: {
          status: RequestStateTaskStatus.COMPLETE,
          eventType: ObjectEvent.ObjectCreated,
        },
        SEND_NOTIFICATION: {
          status: RequestStateTaskStatus.COMPLETE,
          eventType: ObjectEvent.ObjectUpdated,
        },
        UPDATE_PERMISSIONS: {
          status: RequestStateTaskStatus.COMPLETE,
          eventType: PermissionsEvent.PermissionsUpdated,
        },
        AUDIT_LOG: {
          status: RequestStateTaskStatus.COMPLETE,
          eventType: LinkedItemEvent.LinkedItemCreated,
        },
      });

      mockSend.mockResolvedValue({
        Item: requestState,
      });

      // Act
      const response = await getRequestStateHandler(event);
      const body = JSON.parse(response.body ?? '') as RequestStateResponse;

      // Assert
      expect(response.statusCode).toBe(200);
      expect(body).toEqual({
        correlationId,
        status: RequestStateTaskStatus.COMPLETE,
      });
    });

    it('should handle request state with mixed task statuses correctly', async () => {
      // Arrange
      const correlationId = '550e8400-e29b-41d4-a716-446655440016';
      const tenant = 'mixed-tenant';
      const event = generateEvent(correlationId, tenant);

      const requestState = createMockRequestState(correlationId, {
        TASK_1: {
          status: RequestStateTaskStatus.COMPLETE,
          eventType: ObjectEvent.ObjectCreated,
        },
        TASK_2: {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectUpdated,
        },
        TASK_3: {
          status: RequestStateTaskStatus.PENDING,
          eventType: ObjectEvent.ObjectDeleted,
        },
        TASK_4: {
          status: RequestStateTaskStatus.COMPLETE,
          eventType: PermissionsEvent.PermissionsUpdated,
        },
      });

      mockSend.mockResolvedValue({
        Item: requestState,
      });

      // Act
      const response = await getRequestStateHandler(event);
      const body = JSON.parse(response.body ?? '') as RequestStateResponse;

      // Assert
      expect(response.statusCode).toBe(200);
      expect(body.status).toBe(RequestStateTaskStatus.PENDING);
    });
  });
});
