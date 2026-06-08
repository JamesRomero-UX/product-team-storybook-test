import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import {
  BadRequestResponse,
  InternalServerErrorResponse,
  NotFoundResponse,
  scimErrorResponse,
} from 'src/scim/responseTypes';
import { server } from 'src/testing/mocks/server';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { handler } from './patch';

vi.mock('sst/node/config', () => {
  return {
    Config: {
      HASURA_ADMIN_SECRET: 'dummy-secret',
    },
  };
});

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => server.close());

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

describe('PATCH /Users/{id}', () => {
  describe('When the request body is valid', () => {
    describe('And the user exists with a valid domain in the same casing', () => {
      test('then it returns 200 status code and the updated scim user', async () => {
        const userId = '1';
        const event = generateEvent(
          userId,
          JSON.stringify({
            Operations: [
              {
                op: 'add',
                path: 'externalId',
                value: '123456789',
              },
              {
                op: 'replace',
                path: 'emails[type eq "work"].value',
                value: 'test@user.com',
              },
              {
                op: 'replace',
                value: {
                  active: true,
                  'name.familyName': 'Laney',
                },
              },
              {
                op: 'remove',
                path: 'name.givenName',
              },
            ],
            schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          })
        );

        const response = await handler(event, {} as Context);
        const responseBody = JSON.parse(response.body ?? '');

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
        const userId = 'existingUserIdWithDifferentCasing';
        const event = generateEvent(
          userId,
          JSON.stringify({
            Operations: [
              {
                op: 'add',
                path: 'externalId',
                value: '123456789',
              },
              {
                op: 'replace',
                path: 'emails[type eq "work"].value',
                value: 'test@UsEr.CoM',
              },
              {
                op: 'replace',
                value: {
                  active: true,
                  'name.familyName': 'Laney',
                },
              },
              {
                op: 'remove',
                path: 'name.givenName',
              },
            ],
            schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          })
        );

        const response = await handler(event, {} as Context);
        const responseBody = JSON.parse(response.body ?? '');

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
        const event = generateEvent(
          'nonexistent-user-id',
          JSON.stringify({
            Operations: [
              {
                op: 'replace',
                path: 'emails[type eq "work"].value',
                value: 'emile@gerlachsenger.uk',
              },
              {
                op: 'replace',
                value: {
                  active: true,
                  'name.givenName': 'Caitlyn',
                  'name.familyName': 'Laney',
                },
              },
            ],
            schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          })
        );

        const response = await handler(event, {} as Context);

        expect(response).toEqual(
          expect.objectContaining(NotFoundResponse('User not found.'))
        );
      });
    });
    describe('And the users email domain is invalid', () => {
      test('then it returns 403 Forbidden response', async () => {
        const event = generateEvent(
          'userWithInvalidDomain',
          JSON.stringify({
            Operations: [
              {
                op: 'replace',
                path: 'emails[type eq "work"].value',
                value: 'emile@gerlachsenger.uk',
              },
              {
                op: 'replace',
                value: {
                  active: true,
                  'name.givenName': 'Caitlyn',
                  'name.familyName': 'Laney',
                },
              },
            ],
            schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          })
        );

        const response = await handler(event, {} as Context);

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
        const userId = 'some-random-id';
        const event = generateEvent(
          userId,
          JSON.stringify({
            Operations: [
              {
                op: 'Add',
                path: 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User:manager',
                value: 'waad|K6Ht_GUseG-NTvvPv8B_qfW8isFBFR1C4QcoAHQkSOs',
              },
            ],
            schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          })
        );

        const response = await handler(event, {} as Context);

        expect(response.statusCode).toBe(500);
        expect(response).toEqual(
          expect.objectContaining(InternalServerErrorResponse())
        );
      });
    });
    describe('And the hasura update query fails', () => {
      test('then it returns 500 Internal Server Error response', async () => {
        const userId = 'error-user-id';
        const event = generateEvent(
          userId,
          JSON.stringify({
            Operations: [
              {
                op: 'add',
                path: 'externalId',
                value: '123456789',
              },
            ],
            schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          })
        );

        const response = await handler(event, {} as Context);

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
