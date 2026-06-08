import type { GetActionByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetActionByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetActionByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetActionByIdArgs = {
  id: string;
};

export const useGetActionById = createQueryHook<
  UseGetActionByIdArgs,
  GetActionByIdResponseRow[],
  GetActionByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.action.actionById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ action: data }),
  graphqlDocument: GetActionByIdDocument,
  graphqlVariables: ({ id }) => ({ _eq: id }),
});
