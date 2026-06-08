import type { GetActionUpdateByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetActionUpdateByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetActionUpdateByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetActionUpdateByIdArgs = {
  id: string;
};

export const useGetActionUpdateById = createQueryHook<
  UseGetActionUpdateByIdArgs,
  GetActionUpdateByIdResponseRow[],
  GetActionUpdateByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.action.updates.getActionUpdateById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ action_update: data }),
  graphqlDocument: GetActionUpdateByIdDocument,
  graphqlVariables: ({ id }) => ({ _eq: id }),
});
