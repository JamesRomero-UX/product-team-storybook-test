import type { EntityByIdResponse } from '@risksmart-app/trpc/types';
import type { GetEntityByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetEntityByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetEntityByIdArgs = {
  id?: string;
};

export const useGetEntityById = createQueryHook<
  UseGetEntityByIdArgs,
  EntityByIdResponse,
  GetEntityByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.entity.getById.queryOptions({ id: id! }),
  mapTrpcDataToGraphQL: (data) => ({ entity_by_pk: data }),
  graphqlDocument: GetEntityByIdDocument,
  graphqlVariables: ({ id }) => ({ Id: id }),
});
