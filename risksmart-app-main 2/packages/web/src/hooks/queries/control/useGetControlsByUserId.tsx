import type { ControlsByUserIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetControlsByUserQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetControlsByUserDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetControlsByUserIdArgs = {
  userId: string;
};

export const useGetControlsByUserId = createQueryHook<
  UseGetControlsByUserIdArgs,
  ControlsByUserIdResponseRow[],
  GetControlsByUserQuery
>({
  trpcQueryOptions: (trpc, { userId }) =>
    trpc.frontend.control.controlsByUserId.queryOptions({ userId }),
  mapTrpcDataToGraphQL: (data) => ({ control: data }),
  graphqlDocument: GetControlsByUserDocument,
  graphqlVariables: ({ userId }) => ({ _eq: userId }),
});
