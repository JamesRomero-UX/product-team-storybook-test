import type { ParentIssueType } from '@risksmart-app/domain/src/types/consts';
import type { GetIssuesByParentIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetIssuesByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetIssuesByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetIssuesByParentIdArgs = {
  parentId: string;
  type: ParentIssueType;
};

export const useGetIssuesByParentId = createQueryHook<
  UseGetIssuesByParentIdArgs,
  GetIssuesByParentIdResponseRow[],
  GetIssuesByParentIdQuery
>({
  trpcQueryOptions: (trpc, { parentId, type }) =>
    trpc.frontend.issue.issuesByParentId.queryOptions({ parentId, type }),
  mapTrpcDataToGraphQL: (data) => ({ issue: data }),
  graphqlDocument: GetIssuesByParentIdDocument,
  graphqlVariables: ({ parentId, type }) => ({
    ParentId: parentId,
    Type: type,
  }),
});
