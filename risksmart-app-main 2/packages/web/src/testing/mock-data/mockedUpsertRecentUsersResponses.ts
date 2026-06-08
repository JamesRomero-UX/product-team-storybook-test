import type { MockedResponse } from '@apollo/client/testing';
import type {
  UpsertRecentUsersMutation,
  UpsertRecentUsersMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { UpsertRecentUsersDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedUpsertRecentUsersResponses = (
  variables: UpsertRecentUsersMutationVariables
): MockedResponse<
  UpsertRecentUsersMutation,
  UpsertRecentUsersMutationVariables
> => ({
  request: {
    query: UpsertRecentUsersDocument,
    variables,
  },
  result: {
    data: {
      insert_user_search_preferences: {
        affected_rows: 1,
      },
    },
  },
});
