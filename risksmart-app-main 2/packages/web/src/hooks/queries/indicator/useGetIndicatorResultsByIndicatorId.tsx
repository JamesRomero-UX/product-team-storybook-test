import type { GetIndicatorResultsByIndicatorIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetIndicatorResultsByIndicatorIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetIndicatorResultsByIndicatorIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetIndicatorResultsByIndicatorIdArgs = {
  indicatorId: string;
};

export const useGetIndicatorResultsByIndicatorId = createQueryHook<
  UseGetIndicatorResultsByIndicatorIdArgs,
  GetIndicatorResultsByIndicatorIdResponseRow[],
  GetIndicatorResultsByIndicatorIdQuery
>({
  trpcQueryOptions: (trpc, { indicatorId }) =>
    trpc.frontend.indicator.indicatorResultsByIndicatorId.queryOptions({
      indicatorId,
    }),
  mapTrpcDataToGraphQL: (data) => ({ indicator_result: data ?? [] }),
  graphqlDocument: GetIndicatorResultsByIndicatorIdDocument,
  graphqlVariables: ({ indicatorId }) => ({ indicatorId }),
});
