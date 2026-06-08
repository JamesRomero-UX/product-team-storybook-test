import type { ThirdPartyRegisterResponse } from '@risksmart-app/trpc/src/types';
import type {
  GetThirdPartiesQuery,
  Third_Party_Bool_Exp,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import {
  GetThirdPartiesDocument,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

import useEntityWhereFilter from '@/hooks/useEntityWhereFilter';

type UseGetThirdPartyRegisterArgs = Record<string, never>;

export function mapTrpcThirdPartiesToGraphQL(
  trpcData: ThirdPartyRegisterResponse | undefined
): GetThirdPartiesQuery | undefined {
  if (!trpcData) {
    return undefined;
  }

  return {
    third_party: trpcData.third_party,
  };
}

const useThirdPartyRegisterGraphqlVariables = () => {
  const where = useEntityWhereFilter<Third_Party_Bool_Exp>(
    Parent_Type_Enum.ThirdParty
  );

  return { where };
};

export const useGetThirdPartyRegister = createQueryHook<
  UseGetThirdPartyRegisterArgs,
  ThirdPartyRegisterResponse,
  GetThirdPartiesQuery
>({
  trpcQueryOptions: (trpc) => trpc.frontend.thirdParty.register.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ third_party: data.third_party }),
  graphqlDocument: GetThirdPartiesDocument,
  graphqlVariables: useThirdPartyRegisterGraphqlVariables,
});
