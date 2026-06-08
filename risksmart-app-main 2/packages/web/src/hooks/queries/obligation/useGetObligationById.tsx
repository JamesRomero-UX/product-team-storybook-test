import type { GetObligationByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetObligationByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetObligationByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetObligationByIdArgs = { id: string };

export const useGetObligationById = createQueryHook<
  UseGetObligationByIdArgs,
  GetObligationByIdResponseRow[],
  GetObligationByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.obligation.getById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ obligation: data || [] }),
  graphqlDocument: GetObligationByIdDocument,
  graphqlVariables: ({ id }) => ({ _eq: id }),
});
