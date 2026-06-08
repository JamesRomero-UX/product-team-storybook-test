import type { AppetiteByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetAppetiteByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAppetiteByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetAppetiteByIdArgs = {
  id: string;
};

export const useGetAppetiteById = createQueryHook<
  UseGetAppetiteByIdArgs,
  AppetiteByIdResponseRow[],
  GetAppetiteByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.appetite.getById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ appetite: data || [] }),
  graphqlDocument: GetAppetiteByIdDocument,
  graphqlVariables: ({ id }) => ({ _eq: id }),
});
