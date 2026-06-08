import type { ConsequenceByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetConsequenceByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetConsequenceByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetConsequenceByIdArgs = {
  id: string;
};

export const useGetConsequenceById = createQueryHook<
  UseGetConsequenceByIdArgs,
  ConsequenceByIdResponseRow[],
  GetConsequenceByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.consequence.consequenceById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ consequence: data ?? [] }),
  graphqlDocument: GetConsequenceByIdDocument,
  graphqlVariables: ({ id }) => ({ _eq: id }),
});
