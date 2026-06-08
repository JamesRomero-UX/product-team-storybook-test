import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { BadRequestResponse } from 'src/scim/responseTypes';
import type { ScimUser } from 'src/scim/types';
import { server } from 'src/testing/mocks/server';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

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

const generateEvent = (
  filter?: string,
  attributes?: string,
  startIndex?: string,
  count?: string
) => {
  return {
    ...((filter || attributes || startIndex || count) && {
      queryStringParameters: {
        filter,
        attributes,
        startIndex,
        count,
      },
      requestContext: {
        authorizer: {
          lambda: {
            orgKey: 'org-key',
            tenant: 'tenant',
            domains: JSON.stringify(['user.com, gerlachsenger.uk']),
          },
        },
      },
    }),
  } as unknown as APIGatewayProxyEventV2;
};

const user1: ScimUser = {
  schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
  id: '1',
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
    givenName: 'Caitlyn',
    familyName: 'Laney',
  },
  externalId: '123456789',
  active: true,
};
const user2: ScimUser = {
  schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
  id: '2',
  meta: {
    created: '2022-01-01',
    resourceType: 'User',
  },
  userName: 'username2',
  emails: [
    {
      value: 'test2@user.com',
      primary: true,
      type: 'work',
    },
  ],
  name: {
    givenName: 'Test2',
    familyName: 'User2',
  },
  externalId: '222222222',
  active: true,
};
const user3: ScimUser = {
  schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
  id: '3',
  meta: {
    created: '2022-01-01',
    resourceType: 'User',
  },
  userName: 'username3',
  emails: [
    {
      value: 'test3@user.com',
      primary: true,
      type: 'work',
    },
  ],
  name: {
    givenName: 'Test3',
    familyName: 'User3',
  },
  externalId: '333333333',
  active: true,
};
const user4: ScimUser = {
  schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
  id: '4',
  meta: {
    created: '2022-01-01',
    resourceType: 'User',
  },
  userName: 'username4',
  emails: [
    {
      value: 'test4@user.com',
      primary: true,
      type: 'work',
    },
  ],
  name: {
    givenName: 'Test4',
    familyName: 'User4',
  },
  externalId: '444444444',
  active: true,
};

// prettier-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { emails: user1Emails, name: user1Name, externalId: user1ExternalId, active: user1Active, ...user1WithUserNameOnly } = user1

interface TestCase {
  filter?: string;
  attributes?: string;
  startIndex?: string;
  count?: string;
  expectedStatusCode?: number;
  expectedUsers: ScimUser[];
  expectedTotalResults: number;
  expectedStartIndex: number;
  expectedItemsPerPage: number;
}

// prettier-ignore
const validFilterExpressions: TestCase[] = [
  // Basic filtering
  { filter: 'userName eq "username1"', attributes: undefined, startIndex: undefined, count: undefined, expectedUsers: [user1], expectedTotalResults: 1, expectedStartIndex: 1, expectedItemsPerPage: 200 },
  { filter: 'userName eq "username1" or userName eq "username2"', attributes: undefined, startIndex: undefined, count: undefined, expectedUsers: [user1, user2], expectedTotalResults: 2, expectedStartIndex: 1, expectedItemsPerPage: 200 },  
  { filter: 'userName eq "username1" and emails[type eq "work"].value eq "emile@gerlachsenger.uk"', attributes: undefined, startIndex: undefined, count: undefined, expectedUsers: [user1], expectedTotalResults: 1, expectedStartIndex: 1, expectedItemsPerPage: 200 },
  { filter: '(userName eq "username1" and emails[type eq "work"].value eq "emile@gerlachsenger.uk")', attributes: undefined, startIndex: undefined, count: undefined, expectedUsers: [user1], expectedTotalResults: 1, expectedStartIndex: 1, expectedItemsPerPage: 200 },
  { filter: 'userName eq "username1" and externalId eq "123456789"', attributes: undefined, startIndex: undefined, count: undefined, expectedUsers: [user1], expectedTotalResults: 1, expectedStartIndex: 1, expectedItemsPerPage: 200 },
  { filter: 'userName eq "username1" and active eq false', attributes: undefined, startIndex: undefined, count: undefined, expectedUsers: [], expectedTotalResults: 0, expectedStartIndex: 1, expectedItemsPerPage: 200 },
  { filter: 'active eq "true"', attributes: undefined, startIndex: undefined, count: undefined, expectedUsers: [user1, user2, user3, user4], expectedTotalResults: 4, expectedStartIndex: 1, expectedItemsPerPage: 200 },
  // Attribute filtering
  { filter: 'userName eq "username1"', attributes: 'userName', startIndex: undefined, count: undefined, expectedUsers: [user1WithUserNameOnly], expectedTotalResults: 1, expectedStartIndex: 1, expectedItemsPerPage: 200 },
  { filter: 'userName eq "username1"', attributes: 'userName,active', startIndex: undefined, count: undefined, expectedUsers: [{...user1WithUserNameOnly, active:user1Active}], expectedTotalResults: 1, expectedStartIndex: 1, expectedItemsPerPage: 200 },
  // Pagination
  { filter: 'active eq "true"', attributes: undefined, startIndex: '3', count: '2', expectedUsers: [user3, user4], expectedTotalResults: 4, expectedStartIndex: 3, expectedItemsPerPage: 2 },
  { filter: 'active eq "true"', attributes: undefined, startIndex: '50', count: '2', expectedUsers: [], expectedTotalResults: 4, expectedStartIndex: 50, expectedItemsPerPage: 2 },
  { filter: 'active eq "true"', attributes: undefined, startIndex: '-1', count: undefined, expectedUsers: [user1, user2, user3, user4], expectedTotalResults: 4, expectedStartIndex: 1, expectedItemsPerPage: 200 },
  { filter: 'active eq "true"', attributes: undefined, startIndex: undefined, count: '-1', expectedUsers: [], expectedTotalResults: 4, expectedStartIndex: 1, expectedItemsPerPage: 0 },
];

// prettier-ignore
const invalidFilterExpressions = [
    { filter: 'userName co "username1"', attributes: undefined, startIndex: undefined, count: undefined, expectedStatusCode: 400, expectedUsers: [user1], expectedTotalResults: 1, expectedStartIndex: 1, expectedItemsPerPage: 200 },
]

describe('GET /Users', () => {
  describe('When the request query string is valid', () => {
    describe('And the query string contains a valid filter expression', () => {
      test.each(validFilterExpressions)(
        `filter: $filter, attributes: $attributes, startIndex: $startIndex, count: $count - returns 200 status code and $expectedTotalResults scim users`,
        async ({
          filter,
          attributes,
          startIndex,
          count,
          expectedUsers,
          expectedTotalResults,
          expectedStartIndex,
          expectedItemsPerPage,
        }) => {
          const event = generateEvent(filter, attributes, startIndex, count);

          const response = await handler(event, {} as Context);
          const responseBody = JSON.parse(response.body ?? '');

          expect(response.statusCode).toBe(200);
          expect(responseBody).toMatchObject({
            schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
            totalResults: expectedTotalResults,
            Resources: expectedUsers,
            startIndex: expectedStartIndex,
            itemsPerPage: expectedItemsPerPage,
          });
        }
      );
    });
  });
  describe('When the request query string is invalid', () => {
    describe('And the query string contains an invalid filter expression', () => {
      test.each(invalidFilterExpressions)(
        `filter: $filter, attributes: $attributes, startIndex: $startIndex, count: $count - returns $expectedStatusCode status code and $expectedTotalResults scim users`,
        async ({
          filter,
          attributes,
          startIndex,
          count,
          expectedStatusCode,
        }) => {
          const event = generateEvent(filter, attributes, startIndex, count);

          const response = await handler(event, {} as Context);

          expect(response.statusCode).toBe(expectedStatusCode);
          expect(response).toEqual(
            expect.objectContaining(
              BadRequestResponse('Invalid query string parameters.')
            )
          );
        }
      );
    });
  });
});
