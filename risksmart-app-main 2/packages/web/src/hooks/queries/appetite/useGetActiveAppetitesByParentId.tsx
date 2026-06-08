import type { GetActiveAppetitesByParentIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetActiveAppetitesByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetActiveAppetitesByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetActiveAppetitesByParentIdArgs = {
  parentId: string;
};

export const useGetActiveAppetitesByParentId = createQueryHook<
  UseGetActiveAppetitesByParentIdArgs,
  GetActiveAppetitesByParentIdResponseRow[],
  GetActiveAppetitesByParentIdQuery
>({
  trpcQueryOptions: (trpc, { parentId }) =>
    trpc.frontend.appetite.activeAppetitesByParentId.queryOptions({
      parentId,
    }),
  mapTrpcDataToGraphQL: (data) => ({ appetite_parent: data }),
  graphqlDocument: GetActiveAppetitesByParentIdDocument,
  graphqlVariables: ({ parentId }) => ({ parentId }),
});
