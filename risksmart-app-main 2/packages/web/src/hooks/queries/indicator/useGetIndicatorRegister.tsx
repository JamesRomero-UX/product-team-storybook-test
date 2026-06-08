import type { IndicatorRegisterResponse } from '@risksmart-app/trpc/src/types';
import type {
  GetIndicatorsQuery,
  Indicator_Bool_Exp,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetIndicatorsDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';

const useIndicatorGraphqlVariables = () => {
  const whereFilter = useEntityWhereFilter<Indicator_Bool_Exp>(
    Parent_Type_Enum.Indicator
  );

  return { where: whereFilter };
};

/**
 * Maps TRPC indicator data to match the GraphQL query structure
 * Exported for use by data sources
 */
export function mapTrpcIndicatorsToGraphQL(
  trpcData: IndicatorRegisterResponse | undefined
): GetIndicatorsQuery | undefined {
  if (!trpcData) {
    return undefined;
  }

  return {
    indicator: trpcData.indicators,
  };
}

export const useGetIndicatorRegister = createQueryHook<
  Record<string, never>,
  IndicatorRegisterResponse,
  GetIndicatorsQuery
>({
  trpcQueryOptions: (trpc) => trpc.frontend.indicator.register.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ indicator: data.indicators }),
  graphqlDocument: GetIndicatorsDocument,
  graphqlVariables: useIndicatorGraphqlVariables,
});
