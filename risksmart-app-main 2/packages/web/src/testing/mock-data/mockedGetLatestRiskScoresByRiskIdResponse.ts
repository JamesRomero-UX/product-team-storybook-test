import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetLatestRiskScoresByRiskIdSubscription,
  GetLatestRiskScoresByRiskIdSubscriptionVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestRiskScoresByRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetLatestRiskScoresByRiskIdResponse = (
  variables: GetLatestRiskScoresByRiskIdSubscriptionVariables,
  response: GetLatestRiskScoresByRiskIdSubscription = {
    risk_score: [],
  }
): MockedResponse<
  GetLatestRiskScoresByRiskIdSubscription,
  GetLatestRiskScoresByRiskIdSubscriptionVariables
> => ({
  request: {
    query: GetLatestRiskScoresByRiskIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
