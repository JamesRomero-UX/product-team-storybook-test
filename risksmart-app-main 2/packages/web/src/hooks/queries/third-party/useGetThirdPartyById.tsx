import type { ThirdPartyWithFilesResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetThirdPartyByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetThirdPartyByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetThirdPartyByIdArgs = { thirdPartyId: string };

export const useGetThirdPartyById = createQueryHook<
  UseGetThirdPartyByIdArgs,
  ThirdPartyWithFilesResponseRow,
  GetThirdPartyByIdQuery
>({
  trpcQueryOptions: (trpc, { thirdPartyId }) =>
    trpc.frontend.thirdParty.getById.queryOptions({ thirdPartyId }),
  mapTrpcDataToGraphQL: (data) => ({ third_party: data }),
  graphqlDocument: GetThirdPartyByIdDocument,
  graphqlVariables: ({ thirdPartyId }) => ({ Id: thirdPartyId }),
});
