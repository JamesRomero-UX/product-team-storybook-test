import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetRiskScoresByRiskIdQuery,
  GetRiskScoresByRiskIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRiskScoresByRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetRiskScoresByRiskIdResponse = (
  variables: GetRiskScoresByRiskIdQueryVariables,
  response: GetRiskScoresByRiskIdQuery = {
    risk: [],
    residual: [],
    inherent: [],
  }
): MockedResponse<
  GetRiskScoresByRiskIdQuery,
  GetRiskScoresByRiskIdQueryVariables
> => ({
  request: {
    query: GetRiskScoresByRiskIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
