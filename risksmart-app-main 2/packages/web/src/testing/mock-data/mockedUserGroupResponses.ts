import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetUserGroupsQuery,
  GetUserGroupsQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetUserGroupsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedUserGroupResponse = (
  response: GetUserGroupsQuery = { user_group: [] }
): MockedResponse<GetUserGroupsQuery, GetUserGroupsQueryVariables> => ({
  request: {
    query: GetUserGroupsDocument,
  },
  result: {
    data: response,
  },
});
