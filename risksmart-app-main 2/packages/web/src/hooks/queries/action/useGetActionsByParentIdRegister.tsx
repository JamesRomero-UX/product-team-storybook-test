import type { ActionRegisterResponse } from '@risksmart-app/trpc/src/types';
import type { GetActionsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetActionsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetActionsByParentIdRegisterArgs = {
  parentId: string;
};

export const useGetActionsByParentIdRegister = createQueryHook<
  UseGetActionsByParentIdRegisterArgs,
  ActionRegisterResponse,
  GetActionsQuery
>({
  trpcQueryOptions: (trpc, { parentId }) =>
    trpc.frontend.action.register.queryOptions({ parentId }),
  mapTrpcDataToGraphQL: (data) => ({ action: data.action }),
  graphqlDocument: GetActionsDocument,
  graphqlVariables: ({ parentId }) => ({
    where: {
      parents: {
        ParentId: {
          _eq: parentId,
        },
      },
    },
  }),
});
