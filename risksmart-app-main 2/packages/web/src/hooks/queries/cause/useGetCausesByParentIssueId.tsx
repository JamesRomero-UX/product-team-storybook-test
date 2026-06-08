import type { CausesByParentIssueIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetCausesByParentIssueIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetCausesByParentIssueIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetCausesByParentIssueIdArgs = {
  parentIssueId: string;
};

export const useGetCausesByParentIssueId = createQueryHook<
  UseGetCausesByParentIssueIdArgs,
  CausesByParentIssueIdResponseRow[],
  GetCausesByParentIssueIdQuery
>({
  trpcQueryOptions: (trpc, { parentIssueId }) =>
    trpc.frontend.cause.getByParentIssueId.queryOptions({
      issueId: parentIssueId,
    }),
  mapTrpcDataToGraphQL: (data) => ({ cause: data }),
  graphqlDocument: GetCausesByParentIssueIdDocument,
  graphqlVariables: ({ parentIssueId }) => ({ _eq: parentIssueId }),
});
