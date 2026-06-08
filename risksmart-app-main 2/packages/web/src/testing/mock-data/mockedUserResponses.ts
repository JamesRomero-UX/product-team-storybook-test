import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetUsersQuery,
  GetUsersQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetUsersDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedUsersResponse = (
  response: GetUsersQuery = { user: [] }
): MockedResponse<GetUsersQuery, GetUsersQueryVariables> => ({
  request: {
    query: GetUsersDocument,
  },
  result: {
    data: response,
  },
});
