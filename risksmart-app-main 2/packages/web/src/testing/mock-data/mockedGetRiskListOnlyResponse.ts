import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetRiskListOnlyOptimizedQuery,
  GetRiskListOnlyOptimizedQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRiskListOnlyOptimizedDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetRiskListOnlyResponse = (
  response: GetRiskListOnlyOptimizedQuery = {
    risk: [],
  }
): MockedResponse<
  GetRiskListOnlyOptimizedQuery,
  GetRiskListOnlyOptimizedQueryVariables
> => ({
  request: {
    query: GetRiskListOnlyOptimizedDocument,
  },
  result: {
    data: response,
  },
});
