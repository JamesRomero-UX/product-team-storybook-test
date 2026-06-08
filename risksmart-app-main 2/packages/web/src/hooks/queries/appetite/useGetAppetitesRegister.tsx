import type { AppetiteRegisterResponse } from '@risksmart-app/trpc/src/types';
import type {
  Appetite_Parent_Bool_Exp,
  GetActiveRiskAppetitesQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  Appetite_Status_Enum,
  Appetite_Type_Enum,
  GetActiveRiskAppetitesDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';

/**
 * Maps TRPC appetite data to match the GraphQL query structure
 */
export function mapTrpcAppetitesToGraphQL(
  trpcData: AppetiteRegisterResponse
): GetActiveRiskAppetitesQuery {
  return {
    appetite_parent: trpcData.appetite_parent,
  };
}

const useAppetitesGraphqlVariables = () => {
  const whereFilter = useEntityWhereFilter<Appetite_Parent_Bool_Exp>(
    Parent_Type_Enum.Appetite,
    {
      Status: { _eq: Appetite_Status_Enum.Active },
      appetite: { AppetiteType: { _eq: Appetite_Type_Enum.Risk } },
    }
  );

  return { where: whereFilter };
};

type UseGetAppetitesRegisterArgs = Record<string, never>;

export const useGetAppetitesRegister = createQueryHook<
  UseGetAppetitesRegisterArgs,
  AppetiteRegisterResponse,
  GetActiveRiskAppetitesQuery
>({
  trpcQueryOptions: (trpc) => trpc.frontend.appetite.register.queryOptions(),
  mapTrpcDataToGraphQL: mapTrpcAppetitesToGraphQL,
  graphqlDocument: GetActiveRiskAppetitesDocument,
  graphqlVariables: useAppetitesGraphqlVariables,
});
