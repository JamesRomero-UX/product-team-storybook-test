import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetLatestImpactRatingsForRatedImpactsByRatedItemIdQuery,
  GetLatestImpactRatingsForRatedImpactsByRatedItemIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestImpactRatingsForRatedImpactsByRatedItemIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetLatestImpactRatingsForRatedImpactsByRatedItemIdQueryResponse =
  (
    variables: GetLatestImpactRatingsForRatedImpactsByRatedItemIdQueryVariables,
    response: GetLatestImpactRatingsForRatedImpactsByRatedItemIdQuery = {
      impact: [],
    }
  ): MockedResponse<
    GetLatestImpactRatingsForRatedImpactsByRatedItemIdQuery,
    GetLatestImpactRatingsForRatedImpactsByRatedItemIdQueryVariables
  > => ({
    request: {
      query: GetLatestImpactRatingsForRatedImpactsByRatedItemIdDocument,
      variables,
    },
    result: {
      data: response,
    },
  });
