import type { AggregationSettingsForOrgResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetAggregationSettingsForOrgQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAggregationSettingsForOrgDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetAggregationSettingsForOrgArgs = Record<string, never>;

export const useGetAggregationSettingsForOrg = createQueryHook<
  UseGetAggregationSettingsForOrgArgs,
  AggregationSettingsForOrgResponseRow[],
  GetAggregationSettingsForOrgQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.aggregation.getAggregationSettingsForOrg.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ aggregation_org: data }),
  graphqlDocument: GetAggregationSettingsForOrgDocument,
  graphqlFetchPolicy: 'cache-first',
});
