import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { BadRequestResponse, ConflictResponse } from 'src/scim/responseTypes';
import * as assignUserToOrgService from 'src/services/hasura/assignUserToOrg';
import * as createUserService from 'src/services/hasura/createUser';
import * as updateUserService from 'src/services/hasura/updateUser';
import { server } from 'src/testing/mocks/server';
import type { MockInstance } from 'vitest';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';

import type { PostSchema } from './post';
import { handler } from './post';

vi.mock('sst/node/config', () => {
  return {
    Config: {
      HASURA_ADMIN_SECRET: 'dummy-secret',
    },
  };
});

vi.mock('crypto', () => ({
  randomUUID: vi.fn(),
}));

const generateValidRequestBody = (
  email?: string,
  username?: string,
  externalId?: string
): PostSchema => ({
  schemas: [
    'urn:ietf:params:scim:schemas:core:2.0:User',
    'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User',
  ],
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
    formatted: 'User 1',
    familyName: '1',
    givenName: 'User',
  },
  title: 'Techy',
  'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': {
    department: 'Tech People',
  },
  addresses: [{ primary: true, formatted: 'Manchester' }],
  groups: [],
});

const generateEvent = (body?: string, orgKey?: string, domains?: string[]) => {
  return {
    body,
    requestContext: {
      authorizer: {
        lambda: {
          orgKey: orgKey ?? 'org-key',
          tenant: 'tenant',
          domains: JSON.stringify(domains ?? ['test.com', 'user.com']),
        },
      },
    },
  } as unknown as APIGatewayProxyEventV2;
};

let updateUserSpy: MockInstance;
let assignUserToOrgSpy: MockInstance;
let createUserSpy: MockInstance;

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => {
  server.close();
  vi.resetAllMocks();
});
beforeEach(() => {
  updateUserSpy = vi.spyOn(updateUserService, 'updateUser');
  assignUserToOrgSpy = vi.spyOn(assignUserToOrgService, 'assignUserToOrg');
  createUserSpy = vi.spyOn(createUserService, 'createUser');
});
afterEach(() => {
  updateUserSpy.mockRestore();
});

describe('Post /Users handler', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  beforeAll(async () => {
    const { randomUUID } = await import('crypto');
    vi.mocked(randomUUID).mockReturnValue(mockUserId);
  });
  describe('when the request body is invalid', () => {
    test('then return status 400 bad request response', async () => {
      const mockEvent = generateEvent('{}');

      const result = await handler(mockEvent, {} as Context);

      expect(result).toEqual(
        expect.objectContaining(BadRequestResponse('Invalid request body.'))
      );
    });
  });
  describe('when the request body is valid', () => {
    describe('and no email address is provided', () => {
      test('then return status 400 bad request response', async () => {
        // Arrange
        const requestBody = {
          ...generateValidRequestBody(),
          emails: undefined,
        };
        const validDomains = ['validdomain.com'];
        const mockEvent = generateEvent(
          JSON.stringify(requestBody),
          undefined,
          validDomains
        );

        // Act
        const result = await handler(mockEvent, {} as Context);

        // Assert
        expect(result).toEqual(
          expect.objectContaining(BadRequestResponse('Email is required.'))
        );
      });
    });
    describe('and the users email domain is not allowed', () => {
      test('then return status 400 bad request response', async () => {
        // Arrange
        const invalidEmailAddress = 'bob@invaliddomain.com';
        const requestBody = generateValidRequestBody(invalidEmailAddress);
        const validDomains = ['validdomain.com'];
        const mockEvent = generateEvent(
          JSON.stringify(requestBody),
          undefined,
          validDomains
        );

        // Act
        const result = await handler(mockEvent, {} as Context);

        // Assert
        expect(result).toEqual(
          expect.objectContaining(
            BadRequestResponse('Email domain is not allowed.')
          )
        );
      });
    });
    describe('and the organisation does not exist in hasura', () => {
      describe('and the user does not exist in hasura', () => {
        describe('and the users email is in the same casing as the authorized domains', () => {
          test('then create the org and user in hasura and return 201 status code and the scim user response', async () => {
            // Arrange
            const requestBody = generateValidRequestBody(
              'nonexistinguser@test.com'
            );
            const event = generateEvent(
              JSON.stringify(requestBody),
              'new-org-key'
            );

            // Act
            const result = await handler(event, {} as Context);

            // Assert
            expect(updateUserSpy).toHaveBeenCalledTimes(0);
            expect(assignUserToOrgSpy).toHaveBeenCalledTimes(0);
            expect(createUserSpy).toHaveBeenCalledTimes(1);
            expect(result.statusCode).toBe(201);
            expect(JSON.parse(result.body!)).toEqual({
              schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
              id: mockUserId,
              meta: {
                created: '2024-05-20T15:41:30.089358+00:00',
                resourceType: 'User',
              },
              userName: 'user1',
              emails: [
                {
                  value: 'nonexistinguser@test.com',
                  primary: true,
                  type: 'work',
                },
              ],
              name: {
                givenName: 'User',
                familyName: '1',
                formatted: 'User 1',
              },
              active: true,
              externalId: '123456789',
              title: 'Techy',
              'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': {
                department: 'Tech People',
              },
              addresses: [{ type: 'work', formatted: 'Manchester' }],
            });
          });
        });
        describe('and the users email is in a different casing to the authorized domains', () => {
          test('then create the org and user in hasura and return 201 status code and the scim user response', async () => {
            // Arrange
            const requestBody = generateValidRequestBody(
              'nonexistinguser@TeSt.CoM'
            );
            const event = generateEvent(
              JSON.stringify(requestBody),
              'new-org-key'
            );

            // Act
            const result = await handler(event, {} as Context);

            // Assert
            expect(updateUserSpy).toHaveBeenCalledTimes(0);
            expect(assignUserToOrgSpy).toHaveBeenCalledTimes(0);
            expect(createUserSpy).toHaveBeenCalledTimes(1);
            expect(result.statusCode).toBe(201);
            expect(JSON.parse(result.body!)).toEqual({
              schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
              id: mockUserId,
              meta: {
                created: '2024-05-20T15:41:30.089358+00:00',
                resourceType: 'User',
              },
              userName: 'user1',
              emails: [
                {
                  value: 'nonexistinguser@TeSt.CoM',
                  primary: true,
                  type: 'work',
                },
              ],
              name: {
                givenName: 'User',
                familyName: '1',
                formatted: 'User 1',
              },
              active: true,
              externalId: '123456789',
              title: 'Techy',
              'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': {
                department: 'Tech People',
              },
              addresses: [{ type: 'work', formatted: 'Manchester' }],
            });
          });
        });
      });
      describe('and the user already exists in hasura for a different org', () => {
        test('then create the org, update user and return 201 status code', async () => {
          // Arrange
          const requestBody = generateValidRequestBody(
            'existinguser-differentorg@test.com'
          );
          const event = generateEvent(
            JSON.stringify(requestBody),
            'new-org-key'
          );

          // Act
          const result = await handler(event, {} as Context);

          // Assert
          expect(updateUserSpy).toHaveBeenCalledTimes(1);
          expect(assignUserToOrgSpy).toHaveBeenCalledTimes(1);
          expect(createUserSpy).toHaveBeenCalledTimes(0);
          expect(result.statusCode).toBe(201);
          expect(JSON.parse(result.body!)).toEqual({
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
            id: 'existingUserId',
            meta: {
              created: '2024-05-09T06:49:01.185284+00:00',
              resourceType: 'User',
            },
            userName: 'user1',
            emails: [
              {
                value: 'existinguser-differentorg@test.com',
                primary: true,
                type: 'work',
              },
            ],
            name: {
              givenName: 'User',
              familyName: '1',
              formatted: 'User 1',
            },
            active: true,
            externalId: '123456789',
          });
        });
      });
    });
    describe('and the organisation already exists in hasura', () => {
      describe('and the user does not exist in hasura', () => {
        test('then create the user in hasura and return 201 status code and the scim user response', async () => {
          // Arrange
          const requestBody = generateValidRequestBody(
            'nonexistinguser@test.com'
          );
          const event = generateEvent(
            JSON.stringify(requestBody),
            'existing-org-key'
          );

          // Act
          const result = await handler(event, {} as Context);

          // Assert
          expect(updateUserSpy).toHaveBeenCalledTimes(0);
          expect(assignUserToOrgSpy).toHaveBeenCalledTimes(0);
          expect(createUserSpy).toHaveBeenCalledTimes(1);
          expect(result.statusCode).toBe(201);
          expect(JSON.parse(result.body!)).toEqual({
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
            id: mockUserId,
            meta: {
              created: '2024-05-20T15:41:30.089358+00:00',
              resourceType: 'User',
            },
            userName: 'user1',
            emails: [
              {
                value: 'nonexistinguser@test.com',
                primary: true,
                type: 'work',
              },
            ],
            name: {
              givenName: 'User',
              familyName: '1',
              formatted: 'User 1',
            },
            active: true,
            externalId: '123456789',
            title: 'Techy',
            'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': {
              department: 'Tech People',
            },
            addresses: [{ type: 'work', formatted: 'Manchester' }],
          });
        });
      });
      describe('and the user already exists in hasura', () => {
        test('then return 409 status code', async () => {
          // Arrange
          const requestBody = generateValidRequestBody(
            'existinguser-existingorg@test.com'
          );
          const event = generateEvent(
            JSON.stringify(requestBody),
            'existing-org-key'
          );

          // Act
          const result = await handler(event, {} as Context);

          // Assert
          expect(result.statusCode).toBe(409);
          expect(result).toEqual(
            expect.objectContaining(
              ConflictResponse('User with email already exists.')
            )
          );
        });
      });
    });
  });
});
