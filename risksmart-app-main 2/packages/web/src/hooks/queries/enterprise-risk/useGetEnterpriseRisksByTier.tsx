import type { EnterpriseRiskByTierResponseRow } from '@risksmart-app/trpc/types';
import type { GetEnterpriseRisksByTierQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetEnterpriseRisksByTierDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetEnterpriseRiskByTierArgs = {
  tier: number;
};

export const useGetEnterpriseRiskByTier = createQueryHook<
  UseGetEnterpriseRiskByTierArgs,
  EnterpriseRiskByTierResponseRow[],
  GetEnterpriseRisksByTierQuery
>({
  trpcQueryOptions: (trpc, { tier }) =>
    trpc.frontend.enterpriseRisk.getByTier.queryOptions({ tier }),
  mapTrpcDataToGraphQL: (data) => ({ enterprise_risk: data }),
  graphqlDocument: GetEnterpriseRisksByTierDocument,
  graphqlVariables: ({ tier }) => ({ Tier: tier }),
});
