import type { GetIndicatorByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetIndicatorByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetIndicatorByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetIndicatorByIdArgs = {
  id: string;
};

export const useGetIndicatorById = createQueryHook<
  UseGetIndicatorByIdArgs,
  GetIndicatorByIdResponseRow[],
  GetIndicatorByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.indicator.indicatorById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ indicator: data ?? [] }),
  graphqlDocument: GetIndicatorByIdDocument,
  graphqlVariables: ({ id }) => ({ id }),
});
