import type { GetUsersByGroupIdResponseRow } from '@risksmart-app/trpc/types/user-group.types';
import type { GetUsersByGroupIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetUsersByGroupIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetUsersByGroupIdArgs = {
  groupId: string;
};

export const useGetUsersByGroupId = createQueryHook<
  UseGetUsersByGroupIdArgs,
  GetUsersByGroupIdResponseRow[],
  GetUsersByGroupIdQuery
>({
  trpcQueryOptions: (trpc, { groupId }) =>
    trpc.frontend.userGroup.usersByGroupId.queryOptions({ groupId }),
  mapTrpcDataToGraphQL: (data) => ({
    user_group: data.map((user) => ({
      users: user.users.map((user) => ({
        ...user,
        authUsers: user.authUsers!,
      })),
    })),
  }),
  graphqlDocument: GetUsersByGroupIdDocument,
  graphqlVariables: ({ groupId }) => ({ GroupId: groupId }),
});
