import type {
  RiskRegisterResponse,
  RiskRegisterResponseRow,
} from '@risksmart-app/trpc/src/types';
import type {
  GetRisksFlatQuery,
  Risk_Bool_Exp,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetRisksFlatDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';

function mapTrpcRiskToGraphQL(
  risk: RiskRegisterResponseRow
): GetRisksFlatQuery['risk'][number] {
  return {
    ...risk,
    // impactRatingsForTrend is the same data as impactRatings but used for trend calculation
    // The ordering is already handled in the query
    impactRatingsForTrend: risk.impactRatings,
    controls_aggregate: {
      aggregate: {
        count: risk.controls.length,
      },
    },
    indicators_aggregate: {
      aggregate: {
        count: risk.indicators.length,
      },
    },
    actions_aggregate: {
      aggregate: {
        count: risk.actions.length,
      },
    },
  };
}

/**
 * Maps TRPC risk data to match the GraphQL query structure
 */
export function mapTrpcRisksToGraphQL(
  trpcData: RiskRegisterResponse
): GetRisksFlatQuery {
  return {
    risk: trpcData.risk.map((risk) => mapTrpcRiskToGraphQL(risk)),
  };
}

const useRiskRegisterGraphqlVariables = () => {
  const where = useEntityWhereFilter<Risk_Bool_Exp>(Parent_Type_Enum.Risk);

  return { where };
};

type UseGetRiskRegisterArgs = Record<string, never>;

export const useGetRiskRegister = createQueryHook<
  UseGetRiskRegisterArgs,
  RiskRegisterResponse,
  GetRisksFlatQuery
>({
  trpcQueryOptions: (trpc) => trpc.frontend.risk.register.queryOptions(),
  mapTrpcDataToGraphQL: mapTrpcRisksToGraphQL,
  graphqlDocument: GetRisksFlatDocument,
  graphqlVariables: useRiskRegisterGraphqlVariables,
});
