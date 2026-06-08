import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { BadRequestResponse, NotFoundResponse } from 'src/scim/responseTypes';
import { server } from 'src/testing/mocks/server';
import { describe, expect, test, vi } from 'vitest';

import { handler } from './get';

vi.mock('sst/node/config', () => {
  return {
    Config: {
      HASURA_ADMIN_SECRET: 'dummy-secret',
    },
  };
});

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => server.close());

const requestContext = {
  authorizer: {
    lambda: {
      orgKey: 'org-key',
      tenant: 'tenant',
      domains: JSON.stringify(['user.com']),
    },
  },
};

describe('Get /Users/{userId}', () => {
  const generateEvent = (userId?: string) =>
    ({
      pathParameters: userId ? { userId } : {},
      requestContext,
    }) as unknown as APIGatewayProxyEventV2;
  describe('when the userId is not provided', () => {
    test('then return status 400', async () => {
      // Arrange
      const event = {
        pathParameters: {},
        requestContext,
      } as unknown as APIGatewayProxyEventV2;

      // Act
      const response = await handler(event, {} as Context);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response).toEqual(
        expect.objectContaining(
          BadRequestResponse('userId path parameter is not provided.')
        )
      );
    });
  });

  describe('when the user exists in Hasura', () => {
    describe('and the user is a member of the given organisation', () => {
      describe('and the users email has a valid domain', () => {
        test('then return status 200 and the scim user', async () => {
          // Arrange
          const userId = 'existingUserId';
          const event = generateEvent(userId);

          // Act
          const response = await handler(event, {} as Context);
          const responseBody = JSON.parse(response.body ?? '');

          // Assert
          expect(response.statusCode).toBe(200);
          expect(responseBody).toHaveProperty('schemas', [
            'urn:ietf:params:scim:schemas:core:2.0:User',
          ]);
          expect(responseBody).toHaveProperty('id', userId);
          expect(responseBody).toStrictEqual({
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
            id: userId,
            meta: {
              created: '2022-01-01',
              resourceType: 'User',
            },
            userName: 'testUser',
            emails: [
              {
                value: 'test@user.com',
                primary: true,
                type: 'work',
              },
            ],
            active: true,
          });
        });
      });
      describe('and the users email has a valid domain with different casing', () => {
        test('then return status 200 and the scim user', async () => {
          // Arrange
          const userId = 'existingUserIdWithDifferentCasing';
          const event = generateEvent(userId);

          // Act
          const response = await handler(event, {} as Context);
          const responseBody = JSON.parse(response.body ?? '');
          console.log('response', response);

          // Assert
          expect(response.statusCode).toBe(200);
          expect(responseBody).toHaveProperty('schemas', [
            'urn:ietf:params:scim:schemas:core:2.0:User',
          ]);
          expect(responseBody).toHaveProperty('id', userId);
          expect(responseBody).toStrictEqual({
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
            id: userId,
            meta: {
              created: '2022-01-01',
              resourceType: 'User',
            },
            userName: 'testUser',
            emails: [
              {
                value: 'test@UsEr.CoM',
                primary: true,
                type: 'work',
              },
            ],
            active: true,
          });
        });
      });
      describe('and the users email has an invalid domain', () => {
        test('then return status 400', async () => {
          // Arrange
          const userId = 'userWithInvalidDomain';
          const event = generateEvent(userId);

          // Act
          const response = await handler(event, {} as Context);

          // Assert
          expect(response.statusCode).toBe(400);
          expect(response).toEqual(
            expect.objectContaining(
              BadRequestResponse(
                'Attempting to retrieve user for unauthorized domain.'
              )
            )
          );
        });
      });
    });
    describe('and the user is not a member of the given organisation', () => {
      test('then return status 400', async () => {
        // Arrange
        const userId = 'userNotInOrg';
        const event = generateEvent(userId);

        // Act
        const response = await handler(event, {} as Context);

        // Assert
        expect(response.statusCode).toBe(400);
        expect(response).toEqual(
          expect.objectContaining(
            BadRequestResponse(
              'Attempting to retrieve user for unauthorized org.'
            )
          )
        );
      });
    });
  });
  describe('when the user does not exist in Hasura', () => {
    test('then return status 404', async () => {
      // Arrange
      const userId = 'auth0UserWithoutHasuraUser';
      const event = generateEvent(userId);

      // Act
      const response = await handler(event, {} as Context);

      // Assert
      expect(response.statusCode).toBe(404);
      expect(response).toEqual(
        expect.objectContaining(NotFoundResponse('User not found.'))
      );
    });
  });
});
