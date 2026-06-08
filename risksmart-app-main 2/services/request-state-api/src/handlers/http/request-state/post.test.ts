import { AsyncRequestEvent } from '@risksmart-app/events/src/types/common';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { stub } from 'src/testing/stub';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RequestStateTaskStatus } from '../../../event-store/aggregator/types';
import type { SimplifiedRequestBody } from '../../../schemas/initiate-request';

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mocked-event-id-1234'),
}));

// Mock the facets module
vi.mock('../../../event-store/aggregator/facets', () => ({
  appendToRequest: vi.fn(),
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

// Import after mocks
import { appendToRequest } from '../../../event-store/aggregator/facets';
import type { InitiateRequestResponse } from './post';
import { postInitiateRequestHandler } from './post';

const mockAppendToRequest = appendToRequest as ReturnType<typeof vi.fn>;

const createValidRequestBody = (): SimplifiedRequestBody => ({
  request: {
    Title: 'Test Action Update',
    Description: 'Test description for action update',
    ParentActionId: '92884517-4731-4446-abb8-b0cbed0e9842',
    CustomAttributeData: null,
  },
  type: 'CREATE_ACTION_UPDATE',
});

const createValidHeaders = () => ({
  'x-tenant': 'test-tenant',
  'x-org-key': 'org_Qshp7tYsxxAWwhVa',
  'x-user-id': 'auth0|644151efc3a961d2784456d9',
  'x-correlation-id': '6cd9480d-9c26-44a2-b5ff-f4b92c636d7f',
  'x-domain': 'risksmart',
  'x-service': 'test-service',
});

const generateEvent = (
  headers: Record<string, string | undefined>,
  body: unknown
): APIGatewayProxyEvent => {
  return stub<APIGatewayProxyEvent>({
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    requestContext: {
      domainPrefix: 'test',
    },
  });
};

describe('POST /request', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful request processing', () => {
    it('should return 202 with correlationId and PENDING status on success', async () => {
      // Arrange
      const headers = createValidHeaders();
      const requestBody = createValidRequestBody();
      const event = generateEvent(headers, requestBody);

      mockAppendToRequest.mockResolvedValue(undefined);

      // Act
      const response = await postInitiateRequestHandler(event);
      const body = JSON.parse(response.body ?? '') as InitiateRequestResponse;

      // Assert
      expect(response.statusCode).toBe(202);
      expect(body).toEqual({
        correlationId: headers['x-correlation-id'],
        status: RequestStateTaskStatus.PENDING,
      });
    });

    it('should call appendToRequest with correct parameters', async () => {
      // Arrange
      const headers = createValidHeaders();
      const requestBody = createValidRequestBody();
      const event = generateEvent(headers, requestBody);

      mockAppendToRequest.mockResolvedValue(undefined);

      // Act
      await postInitiateRequestHandler(event);

      // Assert
      expect(mockAppendToRequest).toHaveBeenCalledTimes(1);
      expect(mockAppendToRequest).toHaveBeenCalledWith(
        headers['x-correlation-id'],
        headers['x-tenant'],
        {
          eventName: AsyncRequestEvent.InitiateAsyncRequest,
          event: expect.objectContaining({
            type: AsyncRequestEvent.InitiateAsyncRequest,
            data: {
              request: requestBody.request,
              subType: requestBody.type,
            },
            metadata: expect.objectContaining({
              correlationId: headers['x-correlation-id'],
              tenant: headers['x-tenant'],
              orgKey: headers['x-org-key'],
              userId: headers['x-user-id'],
              domain: headers['x-domain'],
              service: headers['x-service'],
            }),
          }),
        }
      );
    });

    it('should return correct Content-Type header', async () => {
      // Arrange
      const headers = createValidHeaders();
      const requestBody = createValidRequestBody();
      const event = generateEvent(headers, requestBody);

      mockAppendToRequest.mockResolvedValue(undefined);

      // Act
      const response = await postInitiateRequestHandler(event);

      // Assert
      expect(response.headers).toEqual({
        'Content-Type': 'application/json',
      });
    });
  });

  describe('header validation errors', () => {
    it('should throw BadRequest when x-tenant header is missing', async () => {
      // Arrange
      const headers = { ...createValidHeaders(), 'x-tenant': undefined };
      const requestBody = createValidRequestBody();
      const event = generateEvent(headers, requestBody);

      // Act & Assert
      await expect(postInitiateRequestHandler(event)).rejects.toThrow(
        'Missing or invalid headers'
      );
    });

    it('should throw BadRequest when x-org-key header is missing', async () => {
      // Arrange
      const headers = { ...createValidHeaders(), 'x-org-key': undefined };
      const requestBody = createValidRequestBody();
      const event = generateEvent(headers, requestBody);

      // Act & Assert
      await expect(postInitiateRequestHandler(event)).rejects.toThrow(
        'Missing or invalid headers'
      );
    });

    it('should throw BadRequest when x-user-id header is missing', async () => {
      // Arrange
      const headers = { ...createValidHeaders(), 'x-user-id': undefined };
      const requestBody = createValidRequestBody();
      const event = generateEvent(headers, requestBody);

      // Act & Assert
      await expect(postInitiateRequestHandler(event)).rejects.toThrow(
        'Missing or invalid headers'
      );
    });

    it('should throw BadRequest when x-correlation-id header is missing', async () => {
      // Arrange
      const headers = {
        ...createValidHeaders(),
        'x-correlation-id': undefined,
      };
      const requestBody = createValidRequestBody();
      const event = generateEvent(headers, requestBody);

      // Act & Assert
      await expect(postInitiateRequestHandler(event)).rejects.toThrow(
        'Missing or invalid headers'
      );
    });

    it('should throw BadRequest when x-correlation-id is not a valid UUID', async () => {
      // Arrange
      const headers = {
        ...createValidHeaders(),
        'x-correlation-id': 'not-a-uuid',
      };
      const requestBody = createValidRequestBody();
      const event = generateEvent(headers, requestBody);

      // Act & Assert
      await expect(postInitiateRequestHandler(event)).rejects.toThrow(
        'x-correlation-id must be a valid UUID'
      );
    });

    it('should throw BadRequest when x-domain header is missing', async () => {
      // Arrange
      const headers = { ...createValidHeaders(), 'x-domain': undefined };
      const requestBody = createValidRequestBody();
      const event = generateEvent(headers, requestBody);

      // Act & Assert
      await expect(postInitiateRequestHandler(event)).rejects.toThrow(
        'Missing or invalid headers'
      );
    });

    it('should throw BadRequest when x-service header is missing', async () => {
      // Arrange
      const headers = { ...createValidHeaders(), 'x-service': undefined };
      const requestBody = createValidRequestBody();
      const event = generateEvent(headers, requestBody);

      // Act & Assert
      await expect(postInitiateRequestHandler(event)).rejects.toThrow(
        'Missing or invalid headers'
      );
    });
  });

  describe('body validation errors', () => {
    it('should throw BadRequest when request body is missing', async () => {
      // Arrange
      const headers = createValidHeaders();
      const event = stub<APIGatewayProxyEvent>({
        headers,
        body: undefined,
        requestContext: { domainPrefix: 'test' },
      });

      // Act & Assert
      await expect(postInitiateRequestHandler(event)).rejects.toThrow(
        'Request body is required'
      );
    });

    it('should throw BadRequest when request body is invalid JSON', async () => {
      // Arrange
      const headers = createValidHeaders();
      const event = stub<APIGatewayProxyEvent>({
        headers,
        body: 'not valid json',
        requestContext: { domainPrefix: 'test' },
      });

      // Act & Assert
      await expect(postInitiateRequestHandler(event)).rejects.toThrow(
        'Invalid JSON in request body'
      );
    });

    it('should throw BadRequest when type is not CREATE_ACTION_UPDATE', async () => {
      // Arrange
      const headers = createValidHeaders();
      const requestBody = {
        ...createValidRequestBody(),
        type: 'INVALID_TYPE',
      };
      const event = generateEvent(headers, requestBody);

      // Act & Assert
      await expect(postInitiateRequestHandler(event)).rejects.toThrow(
        'Invalid request body'
      );
    });

    it('should throw BadRequest when request data fields are missing', async () => {
      // Arrange
      const headers = createValidHeaders();
      const requestBody = {
        type: 'CREATE_ACTION_UPDATE',
        request: {
          Title: 'Test',
          // Missing Description, ParentActionId, CustomAttributeData
        },
      };
      const event = generateEvent(headers, requestBody);

      // Act & Assert
      await expect(postInitiateRequestHandler(event)).rejects.toThrow(
        'Invalid request body'
      );
    });
  });

  describe('error handling', () => {
    it('should throw error when appendToRequest fails', async () => {
      // Arrange
      const headers = createValidHeaders();
      const requestBody = createValidRequestBody();
      const event = generateEvent(headers, requestBody);

      const error = new Error('DynamoDB error');
      mockAppendToRequest.mockRejectedValue(error);

      // Act & Assert
      await expect(postInitiateRequestHandler(event)).rejects.toThrow(
        'DynamoDB error'
      );
    });
  });
});
