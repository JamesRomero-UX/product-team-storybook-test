import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import {
  BadRequestResponse,
  InternalServerErrorResponse,
  NotFoundResponse,
  scimErrorResponse,
} from 'src/scim/responseTypes';
import { server } from 'src/testing/mocks/server';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import type { PutSchema } from './put';
import { handler } from './put';

vi.mock('sst/node/config', () => {
  return {
    Config: {
      HASURA_ADMIN_SECRET: 'dummy-secret',
    },
  };
});

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => server.close());

const generateValidRequestBody = (
  id?: string,
  email?: string,
  username?: string,
  externalId?: string,
  displayName?: string,
  jobTitle?: string,
  address?: string,
  department?: string
): PutSchema => ({
  schemas: [
    'urn:ietf:params:scim:schemas:core:2.0:User',
    'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User',
  ],
  id: id ?? '1',
  externalId: externalId ?? '123456789',
  userName: username ?? 'user1',
  active: true,
  emails: [
    {
      primary: true,
      type: 'work',
      value: email ?? 'user1@user.com',
    },
  ],
  meta: {
    resourceType: 'User',
  },
  name: {
    formatted: displayName ?? 'User 1',
    familyName: '1',
    givenName: 'User',
  },
  title: jobTitle ?? 'Techy',
  addresses: address ? [{ primary: true, formatted: address }] : undefined,
  groups: [],
  ...(department && {
    'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': {
      department: 'Tech People',
    },
  }),
});

const generateEvent = (userId?: string, body?: string) => {
  return {
    ...(userId && { pathParameters: { userId } }),
    body,
    requestContext: {
      authorizer: {
        lambda: {
          orgKey: 'org-key',
          tenant: 'tenant',
          domains: JSON.stringify(['gerlachsenger.uk', 'user.com']),
        },
      },
    },
  } as unknown as APIGatewayProxyEventV2;
};

describe('PUT /Users/{id}', () => {
  describe('When the request body is valid', () => {
    describe('And the user exists with a valid domain in the same casing', () => {
      test('then it returns 200 status code and the updated scim user', async () => {
        // Arrange
        const userId = '1';
        const requestBody = generateValidRequestBody(
          userId,
          'emile@gerlachsenger.uk'
        );
        const event = generateEvent(userId, JSON.stringify(requestBody));

        // Act
        const response = await handler(event, {} as Context);
        const responseBody = JSON.parse(response.body ?? '');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(responseBody).toMatchObject({
          schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
          id: userId,
          meta: {
            created: '2022-01-01',
            resourceType: 'User',
          },
          userName: 'username1',
          emails: [
            {
              value: 'emile@gerlachsenger.uk',
              primary: true,
              type: 'work',
            },
          ],
          name: {
            familyName: 'Laney',
          },
          externalId: '123456789',
          active: true,
        });
      });
    });
    describe('And the user exists with a valid domain with different casing', () => {
      test('then it returns 200 status code and the updated scim user', async () => {
        // Arrange
        const userId = 'existingUserIdWithDifferentCasing';
        const requestBody = generateValidRequestBody(userId, 'test@USER.com');
        const event = generateEvent(userId, JSON.stringify(requestBody));

        // Act
        const response = await handler(event, {} as Context);
        const responseBody = JSON.parse(response.body ?? '');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(responseBody).toMatchObject({
          schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
          id: userId,
          meta: {
            created: '2022-01-01',
            resourceType: 'User',
          },
          userName: 'username1',
          emails: [
            {
              value: 'test@UsEr.CoM',
              primary: true,
              type: 'work',
            },
          ],
          name: {
            familyName: 'Laney',
          },
          externalId: '123456789',
          active: true,
        });
      });
    });
    describe('And the user does not exist', () => {
      test('then it returns 404 NotFound response', async () => {
        // Arrange
        const userId = 'nonexistent-user-id';
        const requestBody = generateValidRequestBody(
          userId,
          'emile@gerlachsenger.uk'
        );
        const event = generateEvent(userId, JSON.stringify(requestBody));

        // Act
        const response = await handler(event, {} as Context);

        // Assert
        expect(response).toEqual(
          expect.objectContaining(NotFoundResponse('User not found.'))
        );
      });
    });
    describe('And the users email domain is invalid', () => {
      test('then it returns 403 Forbidden response', async () => {
        // Arrange
        const userId = 'userWithInvalidDomain';
        const requestBody = generateValidRequestBody(
          userId,
          'emile@gerlachsenger.uk'
        );
        const event = generateEvent(userId, JSON.stringify(requestBody));

        // Act
        const response = await handler(event, {} as Context);

        // Assert
        expect(response).toEqual(
          expect.objectContaining(
            scimErrorResponse(
              403,
              'Attempting to update user for unauthorized domain.'
            )
          )
        );
      });
    });
    describe('And the hasura update query is invalid', () => {
      test('then it returns 500 Internal Server Error response', async () => {
        // Arrange
        const userId = 'some-random-id';
        const requestBody = generateValidRequestBody(userId);
        const event = generateEvent(userId, JSON.stringify(requestBody));

        // Act
        const response = await handler(event, {} as Context);

        // Assert
        expect(response.statusCode).toBe(500);
        expect(response).toEqual(
          expect.objectContaining(InternalServerErrorResponse())
        );
      });
    });
    describe('And the hasura update query fails', () => {
      test('then it returns 500 Internal Server Error response', async () => {
        // Arrange
        const userId = 'error-user-id';
        const requestBody = generateValidRequestBody(userId);
        const event = generateEvent(userId, JSON.stringify(requestBody));

        // Act
        const response = await handler(event, {} as Context);

        // Assert
        expect(response.statusCode).toBe(500);
        expect(response).toEqual(
          expect.objectContaining(InternalServerErrorResponse())
        );
      });
    });
  });
  describe('When the request body is invalid', () => {
    test('then it returns 400 Bad Request response', async () => {
      const event = generateEvent('userId', '{}');

      const response = await handler(event, {} as Context);

      expect(response).toEqual(
        expect.objectContaining(BadRequestResponse('Invalid request body.'))
      );
    });
  });
  describe('When the path parameter is not provided', () => {
    test('then it returns 400 Bad Request response', async () => {
      const event = generateEvent(undefined, '{}');

      const response = await handler(event, {} as Context);

      expect(response).toEqual(
        expect.objectContaining(
          BadRequestResponse('userId path parameter is not provided.')
        )
      );
    });
  });
});
