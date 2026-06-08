import type { RiskListOnlyOptimizedResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetRiskListOnlyOptimizedQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRiskListOnlyOptimizedDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

export const useGetRiskListOnlyOptimized = createQueryHook<
  Record<string, never>,
  RiskListOnlyOptimizedResponseRow[],
  GetRiskListOnlyOptimizedQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.risk.riskListOnlyOptimized.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ risk: data }),
  graphqlDocument: GetRiskListOnlyOptimizedDocument,
});
