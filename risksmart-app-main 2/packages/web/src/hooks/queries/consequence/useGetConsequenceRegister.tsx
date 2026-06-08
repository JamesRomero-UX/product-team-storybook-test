import type { ConsequenceRegisterResponse } from '@risksmart-app/trpc/src/types';
import type {
  Consequence_Bool_Exp,
  GetConsequencesQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetConsequencesDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';

const useConsequenceGraphqlVariables = () => {
  const whereFilter = useEntityWhereFilter<Consequence_Bool_Exp>(
    Parent_Type_Enum.Consequence
  );

  return { where: whereFilter };
};

type UseGetConsequenceRegisterArgs = Record<string, never>;

export const useGetConsequenceRegister = createQueryHook<
  UseGetConsequenceRegisterArgs,
  ConsequenceRegisterResponse,
  GetConsequencesQuery
>({
  trpcQueryOptions: (trpc) => trpc.frontend.consequence.register.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ consequence: data.consequence }),
  graphqlDocument: GetConsequencesDocument,
  graphqlVariables: useConsequenceGraphqlVariables,
});

/**
 * Maps TRPC consequence data to match the GraphQL query structure
 * Exported for use in data sources
 */
export function mapTrpcConsequencesToGraphQL(
  trpcData: ConsequenceRegisterResponse | undefined
): GetConsequencesQuery | undefined {
  if (!trpcData) {
    return undefined;
  }

  return {
    consequence: trpcData.consequence,
  };
}
