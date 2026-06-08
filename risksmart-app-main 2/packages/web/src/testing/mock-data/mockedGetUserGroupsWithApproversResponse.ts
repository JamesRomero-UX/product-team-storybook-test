import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetUserGroupsWithApproversQuery,
  GetUserGroupsWithApproversQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetUserGroupsWithApproversDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetUserGroupsWithApproversResponse = (
  response: GetUserGroupsWithApproversQuery = { user_group: [] }
): MockedResponse<
  GetUserGroupsWithApproversQuery,
  GetUserGroupsWithApproversQueryVariables
> => ({
  request: {
    query: GetUserGroupsWithApproversDocument,
  },
  result: {
    data: response,
  },
});
