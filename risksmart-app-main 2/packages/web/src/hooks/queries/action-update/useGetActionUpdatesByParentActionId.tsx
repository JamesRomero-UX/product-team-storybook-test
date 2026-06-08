import type { GetActionUpdatesByParentActionIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetActionUpdatesByParentActionIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetActionUpdatesByParentActionIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetActionUpdatesByParentActionIdArgs = {
  parentActionId: string;
};

export const useGetActionUpdatesByParentActionId = createQueryHook<
  UseGetActionUpdatesByParentActionIdArgs,
  GetActionUpdatesByParentActionIdResponseRow[],
  GetActionUpdatesByParentActionIdQuery
>({
  trpcQueryOptions: (trpc, { parentActionId }) =>
    trpc.frontend.action.updates.getActionUpdatesByParentActionId.queryOptions({
      ParentActionId: parentActionId,
    }),
  mapTrpcDataToGraphQL: (data) => ({ action_update: data }),
  graphqlDocument: GetActionUpdatesByParentActionIdDocument,
  graphqlVariables: ({ parentActionId }) => ({ _eq: parentActionId }),
});
