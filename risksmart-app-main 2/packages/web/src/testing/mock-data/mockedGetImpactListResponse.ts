import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetImpactListQuery,
  GetImpactListQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetImpactListDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetImpactListResponse = (
  response: GetImpactListQuery = {
    impact: [],
  }
): MockedResponse<GetImpactListQuery, GetImpactListQueryVariables> => ({
  request: {
    query: GetImpactListDocument,
  },
  result: {
    data: response,
  },
});
