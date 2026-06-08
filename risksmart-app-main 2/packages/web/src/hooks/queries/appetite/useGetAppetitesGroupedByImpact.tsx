import type { GetAppetitesGroupedByImpactResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetAppetitesGroupedByImpactQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAppetitesGroupedByImpactDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

export const useGetAppetitesGroupedByImpact = createQueryHook<
  Record<string, never>,
  GetAppetitesGroupedByImpactResponseRow[],
  GetAppetitesGroupedByImpactQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.appetite.getAppetitesGroupedByImpact.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ impact: data }),
  graphqlDocument: GetAppetitesGroupedByImpactDocument,
});
