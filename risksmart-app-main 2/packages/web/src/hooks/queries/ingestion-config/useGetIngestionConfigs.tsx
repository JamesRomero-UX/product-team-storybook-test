import type { IngestionConfigResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetIngestionConfigsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetIngestionConfigsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

export const useGetIngestionConfigs = createQueryHook<
  Record<string, never>,
  IngestionConfigResponseRow[],
  GetIngestionConfigsQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.ingestionConfig.getAll.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ ingestion_config: data }),
  graphqlDocument: GetIngestionConfigsDocument,
});
