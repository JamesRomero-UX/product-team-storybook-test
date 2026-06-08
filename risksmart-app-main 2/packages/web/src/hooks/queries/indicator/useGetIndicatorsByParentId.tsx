import type { GetIndicatorsByParentIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetIndicatorsByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetIndicatorsByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetIndicatorsByParentIdArgs = {
  parentId: string;
};

export const useGetIndicatorsByParentId = createQueryHook<
  UseGetIndicatorsByParentIdArgs,
  GetIndicatorsByParentIdResponse,
  GetIndicatorsByParentIdQuery
>({
  trpcQueryOptions: (trpc, { parentId }) =>
    trpc.frontend.indicator.indicatorsByParentId.queryOptions({
      parentId,
    }),
  mapTrpcDataToGraphQL: (data) => data,
  graphqlDocument: GetIndicatorsByParentIdDocument,
  graphqlVariables: ({ parentId }) => ({ parentId }),
});
