import type { MockedResponse } from '@apollo/client/testing';
import type { GetGlobalUsersAndGroupsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetGlobalUsersAndGroupsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetGlobalUsersAndGroupsResponse = (
  response: GetGlobalUsersAndGroupsQuery = {
    globalUsers: { aggregate: { count: 0 }, nodes: [] },
    userGroups: [
      {
        Id: 'group1',
        Name: 'Group 1',
        users: [{ UserId: 'user1' }],
      },
      {
        Id: 'group2',
        Name: 'Group 2',
        users: [{ UserId: 'user2' }],
      },
    ],
  }
): MockedResponse<GetGlobalUsersAndGroupsQuery> => ({
  request: {
    query: GetGlobalUsersAndGroupsDocument,
  },
  result: {
    data: response,
  },
});
