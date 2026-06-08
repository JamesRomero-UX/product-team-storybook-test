import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetAppetitesGroupedByImpactQuery,
  GetAppetitesGroupedByImpactQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAppetitesGroupedByImpactDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetAppetitesGroupedByImpactResponse = (
  response: GetAppetitesGroupedByImpactQuery = {
    impact: [],
  }
): MockedResponse<
  GetAppetitesGroupedByImpactQuery,
  GetAppetitesGroupedByImpactQueryVariables
> => ({
  request: {
    query: GetAppetitesGroupedByImpactDocument,
  },
  result: {
    data: response,
  },
});
