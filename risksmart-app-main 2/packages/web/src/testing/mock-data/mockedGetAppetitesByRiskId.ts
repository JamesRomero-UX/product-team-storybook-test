import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetAppetitesByRiskIdQuery,
  GetAppetitesByRiskIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAppetitesByRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetAppetitesByRiskIdResponse = (
  variables: GetAppetitesByRiskIdQueryVariables,
  response: GetAppetitesByRiskIdQuery = {
    appetite_parent: [],
  }
): MockedResponse<
  GetAppetitesByRiskIdQuery,
  GetAppetitesByRiskIdQueryVariables
> => ({
  request: { variables, query: GetAppetitesByRiskIdDocument },
  result: {
    data: response,
  },
});
