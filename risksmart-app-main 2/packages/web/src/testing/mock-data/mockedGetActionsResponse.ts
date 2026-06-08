import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetActionsQuery,
  GetActionsQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetActionsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetActionsResponse = (
  variables: GetActionsQueryVariables,
  response: GetActionsQuery = {
    action: [],
  }
): MockedResponse<GetActionsQuery, GetActionsQueryVariables> => ({
  request: {
    query: GetActionsDocument,
    variables,
  },
  result: {
    data: response,
  },
});
