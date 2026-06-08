import type { RiskListOnlyWithEntitiesOptimizedResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetRiskListOnlyWithEntitiesOptimizedQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRiskListOnlyWithEntitiesOptimizedDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetRiskListOnlyWithEntitiesOptimizedArgs = Record<string, never>;

export const useGetRiskListOnlyWithEntitiesOptimized = createQueryHook<
  UseGetRiskListOnlyWithEntitiesOptimizedArgs,
  RiskListOnlyWithEntitiesOptimizedResponseRow[],
  GetRiskListOnlyWithEntitiesOptimizedQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.risk.riskListOnlyWithEntitiesOptimized.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ risk: data }),
  graphqlDocument: GetRiskListOnlyWithEntitiesOptimizedDocument,
});
