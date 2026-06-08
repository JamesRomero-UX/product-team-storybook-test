import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetRiskListQuery,
  GetRiskListQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRiskListDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetRiskListResponse = (
  response: GetRiskListQuery = {
    node: [],
    risk: [],
  }
): MockedResponse<GetRiskListQuery, GetRiskListQueryVariables> => ({
  request: {
    query: GetRiskListDocument,
  },
  result: {
    data: response,
  },
});
