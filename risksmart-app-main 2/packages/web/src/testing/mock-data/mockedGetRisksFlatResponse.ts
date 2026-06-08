import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetRisksFlatQuery,
  GetRisksFlatQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRisksFlatDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetRisksFlatResponse = (
  response: GetRisksFlatQuery = {
    risk: [],
  },
  variables: GetRisksFlatQueryVariables,
  delay = 0
): MockedResponse<GetRisksFlatQuery, GetRisksFlatQueryVariables> => ({
  request: {
    variables,
    query: GetRisksFlatDocument,
  },
  delay,
  result: {
    data: response,
  },
});
