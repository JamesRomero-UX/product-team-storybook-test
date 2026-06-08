import type { APIGatewayProxyEvent } from 'aws-lambda';
import { describe, expect, it } from 'vitest';

import { createdResponse, deletedResponse } from './http-response';

const createMockEvent = (
  overrides: Partial<APIGatewayProxyEvent> = {}
): APIGatewayProxyEvent =>
  ({
    headers: {
      Host: 'api.example.com',
    },
    requestContext: {
      stage: 'v1',
    },
    ...overrides,
  }) as APIGatewayProxyEvent;

describe('http-response', () => {
  describe('createdResponse', () => {
    it('should return 201 status code', () => {
      const event = createMockEvent();
      const object = { Id: 'object-123' };

      const response = createdResponse({
        event,
        object: object,
        objectType: 'issues',
      });

      expect(response.statusCode).toBe(201);
    });

    it('should include Content-Type header', () => {
      const event = createMockEvent();
      const object = { Id: 'object-123' };

      const response = createdResponse({
        event,
        object: object,
        objectType: 'issues',
      });

      expect(response.headers?.['Content-Type']).toBe('application/json');
    });

    it('should build Location header with object URL', () => {
      const event = createMockEvent();
      const object = { Id: 'object-123' };

      const response = createdResponse({
        event,
        object: object,
        objectType: 'issues',
      });

      expect(response.headers?.Location).toBe(
        'https://api.example.com/v1/issues/object-123'
      );
    });

    it('should use lowercase host header if Host is not present', () => {
      const event = createMockEvent({
        headers: {
          host: 'api.lowercase.com',
        },
      });
      const object = { Id: 'object-456' };

      const response = createdResponse({
        event,
        object: object,
        objectType: 'controls',
      });

      expect(response.headers?.Location).toBe(
        'https://api.lowercase.com/v1/controls/object-456'
      );
    });

    it('should serialize object in body', () => {
      const event = createMockEvent();
      const object = { Id: 'object-123', Name: 'Test Object' };

      const response = createdResponse({
        event,
        object: object,
        objectType: 'issues',
      });

      expect(JSON.parse(response.body)).toEqual({
        data: { Id: 'object-123', Name: 'Test Object' },
      });
    });
  });

  describe('deletedResponse', () => {
    it('should return 204 status code', () => {
      const event = createMockEvent();

      const response = deletedResponse({
        event,
        objectType: 'issues',
        objectId: 'object-123',
      });

      expect(response.statusCode).toBe(204);
    });

    it('should include Content-Type header', () => {
      const event = createMockEvent();

      const response = deletedResponse({
        event,
        objectType: 'issues',
        objectId: 'object-123',
      });

      expect(response.headers?.['Content-Type']).toBe('application/json');
    });

    it('should return empty body', () => {
      const event = createMockEvent();

      const response = deletedResponse({
        event,
        objectType: 'issues',
        objectId: 'object-123',
      });

      expect(response.body).toBe('');
    });

    it('should build Location header with object URL for single delete', () => {
      const event = createMockEvent();

      const response = deletedResponse({
        event,
        objectType: 'issues',
        objectId: 'object-123',
      });

      expect(response.headers?.Location).toBe(
        'https://api.example.com/v1/issues/object-123'
      );
    });

    it('should build Location header with collection URL when no objectId provided', () => {
      const event = createMockEvent();

      const response = deletedResponse({
        event,
        objectType: 'issues',
      });

      expect(response.headers?.Location).toBe(
        'https://api.example.com/v1/issues'
      );
    });

    it('should use lowercase host header if Host is not present', () => {
      const event = createMockEvent({
        headers: {
          host: 'api.lowercase.com',
        },
      });

      const response = deletedResponse({
        event,
        objectType: 'controls',
        objectId: 'object-789',
      });

      expect(response.headers?.Location).toBe(
        'https://api.lowercase.com/v1/controls/object-789'
      );
    });
  });
});
