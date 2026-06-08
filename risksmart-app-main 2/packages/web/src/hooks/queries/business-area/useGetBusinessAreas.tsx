import type { BusinessAreasResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetBusinessAreasQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetBusinessAreasDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

export const useGetBusinessAreas = createQueryHook<
  Record<string, never>,
  BusinessAreasResponseRow[],
  GetBusinessAreasQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.businessArea.businessAreas.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ business_area: data }),
  graphqlDocument: GetBusinessAreasDocument,
});
