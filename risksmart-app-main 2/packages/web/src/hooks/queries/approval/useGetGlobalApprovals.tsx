import type { ApprovalResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetGlobalApprovalsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetGlobalApprovalsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetGlobalApprovalsArgs = {
  isGlobal: boolean;
  parentId: string;
};

export const useGetGlobalApprovals = createQueryHook<
  UseGetGlobalApprovalsArgs,
  ApprovalResponseRow[],
  GetGlobalApprovalsQuery
>({
  trpcQueryOptions: (trpc, { isGlobal, parentId }) =>
    trpc.frontend.approval.globalApprovals.queryOptions({
      isGlobal,
      parentId,
    }),
  mapTrpcDataToGraphQL: (data) => ({ approval: data }),
  graphqlDocument: GetGlobalApprovalsDocument,
  graphqlVariables: ({ isGlobal, parentId }) => ({
    global: isGlobal,
    parentId: parentId ?? '00000000-0000-0000-0000-000000000000',
  }),
});
