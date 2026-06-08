import type { GetLatestImpactRatingsForRatedImpactsByRatedItemIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetLatestImpactRatingsForRatedImpactsByRatedItemIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestImpactRatingsForRatedImpactsByRatedItemIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetLatestImpactRatingsForRatedImpactsByRatedItemIdArgs = {
  ratedItemId: string;
};

export const useGetLatestImpactRatingsForRatedImpactsByRatedItemId =
  createQueryHook<
    UseGetLatestImpactRatingsForRatedImpactsByRatedItemIdArgs,
    GetLatestImpactRatingsForRatedImpactsByRatedItemIdResponseRow[],
    GetLatestImpactRatingsForRatedImpactsByRatedItemIdQuery
  >({
    trpcQueryOptions: (trpc, { ratedItemId }) =>
      trpc.frontend.impact.latestImpactRatingsForRatedImpactsByRatedItemId.queryOptions(
        {
          ratedItemId,
        }
      ),
    mapTrpcDataToGraphQL: (data) => ({ impact: data }),
    graphqlDocument: GetLatestImpactRatingsForRatedImpactsByRatedItemIdDocument,
    graphqlVariables: ({ ratedItemId }) => ({ RatedItemId: ratedItemId }),
  });
