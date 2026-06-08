import type { AcceptanceRegisterResponse } from '@risksmart-app/trpc/src/types';
import type {
  Acceptance_Bool_Exp,
  GetAcceptancesQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetAcceptancesDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';

const useAcceptancesGraphqlVariables = () => {
  const whereFilter = useEntityWhereFilter<Acceptance_Bool_Exp>(
    Parent_Type_Enum.Acceptance
  );

  return { where: whereFilter };
};

/**
 * Maps TRPC acceptance data to match the GraphQL query structure
 */
export function mapTrpcAcceptancesToGraphQL(
  trpcData: AcceptanceRegisterResponse
): GetAcceptancesQuery {
  return {
    acceptance: trpcData.acceptance,
  };
}

type UseGetAcceptancesRegisterArgs = Record<string, never>;

export const useGetAcceptancesRegister = createQueryHook<
  UseGetAcceptancesRegisterArgs,
  AcceptanceRegisterResponse,
  GetAcceptancesQuery
>({
  trpcQueryOptions: (trpc) => trpc.frontend.acceptance.register.queryOptions(),
  mapTrpcDataToGraphQL: mapTrpcAcceptancesToGraphQL,
  graphqlDocument: GetAcceptancesDocument,
  graphqlVariables: useAcceptancesGraphqlVariables,
});
