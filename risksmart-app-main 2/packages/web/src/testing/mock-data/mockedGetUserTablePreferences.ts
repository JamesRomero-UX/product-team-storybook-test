import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetUserTablePreferencesQuery,
  GetUserTablePreferencesQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetUserTablePreferencesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetUserTablePreferences = (
  TableId: string,
  response: GetUserTablePreferencesQuery = {
    user_table_preferences: [],
  }
): MockedResponse<
  GetUserTablePreferencesQuery,
  GetUserTablePreferencesQueryVariables
> => ({
  request: {
    query: GetUserTablePreferencesDocument,
    variables: { TableId },
  },
  result: {
    data: response,
  },
});
