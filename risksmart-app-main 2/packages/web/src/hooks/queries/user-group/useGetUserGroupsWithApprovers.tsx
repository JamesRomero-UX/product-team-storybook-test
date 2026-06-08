import type { GetUserGroupsWithApproversResponseRow } from '@risksmart-app/trpc/types/user-group.types';
import type { GetUserGroupsWithApproversQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetUserGroupsWithApproversDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

export const useGetUserGroupsWithApprovers = createQueryHook<
  Record<string, never>,
  GetUserGroupsWithApproversResponseRow[],
  GetUserGroupsWithApproversQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.userGroup.userGroupsWithApprovers.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ user_group: data }),
  graphqlDocument: GetUserGroupsWithApproversDocument,
});
