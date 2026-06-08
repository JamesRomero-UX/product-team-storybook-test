import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetRisksByTierQuery,
  GetRisksByTierQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRisksByTierDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetRisksByTierResponse = (
  variables: GetRisksByTierQueryVariables,
  response: GetRisksByTierQuery = {
    risk: [],
  }
): MockedResponse<GetRisksByTierQuery, GetRisksByTierQueryVariables> => ({
  request: {
    query: GetRisksByTierDocument,
    variables,
  },
  result: {
    data: response,
  },
});
