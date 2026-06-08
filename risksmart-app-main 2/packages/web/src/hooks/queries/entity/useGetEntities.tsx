import type { EntityRegisterResponse } from '@risksmart-app/trpc/types';
import type { GetEntitiesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetEntitiesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetEntitiesArgs = Record<string, never>;

export const useGetEntities = createQueryHook<
  UseGetEntitiesArgs,
  EntityRegisterResponse,
  GetEntitiesQuery
>({
  trpcQueryOptions: (trpc) => trpc.frontend.entity.register.queryOptions(),
  mapTrpcDataToGraphQL: (data) => data ?? { entity: [] },
  graphqlDocument: GetEntitiesDocument,
});
