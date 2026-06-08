import type { GetUserGroupByIdResponseRow } from '@risksmart-app/trpc/types/user-group.types';
import type { GetUserGroupByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetUserGroupByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetUserGroupByIdArgs = {
  id: string;
};

export const useGetUserGroupById = createQueryHook<
  UseGetUserGroupByIdArgs,
  GetUserGroupByIdResponseRow[],
  GetUserGroupByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.userGroup.userGroupById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ user_group: data }),
  graphqlDocument: GetUserGroupByIdDocument,
  graphqlVariables: ({ id }) => ({ Id: id }),
});
