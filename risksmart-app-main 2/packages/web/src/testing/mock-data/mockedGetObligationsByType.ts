import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetObligationsByTypeQuery,
  GetObligationsByTypeQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetObligationsByTypeDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetObligationsByTypeResponse = (
  variables: GetObligationsByTypeQueryVariables,
  response: GetObligationsByTypeQuery = {
    obligation: [],
  }
): MockedResponse<
  GetObligationsByTypeQuery,
  GetObligationsByTypeQueryVariables
> => ({
  request: {
    query: GetObligationsByTypeDocument,
    variables,
  },
  result: {
    data: response,
  },
});
