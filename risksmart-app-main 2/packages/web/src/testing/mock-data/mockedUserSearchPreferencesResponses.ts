import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetUserSearchPreferencesQuery,
  GetUserSearchPreferencesQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetUserSearchPreferencesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedUserSearchPreferencesResponses = (
  response: GetUserSearchPreferencesQuery = { user_search_preferences: [] }
): MockedResponse<
  GetUserSearchPreferencesQuery,
  GetUserSearchPreferencesQueryVariables
> => ({
  request: {
    query: GetUserSearchPreferencesDocument,
  },
  result: {
    data: response,
  },
});
