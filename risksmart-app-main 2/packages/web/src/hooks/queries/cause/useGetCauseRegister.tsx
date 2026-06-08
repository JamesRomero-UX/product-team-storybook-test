import type { CauseRegisterResponse } from '@risksmart-app/trpc/src/types';
import type {
  Cause_Bool_Exp,
  GetCausesQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetCausesDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';

const useCausesGraphqlVariables = () => {
  const whereFilter = useEntityWhereFilter<Cause_Bool_Exp>(
    Parent_Type_Enum.Cause
  );

  return { where: whereFilter };
};

type UseGetCauseRegisterArgs = Record<string, never>;

/**
 * Maps TRPC cause data to match the GraphQL query structure
 */
export function mapTrpcCausesToGraphQL(
  trpcData: CauseRegisterResponse
): GetCausesQuery {
  return {
    cause: trpcData.cause,
  };
}

export const useGetCauseRegister = createQueryHook<
  UseGetCauseRegisterArgs,
  CauseRegisterResponse,
  GetCausesQuery
>({
  trpcQueryOptions: (trpc) => trpc.frontend.cause.register.queryOptions(),
  mapTrpcDataToGraphQL: mapTrpcCausesToGraphQL,
  graphqlDocument: GetCausesDocument,
  graphqlVariables: useCausesGraphqlVariables,
});
