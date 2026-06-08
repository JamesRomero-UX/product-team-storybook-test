import type { MockedResponse } from '@apollo/client/testing';
import type {
  UpsertUserTablePreferencesMutation,
  UpsertUserTablePreferencesMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { UpsertUserTablePreferencesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedUpsertUserTablePreferences = (
  variables: UpsertUserTablePreferencesMutationVariables,
  response: UpsertUserTablePreferencesMutation = {
    insert_user_table_preferences: { affected_rows: 1 },
  }
): MockedResponse<
  UpsertUserTablePreferencesMutation,
  UpsertUserTablePreferencesMutationVariables
> => ({
  request: {
    query: UpsertUserTablePreferencesDocument,
    variables,
  },
  result: {
    data: response,
  },
});
