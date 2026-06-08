import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetObligationListQuery,
  GetObligationListQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetObligationListDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetObligationListResponse = (
  variables: GetObligationListQueryVariables,
  response: GetObligationListQuery = {
    obligation: [],
    node: [],
  }
): MockedResponse<GetObligationListQuery, GetObligationListQueryVariables> => ({
  request: {
    query: GetObligationListDocument,
    variables,
  },
  result: {
    data: response,
  },
});
