import type { GetAcceptanceByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetAcceptanceByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAcceptanceByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetAcceptanceByIdArgs = {
  acceptanceId: string;
};

export const useGetAcceptanceById = createQueryHook<
  UseGetAcceptanceByIdArgs,
  GetAcceptanceByIdResponseRow[],
  GetAcceptanceByIdQuery
>({
  trpcQueryOptions: (trpc, { acceptanceId }) =>
    trpc.frontend.acceptance.getById.queryOptions({ id: acceptanceId }),
  mapTrpcDataToGraphQL: (data) => ({ acceptance: data || [] }),
  graphqlDocument: GetAcceptanceByIdDocument,
  graphqlVariables: ({ acceptanceId }) => ({ _eq: acceptanceId }),
});
