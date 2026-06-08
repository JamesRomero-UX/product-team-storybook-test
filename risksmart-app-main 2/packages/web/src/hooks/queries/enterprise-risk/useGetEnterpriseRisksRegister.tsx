import type { EnterpriseRiskRegisterResponse } from '@risksmart-app/trpc/src/types';
import type {
  Enterprise_Risk_Bool_Exp,
  GetEnterpriseRisksFlatQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetEnterpriseRisksFlatDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';

const useGraphqlVariables = () => {
  const where = useEntityWhereFilter<Enterprise_Risk_Bool_Exp>(
    Parent_Type_Enum.EnterpriseRisk
  );

  return { where };
};

type UseGetEnterpriseRisksRegisterArgs = Record<string, never>;

export const useGetEnterpriseRisksRegister = createQueryHook<
  UseGetEnterpriseRisksRegisterArgs,
  EnterpriseRiskRegisterResponse,
  GetEnterpriseRisksFlatQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.enterpriseRisk.register.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ enterprise_risk: data.enterprise_risk }),
  graphqlDocument: GetEnterpriseRisksFlatDocument,
  graphqlVariables: useGraphqlVariables,
});

/**
 * Maps TRPC enterprise risks data to match the GraphQL query structure
 * If Possible Use the hook directly instead.
 */
export function mapTrpcEnterpriseRisksToGraphQL(
  trpcData: EnterpriseRiskRegisterResponse | undefined
): GetEnterpriseRisksFlatQuery | undefined {
  if (!trpcData) {
    return undefined;
  }

  return {
    enterprise_risk: trpcData.enterprise_risk,
  };
}
